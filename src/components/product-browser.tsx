import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState, ErrorState } from "@/components/ui-states";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { fetchFacets, fetchProducts, type ProductFilters } from "@/data/api";
import { useCategories } from "@/hooks/use-store";

export function ProductBrowser({
  fixedCategory,
  heading,
}: {
  fixedCategory?: string;
  heading?: string;
}) {
  const categories = useCategories();
  const { data: facets } = useQuery({
    queryKey: ["product-facets"],
    queryFn: fetchFacets,
    staleTime: 60_000,
  });
  const allSizes = facets?.sizes ?? [];
  const allColors = facets?.colors ?? [];

  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [category, setCategory] = useState<string | undefined>(fixedCategory);
  const [sort, setSort] = useState<ProductFilters["sort"]>("featured");

  const filters: ProductFilters = {
    category: fixedCategory ?? category,
    sizes,
    colors,
    sort,
  };

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
  });

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const chipClass = (active: boolean) => `chip ${active ? "chip-active" : ""}`;

  const hasFilters = sizes.length > 0 || colors.length > 0 || (!fixedCategory && !!category);

  return (
    <>
      <div className="mb-8 space-y-4 border-y border-border py-5">
        {!fixedCategory && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory(undefined)}
              className={chipClass(!category)}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={chipClass(category === c.slug)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div>
          <p className="label-caps mb-2 text-muted-foreground">Size</p>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggle(sizes, s, setSizes)}
                className={chipClass(sizes.includes(s))}
                aria-pressed={sizes.includes(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label-caps mb-2 text-muted-foreground">Colour</p>
          <div className="flex flex-wrap gap-2">
            {allColors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => toggle(colors, c.name, setColors)}
                className={chipClass(colors.includes(c.name))}
                aria-pressed={colors.includes(c.name)}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-1">
          <p className="text-xs text-muted-foreground">
            {isPending ? "Loading products…" : `${data?.length ?? 0} products`}
            {heading ? ` in ${heading}` : ""}
          </p>
          <div className="flex min-w-0 items-center gap-4">
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSizes([]);
                  setColors([]);
                  if (!fixedCategory) setCategory(undefined);
                }}
                className="text-xs underline underline-offset-4"
              >
                Clear filters
              </button>
            )}
            <label htmlFor="sort" className="sr-only">
              Sort products
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as ProductFilters["sort"])}
              className="h-11 min-w-0 border border-border bg-background px-3 text-xs"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>
        </div>
      </div>

      {isPending && <ProductGridSkeleton />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.length === 0 && (
        <EmptyState
          title="No products match these filters"
          description="Try removing a size or colour filter to see more of the collection."
          action={
            <Link to="/shop" className="btn btn-outline">
              Shop all
            </Link>
          }
        />
      )}
      {data && data.length > 0 && <ProductGrid products={data} />}
    </>
  );
}
