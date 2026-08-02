import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Container, PageHeading } from "@/components/ui-states";
import { ProductBrowser } from "@/components/product-browser";
import { fetchCategory } from "@/data/api";
import type { Category } from "@/data/types";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }): Promise<{ category: Category }> => {
    const category = await fetchCategory(params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Category not found — Trikon Clothing" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { category } = loaderData;
    const title = `${category.name} for Men — Trikon Clothing`;
    return {
      meta: [
        { title },
        { name: "description", content: category.description },
        { property: "og:title", content: title },
        { property: "og:description", content: category.description },
      ],
    };
  },
  notFoundComponent: CategoryNotFound,
  component: CategoryPage,
});

function CategoryNotFound() {
  return (
    <Container className="py-20 text-center">
      <h1 className="type-h1">Category not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This category may have been renamed or removed.
      </p>
      <Link to="/shop" className="mt-8 btn btn-solid">
        Shop all products
      </Link>
    </Container>
  );
}

function CategoryPage() {
  const { category } = Route.useLoaderData() as { category: Category };

  return (
    <Container className="py-10 md:py-16">
      <PageHeading eyebrow="Category" title={category.name} description={category.description} />
      <div className="mt-10">
        <ProductBrowser fixedCategory={category.slug} heading={category.name} />
      </div>
    </Container>
  );
}
