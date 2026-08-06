import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, PhoneCall, ShoppingBag, Truck, Package, ArrowRight } from "lucide-react";
import { Container, EmptyState } from "@/components/ui-states";
import { readOrder } from "@/lib/order-storage";
import type { PlacedOrder } from "@/data/types";
import { formatBDT } from "@/lib/format";
import { formatImageUrl } from "@/lib/utils";
import { useSettings } from "@/hooks/use-store";
import { useLanguage } from "@/context/language";

export const Route = createFileRoute("/order-success")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — PureBengal Organic" },
      {
        name: "description",
        content: "Your PureBengal order is confirmed. We will call you to verify before dispatch.",
      },
      { property: "og:title", content: "Order Confirmed — PureBengal Organic" },
      {
        property: "og:description",
        content: "Thank you for choosing PureBengal Organic Food Store.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const storeSettings = useSettings();
  const { lang } = useLanguage();
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
          <div className="h-6 w-2/3 bg-secondary rounded-xl" />
          <div className="h-4 w-1/2 bg-secondary rounded-xl" />
          <div className="h-40 w-full bg-secondary rounded-2xl" />
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-16">
        <EmptyState
          title={lang === "bn" ? "সাম্প্রতিক কোনো অর্ডার পাওয়া যায়নি" : "No recent order found"}
          description={
            lang === "bn"
              ? "আপনার ব্রাউজারে সাম্প্রতিক কোনো অর্ডারের তথ্য নেই।"
              : "We couldn't find a recent order in this browser session."
          }
          action={
            <Link to="/shop" className="btn btn-solid">
              {lang === "bn" ? "পণ্য কেনাকাটা করুন" : "Shop All Products"}
            </Link>
          }
        />
      </Container>
    );
  }

  const firstName = order.customer.fullName.split(" ")[0];

  return (
    <div className="min-h-screen bg-muted/20 py-10 md:py-16">
      <Container className="max-w-3xl">
        {/* Success Card Header */}
        <div className="rounded-3xl border border-primary/20 bg-card p-6 sm:p-10 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#0B2E13] via-[#7CB342] to-[#0B2E13]" />

          <div
            className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-4 animate-bounce"
            style={{ animationDuration: "3s" }}
          >
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>

          <span className="block text-xs font-bold uppercase tracking-wider text-[#7CB342] mb-1">
            {lang === "bn" ? "অর্ডার নিশ্চিত করা হয়েছে" : "Order Successfully Confirmed"}
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-[#0B2E13] dark:text-emerald-300">
            {lang === "bn"
              ? `ধন্যবাদ, ${firstName}! আপনার অর্ডারটি গৃহীত হয়েছে।`
              : `Thank you, ${firstName}! Your order is placed.`}
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {lang === "bn"
              ? `আমাদের রিপ্রেজেন্টেটিভ শীঘ্রই ${order.customer.mobile} নম্বরে কল করে অর্ডারটি কনফার্ম করবেন। পার্সেল ডেলিভারির সময় রাইডারকে ${formatBDT(order.total)} প্রদান করুন।`
              : `Our customer team will call ${order.customer.mobile} shortly to verify delivery. Please keep ${formatBDT(order.total)} cash ready.`}
          </p>

          {/* Quick Stats Badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-4 py-1.5 text-xs font-bold text-foreground">
              <Package className="h-4 w-4 text-primary" />
              <span>
                {lang === "bn" ? "অর্ডার নং: " : "Order #: "}
                <strong className="text-primary">{order.orderNumber}</strong>
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-4 py-1.5 text-xs font-bold text-foreground">
              <Truck className="h-4 w-4 text-primary" />
              <span>
                {order.customer.district === "Dhaka"
                  ? storeSettings.deliveryTimeInside
                  : storeSettings.deliveryTimeOutside}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details Accordion Box */}
        <div className="mt-8 rounded-3xl border border-border bg-card overflow-hidden shadow-lg">
          <div className="bg-[#0B2E13] px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#7CB342]" />
              <span className="font-extrabold text-sm sm:text-base">
                {lang === "bn" ? "অর্ডারের বিবরণ" : "Order Breakdown"}
              </span>
            </div>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full font-semibold">
              {lang === "bn" ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery"}
            </span>
          </div>

          {/* Line Items */}
          <ul className="divide-y divide-border px-6 py-2">
            {order.lines.map((l) => (
              <li key={`${l.productId}-${l.size}`} className="py-4 flex gap-4 items-center">
                <img
                  src={formatImageUrl(l.image)}
                  alt={l.name}
                  className="h-16 w-16 shrink-0 rounded-2xl object-cover bg-muted border border-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground truncate">{l.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {l.size ? `সাইজ/ওজন: ${l.size} · ` : ""}পরিমাণ: {l.quantity}
                  </p>
                </div>
                <span className="text-sm font-black text-foreground shrink-0">
                  {formatBDT(l.unitPrice * l.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {/* Pricing Totals */}
          <div className="bg-muted/30 border-t border-border px-6 py-4 space-y-2 text-xs font-semibold text-foreground">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {lang === "bn" ? "পণ্যের মোট দাম" : "Subtotal"}
              </span>
              <span>{formatBDT(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {lang === "bn" ? "ডেলিভারি চার্জ" : "Delivery Fee"}
              </span>
              <span>{formatBDT(order.deliveryCharge)}</span>
            </div>
            <div className="flex justify-between border-t border-border/80 pt-3 text-sm font-black text-[#0B2E13] dark:text-emerald-300">
              <span>{lang === "bn" ? "সর্বমোট টাকা" : "Total Amount"}</span>
              <span className="text-base text-primary">{formatBDT(order.total)}</span>
            </div>
          </div>

          {/* Delivery Address Box */}
          <div className="border-t border-border px-6 py-5 bg-card text-xs space-y-1.5">
            <p className="font-extrabold uppercase tracking-wider text-[#0B2E13] dark:text-emerald-300">
              📍 {lang === "bn" ? "ডেলিভারি ঠিকানা" : "Shipping Address"}
            </p>
            <p className="text-foreground font-medium text-sm">
              {order.customer.fullName} ({order.customer.mobile})
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {order.customer.address}, {order.customer.district}
            </p>
            {order.customer.note && (
              <p className="text-muted-foreground italic pt-1">
                {lang === "bn" ? "বিশেষ নোট: " : "Note: "}
                {order.customer.note}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons & Hotline */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <a
            href={`tel:${storeSettings.supportPhone}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-5 py-3 text-xs font-bold text-primary border border-primary/20 hover:bg-primary/20 transition-colors w-full sm:w-auto justify-center"
          >
            <PhoneCall className="h-4 w-4" />
            <span>
              {lang === "bn"
                ? `সহায়তার জন্য কল করুন: ${storeSettings.supportPhone}`
                : `Need Help? Call: ${storeSettings.supportPhone}`}
            </span>
          </a>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B2E13] px-6 py-3.5 text-xs font-bold text-white transition-all hover:bg-[#0B2E13]/90 shadow-lg w-full sm:w-auto justify-center"
          >
            <span>{lang === "bn" ? "আরও কেনাকাটা করুন" : "Continue Shopping"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
