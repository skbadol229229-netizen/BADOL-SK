import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/types";
import { AppImage } from "@/components/app-image";
import { discountPercent, effectivePrice, formatBDT } from "@/lib/format";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const price = effectivePrice(product.regularPrice, product.salePrice);
  const off = discountPercent(product.regularPrice, product.salePrice);
  const soldOut = product.stock <= 0;

  return (
    <div className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card p-2.5 transition-all duration-300 hover:border-primary/50 hover:shadow-md sm:p-3">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[4/5] w-full overflow-hidden rounded-lg bg-secondary"
        aria-label={product.name}
      >
        <AppImage
          src={product.images[0]}
          alt={product.name}
          width={800}
          height={1000}
          eager={priority}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5 z-10">
          {off !== null && !soldOut && (
            <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary-foreground shadow-xs">
              -{off}% OFF
            </span>
          )}
          {product.featured && !soldOut && (
            <span className="rounded-md bg-amber-600 dark:bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-xs">
              Organic Choice
            </span>
          )}
        </div>

        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/85 backdrop-blur-xs">
            <span className="rounded-md bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Stock Out
            </span>
          </div>
        )}
      </Link>

      <div className="mt-3 flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-wider text-primary/80">
            {product.categorySlug.replace(/-/g, " ")}
          </span>
          <Link to="/product/$slug" params={{ slug: product.slug }} className="mt-1 block">
            <h3 className="clamp-2 text-xs font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-sm sm:leading-relaxed">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-sm font-bold text-foreground sm:text-base">
              {formatBDT(price)}
            </span>
            {off !== null && (
              <span className="text-xs text-muted-foreground line-through">
                {formatBDT(product.regularPrice)}
              </span>
            )}
          </div>
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="hidden rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground sm:inline-flex"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full min-w-0 animate-pulse flex-col rounded-xl border border-border p-3">
      <div className="aspect-[4/5] w-full rounded-lg bg-secondary" />
      <div className="mt-3 h-3 w-1/3 rounded bg-secondary" />
      <div className="mt-2 h-4 w-4/5 rounded bg-secondary" />
      <div className="mt-4 h-4 w-1/2 rounded bg-secondary" />
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid-products">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 2} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid-products">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
