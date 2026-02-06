import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

// PrismaClient 인스턴스를 생성합니다.
// 개발 중에는 핫 리로딩으로 인해 여러 인스턴스가 생성되는 것을 방지하기 위해 전역 객체를 사용합니다.
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export async function GET(req: NextRequest) {
  try {
    // 쿼리 파라미터에서 limit을 가져오거나 기본값 10을 사용합니다.
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // 최신 게시글을 가져옵니다.
    // 여기서는 간단하게 모든 게시글 중 최신 10개를 가져오도록 구현합니다.
    // 실제 서비스에서는 팔로우하는 블로그의 글, 추천 글 등을 조합하여 "유니버스 새 글"을 구성할 수 있습니다.
    const latestPosts = await prisma.posts.findMany({
      // ... 기존 설정 ...
      orderBy: {
        created_at: "desc",
      },
      take: limit,
      include: {
        blogs: {
          select: {
            title: true,
            url_slug: true,
            profile_img: true,
            user: {
              select: {
                nickname: true,
              },
            },
          },
        },
        categories: {
          select: {
            name: true,
          },
        },
        post_tags: {
          include: {
            tags: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // BigInt를 처리하기 위해 JSON 직렬화 시 변환 로직을 추가합니다.
    const serializedPosts = JSON.parse(
      JSON.stringify(latestPosts, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json(serializedPosts, { status: 200 });
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
