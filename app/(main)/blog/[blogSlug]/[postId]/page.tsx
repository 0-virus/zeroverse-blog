export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ blogSlug: string; postId: string }>;
}) {
  const { blogSlug, postId } = await params;

  return (
    <main>
      {/* 게시글 상세 */}
      <article>
        <h1>게시글 제목</h1>
        {/* 게시글 본문 */}
      </article>

      {/* 공감 버튼 */}

      {/* 댓글 영역 */}
      <section>
        <h2>댓글</h2>
        {/* 댓글 목록 */}
        {/* 댓글 작성 폼 */}
      </section>
    </main>
  );
}
