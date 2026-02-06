import { prisma } from "./lib/prisma";

async function main() {
  console.log("🌱 데이터 시딩 시작...\n");

  // 1. 사용자 생성
  const user = await prisma.users.create({
    data: {
      email: "zerovirus@example.com",
      password: "hashed_password_here", // 실제로는 bcrypt 해시 사용
      nickname: "제로바이러스",
      status: "activated",
    },
  });
  console.log("✅ 사용자 생성:", user.nickname);

  // 2. 블로그 생성
  const blog = await prisma.blogs.create({
    data: {
      user_id: user.id,
      title: "제로바이러스 블로그",
      url_slug: "zerovirus",
      description: "AI와 개발 이야기",
      profile_img: "/default-profile.jpg",
    },
  });
  console.log("✅ 블로그 생성:", blog.title);

  // 3. 카테고리 생성
  const category = await prisma.categories.create({
    data: {
      blog_id: blog.id,
      name: "개발",
      type: "default",
      is_representative: true,
      order_index: 0,
    },
  });
  console.log("✅ 카테고리 생성:", category.name);

  // 4. 게시글 3개 생성
  const post1 = await prisma.posts.create({
    data: {
      blog_id: blog.id,
      category_id: category.id,
      title: "Prisma 시작하기",
      content: "# Prisma란?\n\nPrisma는 TypeScript ORM입니다...",
      status: "published",
      published_at: new Date("2026-02-01"),
      view_count: 42,
    },
  });

  const post2 = await prisma.posts.create({
    data: {
      blog_id: blog.id,
      category_id: category.id,
      title: "Next.js 블로그 만들기",
      content: "# Next.js로 블로그를\n\n앱 라우터를 사용해서...",
      status: "published",
      published_at: new Date("2026-02-02"),
      view_count: 128,
    },
  });

  const post3 = await prisma.posts.create({
    data: {
      blog_id: blog.id,
      category_id: category.id,
      title: "아직 작성 중인 글",
      content: "임시 저장...",
      status: "draft", // 임시 저장
    },
  });

  console.log("✅ 게시글 3개 생성 (발행 2개, 임시 1개)");

  // 5. 태그 생성 및 연결
  const tag1 = await prisma.tags.create({
    data: { name: "Prisma" },
  });

  const tag2 = await prisma.tags.create({
    data: { name: "Next.js" },
  });

  await prisma.post_tags.createMany({
    data: [
      { post_id: post1.id, tag_id: tag1.id },
      { post_id: post2.id, tag_id: tag2.id },
    ],
  });
  console.log("✅ 태그 생성 및 연결");

  console.log("\n🎉 시딩 완료!");
  console.log("\n📊 생성된 데이터:");
  console.log(`- 사용자: ${user.nickname}`);
  console.log(`- 블로그: ${blog.title}`);
  console.log(`- 카테고리: ${category.name}`);
  console.log(`- 게시글: 3개 (발행 2개, 임시 1개)`);
  console.log(`- 태그: 2개`);
}

main()
  .catch((e) => {
    console.error("❌ 에러:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
