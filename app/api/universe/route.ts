import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    // 세션 데이터 불러오기
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    // 유니버스 정보 불러오기
    const universe = await prisma.neighbors.findMany({
      where: { from_blog: { user_id: BigInt(session.user.id) } },
      select: {
        to_blog: {
          select: {
            user: {
              select: {
                name: true,
                nickname: true,
                profile_img: true,
              },
            },
          },
        },
      },
    });
    const formattedUniverse = universe.map((u) => ({
      name: u.to_blog.user.name,
      nickname: u.to_blog.user.nickname,
      profile_img: u.to_blog.user.profile_img,
    }));

    return NextResponse.json(
      { message: "유니버스 정보 조회 성공!", data: formattedUniverse },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[GET /api/universe]", error);
    return NextResponse.json(
      { message: "유니버스 정보 조회 실패..." },
      { status: 500 },
    );
  }
}
