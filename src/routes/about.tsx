import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, PageHeading } from "@/components/ui-states";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Trikon — Menswear Made Properly" },
      {
        name: "description",
        content:
          "Trikon is a Dhaka-based menswear label making heavier cotton basics with clean cuts and honest pricing.",
      },
      { property: "og:title", content: "About Trikon — Menswear Made Properly" },
      {
        property: "og:description",
        content: "A small Dhaka label, a tight range, and fabric heavier than the market average.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <Container className="py-10 md:py-16">
      <PageHeading
        eyebrow="Our story"
        title="Menswear made properly"
        description="Trikon started in Dhaka in 2023 with one frustration: locally available basics were thin, badly cut, and inconsistently sized."
      />

      <div className="mt-12 grid gap-10 md:grid-cols-3">
        <div>
          <h2 className="type-h3">Fabric first</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We buy 240 GSM combed cotton for our tees when the market standard is 160. Heavier
            fabric drapes better, survives more washes, and does not go transparent.
          </p>
        </div>
        <div>
          <h2 className="type-h3">A tight range</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We carry fewer than twenty products at any time. Each one is fitted on real bodies in
            Dhaka before it goes into production.
          </p>
        </div>
        <div>
          <h2 className="type-h3">Honest pricing</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            No inflated MRP followed by permanent discounts. Prices reflect what the garment costs
            to make well, plus a working margin.
          </p>
        </div>
      </div>

      <div className="mt-16 border-t border-border pt-10">
        <h2 className="type-h2">Where we are</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Our studio and dispatch centre are in Banani, Dhaka. Every order is packed and checked by
          our own team before handover to the courier. We deliver to all 64 districts.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex h-12 items-center justify-center bg-foreground px-8 text-sm font-medium text-background"
        >
          Shop the collection
        </Link>
      </div>
    </Container>
  );
}
