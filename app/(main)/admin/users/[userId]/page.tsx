export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return (
    <main>
      <h1>사용자 관리</h1>

      {/* 글 관리 섹션 */}
      <section>
        <h2>글 관리</h2>
        {/* 해당 사용자의 게시글 목록 및 관리 */}
      </section>

      {/* 계정 관리 섹션 */}
      <section>
        <h2>계정 관리</h2>
        {/* 계정 정지, 삭제 등 */}
      </section>
    </main>
  );
}
