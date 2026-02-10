import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nickname?: string;
      profile_img?: string;
    } & DefaultSession["user"]; // 기존 name, email, image 유지
  }

  interface User {
    id: string;
    nickname?: string;
    profile_img?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nickname?: string;
    profile_img?: string;
  }
}
