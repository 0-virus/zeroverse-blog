import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> },
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
    const { notificationId } = await params;
    if (!notificationId) {
      return NextResponse.json(
        { message: "유효하지 않은 ID입니다." },
        { status: 400 },
      );
    }
    let id: bigint;
    try {
      id = BigInt(notificationId);
    } catch (error: any) {
      return NextResponse.json(
        { message: "유효하지 않은 ID입니다." },
        { status: 400 },
      );
    }

    // 알림 존재 여부 확인
    const existingNotification = await prisma.notifications.findUnique({
      where: { id },
    });
    if (!existingNotification) {
      return NextResponse.json(
        { message: "알림이 존재하지 않습니다." },
        { status: 404 },
      );
    }

    // 알림 소유자 검증
    if (existingNotification.user_id !== BigInt(session.user.id)) {
      return NextResponse.json(
        { message: "알림 변경 권한이 없습니다." },
        { status: 403 },
      );
    }

    // 알림 읽음 처리
    await prisma.notifications.update({
      where: { id },
      data: {
        is_read: true,
      },
    });

    return NextResponse.json(
      { message: "알림 읽음 처리 완료!" },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "알림 읽음 처리 실패..." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> },
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
    const { notificationId } = await params;
    if (!notificationId) {
      return NextResponse.json(
        { message: "유효하지 않은 ID입니다." },
        { status: 400 },
      );
    }
    let id: bigint;
    try {
      id = BigInt(notificationId);
    } catch (error: any) {
      return NextResponse.json(
        { message: "유효하지 않은 ID입니다." },
        { status: 400 },
      );
    }

    // 알림 존재 여부 확인
    const existingNotification = await prisma.notifications.findUnique({
      where: { id },
    });
    if (!existingNotification) {
      return NextResponse.json(
        { message: "알림이 존재하지 않습니다." },
        { status: 404 },
      );
    }

    // 알림 소유자 검증
    if (existingNotification.user_id !== BigInt(session.user.id)) {
      return NextResponse.json(
        { message: "알림 삭제 권한이 없습니다." },
        { status: 403 },
      );
    }

    // 알림 삭제
    await prisma.notifications.delete({
      where: { id },
    });

    return NextResponse.json({ message: "알림 삭제 완료!" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "알림 삭제 실패..." }, { status: 500 });
  }
}
