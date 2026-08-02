import { Link } from "@tanstack/react-router";
import type { Product } from "@/data/types";
import { AppImage } from "@/components/app-image";
import { discountPercent, effectivePrice, formatBDT } from "@/lib/format";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const price = effectivePrice(product.regularPrice, product.salePrice);
  const off = discountPercent(product.regularPrice, product.salePrice);
  const soldOut = product.stock <= 0;

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group flex h-full min-w-0 flex-col"
      aria-label={product.name}
    >
      <div className="relative overflow-hidden">
        <AppImage
          src={product.images[0]}
          alt={product.name}
          width={800}
          height={1000}
          eager={priority}
          className="media-4x5 group-hover:opacity-90"
        />

        {off !== null && !soldOut && (
          <span className="absolute left-0 top-0 bg-foreground px-2 py-1 text-[10px] font-medium tracking-wide text-background">
            -{off}%
          </span>
        )}
        {soldOut && (
          <span className="label-caps absolute inset-x-0 bottom-0 bg-background/92 py-2 text-center">
            Sold out
          </span>
        )}
      </div>

      <div className="mt-3 flex min-w-0 flex-1 flex-col">
        <h3 className="clamp-2 min-h-[2.2rem] text-[13px] font-medium leading-[1.35] md:min-h-[2.4rem] md:text-sm">
          {product.name}
        </h3>
        <div className="mt-auto flex min-w-0 items-baseline gap-2 overflow-hidden pt-2">
          <span className="whitespace-nowrap text-[13px] font-medium md:text-sm">
            {formatBDT(price)}
          </span>
          {off !== null && (
            <span className="whitespace-nowrap text-xs text-muted-foreground line-through">
              {formatBDT(product.regularPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full min-w-0 animate-pulse flex-col">
      <div className="media-4x5" />
      <div className="mt-3 h-3 w-4/5 bg-secondary" />
      <div className="mt-3 h-3 w-1/3 bg-secondary" />
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
