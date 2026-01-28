import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.sale.deleteMany();
  await prisma.user.deleteMany();
  const password = await bcrypt.hash("password123", 10);

  // -------------------------
  // ADMINS
  // -------------------------
  const admins = await prisma.user.createMany({
    data: [
      {
        email: "admin1@example.com",
        firstName: "Alice",
        lastName: "Ankle",
        password,
        role: "ADMIN",
      },
      {
        email: "admin2@example.com",
        firstName: "Bob",
        lastName: "Boss",
        password,
        role: "ADMIN",
      },
    ],
  });

  console.log("✅ Admins created");

  // -------------------------
  // Default Users
  // -------------------------
  const usersData = [
    {
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      password,
    },
    {
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith",
      password,
    },
  ];

  const users = [];

  for (const user of usersData) {
    const createdUser = await prisma.user.create({
      data: {
        ...user,
        role: "USER",
      },
    });
    users.push(createdUser);
  }

  console.log("✅ users created");

  // -------------------------
  // SALES (linked to users)
  // -------------------------
  const salesData = [];

  const branches = await prisma.branch.findMany();

  for (const branch of branches) {
    const numberOfSales = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < numberOfSales; i++) {
      salesData.push({
        totalAmount: parseFloat((Math.random() * 5000 + 500).toFixed(2)),
        branchId: branch.id,
        mpesaReference: crypto.randomUUID(),
        transactionDate: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
        ),
      });
    }
  }

  await prisma.sale.createMany({
    data: salesData,
  });

  console.log(`✅ ${salesData.length} sales created`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
