import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHeading } from "@/components/ui-states";
import { useSettings } from "@/hooks/use-store";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — GreenHarvest Organic Food" },
      {
        name: "description",
        content:
          "Terms and conditions for ordering fresh organic produce, dairy, and pantry goods from GreenHarvest in Bangladesh.",
      },
      { property: "og:title", content: "Terms & Conditions — GreenHarvest Organic Food" },
      {
        property: "og:description",
        content: "Ordering, produce freshness, delivery, and refund terms.",
      },
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
        description="By placing an order on GreenHarvest, you agree to the standard terms outlined below."
      />

      <div className="mt-10 max-w-2xl space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="type-h3 text-foreground">Orders & Harvest Availability</h2>
          <p className="mt-3">
            Because our fruits and vegetables are harvested fresh daily, items are subject to
            seasonal availability and morning farm yields. If a specific produce line is
            unavailable, our team will inform you before dispatch.
          </p>
        </section>

        <section>
          <h2 className="type-h3 text-foreground">Pricing and Delivery</h2>
          <p className="mt-3">
            All prices are in Bangladeshi Taka (BDT). Delivery fees inside and outside Dhaka are
            calculated at checkout. Cash on Delivery (COD) is available nationwide.
          </p>
        </section>

        <section>
          <h2 className="type-h3 text-foreground">Cancellation & Replacements</h2>
          <p className="mt-3">
            Orders can be cancelled before early morning dispatch by contacting support at{" "}
            <a
              href={`tel:${storeSettings.supportPhone}`}
              className="underline font-medium text-primary"
            >
              {storeSettings.supportPhone}
            </a>
            . Perishable goods found damaged upon arrival qualify for instant replacement under our
            Freshness Guarantee.
          </p>
        </section>

        <section>
          <h2 className="type-h3 text-foreground">Contact</h2>
          <p className="mt-3">
            For inquiries, email us at{" "}
            <a
              href={`mailto:${storeSettings.supportEmail}`}
              className="underline text-primary font-medium"
            >
              {storeSettings.supportEmail}
            </a>
            . Office address: {storeSettings.address}.
          </p>
        </section>
      </div>
    </Container>
  );
}
