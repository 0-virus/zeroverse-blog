import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ likeId: string }> },
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
    const { likeId } = await params;
    if (!likeId) {
      return NextResponse.json(
        { message: "Path Parameter가 유효하지 않습니다." },
        { status: 400 },
      );
    }

    // 권한 확인
    const existingLike = await prisma.likes.findUnique({
      where: { id: BigInt(likeId) },
    });

    if (!existingLike) {
      return NextResponse.json(
        { message: "공감이 존재하지 않습니다." },
        { status: 400 },
      );
    }

    if (existingLike.user_id !== BigInt(session.user.id)) {
      return NextResponse.json(
        { message: "공감 삭제 권한이 없습니다." },
        { status: 403 },
      );
    }

    // 공감 삭제
    await prisma.likes.delete({
      where: { id: BigInt(likeId) },
    });

    return NextResponse.json({ message: "공감 삭제 성공!" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "공감 삭제 실패..." }, { status: 500 });
  }
}
