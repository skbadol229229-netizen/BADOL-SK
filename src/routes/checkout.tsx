import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Truck, ShieldCheck, CheckCircle2, ArrowRight, ShoppingBag } from "lucide-react";
import { Container, EmptyState } from "@/components/ui-states";
import { useCart } from "@/context/cart";
import { districts } from "@/data/catalog";
import { useSettings } from "@/hooks/use-store";
import { useLanguage } from "@/context/language";
import { placeTursoOrder } from "@/lib/admin";
import { formatBDT } from "@/lib/format";
import { saveOrder } from "@/lib/order-storage";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Cash on Delivery | PureBengal Organic" },
      {
        name: "description",
        content:
          "Complete your organic harvest order with cash on delivery. Express delivery inside Dhaka and nationwide shipping across Bangladesh.",
      },
      { property: "og:title", content: "Checkout — Cash on Delivery | PureBengal Organic" },
      {
        property: "og:description",
        content: "Pay when your fresh organic parcel arrives, anywhere in Bangladesh.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, { message: "Please enter your full name." })
    .max(80, { message: "Name must be under 80 characters." }),
  mobile: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, {
      message: "Enter a valid 11 digit mobile number, e.g. 01712345678.",
    }),
  district: z.string().min(1, { message: "Please select your district." }),
  address: z
    .string()
    .trim()
    .min(8, { message: "Please enter your full delivery address." })
    .max(300, { message: "Address must be under 300 characters." }),
  note: z.string().trim().max(300, { message: "Note must be under 300 characters." }).optional(),
});

type FormValues = z.infer<typeof checkoutSchema>;
type FormErrors = Partial<Record<keyof FormValues, string>>;

const emptyForm: FormValues = {
  fullName: "",
  mobile: "",
  district: "Dhaka",
  address: "",
  note: "",
};

