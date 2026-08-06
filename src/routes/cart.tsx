import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { Container, EmptyState, PageHeading } from "@/components/ui-states";
import { lineKey, useCart } from "@/context/cart";
import { formatBDT } from "@/lib/format";
import { formatImageUrl } from "@/lib/utils";
import { useSettings } from "@/hooks/use-store";
import { useLanguage } from "@/context/language";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Shopping Cart — PureBengal Organic" },
      {
        name: "description",
        content: "Review your organic harvest items before checking out with cash on delivery.",
      },
      { property: "og:title", content: "Your Shopping Cart — PureBengal Organic" },
      { property: "og:description", content: "Review your items and continue to checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const storeSettings = useSettings();
  const { lang } = useLanguage();
  const { lines, subtotal, hydrated, updateQuantity, removeLine } = useCart();

  return (
    <Container className="py-8 md:py-14">
      <PageHeading
        eyebrow={lang === "bn" ? "কার্ট" : "Cart"}
        title={lang === "bn" ? "আপনার শপিং ব্যাগ" : "Your Shopping Bag"}
      />

      {!hydrated && (
        <div className="mt-8 space-y-4 max-w-4xl">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex animate-pulse gap-4 rounded-2xl border border-border p-4 bg-card"
            >
              <div className="h-20 w-20 rounded-2xl bg-secondary" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-4 w-2/3 rounded-md bg-secondary" />
                <div className="h-3 w-1/4 rounded-md bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      )}

      {hydrated && lines.length === 0 && (
        <div className="mt-10 max-w-xl mx-auto">
          <EmptyState
            title={lang === "bn" ? "আপনার শপিং ব্যাগ খালি" : "Your bag is empty"}
            description={
              lang === "bn"
                ? "পছন্দের অর্গানিক খাঁটি পণ্য কার্টে যোগ করুন এবং ক্যাশ অন ডেলিভারিতে অর্ডার করুন।"
                : "Add a few organic essentials to your bag and check out with cash on delivery."
            }
            action={
              <Link to="/shop" className="btn btn-solid rounded-xl px-6 py-3 font-bold">
                {lang === "bn" ? "শপিং শুরু করুন" : "Start Shopping"}
              </Link>
            }
          />
        </div>
      )}

      {hydrated && lines.length > 0 && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Cart Items List */}
          <div className="space-y-4">
            {lines.map((line) => {
              const key = lineKey(line);
              return (
                <div
                  key={key}
                  className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
                >
                  {/* Square Rounded Product Image */}
                  <Link
                    to="/product/$slug"
                    params={{ slug: line.slug }}
                    className="relative shrink-0 overflow-hidden rounded-2xl border-2 border-primary/20 bg-secondary/40 p-1 shadow-xs transition-transform group-hover:scale-105"
                  >
                    <img
                      src={formatImageUrl(line.image)}
                      alt={line.name}
                      width={120}
                      height={120}
                      loading="lazy"
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="min-w-0 flex-1 w-full">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to="/product/$slug"
                          params={{ slug: line.slug }}
                          className="line-clamp-2 text-sm sm:text-base font-bold text-foreground hover:text-primary transition-colors"
                        >
                          {line.name}
                        </Link>
                        {line.size && (
                          <span className="mt-1 inline-block rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            {line.size}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${line.name}`}
                        onClick={() => removeLine(key)}
                        className="rounded-xl p-2 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Quantity & Unit Total */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
                      <div className="flex items-center rounded-xl border-2 border-primary/20 bg-secondary/50 p-0.5">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(key, line.quantity - 1)}
                          disabled={line.quantity <= 1}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold transition-colors hover:bg-background disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-foreground">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(key, line.quantity + 1)}
                          disabled={line.quantity >= line.maxQuantity}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold transition-colors hover:bg-background disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">
                          {formatBDT(line.unitPrice)} × {line.quantity}
                        </span>
                        <span className="text-sm sm:text-base font-extrabold text-primary">
                          {formatBDT(line.unitPrice * line.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary Sidebar */}
          <aside className="h-fit rounded-3xl border-2 border-primary/20 bg-card p-5 sm:p-6 shadow-lg space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-base font-extrabold text-foreground">
                {lang === "bn" ? "অর্ডার সারাংশ" : "Order Summary"}
              </h2>
            </div>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between font-semibold">
                <dt className="text-muted-foreground">
                  {lang === "bn" ? "পণ্যগুলোর মোট মূল্য:" : "Subtotal:"}
                </dt>
                <dd className="font-extrabold text-foreground">{formatBDT(subtotal)}</dd>
              </div>

              <div className="flex justify-between border-t border-border/60 pt-3">
                <dt className="text-muted-foreground text-xs">
                  {lang === "bn" ? "ডেলিভারি চার্জ:" : "Delivery Fee:"}
                </dt>
                <dd className="text-right text-xs font-medium text-muted-foreground">
                  ঢাকা ভেতরে: {formatBDT(storeSettings.deliveryInsideDhaka)}
                  <br />
                  ঢাকার বাইরে: {formatBDT(storeSettings.deliveryOutsideDhaka)}
                </dd>
              </div>

              <div className="flex justify-between border-t border-border pt-3 text-base font-extrabold text-primary">
                <dt>{lang === "bn" ? "সর্বমোট (আনুমানিক):" : "Estimated Total:"}</dt>
                <dd className="text-lg">
                  {formatBDT(subtotal + storeSettings.deliveryInsideDhaka)}
                </dd>
              </div>
            </dl>

            <div className="space-y-2.5 pt-2">
              <Link
                to="/checkout"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition-all hover:bg-primary/90 active:scale-95"
              >
                <span>{lang === "bn" ? "অর্ডার সম্পন্ন করুন" : "Proceed to Checkout"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                className="flex w-full items-center justify-center rounded-2xl border border-border bg-secondary/50 px-5 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-secondary"
              >
                {lang === "bn" ? "আরও কেনাকাটা করুন" : "Continue Shopping"}
              </Link>
            </div>

            <div className="space-y-2 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  {lang === "bn"
                    ? "১০০% খাঁটি ও সেরা মানের নিশ্চয়তা"
                    : "100% Authentic Organic Guarantee"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary shrink-0" />
                <span>
                  {lang === "bn"
                    ? "সারাদেশে ক্যাশ অন ডেলিভারি"
                    : "Nationwide Cash on Delivery Available"}
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </Container>
  );
}
