export function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatWeight(grams: number): string {
  return `${grams.toFixed(1)} g`;
}
