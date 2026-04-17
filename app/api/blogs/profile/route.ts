import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // 세션 데이터 불러오기
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    // 사용자 및 블로그 정보 불러오기
    const user = await prisma.users.findUnique({
      where: { id: BigInt(session.user.id) },
      select: {
        name: true,
        nickname: true,
        birthdate: true,
        profile_img: true,
        email: true,
        blog: {
          select: {
            title: true,
            url_slug: true,
            description: true,
          },
        },
      },
    });
    if (!user) {
      return NextResponse.json(
        { message: "사용자를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "기본 정보 조회 완료!", data: user },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: "기본 정보 조회 실패..." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // 세션 데이터 불러오기
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      blogTitle,
      urlSlug,
      description,
      name,
      nickname,
      profileImg,
      currentPassword,
      newPassword,
    } = body;

    const userId = BigInt(session.user.id);

    // 비밀번호 변경 요청 시 현재 비밀번호 검증
    let hashedNewPassword: string | undefined;
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "현재 비밀번호를 입력해주세요." },
          { status: 400 },
        );
      }

      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { password: true },
      });
      if (!user) {
        return NextResponse.json(
          { message: "사용자를 찾을 수 없습니다." },
          { status: 404 },
        );
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(
          { message: "현재 비밀번호가 일치하지 않습니다." },
          { status: 400 },
        );
      }

      hashedNewPassword = await bcrypt.hash(newPassword, 10);
    }

    // 유저 정보 업데이트
    const userData: Record<string, any> = {};
    if (name !== undefined) userData.name = name;
    if (nickname !== undefined) userData.nickname = nickname;
    if (profileImg !== undefined) userData.profile_img = profileImg;
    if (hashedNewPassword) userData.password = hashedNewPassword;

    // 블로그 정보 업데이트
    const blogData: Record<string, any> = {};
    if (blogTitle !== undefined) blogData.title = blogTitle;
    if (urlSlug !== undefined) blogData.url_slug = urlSlug;
    if (description !== undefined) blogData.description = description;

    // 트랜잭션으로 유저 + 블로그 동시 업데이트
    const [updatedUser, updatedBlog] = await prisma.$transaction(
      async (tx) => {
        const updatedUser =
          Object.keys(userData).length > 0
            ? await tx.users.update({
                where: { id: userId },
                data: userData,
                select: {
                  name: true,
                  nickname: true,
                  profile_img: true,
                  email: true,
                },
              })
            : null;

        const updatedBlog =
          Object.keys(blogData).length > 0
            ? await tx.blogs.update({
                where: { user_id: userId },
                data: blogData,
                select: {
                  title: true,
                  url_slug: true,
                  description: true,
                },
              })
            : null;

        return [updatedUser, updatedBlog];
      },
    );

    return NextResponse.json(
      {
        message: "프로필 수정 완료!",
        data: {
          user: updatedUser,
          blog: updatedBlog,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[PUT /api/blogs/profile]", error);
    if (error.code === "P2002") {
      const target = error.meta?.target;
      if (target?.includes("nickname")) {
        return NextResponse.json(
          { message: "이미 사용 중인 별명입니다." },
          { status: 409 },
        );
      }
      if (target?.includes("url_slug")) {
        return NextResponse.json(
          { message: "이미 사용 중인 블로그 주소입니다." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { message: "중복된 값이 존재합니다." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { message: "프로필 수정 실패..." },
      { status: 500 },
    );
  }
}
