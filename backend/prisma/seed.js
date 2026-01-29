import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create branches
  console.log("📍 Creating branches...");
  const branches = await Promise.all([
    prisma.branch.upsert({
      where: { name: "Nairobi HQ" },
      update: {},
      create: {
        name: "Nairobi HQ",
        location: "Nairobi, Kenya",
        isHQ: true,
      },
    }),
    prisma.branch.upsert({
      where: { name: "Kisumu" },
      update: {},
      create: {
        name: "Kisumu",
        location: "Kisumu, Kenya",
        isHQ: false,
      },
    }),
    prisma.branch.upsert({
      where: { name: "Mombasa" },
      update: {},
      create: {
        name: "Mombasa",
        location: "Mombasa, Kenya",
        isHQ: false,
      },
    }),
    prisma.branch.upsert({
      where: { name: "Nakuru" },
      update: {},
      create: {
        name: "Nakuru",
        location: "Nakuru, Kenya",
        isHQ: false,
      },
    }),
    prisma.branch.upsert({
      where: { name: "Eldoret" },
      update: {},
      create: {
        name: "Eldoret",
        location: "Eldoret, Kenya",
        isHQ: false,
      },
    }),
  ]);
  console.log(`✅ Created ${branches.length} branches`);

  console.log("🥤 Creating products...");
  const products = await Promise.all([
    prisma.product.upsert({
      where: { name: "Coke" },
      update: {},
      create: {
        name: "Coke",
        price: 80.0,
        description: "Coca-Cola 500ml",
      },
    }),
    prisma.product.upsert({
      where: { name: "Fanta" },
      update: {},
      create: {
        name: "Fanta",
        price: 75.0,
        description: "Fanta Orange 500ml",
      },
    }),
    prisma.product.upsert({
      where: { name: "Sprite" },
      update: {},
      create: {
        name: "Sprite",
        price: 75.0,
        description: "Sprite 500ml",
      },
    }),
  ]);
  console.log(`✅ Created ${products.length} products`);

  console.log("📦 Creating inventory...");
  const inventoryData = [];
  for (const branch of branches) {
    for (const product of products) {
      // HQ has more stock, other branches vary
      let quantity = 0;
      if (branch.isHQ) {
        quantity = Math.floor(Math.random() * 500) + 500; // 500-1000 units
      } else {
        quantity = Math.floor(Math.random() * 200) + 100; // 100-300 units
      }

      inventoryData.push({
        branchId: branch.id,
        productId: product.id,
        quantity: quantity,
        lowStockThreshold: 50,
        lastRestocked: new Date(),
      });
    }
  }

  await prisma.inventory.createMany({
    data: inventoryData,
    skipDuplicates: true,
  });
  console.log(`✅ Created ${inventoryData.length} inventory records`);

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

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
