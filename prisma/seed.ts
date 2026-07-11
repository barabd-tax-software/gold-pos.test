import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  { name: "Gold Ring 22K", sku: "RING-22K-01", category: "Rings", weight: 4.5, priceCents: 34500, stock: 12 },
  { name: "Gold Chain 22K", sku: "CHAIN-22K-01", category: "Chains", weight: 12.0, priceCents: 92000, stock: 8 },
  { name: "Gold Bangle 22K", sku: "BANG-22K-01", category: "Bangles", weight: 15.5, priceCents: 118500, stock: 6 },
  { name: "Gold Earrings 18K", sku: "EAR-18K-01", category: "Earrings", weight: 3.2, priceCents: 24000, stock: 20 },
  { name: "Gold Pendant 18K", sku: "PEND-18K-01", category: "Pendants", weight: 2.8, priceCents: 21000, stock: 15 },
  { name: "Gold Coin 1g 24K", sku: "COIN-24K-1G", category: "Coins", weight: 1.0, priceCents: 8500, stock: 50 },
  { name: "Gold Coin 5g 24K", sku: "COIN-24K-5G", category: "Coins", weight: 5.0, priceCents: 42000, stock: 30 },
  { name: "Gold Nose Pin 18K", sku: "NOSE-18K-01", category: "Nose Pins", weight: 0.6, priceCents: 5200, stock: 40 },
];

async function main() {
  console.log("Seeding products...");
  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: p,
      create: p,
    });
  }
  const count = await prisma.product.count();
  console.log(`Seed complete. ${count} products in catalog.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
