import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Container, EmptyState, PageHeading } from "@/components/ui-states";
import { useCart } from "@/context/cart";
import { districts } from "@/data/catalog";
import type { CartLine } from "@/data/types";
import { useSettings } from "@/hooks/use-store";
import { placeTursoOrder } from "@/lib/admin";
import { formatBDT } from "@/lib/format";
import { saveOrder } from "@/lib/order-storage";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Cash on Delivery | Trikon Clothing" },
      {
        name: "description",
        content:
          "Complete your Trikon order with cash on delivery. Delivery ৳70 inside Dhaka and ৳120 outside Dhaka.",
      },
      { property: "og:title", content: "Checkout — Cash on Delivery | Trikon Clothing" },
      { property: "og:description", content: "Pay when your parcel arrives, anywhere in Bangladesh." },
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
    .regex(/^01[3-9]\d{8}$/, { message: "Enter a valid 11 digit mobile number, e.g. 01712345678." }),
  district: z.string().min(1, { message: "Please select your district." }),
  area: z
    .string()
    .trim()
    .min(2, { message: "Please enter your area or thana." })
    .max(80, { message: "Area must be under 80 characters." }),
  address: z
    .string()
    .trim()
    .min(10, { message: "Please enter your full address, including house and road." })
    .max(300, { message: "Address must be under 300 characters." }),
  note: z.string().trim().max(300, { message: "Note must be under 300 characters." }).optional(),
});

type FormValues = z.infer<typeof checkoutSchema>;
type FormErrors = Partial<Record<keyof FormValues, string>>;

const emptyForm: FormValues = {
  fullName: "",
  mobile: "",
  district: "",
  area: "",
  address: "",
  note: "",
};

