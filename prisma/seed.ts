import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash("admin123", 10);
  const maestroPass = await bcrypt.hash("maestro123", 10);

  await prisma.user.upsert({
    where: { email: "admin@scuola.it" },
    update: {},
    create: {
      email: "admin@scuola.it",
      name: "Amministratore",
      passwordHash: adminPass,
      role: Role.ADMIN,
      hourlyRate: 0,
    },
  });

  await prisma.user.upsert({
    where: { email: "mario@scuola.it" },
    update: {},
    create: {
      email: "mario@scuola.it",
      name: "Mario Rossi",
      passwordHash: maestroPass,
      role: Role.INSTRUCTOR,
      hourlyRate: 28,
    },
  });

  await prisma.setting.upsert({
    where: { id: "app" },
    update: {},
    create: { id: "app" },
  });

  console.log("Seed ok. Admin: admin@scuola.it / admin123");
  console.log("Maestro: mario@scuola.it / maestro123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
