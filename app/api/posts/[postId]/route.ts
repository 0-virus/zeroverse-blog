import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
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
        { message: "수정할 게시물을 찾을 수 없습니다." },
        { status: 400 },
      );
    }
    const { categoryId, title, content, representativeImageId, status } = body;

    // URL 파라미터 불러오기
    const { postId } = await params;
    if (!postId) {
      return NextResponse.json(
        { message: "잘못된 요청입니다." },
        { status: 400 },
      );
    }

    // 권한 확인 & 카테고리 검증
    const [existingPost, category] = await Promise.all([
      prisma.posts.findUnique({
        where: { id: Number(postId) },
        include: { blog: true },
      }),
      categoryId === null
        ? Promise.resolve(null)
        : prisma.categories.findUnique({
            where: { id: categoryId },
          }),
    ]);

    if (!existingPost) {
      return NextResponse.json(
        { message: "수정할 게시물을 찾을 수 없습니다." },
        { status: 400 },
      );
    }

    if (existingPost.blog.user_id.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "수정 권한이 없습니다." },
        { status: 403 },
      );
    }

    if (categoryId && !category) {
      return NextResponse.json(
        { message: "해당 카테고리를 찾을 수 없습니다." },
        { status: 400 },
      );
    }

    // 게시물 수정
    const post = await prisma.posts.update({
      where: { id: Number(postId) },
      data: {
        title: title,
        content: content,
        category_id: categoryId,
        representative_image_id: representativeImageId,
        status: status,
      },
    });

    return NextResponse.json({ message: "게시물 수정에 성공했습니다.", post });
  } catch (error: any) {
    return NextResponse.json(
      { message: "게시물 수정에 실패했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
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
    const { postId } = await params;
    if (!postId) {
      return NextResponse.json(
        { message: "URL 파라미터가 유효하지 않습니다." },
        { status: 400 },
      );
    }

    // 권한 확인
    const existingPost = await prisma.posts.findUnique({
      where: { id: Number(postId) },
      include: { blog: true },
    });
    if (!existingPost) {
      return NextResponse.json(
        { message: "삭제할 게시물을 찾을 수 없습니다." },
        { status: 400 },
      );
    }

    if (existingPost.blog.user_id.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "삭제 권한이 없습니다." },
        { status: 403 },
      );
    }

    // 게시물 삭제
    await prisma.posts.delete({
      where: { id: Number(postId) },
    });

    return NextResponse.json(
      { message: "게시물 삭제가 완료되었습니다." },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "게시물 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}
