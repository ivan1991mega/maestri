const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

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
      role: "ADMIN",
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
}

main()
  .catch((e) => {
    console.error("Seed skipped:", e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
