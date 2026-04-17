import { PrismaClient } from "./app/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasourceUrl: process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL,
});

async function main() {
  console.log("🗑️  Cleaning existing data...");
  await prisma.notifications.deleteMany();
  await prisma.likes.deleteMany();
  await prisma.comments.deleteMany();
  await prisma.post_tags.deleteMany();
  await prisma.post_images.deleteMany();
  await prisma.posts.deleteMany();
  await prisma.categories.deleteMany();
  await prisma.neighbors.deleteMany();
  await prisma.tags.deleteMany();
  await prisma.blogs.deleteMany();
  await prisma.users.deleteMany();

  console.log("👤 Creating users + blogs...");
  const hashed = await bcrypt.hash("password123", 10);

  const userA = await prisma.users.create({
    data: {
      email: "testa@example.com",
      password: hashed,
      name: "유저A",
      nickname: "userA",
      profile_img: "https://example.com/a.png",
      blog: {
        create: {
          title: "A의 블로그",
          url_slug: "user-a",
          description: "A의 일상 기록",
        },
      },
    },
    include: { blog: true },
  });

  const userB = await prisma.users.create({
    data: {
      email: "testb@example.com",
      password: hashed,
      name: "유저B",
      nickname: "userB",
      blog: {
        create: {
          title: "B의 블로그",
          url_slug: "user-b",
          description: "B의 기록",
        },
      },
    },
    include: { blog: true },
  });

  const userC = await prisma.users.create({
    data: {
      email: "testc@example.com",
      password: hashed,
      name: "유저C",
      nickname: "userC",
      blog: {
        create: {
          title: "C의 블로그",
          url_slug: "user-c",
        },
      },
    },
    include: { blog: true },
  });

  console.log("📁 Creating categories...");
  const catDev = await prisma.categories.create({
    data: {
      blog_id: userA.blog!.id,
      name: "개발",
      order_index: 0,
      is_representative: true,
    },
  });
  const catDesign = await prisma.categories.create({
    data: { blog_id: userA.blog!.id, name: "디자인", order_index: 1 },
  });
  const catDaily = await prisma.categories.create({
    data: { blog_id: userB.blog!.id, name: "일상", order_index: 0 },
  });
  const catPhoto = await prisma.categories.create({
    data: { blog_id: userC.blog!.id, name: "사진", order_index: 0 },
  });

  console.log("📝 Creating posts...");
  const now = new Date();
  const postA1 = await prisma.posts.create({
    data: {
      blog_id: userA.blog!.id,
      category_id: catDev.id,
      title: "첫 번째 글",
      content: "첫 번째 글 내용입니다. ".repeat(20),
      status: "published",
      published_at: now,
    },
  });
  const postA2 = await prisma.posts.create({
    data: {
      blog_id: userA.blog!.id,
      category_id: catDev.id,
      title: "두 번째 글",
      content: "두 번째 글 내용입니다. ".repeat(20),
      status: "published",
      published_at: now,
    },
  });
  const postA3 = await prisma.posts.create({
    data: {
      blog_id: userA.blog!.id,
      category_id: catDesign.id,
      title: "초안 글",
      content: "초안입니다.",
      status: "draft",
    },
  });
  const postB1 = await prisma.posts.create({
    data: {
      blog_id: userB.blog!.id,
      category_id: catDaily.id,
      title: "B의 첫 글",
      content: "B의 첫 글입니다. ".repeat(20),
      status: "published",
      published_at: now,
    },
  });
  const postC1 = await prisma.posts.create({
    data: {
      blog_id: userC.blog!.id,
      category_id: catPhoto.id,
      title: "C의 사진",
      content: "사진 설명입니다. ".repeat(20),
      status: "published",
      published_at: now,
    },
  });

  console.log("🏷️  Creating tags...");
  const tagJs = await prisma.tags.create({ data: { name: "JavaScript" } });
  const tagCss = await prisma.tags.create({ data: { name: "CSS" } });
  const tagLife = await prisma.tags.create({ data: { name: "일상" } });

  await prisma.post_tags.createMany({
    data: [
      { post_id: postA1.id, tag_id: tagJs.id },
      { post_id: postA2.id, tag_id: tagJs.id },
      { post_id: postA3.id, tag_id: tagCss.id },
      { post_id: postB1.id, tag_id: tagLife.id },
    ],
  });

  console.log("💬 Creating comments...");
  const commentB = await prisma.comments.create({
    data: {
      post_id: postA1.id,
      user_id: userB.id,
      parent_id: null,
      content: "좋은 글입니다.",
    },
  });
  const replyA = await prisma.comments.create({
    data: {
      post_id: postA1.id,
      user_id: userA.id,
      parent_id: commentB.id,
      content: "감사합니다!",
    },
  });
  const commentC = await prisma.comments.create({
    data: {
      post_id: postB1.id,
      user_id: userC.id,
      parent_id: null,
      content: "잘 읽었습니다.",
    },
  });

  console.log("❤️  Creating likes...");
  const likeB = await prisma.likes.create({
    data: { post_id: postA1.id, user_id: userB.id },
  });
  const likeC = await prisma.likes.create({
    data: { post_id: postA1.id, user_id: userC.id },
  });
  const likeA = await prisma.likes.create({
    data: { post_id: postB1.id, user_id: userA.id },
  });

  console.log("🤝 Creating neighbors...");
  await prisma.neighbors.create({
    data: { from_blog_id: userA.blog!.id, to_blog_id: userB.blog!.id },
  });
  await prisma.neighbors.create({
    data: { from_blog_id: userB.blog!.id, to_blog_id: userC.blog!.id },
  });

  console.log("🔔 Creating notifications...");
  const noti1 = await prisma.notifications.create({
    data: {
      user_id: userA.id,
      actor_id: userB.id,
      type: "COMMENT",
      target_url: `/${postA1.id}`,
      message: "userB님이 첫 번째 글에 댓글을 남겼습니다.",
    },
  });
  const noti2 = await prisma.notifications.create({
    data: {
      user_id: userA.id,
      actor_id: userB.id,
      type: "LIKE",
      target_url: `/${postA1.id}`,
      message: "userB님이 첫 번째 글에 공감했습니다.",
      is_read: true,
    },
  });

  console.log("\n✅ Seed complete!\n");
  console.log("=== Seeded IDs ===");
  console.log(
    JSON.stringify(
      {
        userA: { id: userA.id.toString(), blogId: userA.blog!.id.toString() },
        userB: { id: userB.id.toString(), blogId: userB.blog!.id.toString() },
        userC: { id: userC.id.toString(), blogId: userC.blog!.id.toString() },
        categories: {
          catDev: catDev.id.toString(),
          catDesign: catDesign.id.toString(),
          catDaily: catDaily.id.toString(),
          catPhoto: catPhoto.id.toString(),
        },
        posts: {
          postA1: postA1.id.toString(),
          postA2: postA2.id.toString(),
          postA3: postA3.id.toString(),
          postB1: postB1.id.toString(),
          postC1: postC1.id.toString(),
        },
        comments: {
          commentB: commentB.id.toString(),
          replyA: replyA.id.toString(),
          commentC: commentC.id.toString(),
        },
        likes: {
          likeB: likeB.id.toString(),
          likeC: likeC.id.toString(),
          likeA: likeA.id.toString(),
        },
        notifications: {
          noti1: noti1.id.toString(),
          noti2: noti2.id.toString(),
        },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
