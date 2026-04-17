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

    // 쿼리 파라미터
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const filter = searchParams.get("filter"); // "mutual" | "one-way" | null(전체)
    const skip = (page - 1) * limit;

    // 사용자 블로그 정보 불러오기
    const myBlog = await prisma.blogs.findUnique({
      where: { user_id: BigInt(session.user.id) },
      select: { id: true },
    });
    if (!myBlog) {
      return NextResponse.json(
        { message: "사용자 블로그 정보가 없습니다." },
        { status: 404 },
      );
    }

    // 내가 발견한 블로그 목록 조회
    const [totalCount, neighbors] = await Promise.all([
      prisma.neighbors.count({
        where: { from_blog_id: myBlog.id },
      }),
      prisma.neighbors.findMany({
        where: { from_blog_id: myBlog.id },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          created_at: true,
          to_blog: {
            select: {
              id: true,
              title: true,
              url_slug: true,
              description: true,
              user: {
                select: {
                  id: true,
                  nickname: true,
                  profile_img: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // 상대가 나를 발견했는지 확인 (상호 여부)
    const toBlogIds = neighbors.map((n) => n.to_blog.id);
    const mutualRelations = await prisma.neighbors.findMany({
      where: {
        from_blog_id: { in: toBlogIds },
        to_blog_id: myBlog.id,
      },
      select: { from_blog_id: true },
    });
    const mutualSet = new Set(mutualRelations.map((r) => r.from_blog_id));

    // 결과 포맷팅
    let formatted = neighbors.map((n) => ({
      relationId: n.id.toString(),
      isMutual: mutualSet.has(n.to_blog.id),
      discoveredAt: n.created_at,
      blog: {
        id: n.to_blog.id.toString(),
        title: n.to_blog.title,
        urlSlug: n.to_blog.url_slug,
        description: n.to_blog.description,
        user: {
          id: n.to_blog.user.id.toString(),
          nickname: n.to_blog.user.nickname,
          profileImg: n.to_blog.user.profile_img,
        },
      },
    }));

    // 필터 적용
    if (filter === "mutual") {
      formatted = formatted.filter((n) => n.isMutual);
    } else if (filter === "one-way") {
      formatted = formatted.filter((n) => !n.isMutual);
    }

    return NextResponse.json({
      success: true,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      neighbors: formatted,
    });
  } catch (error) {
    console.error("[GET /api/neighbors]", error);
    return NextResponse.json(
      { message: "이웃 목록 조회 실패..." },
      { status: 500 },
    );
  }
}
