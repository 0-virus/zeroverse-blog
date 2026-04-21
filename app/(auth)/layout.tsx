export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(farthest-corner at 10% 0%, var(--primary-light), #fffade 80%, var(--background) 100%)",
      }}
    >
      {children}
      <footer className="mt-8 text-xs text-muted">
        <p>Copyright &copy; ZV Corp. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
