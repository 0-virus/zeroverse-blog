export default async function BlogPage({
  params,
}: {
  params: Promise<{ blogSlug: string }>;
}) {
  const { blogSlug } = await params;

  return (
    <main>
      {/* 블로그 헤더: 블로그 제목, 대표 이미지 */}
      <section>
        <h1>블로그 제목</h1>
        {/* 대표 이미지 영역 */}
      </section>

      {/* 사이드바: 카테고리 목록, 프로필 정보 */}
      <aside>
        {/* 카테고리 네비게이션 (접이식) */}
      </aside>

      {/* 게시글 목록 */}
      <section>
        {/* 게시글 카드: 제목, 내용 미리보기, 날짜, 댓글 수 */}
        {/* "이건 글 제목이란다 오마하하" 스타일의 게시글 미리보기 */}
      </section>
    </main>
  );
}
