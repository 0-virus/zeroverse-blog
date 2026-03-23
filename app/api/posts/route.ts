import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
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
        blog: {
          select: {
            title: true,
            url_slug: true,
            user: {
              select: { nickname: true },
            },
          },
        },
        category: {
          select: { name: true },
        },
        post_tags: {
          include: {
            tag: { select: { name: true } },
          },
        },
      },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content.substring(0, 200) + "...",
      status: post.status,
      viewCount: post.view_count,
      publishedAt: post.published_at,
      author: post.blog.user.nickname,
      blog: {
        title: post.blog.title,
        slug: post.blog.url_slug,
      },
      category: post.category?.name || "미분류",
      tags: post.post_tags.map((pt) => pt.tag.name),
    }));

    return NextResponse.json({
      success: true,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      posts: formattedPosts,
    });
  } catch (error) {
    console.error("게시글 조회 에러: ", error);
    return NextResponse.json(
      { success: false, error: "게시글을 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 세션 데이터 불러오기
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    // 블로그 정보 불러오기
    const blog = await prisma.blogs.findUnique({
      where: {
        user_id: BigInt(session.user.id),
      },
    });
    if (!blog) {
      return NextResponse.json(
        { message: "블로그 정보가 없습니다." },
        { status: 400 },
      );
    }
    const blogId = blog.id;

    // Request Body 불러오기
    const body = await request.json();
    if (!body) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 },
      );
    }
    const { categoryId, title, content, representativeImageId, status } = body;
    let publishedAt = null;
    if (status === "published") {
      publishedAt = new Date();
    }
    // 필수 값 확인
    if (!title || !content) {
      return NextResponse.json(
        { message: "필수 항목(제목, 내용)이 누락되었습니다." },
        { status: 400 },
      );
    }

    // 포스트 생성
    const post = await prisma.posts.create({
      data: {
        category_id: categoryId,
        title,
        content,
        representative_image_id: representativeImageId,
        status,
        blog_id: BigInt(blogId),
        published_at: publishedAt,
      },
    });

    return NextResponse.json(
      {
        message: "포스팅에 성공했습니다.",
        post,
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "포스팅에 실패했습니다." },
      { status: 500 },
    );
  }
}
