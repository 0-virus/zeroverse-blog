import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> },
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

    // Request Body 불러오기
    const body = await request.json();
    if (!body) {
      return NextResponse.json(
        { message: "수정할 댓글을 찾을 수 없습니다." },
        { status: 400 },
      );
    }
    const { content } = body;

    // Path Parameter 불러오기
    const { commentId } = await params;
    if (!commentId) {
      return NextResponse.json(
        { message: "Path Parameter가 유효하지 않습니다." },
        { status: 400 },
      );
    }

    // 권한 확인
    const existingComment = await prisma.comments.findUnique({
      where: { id: BigInt(commentId) },
    });

    if (!existingComment) {
      return NextResponse.json(
        { message: "수정할 댓글을 찾을 수 없습니다." },
        { status: 400 },
      );
    }

    if (existingComment.user_id?.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "수정 권한이 없습니다." },
        { status: 403 },
      );
    }

    // 댓글 수정
    const comment = await prisma.comments.update({
      where: { id: BigInt(commentId) },
      data: {
        content: content,
      },
    });

    return NextResponse.json(
      { message: "댓글 수정 완료!", comment },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ message: "댓글 수정 실패..." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ commentId: string }>;
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
    const { commentId } = await params;
    if (!commentId) {
      return NextResponse.json(
        { message: "Path Parameter가 유효하지 않습니다." },
        { status: 400 },
      );
    }

    // 권한 확인
    const existingComment = await prisma.comments.findUnique({
      where: { id: BigInt(commentId) },
    });
    if (!existingComment) {
      return NextResponse.json(
        { message: "삭제할 댓글을 찾을 수 없습니다." },
        { status: 400 },
      );
    }

    if (existingComment.user_id?.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "삭제 권한이 없습니다." },
        { status: 403 },
      );
    }

    // 게시물 삭제
    await prisma.comments.delete({
      where: { id: BigInt(commentId) },
    });

    return NextResponse.json({ message: "댓글 삭제 완료!" }, { status: 200 });
  } catch (error: any) {
    console.error("[api/comments/:commentId] error: ", error);
    return NextResponse.json({ message: "댓글 삭제 실패..." }, { status: 500 });
  }
}
