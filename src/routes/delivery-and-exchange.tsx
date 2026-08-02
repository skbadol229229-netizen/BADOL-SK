import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHeading } from "@/components/ui-states";
import { useSettings } from "@/hooks/use-store";
import { formatBDT } from "@/lib/format";

export const Route = createFileRoute("/delivery-and-exchange")({
  head: () => ({
    meta: [
      { title: "Delivery & Returns — GreenHarvest Organic Food" },
      {
        name: "description",
        content:
          "Same-day organic produce delivery ৳60 inside Dhaka and ৳120 outside Dhaka, cash on delivery, with fresh quality guarantee.",
      },
      { property: "og:title", content: "Delivery & Returns — GreenHarvest Organic Food" },
      {
        property: "og:description",
        content: "Cold-chain delivery charges, schedules, and freshness guarantee policy.",
      },
    ],
  }),
  component: DeliveryPage,
});

function DeliveryPage() {
  const storeSettings = useSettings();
  return (
    <Container className="py-10 md:py-16">
      <PageHeading
        eyebrow="Delivery & Policy"
        title="Delivery & Freshness Guarantee"
        description="We deliver farm-fresh organic vegetables, fruits, dairy, and pantry items in temperature-maintained eco packaging."
      />

      <div className="mt-10 max-w-2xl space-y-10">
        <section>
          <h2 className="type-h2">Delivery Rates & Speed</h2>
          <div className="mt-4 border border-border rounded-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 text-sm">
              <span>Inside Dhaka City · {storeSettings.deliveryTimeInside}</span>
              <span className="font-semibold text-primary">
                {formatBDT(storeSettings.deliveryInsideDhaka)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span>Outside Dhaka · {storeSettings.deliveryTimeOutside}</span>
              <span className="font-semibold text-primary">
                {formatBDT(storeSettings.deliveryOutsideDhaka)}
              </span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="type-h2">How Orders Are Fulfilled</h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>1. Place your order online with Cash on Delivery or online payment.</li>
            <li>2. Early morning harvest is collected from organic farms and quality tested.</li>
            <li>3. Packed in breathable, temperature-regulated bio-bags.</li>
            <li>4. Delivered directly to your door with real-time mobile tracking updates.</li>
          </ol>
        </section>

        <section>
          <h2 className="type-h2">Freshness Guarantee & Returns</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            If any perishable fruit or vegetable arrives damaged, bruised, or not up to your fresh
            quality standards, inform us within {storeSettings.exchangeWindowDays} days. We will
            immediately send a fresh replacement or refund your item with no hassle.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            For support or instant replacements, call or WhatsApp{" "}
            <a
              href={`tel:${storeSettings.supportPhone}`}
              className="underline font-medium text-primary"
            >
              {storeSettings.supportPhone}
            </a>
            .
          </p>
        </section>
      </div>
    </Container>
  );
}
