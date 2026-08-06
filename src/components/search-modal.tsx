import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, X, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useDebounced } from "@/hooks/use-debounced";
import { useLanguage } from "@/context/language";
import { fetchProducts, priceOf } from "@/data/api";
import { formatBDT } from "@/lib/format";
import { formatImageUrl } from "@/lib/utils";

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query.trim(), 200);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ["search-modal", debouncedQuery],
    queryFn: () => fetchProducts({ search: debouncedQuery }),
    enabled: debouncedQuery.length > 0 && isOpen,
  });

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate({ to: "/search", search: { q: query.trim() } });
  };

  const popularTags = [
    { label: lang === "bn" ? "মধু (Honey)" : "Honey", q: "মধু" },
    { label: lang === "bn" ? "ঘি (Pure Ghee)" : "Ghee", q: "ঘি" },
    { label: lang === "bn" ? "টমেটো (Tomatoes)" : "Tomatoes", q: "টমেটো" },
    { label: lang === "bn" ? "শাক (Organic Spinach)" : "Spinach", q: "শাক" },
    { label: lang === "bn" ? "সরিষার তেল (Mustard Oil)" : "Mustard Oil", q: "তেল" },
  ];

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-primary/20 bg-card p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header Search Form */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            <span className="text-sm font-extrabold">
              {lang === "bn" ? "অর্গানিক পণ্য খুঁজুন" : "Search Organic Store"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-foreground hover:bg-primary hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="mt-4 relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-primary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder={
              lang === "bn"
                ? "এখানে পণ্যের নাম লিখুন (যেমন: মধু, টমেটো, ঘি)..."
                : "Type product name (e.g. Honey, Tomatoes, Ghee)..."
            }
            className="h-13 w-full rounded-2xl border-2 border-primary/30 bg-secondary/50 pl-11 pr-24 text-sm font-semibold outline-none transition-all focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-16 flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="submit"
            className="absolute right-2.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-primary/90"
          >
            {lang === "bn" ? "খুঁজুন" : "Search"}
          </button>
        </form>

        {/* Popular Tags when query is empty */}
        {!query && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>{lang === "bn" ? "জনপ্রিয় সার্চ সমুহ:" : "Popular Searches:"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(tag.q);
                  }}
                  className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary hover:bg-primary hover:text-white"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results / Live Suggestions */}
        {debouncedQuery.length > 0 && (
          <div className="mt-4 max-h-[50vh] overflow-y-auto space-y-2 pr-1">
            {isFetching && (
              <p className="p-4 text-center text-xs text-muted-foreground animate-pulse">
                {lang === "bn" ? "পণ্য খোঁজা হচ্ছে..." : "Searching products..."}
              </p>
            )}

            {!isFetching && suggestions.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
                <p>
                  {lang === "bn"
                    ? `“${debouncedQuery}” দিয়ে কোনো পণ্য পাওয়া যায়নি।`
                    : `No products found for “${debouncedQuery}”.`}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate({ to: "/shop" });
                  }}
                  className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                >
                  <span>
                    {lang === "bn" ? "সব অর্গানিক পণ্য দেখুন" : "Browse all organic products"}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {suggestions.map((product) => (
              <Link
                key={product.id}
                to="/product/$slug"
                params={{ slug: product.slug }}
                onClick={onClose}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-2.5 transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-primary/20 bg-secondary">
                    {product.images[0] && (
                      <img
                        src={formatImageUrl(product.images[0])}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate text-xs font-bold text-foreground">
                      {product.name}
                    </span>
                    <span className="block text-[11px] font-semibold text-muted-foreground">
                      {product.sizes?.[0] || "100% Organic"}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="block text-xs font-extrabold text-primary">
                    {formatBDT(priceOf(product))}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                    {lang === "bn" ? "স্টকে আছে" : "In Stock"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
