import { prisma } from "@/lib/prisma";
import Register from "@/components/Register";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return <Register products={products} />;
}
