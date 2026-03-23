import Link from "next/link";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* 설정 페이지 상단 탭 네비게이션 */}
      <nav>
        <Link href="/settings">기본 정보</Link>
        <Link href="/settings/universe">유니버스 관리</Link>
        <Link href="/settings/posts">글 관리</Link>
      </nav>

      {/* 설정 서브 네비게이션: 기본 정보 | 유니버스 관리 | 글 관리 */}
      <nav>
        <Link href="/settings">기본 정보</Link>
        <Link href="/settings/universe">유니버스 관리</Link>
        <Link href="/settings/posts">글 관리</Link>
      </nav>

      {children}
    </div>
  );
}
