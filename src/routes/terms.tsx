import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHeading } from "@/components/ui-states";
import { useSettings } from "@/hooks/use-store";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Trikon Clothing" },
      {
        name: "description",
        content:
          "The terms that apply when you order menswear from Trikon Clothing in Bangladesh, including pricing, cancellation and liability.",
      },
      { property: "og:title", content: "Terms & Conditions — Trikon Clothing" },
      { property: "og:description", content: "Ordering, pricing, cancellation and liability terms." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const storeSettings = useSettings();
  return (
    <Container className="py-10 md:py-16">
      <PageHeading
        eyebrow="Legal"
        title="Terms & conditions"
        description="By placing an order on this website you agree to the terms below."
      />

      <div className="mt-10 max-w-2xl space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="type-h3 text-foreground">Orders</h2>
          <p className="mt-3">
            An order is confirmed only after our team reaches you by phone to verify the details.
            If we cannot reach you after three attempts within 48 hours, the order may be
            cancelled.
          </p>
        </section>

        <section>
          <h2 className="type-h3 text-foreground">Pricing and availability</h2>
          <p className="mt-3">
            All prices are shown in Bangladeshi Taka and include VAT where applicable. Delivery is
            charged separately. Stock is limited and a product may sell out between adding it to
            your bag and confirming your order; in that case we will offer an alternative or
            cancel the line.
          </p>
        </section>

        <section>
          <h2 className="type-h3 text-foreground">Cancellation</h2>
          <p className="mt-3">
            You may cancel free of charge any time before the parcel is handed to the courier. Call{" "}
            <a href={`tel:${storeSettings.supportPhone}`} className="underline underline-offset-4">
              {storeSettings.supportPhone}
            </a>{" "}
            with your order number. Repeatedly refusing delivered cash-on-delivery parcels may
            result in future orders requiring advance payment.
          </p>
        </section>

        <section>
          <h2 className="type-h3 text-foreground">Product presentation</h2>
          <p className="mt-3">
            We photograph garments as accurately as we can, but colour can appear slightly
            different across screens. Measurements listed on product pages are taken flat and may
            vary by up to half an inch.
          </p>
        </section>

        <section>
          <h2 className="type-h3 text-foreground">Liability</h2>
          <p className="mt-3">
            Our responsibility is limited to the value of the products you ordered. We are not
            liable for delays caused by courier partners, weather, or events outside our control.
          </p>
        </section>

        <section>
          <h2 className="type-h3 text-foreground">Contact</h2>
          <p className="mt-3">
            Questions about these terms can be sent to{" "}
            <a
              href={`mailto:${storeSettings.supportEmail}`}
              className="underline underline-offset-4"
            >
              {storeSettings.supportEmail}
            </a>
            . Registered address: {storeSettings.address}.
          </p>
        </section>
      </div>
    </Container>
  );
}
