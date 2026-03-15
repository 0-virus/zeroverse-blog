import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ toBlogId: string }> },
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
    const { toBlogId } = await params;
    if (!toBlogId) {
      return NextResponse.json(
        { message: "Path Parameter가 유효하지 않습니다." },
        { status: 400 },
      );
    }

    // 상대 블로그 정보 불러오기
    const toBlog = await prisma.blogs.findUnique({
      where: { id: BigInt(toBlogId) },
      select: {
        user_id: true,
        url_slug: true,
        user: { select: { nickname: true } },
      },
    });
    if (!toBlog) {
      return NextResponse.json(
        { message: "상대 블로그 정보가 없습니다." },
        { status: 404 },
      );
    }

    // 사용자 블로그 정보 불러오기
    const fromBlog = await prisma.blogs.findUnique({
      where: { user_id: BigInt(session.user.id) },
      select: { id: true },
    });
    if (!fromBlog) {
      return NextResponse.json(
        { message: "사용자 블로그 정보가 없습니다." },
        { status: 404 },
      );
    }

    // 자기 자신 추가 방지 로직
    if (fromBlog.id === BigInt(toBlogId)) {
      return NextResponse.json(
        { message: "자기 자신을 이웃추가할 수 없습니다." },
        { status: 400 },
      );
    }

    // 상대의 발견 여부 확인
    const existRelation = await prisma.neighbors.findFirst({
      where: {
        from_blog_id: BigInt(toBlogId),
        to_blog_id: BigInt(fromBlog.id),
      },
    });

    const [newRelation, toBlogNoti, fromBlogNoti] = await prisma.$transaction(
      async (tx) => {
        // 이웃 관계 생성
        const newRelation = await tx.neighbors.create({
          data: {
            from_blog_id: BigInt(fromBlog.id),
            to_blog_id: BigInt(toBlogId),
          },
        });

        // 알림 생성
        const toBlogNoti = await tx.notifications.create({
          data: {
            user_id: toBlog.user_id,
            actor_id: BigInt(session.user.id),
            type: "NEIGHBOR",
            target_url: `/${toBlog.url_slug}`,
            message: `${session.user.nickname}님이 회원님의 우주를 발견했습니다.${existRelation ? ` ${session.user.nickname}님과 친구가 되었습니다!` : ""}`,
          },
        });

        let fromBlogNoti = null;
        if (existRelation) {
          fromBlogNoti = await tx.notifications.create({
            data: {
              user_id: BigInt(session.user.id),
              actor_id: BigInt(toBlogId),
              type: "NEIGHBOR",
              target_url: `/${toBlog.url_slug}`,
              message: `${toBlog.user.nickname}님과 친구가 되었습니다!`,
            },
          });
        }
        return [newRelation, toBlogNoti, fromBlogNoti];
      },
    );

    return NextResponse.json(
      {
        message: "이웃 설정 완료!",
        relationId: newRelation.id.toString(),
        toBlogNotiId: toBlogNoti.id.toString(),
        fromBlogNotiId: fromBlogNoti?.id.toString(),
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "이미 이웃 설정된 블로그입니다." },
        { status: 409 },
      );
    }
    return NextResponse.json({ message: "이웃 설정 실패..." }, { status: 500 });
  }
}
