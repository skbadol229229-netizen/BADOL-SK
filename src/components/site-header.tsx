import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/cart";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { useCategories } from "@/hooks/use-store";
import { useDebounced } from "@/hooks/use-debounced";
import { fetchProducts, priceOf } from "@/data/api";
import { formatBDT } from "@/lib/format";

export function SiteHeader() {
  const { count } = useCart();
  const categories = useCategories();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounced(query.trim(), 200);

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => fetchProducts({ search: debouncedQuery }),
    enabled: debouncedQuery.length > 0,
  });

  // Lock background scroll and allow Escape to close while the drawer is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Close the suggestion dropdown on outside click.
  useEffect(() => {
    if (!suggestOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [suggestOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setMenuOpen(false);
    setSuggestOpen(false);
    navigate({ to: "/search", search: { q } });
  }

  const desktopLinkClass =
    "label-caps text-muted-foreground transition-colors hover:text-foreground";
  const mobileLinkClass = "flex min-h-[52px] items-center border-b border-border text-base";
  const close = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      {/* Top Announcement Bar */}
      <div className="bg-primary px-4 py-1.5 text-center text-[11px] font-medium text-primary-foreground sm:text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <span className="hidden sm:inline">
            🌱 100% Certified Organic Food Sourced Directly From Farmers
          </span>
          <span className="sm:hidden">🌱 100% Organic Food • Express Delivery</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span>📞 Hotline: +880 1711-223344</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">🚚 Cash on Delivery Nationwide</span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 md:h-[72px] md:px-8">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="-ml-2 grid h-11 w-11 shrink-0 place-items-center md:hidden"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <Link to="/" className="min-w-0">
            <BrandMark />
          </Link>
        </div>

        <nav className="hidden min-w-0 items-center justify-center gap-5 md:flex lg:gap-7">
          <Link
            to="/shop"
            className={desktopLinkClass}
            activeProps={{ className: "text-foreground font-semibold" }}
          >
            Shop
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className={desktopLinkClass}
              activeProps={{ className: "text-foreground font-semibold" }}
            >
              {c.name}
            </Link>
          ))}
          <Link
            to="/about"
            className={desktopLinkClass}
            activeProps={{ className: "text-foreground font-semibold" }}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={desktopLinkClass}
            activeProps={{ className: "text-foreground font-semibold" }}
          >
            Contact
          </Link>
        </nav>

        <div className="-mr-2 flex items-center justify-end gap-1 md:mr-0">
          <div ref={searchRef} className="relative hidden md:block">
            <form onSubmit={submitSearch} className="relative flex items-center">
              <label htmlFor="site-search" className="sr-only">
                Search organic products
              </label>
              <input
                id="site-search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSuggestOpen(true);
                }}
                onFocus={() => setSuggestOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSuggestOpen(false);
                }}
                autoComplete="off"
                placeholder="Search honey, ghee, spices..."
                className="h-9 w-48 rounded-full border border-border bg-secondary/70 pl-3.5 pr-8 text-xs outline-none transition-all placeholder:text-muted-foreground focus:w-64 focus:border-primary focus:bg-background lg:w-56"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    setSuggestOpen(false);
                  }}
                  className="absolute right-2 grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-2 grid h-7 w-7 place-items-center text-muted-foreground"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            {suggestOpen && debouncedQuery.length > 0 && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 rounded-xl border border-border bg-popover p-2 shadow-lg">
                {isFetching && suggestions.length === 0 && (
                  <p className="px-3 py-3 text-xs text-muted-foreground">
                    Searching organic harvest…
                  </p>
                )}
                {!isFetching && suggestions.length === 0 && (
                  <p className="px-3 py-3 text-xs text-muted-foreground">
                    No products match “{debouncedQuery}”.
                  </p>
                )}
                {suggestions.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    onClick={() => setSuggestOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted"
                  >
                    <span className="h-12 w-10 shrink-0 overflow-hidden rounded bg-muted">
                      {p.images[0] && (
                        <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-foreground">
                        {p.name}
                      </span>
                      <span className="block text-[11px] font-medium text-primary">
                        {formatBDT(priceOf(p))}
                      </span>
                    </span>
                  </Link>
                ))}
                {suggestions.length > 0 && (
                  <button
                    type="button"
                    onClick={submitSearch}
                    className="mt-1 w-full border-t border-border pt-2 text-center text-xs font-medium text-primary hover:underline"
                  >
                    View all {suggestions.length} results →
                  </button>
                )}
              </div>
            )}
          </div>

          <Link
            to="/search"
            aria-label="Search"
            className="grid h-11 w-11 place-items-center lg:hidden"
          >
            <Search className="h-5 w-5" />
          </Link>
          <ThemeToggle className="h-11 w-11 text-foreground" />
          <Link
            to="/cart"
            aria-label={`Cart, ${count} items`}
            className="relative grid h-11 w-11 place-items-center"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-1 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          tabIndex={menuOpen ? 0 : -1}
          aria-label="Close menu"
          onClick={close}
          className={`absolute inset-0 bg-foreground/50 transition-opacity duration-200 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-[86%] max-w-[20rem] flex-col overflow-y-auto overflow-x-hidden bg-background transition-transform duration-250 ease-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
            <BrandMark logoClassName="h-7" textClassName="font-serif-display text-xl" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="-mr-2 grid h-11 w-11 place-items-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col px-4 pb-10">
            <Link to="/" onClick={close} className={mobileLinkClass}>
              Home
            </Link>
            <Link to="/shop" onClick={close} className={mobileLinkClass}>
              Shop
            </Link>
            <p className="label-caps pt-5 pb-2 text-muted-foreground">Categories</p>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                onClick={close}
                className={mobileLinkClass}
              >
                {c.name}
              </Link>
            ))}
            <div className="h-5" />
            <Link to="/about" onClick={close} className={mobileLinkClass}>
              About
            </Link>
            <Link to="/contact" onClick={close} className={mobileLinkClass}>
              Contact
            </Link>
            <Link to="/delivery-and-exchange" onClick={close} className={mobileLinkClass}>
              Delivery &amp; exchange
            </Link>
            <ThemeToggle className={`${mobileLinkClass} justify-start gap-3`} showLabel />
          </nav>
        </div>
      </div>
    </header>
  );
}
