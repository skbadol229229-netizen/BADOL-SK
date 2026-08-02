import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X, Heart, Globe, PhoneCall, Sparkles } from "lucide-react";
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

  // Lock body scroll during menu open
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
    "text-xs font-semibold uppercase tracking-wider text-[#0B2E13]/80 dark:text-emerald-100/80 transition-colors hover:text-[#7CB342]";
  const mobileLinkClass =
    "flex min-h-[48px] items-center border-b border-border/50 text-sm font-semibold text-foreground transition-colors hover:text-primary";
  const close = () => setMenuOpen(false);

  const marqueeText = t("topBanner");

  return (
    <>
      <header className="sticky top-0 z-[100] w-full border-b border-border bg-background/95 backdrop-blur-md shadow-xs">
        {/* Top Moving Marquee Announcement Bar */}
        <div className="relative z-[101] overflow-hidden bg-[#0B2E13] py-1.5 text-white shadow-xs">
          <div className="flex w-full overflow-hidden">
            <div className="animate-marquee flex whitespace-nowrap text-xs font-medium tracking-wide">
              <span className="mx-6 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                {marqueeText}
              </span>
              <span className="mx-6 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                {marqueeText}
              </span>
              <span className="mx-6 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                {marqueeText}
              </span>
              <span className="mx-6 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                {marqueeText}
              </span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-4 md:h-[72px] md:px-8">
          <div className="flex items-center gap-2">
            {/* Mobile Menu Trigger Button */}
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
              className="-ml-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <BrandMark />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-5 md:flex lg:gap-7">
            <Link
              to="/shop"
              className={desktopLinkClass}
              activeProps={{ className: "text-[#7CB342] font-extrabold" }}
            >
              {t("shop")}
            </Link>
            {categories.slice(0, 5).map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className={desktopLinkClass}
                activeProps={{ className: "text-[#7CB342] font-extrabold" }}
              >
                {c.name}
              </Link>
            ))}
            <Link
              to="/about"
              className={desktopLinkClass}
              activeProps={{ className: "text-[#7CB342] font-extrabold" }}
            >
              {t("about")}
            </Link>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Hotline Pill on Desktop */}
            <a
              href="tel:+8801700000000"
              className="hidden lg:flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>০১৭০০-০০০০০</span>
            </a>

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
                  className="h-9 w-44 rounded-full border border-border/80 bg-secondary/80 pl-3.5 pr-8 text-xs outline-none transition-all placeholder:text-muted-foreground focus:w-60 focus:border-primary focus:bg-background"
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
                <div className="absolute right-0 top-[calc(100%+8px)] z-[120] w-80 rounded-2xl border border-border bg-card p-2 shadow-2xl">
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
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/70"
                    >
                      <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {p.images[0] && (
                          <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-foreground">
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

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang(lang === "bn" ? "en" : "bn")}
              title="Switch Language"
              className="flex h-9 items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 text-xs font-bold text-primary transition-all hover:bg-primary/20"
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

            {/* Cart Button */}
            <Link
              to="/cart"
              aria-label={`Cart, ${count} items`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7CB342] px-1 text-[11px] font-extrabold text-white shadow-xs">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* RENDERED OUTSIDE HEADER SO STACKING CONTEXT / BACKDROP-FILTER NEVER CRASHES THE DRAWER */}
      {menuOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Backdrop */}
          <div
            onClick={close}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Slide-out Drawer */}
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-card shadow-2xl">
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-border bg-[#0B2E13] px-4 text-white">
              <BrandMark logoClassName="h-7" textClassName="text-white text-lg font-bold" />
              <button
                type="button"
                aria-label="Close menu"
                onClick={close}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links */}
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

              <div className="mt-4 border-t border-border/60 pt-2">
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

            {/* Footer with Hotline & Language */}
            <div className="border-t border-border p-4 bg-muted/40 space-y-3">
              <a
                href="tel:+8801700000000"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary/10 py-2.5 text-xs font-bold text-primary border border-primary/20"
              >
                <PhoneCall className="h-4 w-4" />
                <span>হটলাইন: ০১৭০০-০০০০০</span>
              </a>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">ভাষা:</span>
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
        </div>
      )}
    </>
  );
}
