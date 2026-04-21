"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Topbar */}
      <header className="bg-primary-light text-white h-10 flex items-center px-6 shrink-0">
        <nav className="flex items-center justify-between w-full max-w-[1200px] mx-auto">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-base">
              Zero:verse
            </Link>
          </div>
          <div className="flex items-center gap-5 text-sm">
            {session?.user ? (
              <>
                <Link href="/settings" className="hover:underline">
                  관리
                </Link>
                <Link href="/blog/me" className="hover:underline">
                  내 블로그
                </Link>
                <Link href="/settings/universe" className="hover:underline">
                  나의 유니버스
                </Link>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="hover:underline cursor-pointer"
                  >
                    {session.user.nickname || session.user.name}
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-8 bg-white text-foreground rounded shadow-lg border border-border py-1 min-w-[120px] z-50">
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm hover:bg-muted-bg"
                        onClick={() => setMenuOpen(false)}
                      >
                        설정
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-muted-bg cursor-pointer"
                      >
                        로그아웃
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/login" className="hover:underline">
                로그인
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-primary-light text-white text-center py-6 text-xs shrink-0">
        <p>Copyright &copy; ZV Corp. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
