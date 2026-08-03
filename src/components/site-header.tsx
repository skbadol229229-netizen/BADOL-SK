import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X, Heart, Globe, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart";
import { useLanguage } from "@/context/language";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { useCategories } from "@/hooks/use-store";
import { SearchModal } from "@/components/search-modal";

export function SiteHeader() {
  const { count } = useCart();
  const { lang, setLang, t } = useLanguage();
  const categories = useCategories();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

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
            {/* Desktop Search Trigger Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="hidden md:flex h-9 items-center gap-2 rounded-full border border-border/80 bg-secondary/80 px-3.5 text-xs text-muted-foreground hover:border-primary hover:bg-background hover:text-foreground transition-all"
            >
              <Search className="h-3.5 w-3.5 text-primary" />
              <span>{t("searchPlaceholder")}</span>
            </button>

            {/* Mobile Search Icon */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              aria-label="Search"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted md:hidden"
            >
              <Search className="h-5 w-5 text-foreground" />
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang(lang === "bn" ? "en" : "bn")}
              title="Switch Language"
              className="flex h-9 items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 text-xs font-bold text-primary transition-all hover:bg-primary/20"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{lang === "bn" ? "বাংলা" : "ENGLISH"}</span>
            </button>

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

      {/* SEARCH POPUP MODAL */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

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
                  {lang === "bn" ? "ডেলিভারি তথ্য" : "Delivery Information"}
                </Link>
              </div>
            </nav>

            {/* Footer with Clean Language Switcher */}
            <div className="border-t border-border p-4 bg-muted/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  {lang === "bn" ? "ভাষা পরিবর্তন:" : "Language:"}
                </span>
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
