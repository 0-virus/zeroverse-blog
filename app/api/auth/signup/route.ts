import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 요청 데이터 파싱
    const body = await req.json();
    if (!body) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 },
      );
    }
    const { email, password, name, nickname, blogTitle, urlSlug, birthdate } =
      body;

    // 필수 값 확인
    if (!email || !password || !name || !nickname) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // User + Blog 생성
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        birthdate: birthdate ? new Date(birthdate) : null,
        name,
        nickname,
        blog: {
          create: {
            title: blogTitle,
            url_slug: urlSlug,
          },
        },
      },
    });
    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Email or nickname already exists" },
        { status: 409 },
      );
    } else if (error.code === "P2003") {
      return NextResponse.json(
        { message: "Blog creation failed due to invalid data" },
        { status: 400 },
      );
    } else {
      console.error("[api/auth/signup] error: ", error);
      return NextResponse.json(
        { message: "Failed to create user", error: error.message },
        { status: 500 },
      );
    }
  }
}
