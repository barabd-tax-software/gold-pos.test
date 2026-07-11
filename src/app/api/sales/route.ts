import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CartItemInput = { productId: string; quantity: number };

export async function GET() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json(sales);
}

export async function POST(request: NextRequest) {
  let body: { items?: CartItemInput[]; cashier?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const items = body.items ?? [];
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "Cart is empty. Add at least one item." },
      { status: 400 },
    );
  }

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Unknown product: ${item.productId}` },
        { status: 400 },
      );
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return NextResponse.json(
        { error: `Invalid quantity for ${product.name}` },
        { status: 400 },
      );
    }
    if (item.quantity > product.stock) {
      return NextResponse.json(
        { error: `Not enough stock for ${product.name} (have ${product.stock})` },
        { status: 400 },
      );
    }
  }

  const totalCents = items.reduce((sum, item) => {
    const product = productById.get(item.productId)!;
    return sum + product.priceCents * item.quantity;
  }, 0);

  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        totalCents,
        cashier: body.cashier?.trim() || "Front Desk",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPriceCents: productById.get(item.productId)!.priceCents,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  return NextResponse.json(sale, { status: 201 });
}
