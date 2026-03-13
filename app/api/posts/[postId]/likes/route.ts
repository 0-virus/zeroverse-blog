import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ postId: string }>;
  },
) {
  try {
    // 세션 데이터 불러오기
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    // Path Parameter 불러오기
    const { postId } = await params;
    if (!postId) {
      return NextResponse.json(
        { message: "Path Parameter가 유효하지 않습니다." },
        { status: 400 },
      );
    }

    // 공감 생성
    const like = await prisma.likes.create({
      data: { post_id: BigInt(postId), user_id: BigInt(session.user.id) },
    });

    // 게시물 정보 불러오기
    const post = await prisma.posts.findUnique({
      where: { id: BigInt(postId) },
      select: {
        title: true,
        blog: {
          select: { user_id: true },
        },
      },
    });
    if (!post) {
      return NextResponse.json(
        { message: "게시물 정보가 없습니다." },
        { status: 404 },
      );
    }

    // 알림 생성
    const notification = await prisma.notifications.create({
      data: {
        user_id: BigInt(post.blog.user_id),
        actor_id: BigInt(session.user.id),
        type: "LIKE",
        target_url: `/${postId}`,
        message: `${session.user.id}님이 ${post.title}에 공감했습니다.`,
      },
    });

    return NextResponse.json(
      { message: "공감 생성 완료!", likeId: like.id.toString() },
      { status: 201 },
    );
  } catch (error: any) {
    console.log(error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "이미 공감한 게시물입니다." },
        { status: 409 },
      );
    }
    return NextResponse.json({ message: "공감 생성 실패..." }, { status: 500 });
  }
}
