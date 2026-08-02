import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Banknote, Check, RefreshCw, Star, Truck } from "lucide-react";
import { Container, ErrorState } from "@/components/ui-states";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { AppImage } from "@/components/app-image";
import { fetchProduct, fetchRelated, fetchReviews } from "@/data/api";
import { useSettings } from "@/hooks/use-store";
import { discountPercent, effectivePrice, formatBDT } from "@/lib/format";
import { useCart } from "@/context/cart";
import type { Product } from "@/data/types";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }): Promise<{ product: Product }> => {
    const product = await fetchProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Product not found — PureBengal Organic" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — PureBengal Organic Food`;
    return {
      meta: [
        { title },
        { name: "description", content: product.shortDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: product.shortDescription },
      ],
    };
  },
  notFoundComponent: ProductNotFound,
  component: ProductPage,
});

function ProductNotFound() {
  return (
    <Container className="py-20 text-center">
      <h1 className="type-h1">Product not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This product is no longer available or the link is incorrect.
      </p>
      <Link to="/shop" className="mt-8 btn btn-solid">
        Shop all products
      </Link>
    </Container>
  );
}

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: Product };
  const { addLine } = useCart();
  const storeSettings = useSettings();

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(product.sizes[0] ?? null);
  const [color, setColor] = useState<string | null>(product.colors[0]?.name ?? null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const price = effectivePrice(product.regularPrice, product.salePrice);
  const off = discountPercent(product.regularPrice, product.salePrice);
  const soldOut = product.stock <= 0;

  const relatedQuery = useQuery({
    queryKey: ["related", product.slug],
    queryFn: () => fetchRelated(product),
  });
  const reviewsQuery = useQuery({
    queryKey: ["reviews", product.slug],
    queryFn: () => fetchReviews(product.slug),
  });

  function handleAdd() {
    if (!size) {
      setError("Please select a size.");
      return;
    }
    if (!color) {
      setError("Please select a colour.");
      return;
    }
    setError(null);
    setAdding(true);
    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      unitPrice: price,
      size,
      color,
      quantity,
      maxQuantity: Math.max(1, Math.min(product.stock, 10)),
    });
    toast.success("Added to cart", { description: `${product.name} · ${size} · ${color}` });
    window.setTimeout(() => setAdding(false), 400);
  }

  const optionClass = (active: boolean, disabled = false) =>
    `chip ${disabled ? "chip-disabled" : active ? "chip-active" : ""}`;

  return (
    <Container className="py-8 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <span className="px-2">/</span>
        <Link
          to="/category/$slug"
          params={{ slug: product.categorySlug }}
          className="hover:underline"
        >
          {product.categorySlug.replace("-", " ")}
        </Link>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-14">
        <div>
          <AppImage
            key={product.images[activeImage]}
            src={product.images[activeImage]}
            alt={product.name}
            width={800}
            height={1000}
            eager
            className="media-4x5"
          />
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`w-14 shrink-0 border md:w-16 ${i === activeImage ? "border-foreground" : "border-border"}`}
                >
                  <AppImage src={img} alt="" width={800} height={1000} className="media-4x5" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="type-h1">{product.name}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-medium whitespace-nowrap">{formatBDT(price)}</span>
            {off !== null && (
              <>
                <span className="whitespace-nowrap text-base text-muted-foreground line-through">
                  {formatBDT(product.regularPrice)}
                </span>
                <span className="bg-foreground px-2 py-0.5 text-[11px] text-background">
                  Save {off}%
                </span>
              </>
            )}
          </div>

          <div className="mt-8">
            <p className="label-caps text-muted-foreground">Size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={soldOut}
                  onClick={() => {
                    setSize(s);
                    setError(null);
                  }}
                  className={optionClass(size === s, soldOut)}
                  aria-pressed={size === s}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="label-caps text-muted-foreground">Colour</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  disabled={soldOut}
                  onClick={() => {
                    setColor(c.name);
                    setError(null);
                  }}
                  className={optionClass(color === c.name, soldOut)}
                  aria-pressed={color === c.name}
                >
                  <span
                    aria-hidden
                    className="h-3 w-3 rounded-full border border-border"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <p className="label-caps text-muted-foreground">Qty</p>
            <div className="flex items-center border border-border">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || soldOut}
                aria-label="Decrease quantity"
                className="h-11 w-11 text-lg disabled:opacity-40"
              >
                −
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(Math.min(product.stock, 10), q + 1))}
                disabled={soldOut || quantity >= Math.min(product.stock, 10)}
                aria-label="Increase quantity"
                className="h-11 w-11 text-lg disabled:opacity-40"
              >
                +
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              {soldOut ? "Out of stock" : `${product.stock} in stock`}
            </span>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || adding}
            className="mt-6 btn btn-solid btn-block"
          >
            {soldOut ? "Out of stock" : adding ? "Adding…" : "Add to cart"}
          </button>
          <Link to="/cart" className="mt-3 btn btn-outline btn-block">
            View cart
          </Link>

          <dl className="mt-8 space-y-3 border-t border-border pt-6 text-sm">
            <div className="flex gap-3">
              <Truck className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-muted-foreground">
                Delivery {storeSettings.deliveryTimeInside} inside Dhaka (
                {formatBDT(storeSettings.deliveryInsideDhaka)}), {storeSettings.deliveryTimeOutside}{" "}
                outside ({formatBDT(storeSettings.deliveryOutsideDhaka)}).
              </span>
            </div>
            <div className="flex gap-3">
              <Banknote className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-muted-foreground">Cash on delivery available nationwide.</span>
            </div>
            <div className="flex gap-3">
              <RefreshCw className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-muted-foreground">
                {storeSettings.exchangeWindowDays} day size exchange, unworn with tags.
              </span>
            </div>
            <div className="flex gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-muted-foreground">SKU {product.sku}</span>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-14 grid md:mt-20 grid gap-10 border-t border-border pt-10 md:grid-cols-2 md:gap-16">
        <div>
          <h2 className="type-h2">Details</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {product.fullDescription}
          </p>
        </div>
        <div>
          <h2 className="type-h2">Customer reviews</h2>
          <div className="mt-4">
            {reviewsQuery.isPending && (
              <div className="space-y-4">
                {[0, 1].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-3 w-24 bg-secondary" />
                    <div className="h-3 w-full bg-secondary" />
                  </div>
                ))}
              </div>
            )}
            {reviewsQuery.isError && <ErrorState onRetry={() => reviewsQuery.refetch()} />}
            {reviewsQuery.data && reviewsQuery.data.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No reviews yet for this product. Yours could be the first.
              </p>
            )}
            {reviewsQuery.data && reviewsQuery.data.length > 0 && (
              <ul className="space-y-6">
                {reviewsQuery.data.map((r) => (
                  <li key={r.id} className="border-b border-border pb-5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="flex" aria-label={`${r.rating} out of 5`}>
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </span>
                      <span className="text-sm font-medium">{r.author}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="mt-14 md:mt-20">
        <h2 className="type-h2 mb-7 md:mb-9">You may also like</h2>
        {relatedQuery.isPending && <ProductGridSkeleton count={4} />}
        {relatedQuery.isError && <ErrorState onRetry={() => relatedQuery.refetch()} />}
        {relatedQuery.data && relatedQuery.data.length > 0 && (
          <ProductGrid products={relatedQuery.data} />
        )}
        {relatedQuery.data && relatedQuery.data.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing else in this category yet.</p>
        )}
      </section>
    </Container>
  );
}
