import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/ui-states";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { fetchProducts, type ProductFilters } from "@/data/api";
import { useCategories } from "@/hooks/use-store";
import { useLanguage } from "@/context/language";

export function ProductBrowser({
  fixedCategory,
  heading,
}: {
  fixedCategory?: string;
  heading?: string;
}) {
  const categories = useCategories();
  const { lang } = useLanguage();
  const [category, setCategory] = useState<string | undefined>(fixedCategory);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProductFilters["sort"]>("featured");

  const filters: ProductFilters = {
    category: fixedCategory ?? category,
    search: search.trim() || undefined,
    sort,
  };

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
  });

  const activeCategoryObj = categories.find((c) => c.slug === category);

  return (
    <>
      {/* Category Pills & Search Bar */}
      <div className="mb-8 space-y-4 rounded-2xl border border-border bg-card p-4 md:p-6 shadow-xs">
        {!fixedCategory && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setCategory(undefined)}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                !category
                  ? "bg-[#0B2E13] text-white shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {lang === "bn" ? "সকল পণ্য" : "All Products"}
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  category === c.slug
                    ? "bg-[#0B2E13] text-white shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "bn" ? "পণ্য দিয়ে খুঁজুন..." : "Search products..."}
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-8 text-xs outline-none focus:border-primary"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-muted-foreground whitespace-nowrap hidden sm:block">
              {isPending
                ? lang === "bn"
                  ? "লোড হচ্ছে..."
                  : "Loading..."
                : `${data?.length ?? 0} ${lang === "bn" ? "টি পণ্য" : "products"}`}
            </p>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as ProductFilters["sort"])}
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium outline-none focus:border-primary"
              >
                <option value="featured">
                  {lang === "bn" ? "পছন্দনীয় (Featured)" : "Featured"}
                </option>
                <option value="newest">{lang === "bn" ? "নতুন পণ্য (Newest)" : "Newest"}</option>
                <option value="price-asc">
                  {lang === "bn" ? "দাম: কম থেকে বেশি" : "Price: Low to High"}
                </option>
                <option value="price-desc">
                  {lang === "bn" ? "দাম: বেশি থেকে কম" : "Price: High to Low"}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {isPending && <ProductGridSkeleton />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.length === 0 && (
        <EmptyState
          title={lang === "bn" ? "কোনো পণ্য পাওয়া যায়নি" : "No products found"}
          description={
            lang === "bn"
              ? "আপনার কাঙ্ক্ষিত পণ্যটি খুঁজতে অন্য ক্যাটাগরি বা শব্দ ব্যবহার করুন।"
              : "Try clearing search or selecting a different category."
          }
          action={
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory(undefined);
              }}
              className="btn btn-solid"
            >
              {lang === "bn" ? "সব পণ্য দেখুন" : "View All Products"}
            </button>
          }
        />
      )}
      {data && data.length > 0 && <ProductGrid products={data} />}
    </>
  );
}
