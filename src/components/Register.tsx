"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney, formatWeight } from "@/lib/format";

export type ProductDTO = {
  id: string;
  name: string;
  sku: string;
  category: string;
  weight: number;
  priceCents: number;
  stock: number;
};

type CartLine = { product: ProductDTO; quantity: number };

export default function Register({ products }: { products: ProductDTO[] }) {
  const router = useRouter();
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [cashier, setCashier] = useState("Front Desk");
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "saving" }
    | { kind: "error"; message: string }
    | { kind: "success"; total: number; saleId: string }
  >({ kind: "idle" });

  const lines = Object.values(cart);
  const totalCents = useMemo(
    () => lines.reduce((sum, l) => sum + l.product.priceCents * l.quantity, 0),
    [lines],
  );
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  function addToCart(product: ProductDTO) {
    setStatus({ kind: "idle" });
    setCart((prev) => {
      const existing = prev[product.id];
      const nextQty = (existing?.quantity ?? 0) + 1;
      if (nextQty > product.stock) return prev;
      return { ...prev, [product.id]: { product, quantity: nextQty } };
    });
  }

  function setQuantity(productId: string, quantity: number) {
    setCart((prev) => {
      const line = prev[productId];
      if (!line) return prev;
      const clamped = Math.max(0, Math.min(quantity, line.product.stock));
      if (clamped === 0) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: { ...line, quantity: clamped } };
    });
  }

  function clearCart() {
    setCart({});
    setStatus({ kind: "idle" });
  }

  async function checkout() {
    if (lines.length === 0) return;
    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashier,
          items: lines.map((l) => ({
            productId: l.product.id,
            quantity: l.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ kind: "error", message: data.error ?? "Checkout failed" });
        return;
      }
      setStatus({ kind: "success", total: data.totalCents, saleId: data.id });
      setCart({});
      router.refresh();
    } catch {
      setStatus({ kind: "error", message: "Network error during checkout" });
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="lg:col-span-2">
        <h2 className="mb-3 text-lg font-semibold text-zinc-800">Catalog</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => {
            const inCart = cart[p.id]?.quantity ?? 0;
            const soldOut = p.stock - inCart <= 0;
            return (
              <button
                key={p.id}
                type="button"
                data-testid="product-card"
                onClick={() => addToCart(p)}
                disabled={soldOut}
                className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition-all hover:border-amber-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-xs font-medium uppercase tracking-wide text-amber-600">
                  {p.category}
                </span>
                <span className="mt-1 font-semibold text-zinc-900">{p.name}</span>
                <span className="text-xs text-zinc-500">
                  {p.sku} · {formatWeight(p.weight)}
                </span>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-zinc-900">
                    {formatMoney(p.priceCents)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {soldOut ? "Sold out" : `${p.stock - inCart} left`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="lg:col-span-1">
        <div className="sticky top-6 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-800">Cart</h2>
            <span
              data-testid="cart-count"
              className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-medium text-amber-800"
            >
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {lines.length === 0 && (
              <p className="text-sm text-zinc-500">
                Tap a product to add it to the sale.
              </p>
            )}
            {lines.map((l) => (
              <div
                key={l.product.id}
                data-testid="cart-line"
                className="flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-800">
                    {l.product.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatMoney(l.product.priceCents)} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Decrease ${l.product.name}`}
                    onClick={() => setQuantity(l.product.id, l.quantity - 1)}
                    className="h-7 w-7 rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">
                    {l.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase ${l.product.name}`}
                    onClick={() => setQuantity(l.product.id, l.quantity + 1)}
                    className="h-7 w-7 rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-zinc-200 pt-4">
            <label className="block text-xs font-medium text-zinc-500">
              Cashier
              <input
                type="text"
                value={cashier}
                onChange={(e) => setCashier(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 focus:border-amber-400 focus:outline-none"
              />
            </label>

            <div className="mt-4 flex items-center justify-between text-base">
              <span className="font-medium text-zinc-600">Total</span>
              <span
                data-testid="cart-total"
                className="text-2xl font-bold text-zinc-900"
              >
                {formatMoney(totalCents)}
              </span>
            </div>

            <button
              type="button"
              data-testid="checkout"
              onClick={checkout}
              disabled={lines.length === 0 || status.kind === "saving"}
              className="mt-4 w-full rounded-lg bg-amber-500 px-4 py-3 text-center font-semibold text-amber-950 shadow-sm transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status.kind === "saving" ? "Processing…" : "Complete Sale"}
            </button>
            {lines.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="mt-2 w-full rounded-lg px-4 py-2 text-center text-sm text-zinc-500 hover:text-zinc-700"
              >
                Clear cart
              </button>
            )}

            {status.kind === "success" && (
              <p
                data-testid="checkout-success"
                className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700"
              >
                Sale complete — {formatMoney(status.total)} charged. Receipt #
                {status.saleId.slice(-6)}
              </p>
            )}
            {status.kind === "error" && (
              <p
                data-testid="checkout-error"
                className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {status.message}
              </p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
