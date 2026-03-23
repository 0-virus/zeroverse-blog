import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    // Path Parameter 불러오기
    const { userId } = await params;
    if (!userId || isNaN(Number(userId))) {
      return NextResponse.json(
        { message: "유효하지 않은 ID입니다." },
        { status: 400 },
      );
    }

    // 사용자 정보 불러오기
    const user = await prisma.users.findUnique({
      where: { id: BigInt(userId) },
      select: {
        name: true,
        nickname: true,
        profile_img: true,
        blog: { select: { title: true, url_slug: true } },
      },
    });
    if (!user) {
      return NextResponse.json(
        { message: "사용자가 존재하지 않습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "프로필 조회 완료!", data: user },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[GET /api/users/[userId]/profile]", error);
    return NextResponse.json(
      { message: "프로필 조회 실패..." },
      { status: 500 },
    );
  }
}
