import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Container, EmptyState, ErrorState, PageHeading } from "@/components/ui-states";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { fetchProducts } from "@/data/api";
import { useDebounced } from "@/hooks/use-debounced";


type SearchParams = { q?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Search Products — Trikon Clothing" },
      {
        name: "description",
        content: "Search Trikon menswear by product name, category or SKU.",
      },
      { property: "og:title", content: "Search Products — Trikon Clothing" },
      { property: "og:description", content: "Find the Trikon piece you're looking for." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [term, setTerm] = useState(q ?? "");
  const debouncedTerm = useDebounced(term.trim(), 250);

  // Keep the URL in sync with what is typed so results stay shareable.
  useEffect(() => {
    const next = debouncedTerm || undefined;
    if (next === (q ?? undefined)) return;
    navigate({ to: "/search", search: next ? { q: next } : {}, replace: true });
  }, [debouncedTerm, q, navigate]);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["search", debouncedTerm],
    queryFn: () => fetchProducts({ search: debouncedTerm }),
    enabled: !!debouncedTerm,
  });

  const active = debouncedTerm;

  return (
    <Container className="py-10 md:py-16">
      <PageHeading eyebrow="Search" title={q ? `Results for “${q}”` : "Search the store"} />

      <form
        onSubmit={(e) => e.preventDefault()}
        className="mt-8 flex max-w-xl items-center border-b border-foreground"
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <label htmlFor="search-input" className="sr-only">
          Search products
        </label>
        <input
          id="search-input"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          autoComplete="off"
          placeholder="Try “tee”, “oxford” or “boxer”"
          className="h-12 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        {term && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setTerm("")}
            className="grid h-11 w-11 shrink-0 place-items-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>


      <div className="mt-10">
        {!active && (
          <EmptyState
            title="Start typing to search"
            description="Search by product name, category, size, colour or SKU — or browse the full collection."
            action={
              <Link to="/shop" className="btn btn-outline">
                Shop all
              </Link>
            }
          />
        )}
        {active && isPending && <ProductGridSkeleton count={4} />}
        {active && isError && <ErrorState onRetry={() => refetch()} />}
        {active && data && data.length === 0 && (
          <EmptyState
            title={`Nothing found for “${active}”`}
            description="Check the spelling, or browse categories from the shop page."
            action={
              <Link to="/shop" className="btn btn-outline">
                Shop all
              </Link>
            }
          />
        )}
        {active && data && data.length > 0 && (
          <>
            <p className="mb-6 text-xs text-muted-foreground">{data.length} products found</p>
            <ProductGrid products={data} />
          </>
        )}
      </div>

    </Container>
  );
}
