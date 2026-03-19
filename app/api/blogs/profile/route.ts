import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