function CheckoutPage() {
  const { lines, subtotal, hydrated, clear } = useCart();
  const storeSettings = useSettings();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [values, setValues] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const deliveryCharge = useMemo(
    () =>
      values.district === "Dhaka"
        ? storeSettings.deliveryInsideDhaka
        : storeSettings.deliveryOutsideDhaka,
    [values.district, storeSettings],
  );
  const total = subtotal + deliveryCharge;

  useEffect(() => {
    if (hydrated && lines.length === 0) setSubmitting(false);
  }, [hydrated, lines.length]);

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = checkoutSchema.safeParse(values);
    if (!parsed.success) {
      const next: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      toast.error(
        lang === "bn"
          ? "অনুগ্রহ করে লাল চিহ্নিত ঘরগুলো সঠিক তথ্যে পূরণ করুন"
          : "Please check the highlighted fields",
      );
      return;
    }

    setSubmitting(true);
    try {
      const result = await placeTursoOrder({
        fullName: parsed.data.fullName,
        mobile: parsed.data.mobile,
        district: parsed.data.district,
        area: parsed.data.district, // using district as location area
        address: parsed.data.address,
        note: parsed.data.note,
        items: lines.map((l) => ({
          productId: l.productId,
          productSlug: l.productSlug,
          name: l.name,
          image: l.image,
          size: l.size,
          unitPrice: l.unitPrice,
          quantity: l.quantity,
        })),
        subtotal,
        deliveryCharge,
        total,
      });

      saveOrder({
        orderNumber: result.orderNumber,
        placedAt: result.placedAt,
        customer: {
          fullName: parsed.data.fullName,
          mobile: parsed.data.mobile,
          district: parsed.data.district,
          area: parsed.data.district,
          address: parsed.data.address,
          note: parsed.data.note,
        },
        lines,
        subtotal,
        deliveryCharge,
        total,
        paymentMethod: "cod" as const,
      });

      clear();
      toast.success(
        lang === "bn"
          ? "আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে!"
          : "Order placed successfully!",
      );
      navigate({ to: "/order-success" });
    } catch (err) {
      setSubmitting(false);
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : lang === "bn"
            ? "অর্ডার সম্পন্ন করা সম্ভব হয়নি। আবার চেষ্টা করুন।"
            : "We couldn't place your order. Please try again.",
      );
    }
  }

  const inputClass = (invalid?: string) =>
    `w-full rounded-xl border bg-background px-4 py-3 text-sm transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 ${
      invalid ? "border-red-500 bg-red-50/20" : "border-border"
    }`;

  if (hydrated && lines.length === 0) {
    return (
      <Container className="py-12 md:py-20">
        <EmptyState
          title={lang === "bn" ? "আপনার শপিং ব্যাগ খালি" : "Your cart is empty"}
          description={
            lang === "bn"
              ? "অর্ডার সম্পূর্ণ করার জন্য প্রথমে পণ্য যুক্ত করুন।"
              : "Add products to your cart before placing an order."
          }
          action={
            <Link to="/shop" className="btn btn-solid">
              {lang === "bn" ? "পণ্য ব্রাউজ করুন" : "Browse Products"}
            </Link>
          }
        />
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8 md:py-14">
      <Container className="max-w-6xl">
        {/* Top Header */}
        <div className="mb-8 text-center md:text-left border-b border-border/60 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span>
              {lang === "bn"
                ? "১০০% বিশ্বস্ত ক্যাশ অন ডেলিভারি"
                : "100% Secure Cash on Delivery"}
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0B2E13] dark:text-emerald-300 md:text-3xl">
            {lang === "bn" ? "অর্ডার সম্পন্ন করুন (চেকআউট)" : "Complete Your Order"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {lang === "bn"
              ? "পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন। কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।"
              : "Pay in cash when your parcel arrives. No advance payment required."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="grid gap-8 lg:grid-cols-12"
        >
          {/* Left Form Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Info */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-[#0B2E13] dark:text-emerald-300 flex items-center gap-2 mb-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B2E13] text-white text-xs font-bold">
                  ১
                </span>
                <span>
                  {lang === "bn" ? "গ্রাহকের তথ্য ও ডেলিভারি ঠিকানা" : "Customer & Address Details"}
                </span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold text-foreground mb-1.5">
                    {lang === "bn" ? "আপনার পুরো নাম *" : "Your Full Name *"}
                  </label>
                  <input
                    id="fullName"
                    value={values.fullName}
                    onChange={(e) => setField("fullName", e.target.value)}
                    autoComplete="name"
                    maxLength={80}
                    placeholder={lang === "bn" ? "যেমন: মোহাম্মদ রহিম" : "e.g. Mohammad Rahim"}
                    className={inputClass(errors.fullName)}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-xs font-bold text-foreground mb-1.5">
                    {lang === "bn" ? "মোবাইল নম্বর (১১ ডিজিট) *" : "Mobile Number (11 digits) *"}
                  </label>
                  <input
                    id="mobile"
                    value={values.mobile}
                    onChange={(e) =>
                      setField("mobile", e.target.value.replace(/\D/g, "").slice(0, 11))
                    }
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="017XXXXXXXX"
                    className={inputClass(errors.mobile)}
                  />
                  {errors.mobile && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.mobile}</p>
                  )}
                </div>

                {/* District Selector */}
                <div>
                  <label htmlFor="district" className="block text-xs font-bold text-foreground mb-1.5">
                    {lang === "bn" ? "জেলা (District) *" : "District *"}
                  </label>
                  <select
                    id="district"
                    value={values.district}
                    onChange={(e) => setField("district", e.target.value)}
                    className={inputClass(errors.district)}
                  >
                    <option value="">
                      {lang === "bn" ? "-- জেলা নির্বাচন করুন --" : "-- Select District --"}
                    </option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d === "Dhaka"
                          ? lang === "bn"
                            ? "ঢাকা (Dhaka - ৳৬০ ডেলিভারি)"
                            : "Dhaka (৳60 Delivery)"
                          : `${d} (${lang === "bn" ? "৳১২০ ডেলিভারি" : "৳120 Delivery"})`}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.district}</p>
                  )}
                </div>

                {/* Detailed Address */}
                <div>
                  <label htmlFor="address" className="block text-xs font-bold text-foreground mb-1.5">
                    {lang === "bn" ? "সম্পূর্ণ ডেলিভারি ঠিকানা *" : "Complete Delivery Address *"}
                  </label>
                  <textarea
                    id="address"
                    value={values.address}
                    onChange={(e) => setField("address", e.target.value)}
                    rows={3}
                    maxLength={300}
                    placeholder={
                      lang === "bn"
                        ? "বাসা নম্বর, রোড নম্বর, ফ্ল্যাট নম্বর, এলাকা / ল্যান্ডমার্ক লিখুন"
                        : "House No, Road No, Flat/Building, Landmark details"
                    }
                    className={inputClass(errors.address)}
                  />
                  {errors.address && (
                    <p className="text-xs text-red-500 mt-1 font-medium">{errors.address}</p>
                  )}
                </div>

                {/* Note */}
                <div>
                  <label htmlFor="note" className="block text-xs font-bold text-foreground mb-1.5">
                    {lang === "bn" ? "বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)" : "Order Note (Optional)"}
                  </label>
                  <textarea
                    id="note"
                    value={values.note}
                    onChange={(e) => setField("note", e.target.value)}
                    rows={2}
                    maxLength={300}
                    placeholder={
                      lang === "bn"
                        ? "কখন ডেলিভারি চান বা বিশেষ নির্দেশ থাকলে লিখুন"
                        : "Special delivery timings or notes"
                    }
                    className={inputClass(errors.note)}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-7">
              <h2 className="text-base sm:text-lg font-bold text-[#0B2E13] dark:text-emerald-300 flex items-center gap-2 mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                  ২
                </span>
                <span>{lang === "bn" ? "পেমেন্ট মেথড" : "Payment Method"}</span>
              </h2>

              <div className="rounded-xl border border-primary/30 bg-card p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {lang === "bn" ? "ক্যাশ অন ডেলিভারি (পণ্য পেয়ে টাকা দিন)" : "Cash on Delivery"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "bn"
                      ? "পণ্য হাতে পেয়ে রাইডারকে টাকা বুঝিয়ে দিন। কোনো অগ্রিম চার্জ লাগবে না।"
                      : "Pay cash directly to the delivery person upon arrival."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-lg">
              <h2 className="text-lg font-extrabold text-[#0B2E13] dark:text-emerald-300 flex items-center justify-between pb-4 border-b border-border">
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <span>{lang === "bn" ? "অর্ডার সারাংশ" : "Order Summary"}</span>
                </span>
                <span className="text-xs font-normal text-muted-foreground">
                  {lines.length} {lang === "bn" ? "টি আইটেম" : "items"}
                </span>
              </h2>

              {/* Items List */}
              <ul className="divide-y divide-border/60 max-h-72 overflow-y-auto py-2 pr-1 no-scrollbar">
                {lines.map((l) => (
                  <li key={`${l.productId}-${l.size}`} className="py-3 flex gap-3 items-center">
                    <img
                      src={l.image}
                      alt={l.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover bg-muted border border-border"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-foreground">{l.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {l.size ? `সাইজ/ওজন: ${l.size} · ` : ""}পরিমাণ: {l.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-foreground shrink-0">
                      {formatBDT(l.unitPrice * l.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Calculation Breakdown */}
              <div className="space-y-2.5 border-t border-border pt-4 text-xs font-medium text-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{lang === "bn" ? "পণ্যের মোট মূল্য" : "Subtotal"}</span>
                  <span className="font-semibold">{formatBDT(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {lang === "bn" ? "ডেলিভারি চার্জ" : "Delivery Charge"}{" "}
                    {values.district === "Dhaka"
                      ? lang === "bn"
                        ? "(ঢাকার ভেতরে)"
                        : "(Inside Dhaka)"
                      : lang === "bn"
                        ? "(ঢাকার বাইরে)"
                        : "(Outside Dhaka)"}
                  </span>
                  <span className="font-semibold">{formatBDT(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-sm font-extrabold text-[#0B2E13] dark:text-emerald-300">
                  <span>{lang === "bn" ? "সর্বমোট প্রদেয়" : "Total Payable"}</span>
                  <span className="text-base text-primary">{formatBDT(total)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !hydrated || lines.length === 0}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-black text-white transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50"
              >
                {submitting ? (
                  <span>{lang === "bn" ? "অর্ডার প্রসেস হচ্ছে..." : "Processing Order..."}</span>
                ) : (
                  <>
                    <span>
                      {lang === "bn"
                        ? `অর্ডার কনফার্ম করুন · ${formatBDT(total)}`
                        : `Confirm Order · ${formatBDT(total)}`}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Delivery Info Badge */}
              <div className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-center text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 flex items-center justify-center gap-2">
                <Truck className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  {values.district === "Dhaka"
                    ? lang === "bn"
                      ? "ঢাকার ভেতরে সেম ডে / ২৪ ঘন্টায় হোম ডেলিভারি"
                      : "Express 24-Hour Home Delivery inside Dhaka"
                    : lang === "bn"
                      ? "ঢাকার বাইরে ২-৩ দিনে হোম ডেলিভারি"
                      : "Nationwide 2-3 Days Home Delivery"}
                </span>
              </div>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}
