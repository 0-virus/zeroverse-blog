import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
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

    // Path Parameter 불러오기
    const { postId } = await params;
    if (!postId) {
      return NextResponse.json(
        { message: "Path Parameter가 유효하지 않습니다." },
        { status: 400 },
      );
    }

    // Request Body 불러오기
    const body = await request.json();
    if (!body) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 },
      );
    }
    const { parentId, content } = body;

    // 파라미터 유효성 검증
    if (!content) {
      return NextResponse.json(
        { message: "필수 항목(내용)이 누락되었습니다." },
        { status: 400 },
      );
    }
    if (parentId === undefined) {
      return NextResponse.json(
        { message: "필수 항목(상위 댓글 ID)이 누락되었습니다." },
        { status: 400 },
      );
    }
    if (isNaN(Number(parentId))) {
      return NextResponse.json(
        { message: "상위 댓글 ID 항목이 유효하지 않습니다." },
        { status: 400 },
      );
    }

    // 댓글 생성
    const comment = await prisma.comments.create({
      data: {
        post_id: BigInt(postId),
        user_id: BigInt(session.user.id),
        parent_id: parentId === null ? null : BigInt(parentId),
        content,
      },
    });

    // 알림 생성
    let notification;
    if (parentId === null) {
      // 게시물 정보 불러오기
      const post = await prisma.posts.findUnique({
        where: { id: BigInt(postId) },
        select: {
          title: true,
          blog: {
            select: { user_id: true },
          },
        },
      });
      if (!post) {
        return NextResponse.json(
          { message: "게시물 정보가 없습니다." },
          { status: 404 },
        );
      }
      notification = await prisma.notifications.create({
        data: {
          user_id: post.blog.user_id,
          actor_id: BigInt(session.user.id),
          type: "COMMENT",
          target_url: `/${postId}`,
          message: `${session.user.nickname}님이 ${post.title}에 댓글을 남겼습니다.\n"${comment.content}"`,
        },
      });
    } else {
      const parentComment = await prisma.comments.findUnique({
        where: { id: BigInt(parentId) },
        select: {
          user_id: true,
        },
      });

      if (!parentComment) {
        return NextResponse.json(
          { message: "댓글 정보가 없습니다." },
          { status: 404 },
        );
      }

      // 부모 댓글 작성자가 없는 경우 (탈퇴한 회원 등) 알림 생성 생략하고 바로 성공 응답
      if (!parentComment.user_id) {
        return NextResponse.json(
          {
            message: "댓글 생성 성공! (알림 발송 대상 없음)",
            commentId: comment.id.toString(),
          },
          { status: 201 },
        );
      }

      notification = await prisma.notifications.create({
        data: {
          user_id: BigInt(parentComment.user_id),
          actor_id: BigInt(session.user.id),
          type: "REPLY",
          target_url: `/${postId}`,
          message: `${session.user.nickname}님이 회원님의 댓글에 답장했습니다.\n"${comment.content}"`,
        },
      });
    }

    return NextResponse.json(
      {
        message: "댓글 생성 성공!",
        commentId: comment.id.toString(),
        notificationId: notification.id.toString(),
      },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json({ message: "댓글 생성 실패..." }, { status: 500 });
  }
}
