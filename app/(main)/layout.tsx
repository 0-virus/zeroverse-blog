import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* 공통 상단 네비게이션 */}
      <header>
        <nav>
          <Link href="/">Zerocom</Link>
          <div>
            <Link href="/settings">관리</Link>
            <Link href="/blog/me">내 블로그</Link>
            <Link href="/settings/universe">나의 유니버스</Link>
            <Link href="/login">로그인</Link>
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}
