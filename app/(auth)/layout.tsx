export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* 인증 페이지 공통 레이아웃: 중앙 정렬, 네비게이션 없음 */}
      {children}
      <footer>
        <p>Copyright &copy; ZV Corp. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
