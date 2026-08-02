import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, PageHeading } from "@/components/ui-states";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About PureBengal — Authentic Bangladeshi Organic Food" },
      {
        name: "description",
        content:
          "PureBengal connects sustainable local farms with health-conscious families across Bangladesh, delivering pesticide-free produce and authentic organic staples.",
      },
      { property: "og:title", content: "About PureBengal — Authentic Bangladeshi Organic Food" },
      {
        property: "og:description",
        content:
          "Pure Sundarban honey, wood-pressed mustard oil, organic ghee, spices, and natural seeds delivered directly to your doorstep.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <Container className="py-10 md:py-16">
      <PageHeading
        eyebrow="Our Harvest Story"
        title="Pure Organic Food, Farm Fresh Daily"
        description="PureBengal was founded in Dhaka with a simple mission: bringing authentic, chemical-free, nutrient-dense organic food directly from local farmers to your family's table."
      />

      <div className="mt-12 grid gap-10 md:grid-cols-3">
        <div>
          <h2 className="type-h3">100% Chemical-Free</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Our crops are cultivated naturally without harmful pesticides, synthetic fertilizers, or
            growth hormones. We test every batch for purity and soil nutrition.
          </p>
        </div>
        <div>
          <h2 className="type-h3">Direct Farm Sourcing</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We partner directly with organic-certified farms in Sreemangal, Bogura, and Sundarban.
            Fair prices for local farmers, freshest produce for you.
          </p>
        </div>
        <div>
          <h2 className="type-h3">Cold-Chain Freshness</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Harvested early in the morning and chilled immediately in eco-friendly insulated
            packaging to preserve natural flavor, crispness, and vital nutrients.
          </p>
        </div>
      </div>

      <div className="mt-16 border-t border-border pt-10">
        <h2 className="type-h2">Our Fulfillment Center</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Our main organic hub is located in Gulshan, Dhaka. Every package is hand-checked and
          packed under hygienic conditions before swift dispatch across Bangladesh.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex h-12 items-center justify-center bg-primary px-8 text-sm font-medium text-primary-foreground rounded-md shadow-xs hover:opacity-90 transition-opacity"
        >
          Explore Fresh Produce
        </Link>
      </div>
    </Container>
  );
}
