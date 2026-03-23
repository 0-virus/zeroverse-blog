export default async function EditPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;

  return (
    <main>
      <h1>글 수정하기</h1>

      {/* 대표 이미지 업로드 영역 */}
      <section>{/* 이미지 드래그 앤 드롭 / 업로드 */}</section>

      {/* TipTap 에디터 영역 (기존 내용 로드) */}
      <section>{/* TipTap 에디터 */}</section>

      {/* 하단 버튼 */}
      <div>
        <button>임시저장</button>
        <button>등록</button>
      </div>
    </main>
  );
}
