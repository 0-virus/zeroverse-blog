import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// 또는 상대경로: import { prisma } from '../../../lib/prisma';

export async function GET(request: Request) {
  try {
    // URL에서 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // 전체 개수 세기
    const totalCount = await prisma.posts.count({
      where: { status: "published" },
    });

    // 페이지네이션 적용
    const posts = await prisma.posts.findMany({
      where: { status: "published" },
      orderBy: { published_at: "desc" },
      skip: skip,
      take: limit,
      include: {
        blogs: {
          select: {
            title: true,
            url_slug: true,
            user: {
              select: { nickname: true },
            },
          },
        },
        categories: {
          select: { name: true },
        },
        post_tags: {
          include: {
            tags: { select: { name: true } },
          },
        },
      },
    });

    const fromattedPosts = posts.map((post) => ({
      id: post.id.toString(),
      title: post.title,
      content: post.content.substring(0, 200) + "...",
      status: post.status,
      viewCount: post.view_count,
      publishedAt: post.published_at,
      author: post.blogs.user.nickname,
      blog: {
        title: post.blogs.title,
        slug: post.blogs.url_slug,
      },
      category: post.categories?.name || "미분류",
      tags: post.post_tags.map((pt) => pt.tags.name),
    }));

    return NextResponse.json({
      success: true,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      posts: fromattedPosts,
    });
  } catch (error) {
    console.error("게시글 조회 에러: ", error);
    return NextResponse.json(
      { success: false, error: "게시글을 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }
}
