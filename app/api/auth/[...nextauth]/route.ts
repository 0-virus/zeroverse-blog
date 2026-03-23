import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일 또는 비밀번호가 입력되지 않았습니다.");
        }

        // 데이터베이스에서 사용자 조회
        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
          throw new Error("존재하지 않는 이메일입니다.");
        }

        // 비밀번호 검증
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isPasswordValid) {
          throw new Error("비밀번호가 일치하지 않습니다.");
        }

        // 인증된 사용자 정보 반환
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          profile_img: user.profile_img ?? undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nickname = (user as any).nickname;
        token.profile_img = (user as any).profile_img;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).nickname = token.nickname;
        (session.user as any).profile_img = token.profile_img;
      }
      return session;
    },
  },
  // pages: {
  //   signIn: "/auth/signin",
  // },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
