import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHeading } from "@/components/ui-states";
import { useSettings } from "@/hooks/use-store";
import { formatBDT } from "@/lib/format";

export const Route = createFileRoute("/delivery-and-exchange")({
  head: () => ({
    meta: [
      { title: "Delivery & Exchange — Trikon Clothing" },
      {
        name: "description",
        content:
          "Delivery ৳70 inside Dhaka and ৳120 outside Dhaka, cash on delivery nationwide, plus a 7 day exchange window.",
      },
      { property: "og:title", content: "Delivery & Exchange — Trikon Clothing" },
      {
        property: "og:description",
        content: "Charges, timelines and how to request an exchange with Trikon.",
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
        eyebrow="Policy"
        title="Delivery & exchange"
        description="We ship to all 64 districts of Bangladesh with cash on delivery as the default payment method."
      />

      <div className="mt-10 max-w-2xl space-y-10">
        <section>
          <h2 className="type-h2">Delivery charges</h2>
          <div className="mt-4 border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 text-sm">
              <span>Inside Dhaka city · {storeSettings.deliveryTimeInside}</span>
              <span className="font-medium">{formatBDT(storeSettings.deliveryInsideDhaka)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span>Outside Dhaka · {storeSettings.deliveryTimeOutside}</span>
              <span className="font-medium">{formatBDT(storeSettings.deliveryOutsideDhaka)}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="type-h2">How orders are processed</h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>1. You place the order with cash on delivery selected.</li>
            <li>2. Our team calls your mobile number to confirm size, colour and address.</li>
            <li>3. The parcel is packed, checked and handed to the courier the same or next day.</li>
            <li>4. You pay the courier in cash when the parcel reaches you.</li>
          </ol>
        </section>

        <section>
          <h2 className="type-h2">Exchange</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            You can exchange any item within {storeSettings.exchangeWindowDays} days of delivery if
            it is unworn, unwashed and has its tags attached. Size exchanges are free of product
            cost — you only pay the return courier charge. Boxers and innerwear cannot be exchanged
            for hygiene reasons once the pack is opened.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            To start an exchange, call{" "}
            <a href={`tel:${storeSettings.supportPhone}`} className="underline underline-offset-4">
              {storeSettings.supportPhone}
            </a>{" "}
            with your order number ready.
          </p>
        </section>

        <section>
          <h2 className="type-h2">Damaged or wrong item</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            If we sent the wrong product or the item arrived with a manufacturing fault, contact us
            within 48 hours of delivery. We collect the parcel at our own cost and send a
            replacement, or refund the full amount including delivery.
          </p>
        </section>
      </div>
    </Container>
  );
}
