import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Banknote,
  Check,
  RefreshCw,
  Star,
  Truck,
  ShieldCheck,
  Zap,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Container, ErrorState } from "@/components/ui-states";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { AppImage } from "@/components/app-image";
import { fetchProduct, fetchRelated, fetchReviews } from "@/data/api";
import { useSettings } from "@/hooks/use-store";
import { discountPercent, effectivePrice, formatBDT } from "@/lib/format";
import { useCart } from "@/context/cart";
import { useLanguage } from "@/context/language";
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
  const { lang } = useLanguage();
  const storeSettings = useSettings();
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(product.sizes[0] ?? null);
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
    if (product.sizes.length > 0 && !size) {
      setError(
        lang === "bn"
          ? "অনুগ্রহ করে একটি সাইজ/ওজন নির্বাচন করুন।"
          : "Please select a size / weight.",
      );
      return;
    }
    setError(null);
    setAdding(true);
    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[activeImage] || product.images[0],
      unitPrice: price,
      size: size ?? "Standard",
      quantity,
      maxQuantity: Math.max(1, Math.min(product.stock, 10)),
    });
    toast.success(lang === "bn" ? "কার্টে যোগ করা হয়েছে" : "Added to cart", {
      description: `${product.name} ${size ? `· ${size}` : ""}`,
    });
    window.setTimeout(() => setAdding(false), 400);
  }

  function handleBuyNow() {
    if (product.sizes.length > 0 && !size) {
      setError(
        lang === "bn"
          ? "অনুগ্রহ করে একটি সাইজ/ওজন নির্বাচন করুন।"
          : "Please select a size / weight.",
      );
      return;
    }
    setError(null);
    addLine({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[activeImage] || product.images[0],
      unitPrice: price,
      size: size ?? "Standard",
      quantity,
      maxQuantity: Math.max(1, Math.min(product.stock, 10)),
    });
    navigate({ to: "/checkout" });
  }

  return (
    <Container className="py-8 md:py-14">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="mb-6 text-xs text-muted-foreground flex items-center gap-1.5"
      >
        <Link to="/" className="hover:text-primary transition-colors">
          {lang === "bn" ? "হোম" : "Home"}
        </Link>
        <span>/</span>
        <Link
          to="/category/$slug"
          params={{ slug: product.categorySlug }}
          className="hover:text-primary transition-colors capitalize"
        >
          {product.categorySlug.replace("-", " ")}
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-xs">
          {product.name}
        </span>
      </nav>

      <div className="grid gap-8 md:grid-cols-12 lg:gap-12 items-start">
        {/* Left Column: Product Image inside Beautiful Professional Shape Frame */}
        <div className="md:col-span-6 space-y-4">
          <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-[28px] border-2 border-primary/20 bg-card p-3 shadow-xl group">
            {/* Organic Quality Seal Badge */}
            <div className="absolute top-5 left-5 z-10 flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#7CB342] px-3.5 py-1 text-[11px] font-black uppercase text-white shadow-lg backdrop-blur-md">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>100% Pure Organic</span>
              </span>
              {off !== null && (
                <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-[11px] font-black text-white shadow-lg w-fit">
                  -{off}% OFF
                </span>
              )}
            </div>

            <AppImage
              key={product.images[activeImage]}
              src={product.images[activeImage]}
              alt={product.name}
              width={800}
              height={800}
              eager
              className="h-full w-full object-cover rounded-[20px] transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Thumbnails Gallery */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                    i === activeImage
                      ? "border-primary ring-2 ring-primary/20 scale-105 shadow-md"
                      : "border-border/80 opacity-70 hover:opacity-100"
                  }`}
                >
                  <AppImage
                    src={img}
                    alt=""
                    width={200}
                    height={200}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details & Actions */}
        <div className="md:col-span-6 min-w-0 space-y-5">
          <div>
            <span className="inline-block rounded-md bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
              {lang === "bn" ? "অর্গানিক ফুড স্টোর" : "Organic Food Store"}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
              {product.name}
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="flex flex-wrap items-baseline gap-3 rounded-2xl bg-secondary/50 p-4 border border-border/80">
            <span className="text-2xl sm:text-3xl font-black text-primary">{formatBDT(price)}</span>
            {off !== null && (
              <>
                <span className="text-base font-semibold text-muted-foreground line-through">
                  {formatBDT(product.regularPrice)}
                </span>
                <span className="rounded-lg bg-red-600/90 px-2.5 py-0.5 text-xs font-bold text-white">
                  {lang === "bn" ? `ছাড় ৳${product.regularPrice - price}` : `Save ${off}%`}
                </span>
              </>
            )}
          </div>

          {/* Size / Weight Options */}
          {product.sizes.length > 0 && (
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                {lang === "bn" ? "সাইজ / ওজন নির্বাচন করুন:" : "Select Size / Weight:"}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={soldOut}
                    onClick={() => {
                      setSize(s);
                      setError(null);
                    }}
                    className={`rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
                      size === s
                        ? "border-primary bg-primary text-white shadow-md scale-105"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">
              {lang === "bn" ? "পরিমাণ:" : "Qty:"}
            </p>
            <div className="flex items-center rounded-xl border border-border bg-muted/30 p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || soldOut}
                aria-label="Decrease quantity"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-foreground font-bold hover:bg-muted disabled:opacity-40"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-black text-foreground">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(Math.min(product.stock, 10), q + 1))}
                disabled={soldOut || quantity >= Math.min(product.stock, 10)}
                aria-label="Increase quantity"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-foreground font-bold hover:bg-muted disabled:opacity-40"
              >
                +
              </button>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {soldOut
                ? lang === "bn"
                  ? "স্টক শেষ"
                  : "Out of stock"
                : lang === "bn"
                  ? `স্টকে আছে: ${product.stock} টি`
                  : `${product.stock} available`}
            </span>
          </div>

          {error && (
            <p role="alert" className="text-xs font-bold text-red-500">
              {error}
            </p>
          )}

          {/* CTA Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut || adding}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary/10 py-3.5 text-xs font-extrabold text-primary transition-all hover:bg-primary hover:text-white disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>
                {soldOut
                  ? "স্টক শেষ"
                  : adding
                    ? "যোগ হচ্ছে..."
                    : lang === "bn"
                      ? "কার্টে রাখুন"
                      : "Add to Cart"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={soldOut}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-xs font-extrabold text-white transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
            >
              <Zap className="h-4 w-4 fill-current text-amber-300" />
              <span>{lang === "bn" ? "সরাসরি অর্ডারে যান" : "Buy Now"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Delivery & Trust Features */}
          <dl className="space-y-3 rounded-2xl border border-border bg-card p-4 text-xs">
            <div className="flex gap-3 items-center">
              <Truck className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-foreground font-medium">
                {lang === "bn"
                  ? `ডেলিভারি: ঢাকার ভেতরে ${storeSettings.deliveryTimeInside} (${formatBDT(storeSettings.deliveryInsideDhaka)}), ঢাকার বাইরে ${storeSettings.deliveryTimeOutside} (${formatBDT(storeSettings.deliveryOutsideDhaka)})`
                  : `Delivery: ${storeSettings.deliveryTimeInside} inside Dhaka (${formatBDT(storeSettings.deliveryInsideDhaka)}), ${storeSettings.deliveryTimeOutside} outside (${formatBDT(storeSettings.deliveryOutsideDhaka)})`}
              </span>
            </div>
            <div className="flex gap-3 items-center">
              <Banknote className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-foreground font-medium">
                {lang === "bn"
                  ? "১০০% ক্যাশ অন ডেলিভারি সুবিধা (পণ্য হাতে পেয়ে পেমেন্ট করুন)"
                  : "Cash on delivery available nationwide across Bangladesh."}
              </span>
            </div>
            <div className="flex gap-3 items-center">
              <RefreshCw className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-foreground font-medium">
                {lang === "bn"
                  ? `${storeSettings.exchangeWindowDays} দিনের মধ্যে সহজ এক্সচেঞ্জ সুবিধা`
                  : `${storeSettings.exchangeWindowDays} days hassle-free exchange policy`}
              </span>
            </div>
          </dl>
        </div>
      </div>

      {/* Description & Reviews Section */}
      <section className="mt-12 grid gap-8 border-t border-border pt-8 md:grid-cols-2 md:gap-12">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-3">
            {lang === "bn" ? "পণ্যের বিবরণ" : "Product Details"}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {product.fullDescription}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-bold text-foreground mb-3">
            {lang === "bn" ? "গ্রাহকদের মতামত ও রিভিউ" : "Customer Reviews"}
          </h2>
          <div>
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
              <p className="text-xs text-muted-foreground">
                {lang === "bn"
                  ? "এই পণ্যের এখনও কোনো রিভিউ নেই।"
                  : "No reviews yet for this product. Yours could be the first."}
              </p>
            )}
            {reviewsQuery.data && reviewsQuery.data.length > 0 && (
              <ul className="space-y-4">
                {reviewsQuery.data.map((r) => (
                  <li key={r.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex text-amber-500" aria-label={`${r.rating} out of 5`}>
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </span>
                      <span className="text-xs font-bold text-foreground">{r.author}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{r.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="mt-12 md:mt-16">
        <h2 className="text-xl font-extrabold text-foreground mb-6">
          {lang === "bn" ? "আরও পছন্দ হতে পারে" : "You May Also Like"}
        </h2>
        {relatedQuery.isPending && <ProductGridSkeleton count={4} />}
        {relatedQuery.isError && <ErrorState onRetry={() => relatedQuery.refetch()} />}
        {relatedQuery.data && relatedQuery.data.length > 0 && (
          <ProductGrid products={relatedQuery.data} />
        )}
      </section>
    </Container>
  );
}
