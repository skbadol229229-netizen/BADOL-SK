import { createFileRoute } from "@tanstack/react-router";
import { Container, PageHeading } from "@/components/ui-states";
import { ProductBrowser } from "@/components/product-browser";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All Menswear — Trikon Clothing" },
      {
        name: "description",
        content:
          "Browse every Trikon product: heavyweight t-shirts, shirts, polos, shorts and boxers with cash on delivery in Bangladesh.",
      },
      { property: "og:title", content: "Shop All Menswear — Trikon Clothing" },
      {
        property: "og:description",
        content: "Every Trikon piece in one place. Filter by category, size, colour and price.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <Container className="py-10 md:py-16">
      <PageHeading
        eyebrow="All products"
        title="The collection"
        description="Every Trikon piece, made from heavier cotton and cut for the Bangladeshi climate."
      />
      <div className="mt-10">
        <ProductBrowser />
      </div>
    </Container>
  );
}
