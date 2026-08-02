import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Container, EmptyState } from "@/components/ui-states";
import { readOrder } from "@/lib/order-storage";
import type { PlacedOrder } from "@/data/types";
import { formatBDT } from "@/lib/format";
import { useSettings } from "@/hooks/use-store";

export const Route = createFileRoute("/order-success")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Trikon Clothing" },
      {
        name: "description",
        content: "Your Trikon order is confirmed. We will call you to verify before dispatch.",
      },
      { property: "og:title", content: "Order Confirmed — Trikon Clothing" },
      { property: "og:description", content: "Thank you for shopping with Trikon Clothing." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const storeSettings = useSettings();
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOrder(readOrder());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-lg animate-pulse space-y-4">
          <div className="h-6 w-2/3 bg-secondary" />
          <div className="h-4 w-1/2 bg-secondary" />
          <div className="h-40 w-full bg-secondary" />
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-16">
        <EmptyState
          title="No recent order found"
          description="We couldn't find a recent order in this browser session."
          action={
            <Link
              to="/shop"
              className="btn btn-solid"
            >
              Shop all products
            </Link>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <h1 className="type-h1 mt-5">Thank you, {order.customer.fullName.split(" ")[0]}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your order is confirmed. Our team will call {order.customer.mobile} to verify before
          dispatch. Keep {formatBDT(order.total)} ready for the courier.
        </p>

        <div className="mt-8 border border-border">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary px-5 py-4">
            <div>
              <p className="label-caps text-muted-foreground">Order number</p>
              <p className="mt-1 text-lg font-medium">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="label-caps text-muted-foreground">Payment</p>
              <p className="mt-1 text-sm">Cash on delivery</p>
            </div>
          </div>

          <ul className="divide-y divide-border px-5">
            {order.lines.map((l) => (
              <li key={`${l.productId}-${l.size}-${l.color}`} className="flex min-w-0 gap-4 py-4">
                <img
                  src={l.image}
                  alt=""
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="h-20 shrink-0 bg-secondary object-cover"
                  style={{ width: 64 }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {l.size} · {l.color} · ×{l.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-sm">{formatBDT(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-border px-5 py-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatBDT(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd>{formatBDT(order.deliveryCharge)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-medium">
              <dt>Total payable</dt>
              <dd>{formatBDT(order.total)}</dd>
            </div>
          </dl>

          <div className="border-t border-border px-5 py-4 text-sm">
            <p className="label-caps text-muted-foreground">Delivering to</p>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {order.customer.address}, {order.customer.area}, {order.customer.district}
            </p>
            {order.customer.note && (
              <p className="mt-2 text-xs text-muted-foreground">Note: {order.customer.note}</p>
            )}
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Expected delivery:{" "}
          {order.customer.district === "Dhaka"
            ? storeSettings.deliveryTimeInside
            : storeSettings.deliveryTimeOutside}
          . Questions? Call{" "}
          <a href={`tel:${storeSettings.supportPhone}`} className="underline underline-offset-4">
            {storeSettings.supportPhone}
          </a>
          .
        </p>

        <Link
          to="/shop"
          className="mt-8 inline-flex h-12 items-center justify-center bg-foreground px-8 text-sm font-medium text-background"
        >
          Continue shopping
        </Link>
      </div>
    </Container>
  );
}
