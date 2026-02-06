import { prisma } from "./lib/prisma";

async function main() {
  const users = await prisma.users.findMany();
  console.log("Users:", users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
