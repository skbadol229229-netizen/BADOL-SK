import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHeading } from "@/components/ui-states";
import { useSettings } from "@/hooks/use-store";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Trikon Clothing" },
      {
        name: "description",
        content:
          "How Trikon Clothing collects, uses and protects the personal information you share when ordering.",
      },
      { property: "og:title", content: "Privacy Policy — Trikon Clothing" },
      { property: "og:description", content: "What we collect, why we collect it, and your choices." },
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
        description="This page is maintained by Trikon Clothing and explains how we handle the information you give us when you shop."
      />

      <div className="mt-10 max-w-2xl space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="type-h3 text-foreground">What we collect</h2>
          <p className="mt-3">
            When you place an order we collect your name, mobile number, district, area and delivery
            address, plus any note you add. If you contact us we keep your email address and the
            message you send.
          </p>
        </section>

        <section>
          <h2 className="type-h3 text-foreground">Why we collect it</h2>
          <p className="mt-3">
            We use this information only to confirm and deliver your order, handle exchanges, and
            reply to your questions. We share your name, phone number and address with the courier
            company that delivers your parcel — nothing more.
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
            Your shopping bag and your most recent order confirmation are stored in your own
            browser so you can return to them later. Clearing your browser data removes them.
          </p>
        </section>

        <section>
          <h2 className="type-h3 text-foreground">Your choices</h2>
          <p className="mt-3">
            You can ask us to correct or delete the details attached to your order at any time by
            emailing{" "}
            <a
              href={`mailto:${storeSettings.supportEmail}`}
              className="underline underline-offset-4"
            >
              {storeSettings.supportEmail}
            </a>
            . We will confirm the change within one working day.
          </p>
        </section>
      </div>
    </Container>
  );
}
