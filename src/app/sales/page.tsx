import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });

  const revenueCents = sales.reduce((sum, s) => sum + s.totalCents, 0);

  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-800">Sales history</h2>
          <p className="text-sm text-zinc-500">
            {sales.length} sale{sales.length === 1 ? "" : "s"} ·{" "}
            {formatMoney(revenueCents)} total revenue
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-400"
        >
          New sale
        </Link>
      </div>

      {sales.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          No sales yet. Complete a sale on the register to see it here.
        </p>
      ) : (
        <ul className="space-y-3" data-testid="sales-list">
          {sales.map((sale) => (
            <li
              key={sale.id}
              data-testid="sale-row"
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-zinc-900">
                    Receipt #{sale.id.slice(-6)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(sale.createdAt).toLocaleString()} · {sale.cashier}
                  </p>
                </div>
                <span className="text-lg font-bold text-zinc-900">
                  {formatMoney(sale.totalCents)}
                </span>
              </div>
              <ul className="mt-3 divide-y divide-zinc-100 border-t border-zinc-100 text-sm">
                {sale.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-zinc-700">
                      {item.quantity} × {item.product.name}
                    </span>
                    <span className="text-zinc-500">
                      {formatMoney(item.unitPriceCents * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
