import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { now } from "next-auth/client/_utils";

// PrismaClient 인스턴스를 생성합니다.
// 개발 중에는 핫 리로딩으로 인해 여러 인스턴스가 생성되는 것을 방지하기 위해 전역 객체를 사용합니다.
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const myBlog = await prisma.blogs.findUnique({
      where: {
        user_id: Number(session.user.id),
      },
      select: {
        id: true,
      },
    });
    if (!myBlog) {
      return NextResponse.json("블로그 정보가 없습니다.", { status: 404 });
    }

    // 쿼리 파라미터에서 limit을 가져오거나 기본값 10을 사용합니다.
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // 최신 게시글을 가져옵니다.
    // 여기서는 간단하게 모든 게시글 중 최신 10개를 가져오도록 구현합니다.
    // 실제 서비스에서는 팔로우하는 블로그의 글, 추천 글 등을 조합하여 "유니버스 새 글"을 구성할 수 있습니다.
    const neighbors = await prisma.neighbors.findMany({
      where: {
        from_blog_id: BigInt(myBlog.id),
      },
      select: { to_blog_id: true },
    });
    const universeBlogIds = neighbors.map((n) => n.to_blog_id);

    const universeFeed = await prisma.posts.findMany({
      where: {
        blog_id: { in: universeBlogIds },
      },
      orderBy: {
        created_at: "desc",
      },
      take: 10,
      select: {
        title: true,
        content: true,
        published_at: true,
        representative_image_id: true,
        blog: {
          select: {
            title: true,
            user: {
              select: {
                nickname: true,
              },
            },
          },
        },
      },
    });

    const formattedFeed = universeFeed.map((post) => ({
      title: post.title,
      content: post.content,
      published_at: post.published_at,
      representative_image_id: post.representative_image_id,
      blog_title: post.blog.title,
      writer_nickname: post.blog,
    }));

    return NextResponse.json({
      success: true,
      status: 200,
      posts: formattedFeed,
    });
  } catch (error) {
    console.error("Error fetching universe feed:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch universe feed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
