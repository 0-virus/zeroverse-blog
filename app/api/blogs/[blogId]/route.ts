import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blogId: string }> },
) {
  try {
    // URL에서 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    // Path Parameter 불러오기
    const { blogId } = await params;
    if (!blogId) {
      return NextResponse.json(
        { message: "Path Parameter가 유효하지 않습니다." },
        { status: 400 },
      );
    }

    // 구성 정보 불러오기
    const [data, totalCount] = await Promise.all([
      prisma.blogs.findUnique({
        where: { id: BigInt(blogId) },
        select: {
          title: true,
          posts: {
            orderBy: { published_at: "desc" },
            skip: skip,
            take: limit,
            include: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      prisma.posts.count({ where: { blog_id: BigInt(blogId) } }),
    ]);
    if (!data) {
      return NextResponse.json(
        { message: "블로그가 존재하지 않습니다." },
        { status: 404 },
      );
    }
    const totalCount = data.posts.length;

    return NextResponse.json(
      {
        message: "블로그 메인 정보 조회 성공!",

        postList: {
          pagination: {
            page,
            limit,
            totalCount,
            totalPage: Math.ceil(totalCount / limit),
          },
          data,
        },
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("[GET api/blogs/[blogId]]", error);
    return NextResponse.json({ message: "조회 실패..." }, { status: 500 });
  }
}
