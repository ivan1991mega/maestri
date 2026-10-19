const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({
    where: { email: { in: ["mario@scuola.it", "admin@scuola.it"] } },
  });
  try {
    await prisma.user.updateMany({
      where: { email: "sciclubplaylife@gmail.com" },
      data: { email: "jappotasca@gmail.com", name: "Jacopo Tasca" },
    });
  } catch (e) {}
  try {
    await prisma.user.updateMany({
      where: { email: { in: ["enrico@zen.it", "zen.enrcio@gmail.com"] } },
      data: { email: "zen.enrico@gmail.com", name: "Enrico" },
    });
  } catch (e) {}

  const adminPass = await bcrypt.hash("admin123", 10);
  const maestroPass = await bcrypt.hash("jappo123", 10);
  const enricoPass = await bcrypt.hash("enrico123", 10);

  await prisma.user.upsert({
    where: { email: "stetasca@gmail.com" },
    update: { name: "Stefano Tasca", role: "ADMIN", active: true },
    create: {
      email: "stetasca@gmail.com",
      name: "Stefano Tasca",
      passwordHash: adminPass,
      role: "ADMIN",
      hourlyRate: 0,
    },
  });

  await prisma.user.upsert({
    where: { email: "jappotasca@gmail.com" },
    update: { name: "Jacopo Tasca", role: "INSTRUCTOR", active: true },
    create: {
      email: "jappotasca@gmail.com",
      name: "Jacopo Tasca",
      passwordHash: maestroPass,
      role: "INSTRUCTOR",
      hourlyRate: 28,
    },
  });

  await prisma.user.upsert({
    where: { email: "zen.enrico@gmail.com" },
    update: {
      name: "Enrico",
      role: "INSTRUCTOR",
      active: true,
      passwordHash: enricoPass,
    },
    create: {
      email: "zen.enrico@gmail.com",
      name: "Enrico",
      passwordHash: enricoPass,
      role: "INSTRUCTOR",
      hourlyRate: 28,
    },
  });

  await prisma.setting.upsert({
    where: { id: "app" },
    update: {},
    create: { id: "app" },
  });

  console.log("Seed ok");
  console.log("Admin: stetasca@gmail.com / admin123");
  console.log("Maestro: jappotasca@gmail.com / jappo123");
  console.log("Enrico: zen.enrico@gmail.com / enrico123");
}

main()
  .catch((e) => {
    console.error("Seed skipped:", e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
