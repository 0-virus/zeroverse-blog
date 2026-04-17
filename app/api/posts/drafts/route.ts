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

    // 사용자 블로그 정보 불러오기
    const blog = await prisma.blogs.findUnique({
      where: { user_id: BigInt(session.user.id) },
      select: { id: true },
    });
    if (!blog) {
      return NextResponse.json(
        { message: "블로그 정보가 없습니다." },
        { status: 404 },
      );
    }

    // 쿼리 파라미터
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // 임시저장 게시글 조회
    const [totalCount, drafts] = await Promise.all([
      prisma.posts.count({
        where: { blog_id: blog.id, status: "draft" },
      }),
      prisma.posts.findMany({
        where: { blog_id: blog.id, status: "draft" },
        orderBy: { updated_at: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          category: { select: { id: true, name: true } },
          created_at: true,
          updated_at: true,
        },
      }),
    ]);

    const formattedDrafts = drafts.map((d) => ({
      id: d.id.toString(),
      title: d.title,
      contentPreview: d.content.substring(0, 200),
      category: d.category
        ? { id: d.category.id.toString(), name: d.category.name }
        : null,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));

    return NextResponse.json({
      success: true,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      drafts: formattedDrafts,
    });
  } catch (error) {
    console.error("[GET /api/posts/drafts]", error);
    return NextResponse.json(
      { message: "임시저장 목록 조회 실패..." },
      { status: 500 },
    );
  }
}
