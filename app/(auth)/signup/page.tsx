"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    nickname: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (form.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    let birthdate: string | undefined;
    if (form.birthYear && form.birthMonth && form.birthDay) {
      const y = form.birthYear.padStart(4, "0");
      const m = form.birthMonth.padStart(2, "0");
      const d = form.birthDay.padStart(2, "0");
      birthdate = `${y}-${m}-${d}`;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          nickname: form.nickname,
          blogTitle: `${form.nickname}의 블로그`,
          urlSlug: form.nickname.toLowerCase().replace(/[^a-z0-9가-힣-]/g, ""),
          birthdate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setError("이미 사용 중인 이메일 또는 별명입니다.");
        } else {
          setError(data.message || "회원가입에 실패했습니다.");
        }
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch {
      setError("서버 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="w-[420px]">
      <div className="rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-primary text-center mb-6">
          Zero:Verse
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="아이디"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
            className="ring-1 ring-gray-400 w-full h-10 px-4 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
            className="ring-1 ring-gray-400 w-full h-10 px-4 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={form.passwordConfirm}
            onChange={(e) => updateField("passwordConfirm", e.target.value)}
            required
            className="ring-1 ring-gray-400 w-full h-10 px-4 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div>
            <p className="text-sm mb-2">생년월일</p>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="연도"
                value={form.birthYear}
                onChange={(e) => updateField("birthYear", e.target.value)}
                className="ring-1 ring-gray-400 w-full h-10 px-3 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="월"
                value={form.birthMonth}
                onChange={(e) => updateField("birthMonth", e.target.value)}
                min={1}
                max={12}
                className="ring-1 ring-gray-400 w-full h-10 px-3 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="일"
                value={form.birthDay}
                onChange={(e) => updateField("birthDay", e.target.value)}
                min={1}
                max={31}
                className="ring-1 ring-gray-400 w-full h-10 px-3 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <input
            type="text"
            placeholder="이름"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            className="ring-1 ring-gray-400 w-full h-10 px-4 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="별명"
            value={form.nickname}
            onChange={(e) => updateField("nickname", e.target.value)}
            required
            className="ring-1 ring-gray-400 w-full h-10 px-4 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <div className="flex justify-center pt-3">
            <button
              type="submit"
              disabled={loading}
              className="ring-2 ring-primary-light px-8 py-2.5 bg-white rounded-full text-sm font-bold hover:bg-muted-bg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "생성 중..." : "유니버스 생성"}
            </button>
          </div>
        </form>
      </div>

      <div className="text-center mt-6">
        <Link href="/login" className="text-sm text-foreground hover:underline">
          이미 계정이 있으신가요? 로그인
        </Link>
      </div>
    </div>
  );
}
