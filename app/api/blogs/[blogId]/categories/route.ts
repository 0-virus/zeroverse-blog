import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET({ params }: { params: Promise<{ blogId: string }> }) {
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
    console.error("Error fetching categories: ", error);
    return NextResponse.json(
      { success: false, error: "카테고리를 불러오는데 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function POST({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) {
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
    const { blogId } = await params;
    if (!blogId) {
      return NextResponse.json({
        message: "URL 파라미터가 유효하지 않습니다.",
      });
    }

    // 순서 설정
    const maxOrder = await prisma.categories.aggregate({
      _max: { order_index: true },
      where: { blog_id: BigInt(blogId) },
    });
    const orderIndex = (maxOrder._max.order_index ?? -1) + 1;

    // 카테고리 생성
    const category = await prisma.categories.create({
      data: {
        blog_id: Number(blogId),
        name: "새 카테고리",
        order_index: orderIndex,
      },
    });

    return NextResponse.json(
      { message: "카테고리 생성 완료!", category },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "카테고리 생성 실패..." },
      { status: 500 },
    );
  }
}
