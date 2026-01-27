import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data (order matters)
  await prisma.sale.deleteMany();
  await prisma.user.deleteMany();

  // Hash password
  const password = await bcrypt.hash("password123", 10);

  // -------------------------
  // ADMINS
  // -------------------------
  const admins = await prisma.user.createMany({
    data: [
      {
        email: "admin1@example.com",
        firstName: "Alice",
        lastName: "Admin",
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
  // CUSTOMERS
  // -------------------------
  const customersData = [
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
    {
      email: "mike@example.com",
      firstName: "Mike",
      lastName: "Johnson",
      password,
    },
    {
      email: "susan@example.com",
      firstName: "Susan",
      lastName: "Wambui",
      password,
    },
  ];

  const customers = [];

  for (const customer of customersData) {
    const createdCustomer = await prisma.user.create({
      data: {
        ...customer,
        role: "CUSTOMER",
      },
    });
    customers.push(createdCustomer);
  }

  console.log("✅ Customers created");

  // -------------------------
  // SALES (linked to customers)
  // -------------------------
  const salesData = [];

  for (const customer of customers) {
    const numberOfSales = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < numberOfSales; i++) {
      salesData.push({
        totalAmount: parseFloat((Math.random() * 5000 + 500).toFixed(2)),
        customerId: customer.id,
        branchId: "cmkwl9m4r0000tk6c186d8ask",
        customerEmail: customer.email,
        mpesaReference: "UARQE4WKGD",
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
