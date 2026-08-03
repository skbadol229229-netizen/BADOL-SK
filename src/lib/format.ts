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

export function parseSizeWeightGrams(sizeStr: string): number | null {
  if (!sizeStr) return null;
  const cleaned = sizeStr.trim().toLowerCase();

  const kgMatch = cleaned.match(/^([0-9.]+)\s*(kg|kilo|kilogram)$/);
  if (kgMatch) return parseFloat(kgMatch[1]) * 1000;

  const gMatch = cleaned.match(/^([0-9.]+)\s*(g|gm|gram|grams)$/);
  if (gMatch) return parseFloat(gMatch[1]);

  const lMatch = cleaned.match(/^([0-9.]+)\s*(l|ltr|liter|litre)$/);
  if (lMatch) return parseFloat(lMatch[1]) * 1000;

  const mlMatch = cleaned.match(/^([0-9.]+)\s*(ml)$/);
  if (mlMatch) return parseFloat(mlMatch[1]);

  const pcMatch = cleaned.match(/^([0-9.]+)\s*(pc|pcs|piece|pieces|dozen)$/);
  if (pcMatch) {
    const val = parseFloat(pcMatch[1]);
    if (cleaned.includes("dozen")) return val * 12;
    return val;
  }

  const numMatch = cleaned.match(/^([0-9.]+)$/);
  if (numMatch) return parseFloat(numMatch[1]);

  return null;
}

export function getAdjustedPrices(
  product: { regularPrice: number; salePrice: number | null; sizes?: string[] },
  selectedSize: string | null,
) {
  const defaultRegular = product.regularPrice;
  const defaultSale = product.salePrice;

  if (!selectedSize || !product.sizes || product.sizes.length === 0) {
    return {
      regularPrice: defaultRegular,
      salePrice: defaultSale,
      price: effectivePrice(defaultRegular, defaultSale),
    };
  }

  const baseSize = product.sizes[0];
  if (selectedSize === baseSize) {
    return {
      regularPrice: defaultRegular,
      salePrice: defaultSale,
      price: effectivePrice(defaultRegular, defaultSale),
    };
  }

  const baseWeight = parseSizeWeightGrams(baseSize);
  const targetWeight = parseSizeWeightGrams(selectedSize);

  if (baseWeight && targetWeight && baseWeight > 0) {
    const ratio = targetWeight / baseWeight;
    const regularPrice = Math.round(defaultRegular * ratio);
    const salePrice = defaultSale ? Math.round(defaultSale * ratio) : null;
    return {
      regularPrice,
      salePrice,
      price: effectivePrice(regularPrice, salePrice),
    };
  }

  const sizeIndex = product.sizes.indexOf(selectedSize);
  if (sizeIndex > 0) {
    const multiplier = 1 + sizeIndex * 0.25;
    const regularPrice = Math.round(defaultRegular * multiplier);
    const salePrice = defaultSale ? Math.round(defaultSale * multiplier) : null;
    return {
      regularPrice,
      salePrice,
      price: effectivePrice(regularPrice, salePrice),
    };
  }

  return {
    regularPrice: defaultRegular,
    salePrice: defaultSale,
    price: effectivePrice(defaultRegular, defaultSale),
  };
}
