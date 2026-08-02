import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHeading } from "@/components/ui-states";
import { ProductBrowser } from "@/components/product-browser";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Authentic Organic Food — PureBengal" },
      {
        name: "description",
        content:
          "Browse pure Sundarban honey, organic cold-pressed mustard oil, pure cow ghee, organic spices, seeds & herbal teas with cash on delivery in Bangladesh.",
      },
      { property: "og:title", content: "Shop Authentic Organic Food — PureBengal" },
      {
        property: "og:description",
        content: "100% certified organic produce and authentic Bangladeshi pantry staples.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <Container className="py-10 md:py-16">
      <PageHeading
        eyebrow="All Products"
        title="Pure Harvest Collection"
        description="Authentic, chemical-free organic food items directly sourced from local farmers across Bangladesh."
      />
      <div className="mt-10">
        <ProductBrowser />
      </div>
    </Container>
  );
}