function CheckoutPage() {
  const { lines, subtotal, hydrated, clear } = useCart();
  const storeSettings = useSettings();
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const deliveryCharge = useMemo(
    () =>
      values.district === "Dhaka"
        ? storeSettings.deliveryInsideDhaka
        : values.district
          ? storeSettings.deliveryOutsideDhaka
          : storeSettings.deliveryInsideDhaka,
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
      toast.error("Please check the highlighted fields");
      return;
    }

    setSubmitting(true);
    try {
      const result = await placeTursoOrder({
        fullName: parsed.data.fullName,
        mobile: parsed.data.mobile,
        district: parsed.data.district,
        area: parsed.data.area,
        address: parsed.data.address,
        note: parsed.data.note,
        items: lines.map((l) => ({
          productId: l.productId,
          productSlug: l.productSlug,
          name: l.name,
          image: l.image,
          size: l.size,
          color: l.color,
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
        customer: parsed.data,
        lines,
        subtotal,
        deliveryCharge,
        total,
        paymentMethod: "cod" as const,
      });

      clear();
      toast.success("Order placed");
      navigate({ to: "/order-success" });
    } catch (err) {
      setSubmitting(false);
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : "We couldn't place your order. Please try again.",
      );
    }
  }


  const inputClass = (invalid?: string) =>
    `field-input ${invalid ? "field-invalid" : ""}`;

  if (hydrated && lines.length === 0) {
    return (
      <Container className="py-10 md:py-16">
        <PageHeading eyebrow="Checkout" title="Nothing to check out" />
        <div className="mt-10">
          <EmptyState
            title="Your bag is empty"
            description="Add products to your bag before placing an order."
            action={
              <Link
                to="/shop"
                className="btn btn-solid"
              >
                Shop all products
              </Link>
            }
          />
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-16">
      <PageHeading
        eyebrow="Checkout"
        title="Delivery details"
        description="We deliver across Bangladesh. Pay the courier in cash when your parcel arrives."
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16"
      >
        <div className="space-y-6">
          <div>
            <label htmlFor="fullName" className="field-label">
              Full name
            </label>
            <input
              id="fullName"
              value={values.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              autoComplete="name"
              maxLength={80}
              className={inputClass(errors.fullName)}
              aria-invalid={!!errors.fullName}
            />
            {errors.fullName && <p className="field-error">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="mobile" className="field-label">
              Mobile number
            </label>
            <input
              id="mobile"
              value={values.mobile}
              onChange={(e) => setField("mobile", e.target.value.replace(/\D/g, "").slice(0, 11))}
              inputMode="numeric"
              autoComplete="tel"
              placeholder="01XXXXXXXXX"
              className={inputClass(errors.mobile)}
              aria-invalid={!!errors.mobile}
            />
            {errors.mobile && <p className="field-error">{errors.mobile}</p>}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="district" className="field-label">
                District
              </label>
              <select
                id="district"
                value={values.district}
                onChange={(e) => setField("district", e.target.value)}
                className={inputClass(errors.district)}
                aria-invalid={!!errors.district}
              >
                <option value="">Select district</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="field-error">{errors.district}</p>
              )}
            </div>
            <div>
              <label htmlFor="area" className="field-label">
                Area / thana
              </label>
              <input
                id="area"
                value={values.area}
                onChange={(e) => setField("area", e.target.value)}
                maxLength={80}
                className={inputClass(errors.area)}
                aria-invalid={!!errors.area}
              />
              {errors.area && <p className="field-error">{errors.area}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="address" className="field-label">
              Complete address
            </label>
            <textarea
              id="address"
              value={values.address}
              onChange={(e) => setField("address", e.target.value)}
              rows={3}
              maxLength={300}
              autoComplete="street-address"
              placeholder="House, road, block, landmark"
              className={`field-textarea ${errors.address ? "field-invalid" : ""}`}
              aria-invalid={!!errors.address}
            />
            {errors.address && <p className="field-error">{errors.address}</p>}
          </div>

          <div>
            <label htmlFor="note" className="field-label">
              Order note (optional)
            </label>
            <textarea
              id="note"
              value={values.note}
              onChange={(e) => setField("note", e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="Delivery timing, alternative number, size guidance"
              className="field-textarea"
            />
            {errors.note && <p className="field-error">{errors.note}</p>}
          </div>

          <fieldset className="border border-border p-4">
            <legend className="field-label px-2 mb-0">Payment</legend>
            <label className="flex items-start gap-3">
              <input type="radio" name="payment" defaultChecked readOnly className="mt-1" />
              <span>
                <span className="block text-sm font-medium">Cash on delivery</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Pay the courier in cash when your parcel arrives. No advance payment required.
                </span>
              </span>
            </label>
          </fieldset>
        </div>

        <aside className="h-fit border border-border bg-secondary p-5 md:p-6">
          <h2 className="type-h3">Order summary</h2>
          <ul className="mt-5 space-y-4">
            {lines.map((l) => (
              <li key={`${l.productId}-${l.size}-${l.color}`} className="flex min-w-0 gap-3">
                <img
                  src={l.image}
                  alt=""
                  width={800}
                  height={1000}
                  loading="lazy"
                  className="h-16 w-13 shrink-0 bg-background object-cover"
                  style={{ width: 52 }}
                />
                <div className="min-w-0 flex-1">
                  <p className="clamp-2 text-sm">{l.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {l.size} · {l.color} · ×{l.quantity}
                  </p>
                </div>
                <span className="shrink-0 whitespace-nowrap text-sm">{formatBDT(l.unitPrice * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatBDT(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Delivery {values.district === "Dhaka" ? "(inside Dhaka)" : values.district ? "(outside Dhaka)" : ""}
              </dt>
              <dd>{formatBDT(deliveryCharge)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
              <dt>Total payable</dt>
              <dd>{formatBDT(total)}</dd>
            </div>
          </dl>
          <button
            type="submit"
            disabled={submitting || !hydrated || lines.length === 0}
            className="btn btn-solid btn-block mt-6"
          >
            {submitting ? "Placing order…" : `Place order · ${formatBDT(total)}`}
          </button>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Delivery {storeSettings.deliveryTimeInside} inside Dhaka,{" "}
            {storeSettings.deliveryTimeOutside} outside. {storeSettings.exchangeWindowDays} day
            exchange on unworn items.
          </p>
        </aside>
      </form>
    </Container>
  );
}
