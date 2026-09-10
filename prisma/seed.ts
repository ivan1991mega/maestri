import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({
    where: { email: { in: ["mario@scuola.it", "admin@scuola.it"] } },
  });

  const adminPass = await bcrypt.hash("admin123", 10);
  const maestroPass = await bcrypt.hash("jappo123", 10);

  await prisma.user.upsert({
    where: { email: "stetasca@gmail.com" },
    update: { name: "Stefano Tasca", role: Role.ADMIN, active: true },
    create: {
      email: "stetasca@gmail.com",
      name: "Stefano Tasca",
      passwordHash: adminPass,
      role: Role.ADMIN,
      hourlyRate: 0,
    },
  });

  await prisma.user.upsert({
    where: { email: "jappotasca@gmail.com" },
    update: { name: "Jacopo Tasca", role: Role.INSTRUCTOR, active: true },
    create: {
      email: "jappotasca@gmail.com",
      name: "Jacopo Tasca",
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

  console.log("Seed ok");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
