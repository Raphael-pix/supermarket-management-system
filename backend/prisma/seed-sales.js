import { PrismaClient, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMpesaRef() {
  return "MPX" + Date.now() + Math.random().toString(36).substring(2, 8);
}

async function main() {
  console.log("🧹 Clearing existing sales...");
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();

  const branches = await prisma.branch.findMany();
  const products = await prisma.product.findMany();

  if (branches.length === 0 || products.length === 0) {
    throw new Error("Branches or products missing");
  }

  console.log(`📦 Seeding sales for ${branches.length} branches...`);

  for (const branch of branches) {
    const salesCount = randomInt(5, 15);

    for (let i = 0; i < salesCount; i++) {
      const itemsCount = randomInt(1, 4);
      const selectedProducts = products
        .sort(() => 0.5 - Math.random())
        .slice(0, itemsCount);

      let totalAmount = new Prisma.Decimal(0);

      const saleItems = selectedProducts.map((product) => {
        const quantity = randomInt(1, 3);
        const price = product.price;
        const subtotal = price.mul(quantity);

        totalAmount = totalAmount.add(subtotal);

        return {
          productId: product.id,
          quantity,
          priceAtSale: price,
          subtotal,
        };
      });

      await prisma.sale.create({
        data: {
          branchId: branch.id,
          mpesaReference: generateMpesaRef(),
          checkoutRequestId: randomUUID(),
          totalAmount,
          items: {
            create: saleItems,
          },
        },
      });
    }

    console.log(`✅ Seeded sales for branch: ${branch.name}`);
  }

  console.log("🎉 Sales seeding complete");
}

main()
  .catch((e) => {
    console.error("❌ Sales seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
