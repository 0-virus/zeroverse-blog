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

    // 공감 중복 생성 방지
    const existingLike = await prisma.likes.findFirst({
      where: { post_id: BigInt(postId), user_id: BigInt(session.user.id) },
    });

    if (existingLike) {
      return NextResponse.json(
        { message: "이미 공감한 게시물입니다." },
        { status: 409 },
      );
    }

    // 공감 생성
    const like = await prisma.likes.create({
      data: { post_id: BigInt(postId), user_id: BigInt(session.user.id) },
    });

    return NextResponse.json(
      { message: "공감 생성 완료!", like },
      { status: 201 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "공감 생성 실패..." }, { status: 500 });
  }
}
