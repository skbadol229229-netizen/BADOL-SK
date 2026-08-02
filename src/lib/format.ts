export function formatBDT(amount: number): string {
  return `৳${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function discountPercent(regular: number, sale: number | null): number | null {
  if (!sale || sale >= regular) return null;
  return Math.round(((regular - sale) / regular) * 100);
}

export function effectivePrice(regular: number, sale: number | null): number {
  return sale && sale < regular ? sale : regular;
}
