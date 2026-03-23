export default function SettingsPostsPage() {
  return (
    <main>
      <h1>글 관리</h1>

      {/* 카테고리 관리 */}
      <section>
        <h2>카테고리 관리</h2>

        {/* 카테고리 트리: 드래그 앤 드롭으로 순서 변경 가능 */}
        <div>
          {/* 카테고리 목록 (트리 구조) */}
          {/* 각 카테고리: 이름, 글 수 */}
        </div>

        {/* 카테고리 관리 버튼 */}
        <div>
          <button>메인 카테고리 추가</button>
          <button>서브 카테고리 추가</button>
          <button>삭제</button>
          <button>구분선 삽입</button>
          <button>펼쳐 보이기 해제(하위 카테고리는 대표로 노출되지 않습니다.)</button>
        </div>
      </section>
    </main>
  );
}
