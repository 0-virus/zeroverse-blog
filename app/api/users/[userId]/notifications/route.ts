import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    // URL에서 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // 전체 알림 개수
    const totalCount = await prisma.notifications.count({
      where: { user_id: BigInt(session.user.id) },
    });

    // 읽지 않은 알림 개수
    const unreadCount = await prisma.notifications.count({
      where: { is_read: false, user_id: BigInt(session.user.id) },
    });

    const notifications = await prisma.notifications.findMany({
      where: {
        user_id: BigInt(session.user.id),
      },
      orderBy: [{ is_read: "asc" }, { created_at: "desc" }],
      skip: skip,
      take: limit,
      include: {
        actor: {
          select: {
            name: true,
            nickname: true,
          },
        },
      },
    });

    const formattedNoties = notifications.map((noti) => ({
      id: noti.id.toString(),
      userId: noti.user_id.toString(),
      actorId: noti.actor_id.toString(),
      actorName: noti.actor.name,
      actorNickname: noti.actor.nickname,
      type: noti.type,
      targetUrl: noti.target_url,
      message: noti.message,
      isRead: noti.is_read,
      createdAt: noti.created_at,
    }));

    return NextResponse.json({
      success: true,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        unreadCount: unreadCount,
      },
      notifications: formattedNoties,
    });
  } catch (error: any) {
    console.error("Error fetching news feed:", error);
    return NextResponse.json(
      { message: "내 소식 조회 실패..." },
      { status: 500 },
    );
  }
}
