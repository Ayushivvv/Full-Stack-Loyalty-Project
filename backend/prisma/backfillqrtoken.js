import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { qrToken: null },
  });

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { qrToken: randomUUID() },
    });
  }

  console.log("Backfilled QR tokens for all users.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
