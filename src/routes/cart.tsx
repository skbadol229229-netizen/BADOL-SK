import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Container, EmptyState, PageHeading } from "@/components/ui-states";
import { lineKey, useCart } from "@/context/cart";
import { formatBDT } from "@/lib/format";
import { useSettings } from "@/hooks/use-store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Trikon Clothing" },
      {
        name: "description",
        content: "Review your Trikon cart before checking out with cash on delivery.",
      },
      { property: "og:title", content: "Your Cart — Trikon Clothing" },
      { property: "og:description", content: "Review your items and continue to checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const storeSettings = useSettings();
  const { lines, subtotal, hydrated, updateQuantity, removeLine } = useCart();

  return (
    <Container className="py-10 md:py-16">
      <PageHeading eyebrow="Cart" title="Your bag" />

      {!hydrated && (
        <div className="mt-10 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex animate-pulse gap-4">
              <div className="h-32 w-24 bg-secondary" />
              <div className="flex-1 space-y-3 py-2">
                <div className="h-3 w-2/3 bg-secondary" />
                <div className="h-3 w-1/4 bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      )}

      {hydrated && lines.length === 0 && (
        <div className="mt-10">
          <EmptyState
            title="Your bag is empty"
            description="Add a few essentials and check out with cash on delivery."
            action={
              <Link
                to="/shop"
                className="btn btn-solid"
              >
                Start shopping
              </Link>
            }
          />
        </div>
      )}

      {hydrated && lines.length > 0 && (
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <ul className="divide-y divide-border border-y border-border">
            {lines.map((line) => {
              const key = lineKey(line);
              return (
                <li key={key} className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 py-5 md:grid-cols-[96px_minmax(0,1fr)]">
                  <Link to="/product/$slug" params={{ slug: line.slug }} className="shrink-0">
                    <img
                      src={line.image}
                      alt={line.name}
                      width={800}
                      height={1000}
                      loading="lazy"
                      className="media-4x5"
                    />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          to="/product/$slug"
                          params={{ slug: line.slug }}
                          className="clamp-2 block text-sm font-medium"
                        >
                          {line.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {line.size} · {line.color}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${line.name}`}
                        onClick={() => removeLine(key)}
                        className="shrink-0 p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(key, line.quantity - 1)}
                          disabled={line.quantity <= 1}
                          className="h-11 w-11 disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-9 text-center text-sm">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(key, line.quantity + 1)}
                          disabled={line.quantity >= line.maxQuantity}
                          className="h-11 w-11 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <span className="whitespace-nowrap text-sm font-medium">
                        {formatBDT(line.unitPrice * line.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit border border-border bg-secondary p-5 md:p-6">
            <h2 className="type-h3">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatBDT(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="text-right text-muted-foreground">
                  {formatBDT(storeSettings.deliveryInsideDhaka)} inside Dhaka
                  <br />
                  {formatBDT(storeSettings.deliveryOutsideDhaka)} outside
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
                <dt>Estimated total</dt>
                <dd>{formatBDT(subtotal + storeSettings.deliveryInsideDhaka)}</dd>
              </div>
            </dl>
            <Link
              to="/checkout"
              className="btn btn-solid btn-block mt-6"
            >
              Proceed to checkout
            </Link>
            <Link
              to="/shop"
              className="btn btn-outline btn-block mt-3"
            >
              Continue shopping
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Final delivery charge is confirmed at checkout once you choose your district.
            </p>
          </aside>
        </div>
      )}
    </Container>
  );
}
