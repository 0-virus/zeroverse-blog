"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("아이디 또는 비밀번호가 일치하지 않습니다.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="w-[360px]">
      {/* 로고 */}
      <div className="text-center mb-6">
        <Link href="/" className="text-2xl font-bold text-primary">
          Zero:Verse
        </Link>
      </div>

      <div className="rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="아이디"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="ring-1 ring-gray-400 w-full h-11 px-4 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="ring-1 ring-gray-400 w-full h-11 px-4 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="ring-2 ring-primary-light px-8 py-2.5 bg-white rounded-full text-sm font-bold hover:brightness-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </div>
        </form>
      </div>

      <div className="text-center mt-6">
        <Link
          href="/signup"
          className="text-sm text-foreground hover:underline"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
