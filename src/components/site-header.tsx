import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X, Heart, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/cart";
import { useLanguage } from "@/context/language";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { useCategories } from "@/hooks/use-store";
import { useDebounced } from "@/hooks/use-debounced";
import { fetchProducts, priceOf } from "@/data/api";
import { formatBDT } from "@/lib/format";

export function SiteHeader() {
  const { count } = useCart();
  const { lang, setLang, t } = useLanguage();
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

  // Lock background scroll and handle Escape key for mobile menu
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

  // Close suggestion dropdown on outside click
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
    "text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground";
  const mobileLinkClass =
    "flex min-h-[48px] items-center border-b border-border/60 text-sm font-medium text-foreground transition-colors hover:text-primary";
  const close = () => setMenuOpen(false);

  const marqueeText = t("topBanner");

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-border bg-background/95 backdrop-blur-md">
      {/* Top Moving Marquee Announcement Bar */}
      <div className="relative z-[101] overflow-hidden bg-[#0B2E13] py-1.5 text-white shadow-xs">
        <div className="flex w-full overflow-hidden">
          <div className="animate-marquee flex whitespace-nowrap text-xs font-medium tracking-wide">
            <span className="mx-4 flex items-center gap-3">{marqueeText}</span>
            <span className="mx-4 flex items-center gap-3">{marqueeText}</span>
            <span className="mx-4 flex items-center gap-3">{marqueeText}</span>
            <span className="mx-4 flex items-center gap-3">{marqueeText}</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-4 md:h-[72px] md:px-8">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="-ml-1 flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted md:hidden"
          >
            <Menu className="h-6 w-6 text-[#0B2E13]" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <BrandMark />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-5 md:flex lg:gap-7">
          <Link
            to="/shop"
            className={desktopLinkClass}
            activeProps={{ className: "text-primary font-bold" }}
          >
            {t("shop")}
          </Link>
          {categories.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className={desktopLinkClass}
              activeProps={{ className: "text-primary font-bold" }}
            >
              {c.name}
            </Link>
          ))}
          <Link
            to="/about"
            className={desktopLinkClass}
            activeProps={{ className: "text-primary font-bold" }}
          >
            {t("about")}
          </Link>
        </nav>

        {/* Right Section: Search, Language Switcher, Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop Live Search */}
          <div ref={searchRef} className="relative hidden md:block">
            <form onSubmit={submitSearch} className="relative flex items-center">
              <input
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
                placeholder={t("searchPlaceholder")}
                className="h-9 w-48 rounded-full border border-border/80 bg-secondary/80 pl-3.5 pr-8 text-xs outline-none transition-all placeholder:text-muted-foreground focus:w-64 focus:border-primary focus:bg-background"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    setSuggestOpen(false);
                  }}
                  className="absolute right-2.5 flex h-6 w-6 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-2.5 flex h-6 w-6 items-center justify-center text-muted-foreground"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            {/* Suggestions Box */}
            {suggestOpen && debouncedQuery.length > 0 && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-[120] w-80 rounded-xl border border-border bg-card p-2 shadow-xl">
                {isFetching && suggestions.length === 0 && (
                  <p className="px-3 py-3 text-xs text-muted-foreground">খুঁজা হচ্ছে...</p>
                )}
                {!isFetching && suggestions.length === 0 && (
                  <p className="px-3 py-3 text-xs text-muted-foreground">
                    কোনো পণ্য পাওয়া যায়নি: “{debouncedQuery}”
                  </p>
                )}
                {suggestions.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    to="/product/$slug"
                    params={{ slug: p.slug }}
                    onClick={() => setSuggestOpen(false)}
                    className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/70"
                  >
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      {p.images[0] && (
                        <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-foreground">
                        {p.name}
                      </span>
                      <span className="block text-[11px] font-bold text-primary">
                        {formatBDT(priceOf(p))}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Language Switcher Toggle */}
          <button
            type="button"
            onClick={() => setLang(lang === "bn" ? "en" : "bn")}
            title="Switch Language"
            className="flex h-9 items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{lang === "bn" ? "BN" : "EN"}</span>
          </button>

          {/* Mobile Search Icon */}
          <Link
            to="/search"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted md:hidden"
          >
            <Search className="h-5 w-5 text-foreground" />
          </Link>

          {/* Wishlist Icon */}
          <Link
            to="/shop"
            aria-label="Wishlist"
            className="hidden h-9 w-9 items-center justify-center rounded-full hover:bg-muted sm:flex"
          >
            <Heart className="h-5 w-5 text-foreground" />
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle className="h-9 w-9 text-foreground" />

          {/* Cart Icon */}
          <Link
            to="/cart"
            aria-label={`Cart, ${count} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7CB342] px-1 text-[11px] font-bold text-white shadow-xs">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Navigation Drawer with High Z-Index so it ALWAYS floats above Hero section! */}
      <div
        className={`fixed inset-0 z-[150] transition-all duration-300 md:hidden ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        }`}
      >
        {/* Dark Backdrop Overlay */}
        <button
          type="button"
          tabIndex={menuOpen ? 0 : -1}
          aria-label="Close menu backdrop"
          onClick={close}
          className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Drawer Panel */}
        <div
          className={`absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex h-16 items-center justify-between border-b border-border bg-[#0B2E13] px-4 text-white">
            <BrandMark logoClassName="h-7" textClassName="text-white text-lg font-bold" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-3">
            <Link to="/" onClick={close} className={mobileLinkClass}>
              {t("home")}
            </Link>
            <Link to="/shop" onClick={close} className={mobileLinkClass}>
              {t("shop")}
            </Link>

            <p className="pt-4 pb-1 text-xs font-bold uppercase tracking-wider text-primary">
              {t("categories")}
            </p>
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

            <div className="mt-4 border-t border-border pt-2">
              <Link to="/about" onClick={close} className={mobileLinkClass}>
                {t("about")}
              </Link>
              <Link to="/contact" onClick={close} className={mobileLinkClass}>
                {t("contact")}
              </Link>
              <Link to="/delivery-and-exchange" onClick={close} className={mobileLinkClass}>
                ডেলিভারি তথ্য
              </Link>
            </div>
          </nav>

          {/* Language switch footer in drawer */}
          <div className="border-t border-border p-4 bg-muted/30 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">ভাষা / Language:</span>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
              <button
                type="button"
                onClick={() => setLang("bn")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  lang === "bn" ? "bg-primary text-white" : "text-foreground hover:bg-muted"
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  lang === "en" ? "bg-primary text-white" : "text-foreground hover:bg-muted"
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
