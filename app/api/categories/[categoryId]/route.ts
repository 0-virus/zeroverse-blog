import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
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

    // Request Body 불러오기
    const body = await request.json();
    if (!body) {
      return NextResponse.json(
        { message: "잘못된 요청입니다." },
        { status: 400 },
      );
    }
    const { name, type, parentId, isRepresentative } = body;

    // URL 파라미터 불러오기
    const { categoryId } = await params;
    if (!categoryId) {
      return NextResponse.json(
        { message: "URL 파라미터가 유효하지 않습니다." },
        { status: 400 },
      );
    }

    // 권한 확인
    const existingCategory = await prisma.categories.findUnique({
      where: { id: BigInt(categoryId) },
      include: { blog: true },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { message: "수정할 카테고리를 찾을 수 없습니다." },
        { status: 400 },
      );
    }

    if (existingCategory.blog.user_id.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "수정 권한이 없습니다." },
        { status: 403 },
      );
    }

    // 카테고리 수정
    const category = await prisma.categories.update({
      where: { id: BigInt(categoryId) },
      data: {
        name: name,
        type: type,
        is_representative: isRepresentative,
        parent_id: parentId,
      },
    });

    return NextResponse.json(
      { message: "카테고리 수정 완료!", category },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "카테고리 수정 실패..." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
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

    // URL 파라미터 불러오기
    const { categoryId } = await params;
    if (!categoryId) {
      return NextResponse.json(
        { message: "URL 파라미터가 유효하지 않습니다." },
        { status: 400 },
      );
    }

    // 권한 확인
    const existingCategory = await prisma.categories.findUnique({
      where: { id: BigInt(categoryId) },
      include: { blog: true },
    });
    if (!existingCategory) {
      return NextResponse.json(
        { message: "삭제할 카테고리를 찾을 수 없습니다." },
        { status: 400 },
      );
    }

    if (existingCategory.blog.user_id.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "삭제 권한이 없습니다." },
        { status: 403 },
      );
    }

    // 게시물 삭제
    await prisma.categories.delete({
      where: { id: BigInt(categoryId) },
    });

    return NextResponse.json(
      { message: "카테고리 삭제가 완료되었습니다." },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("[api/categories/:categoryId] error: ", error);
    return NextResponse.json(
      { message: "카테고리 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}
