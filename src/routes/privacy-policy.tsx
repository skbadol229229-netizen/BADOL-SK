import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHeading } from "@/components/ui-states";
import { useSettings } from "@/hooks/use-store";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — GreenHarvest Organic Food" },
      {
        name: "description",
        content:
          "How GreenHarvest collects, uses and protects the personal information you share when ordering fresh organic food.",
      },
      { property: "og:title", content: "Privacy Policy — GreenHarvest Organic Food" },
      {
        property: "og:description",
        content: "What we collect, why we collect it, and your choices.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const storeSettings = useSettings();
  return (
    <Container className="py-10 md:py-16">
      <PageHeading
        eyebrow="Legal"
        title="Privacy policy"
        description={`This page explains how ${storeSettings.storeName} handles the information you share when you place an order for fresh produce.`}
      />

      <div className="mt-10 max-w-2xl space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="type-h3 text-foreground">What we collect</h2>
          <p className="mt-3">
            When you place an order for fresh organic groceries, we collect your name, mobile
            number, district, area, and delivery address. If you contact customer service, we retain
            your email address and message history.
          </p>
        </section>

        <section>
          <h2 className="type-h3 text-foreground">Why we collect it</h2>
          <p className="mt-3">
            We use this information strictly to harvest, package, and deliver your order, handle
            freshness guarantees, and reply to your inquiries. We share delivery details with our
            refrigerated cold-chain courier partners solely to execute your order.
          </p>
        </section>

        <section>
          <h2 className="type-h3 text-foreground">Payment information</h2>
          <p className="mt-3">
            Orders are paid in cash on delivery. We do not collect or store card numbers or mobile
            wallet credentials on this website.
          </p>
        </section>

        <section>
          <h2 className="type-h3 text-foreground">Storage on your device</h2>
          <p className="mt-3">
            Your shopping cart and recent order receipts are saved locally in your browser so you
            can access them conveniently. Clearing your browser cache removes this stored data.
          </p>
        </section>

        <section>
          <h2 className="type-h3 text-foreground">Your choices</h2>
          <p className="mt-3">
            You can request to modify or purge order contact records at any time by contacting us at{" "}
            <a
              href={`mailto:${storeSettings.supportEmail}`}
              className="underline underline-offset-4 text-primary font-medium"
            >
              {storeSettings.supportEmail}
            </a>
            .
          </p>
        </section>
      </div>
    </Container>
  );
}
