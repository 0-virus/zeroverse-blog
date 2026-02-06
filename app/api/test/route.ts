import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();

  // 아주 간단한 쿼리
  const count = await prisma.posts.count();

  const duration = Date.now() - start;

  return NextResponse.json({
    count,
    duration: `${duration}ms`,
  });
}
