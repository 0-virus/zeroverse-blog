import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    // URL에서 쿼리 파라미터 가져오기
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const skip = (page - 1) * limit;

    // Path Parameter 불러오기
    const { postId } = await params;
    if (!postId) {
      return NextResponse.json(
        { message: "Path Parameter가 유효하지 않습니다." },
        { status: 400 },
      );
    }

    // 표시할 게시물 불러오기
    const post = await prisma.posts.findUnique({
      where: { id: BigInt(postId) },
      include: { likes: true, comments: true },
    });
    if (!post) {
      return NextResponse.json(
        { message: "게시물이 존재하지 않습니다." },
        { status: 400 },
      );
    }

    // 게시물 목록, 개수 불러오기
    // 카테고리 미분류시 전체 글을 불러옵니다.
    const [totalCount, postList] = await Promise.all([
      prisma.posts.count({
        where: post.category_id
          ? {
              status: "published",
              blog_id: post.blog_id,
              category_id: BigInt(post.category_id),
            }
          : { status: "published", blog_id: post.blog_id },
      }),
      prisma.posts.findMany({
        where: post.category_id
          ? { blog_id: post.blog_id, category_id: BigInt(post.category_id) }
          : { blog_id: post.blog_id },
        orderBy: { published_at: "desc" },
        skip: skip,
        take: limit,
        include: {
          _count: {
            select: { comments: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      post,
      postList: {
        pagination: {
          page,
          limit,
          totalCount,
          totalPage: Math.ceil(totalCount / limit),
        },
        data: postList,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "게시물 조회 실패..." },
      { status: 500 },
    );
  }
}

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

    // Path Parameter 불러오기
    const { postId } = await params;
    if (!postId) {
      return NextResponse.json(
        { message: "Path Parameter가 유효하지 않습니다." },
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

    return NextResponse.json(
      { message: "게시물 수정에 성공했습니다.", post },
      { status: 200 },
    );
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
