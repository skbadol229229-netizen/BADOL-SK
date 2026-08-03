import { Link } from "@tanstack/react-router";
import { Heart, Plus, Check, Eye } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/types";
import { AppImage } from "@/components/app-image";
import { discountPercent, effectivePrice, formatBDT } from "@/lib/format";
import { useCart } from "@/context/cart";
import { useLanguage } from "@/context/language";
import { toast } from "sonner";
import { QuickViewModal } from "@/components/quick-view-modal";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { addLine } = useCart();
  const { lang, t } = useLanguage();
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const price = effectivePrice(product.regularPrice, product.salePrice);
  const off = discountPercent(product.regularPrice, product.salePrice);
  const soldOut = product.stock <= 0;

  // Extract primary weight or size tag (e.g. 500g, 1kg)
  const weightLabel = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "";

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;

    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      unitPrice: price,
      size: weightLabel || "Standard",
      quantity: 1,
      maxQuantity: Math.max(1, Math.min(product.stock, 10)),
    });
    setAdded(true);
    toast.success(`${product.name} - ${t("added")}`);
    setTimeout(() => setAdded(false), 1800);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(!wishlisted);
    toast(wishlisted ? "Remove from wishlist" : "Added to wishlist ❤️");
  };

  const handleOpenQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <div className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-border bg-card p-3 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
        {/* Product Image Box */}
        <div
          onClick={handleOpenQuickView}
          className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-[16px] bg-secondary/60"
        >
          <AppImage
            src={product.images[0]}
            alt={product.name}
            width={600}
            height={450}
            eager={priority}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* Top-Left Organic Badge */}
          <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
            <span className="rounded-md bg-[#7CB342] px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-xs">
              {t("organic")}
            </span>
            {off !== null && !soldOut && (
              <span className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                -{off}%
              </span>
            )}
          </div>

          {/* Quick View Floating Overlay Button */}
          <button
            type="button"
            onClick={handleOpenQuickView}
            className="absolute inset-x-3 bottom-3 z-10 hidden items-center justify-center gap-1.5 rounded-xl bg-card/90 px-3 py-1.5 text-xs font-bold text-foreground shadow-md backdrop-blur-xs transition-all hover:bg-primary hover:text-white group-hover:flex"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{lang === "bn" ? "দ্রুত দেখুন" : "Quick View"}</span>
          </button>

          {/* Top-Right Wishlist Button */}
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label="Wishlist"
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-xs transition-transform hover:scale-110"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                wishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>

          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xs">
              <span className="rounded-md bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("stockOut")}
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <Link to="/product/$slug" params={{ slug: product.slug }} className="block">
              <h3 className="line-clamp-2 text-xs font-bold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-sm">
                {product.name}
              </h3>
            </Link>
            {weightLabel && (
              <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">
                {weightLabel}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-primary sm:text-base">
                {formatBDT(price)}
              </span>
              {off !== null && (
                <span className="text-[10px] text-muted-foreground line-through">
                  {formatBDT(product.regularPrice)}
                </span>
              )}
            </div>

            {/* Bottom-Right Green Add-to-Cart (+) Button */}
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={soldOut}
              aria-label={`Add ${product.name} to cart`}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold shadow-md transition-all active:scale-95 ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-[#7CB342] text-white hover:bg-[#689f38] hover:shadow-lg"
              }`}
            >
              {added ? <Check className="h-4 w-4" /> : <Plus className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full min-w-0 animate-pulse flex-col rounded-[20px] border border-border/60 bg-card p-3">
      <div className="aspect-[4/3] w-full rounded-[16px] bg-secondary/80" />
      <div className="mt-3 h-3 w-1/3 rounded bg-secondary/80" />
      <div className="mt-2 h-4 w-4/5 rounded bg-secondary/80" />
      <div className="mt-4 h-4 w-1/2 rounded bg-secondary/80" />
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 sm:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
