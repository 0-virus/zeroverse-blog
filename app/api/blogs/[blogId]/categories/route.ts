import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blogId: string }> },
) {
  try {
    const { blogId } = await params;
    if (!blogId) {
      return NextResponse.json(
        { success: false, error: "blogId가 없습니다." },
        { status: 400 },
      );
    }

    const categories = await prisma.categories.findMany({
      where: { blog_id: BigInt(blogId) },
      orderBy: { order_index: "asc" },
    });

    const fromattedCategories = categories.map((category) => ({
      id: category.id,
      parent_id: category.parent_id,
      name: category.name,
      type: category.type,
      is_representative: category.is_representative,
      order_index: category.order_index,
      created_at: category.created_at,
    }));

    return NextResponse.json({
      success: true,
      categories: fromattedCategories,
    });
  } catch (error) {
    console.error("카테고리 조회 에러: ", error);
    return NextResponse.json(
      { success: false, error: "카테고리를 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }
}
