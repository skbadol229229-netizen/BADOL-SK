import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ShieldCheck, Leaf, Truck, Sparkles, ChevronRight, Award } from "lucide-react";
import { Container, ErrorState } from "@/components/ui-states";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { AppImage } from "@/components/app-image";
import { fetchBanners, fetchHomeSections } from "@/data/api";
import { useCategories } from "@/hooks/use-store";
import { useLanguage } from "@/context/language";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FlashSaleSection } from "@/components/flash-sale-section";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PureBengal — Authentic Organic Food Store in Bangladesh" },
      {
        name: "description",
        content:
          "Order 100% certified organic vegetables, farm fruits, pure raw Sundarban honey, wood-pressed mustard oil, pure cow ghee, and natural pantry essentials delivered fresh across Bangladesh.",
      },
    ],
  }),
  component: HomePage,
});

const heroSlides = [
  {
    id: "slide-1",
    badgeBn: "🌿 Farm Fresh • ১০০% সার্টিফাইড অর্গানিক",
    badgeEn: "🌿 Farm Fresh • 100% Certified Organic",
    titleBn: "বিশুদ্ধ। সতেজ। সবসময় অর্গানিক।",
    titleEn: "Pure. Fresh. Always Organic.",
    subtitleBn: "কৃষকের মাঠ থেকে সরাসরি রাসায়নিক মুক্ত অর্গানিক পণ্য পৌঁছাচ্ছি আপনার ঘরে।",
    subtitleEn: "Bringing you the finest organic goodness, straight from nature to your doorstep.",
    ctaBn: "এখনই কিনুন",
    ctaEn: "Shop Now",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "slide-2",
    badgeBn: "🐝 সুন্দরবনের খাঁটি বুনো মধু",
    badgeEn: "🐝 Sundarban Raw Wild Honey",
    titleBn: "১০০% খাঁটি ও অপাস্তুরিত প্রাকৃতিক মধু",
    titleEn: "100% Unpasteurized Raw Natural Honey",
    subtitleBn: "কোনো ভেজাল বা প্রিজারভেটিভ ছাড়া সরাসরি সুন্দরবনের মৌয়ালদের সংগৃহীত মধু।",
    subtitleEn: "Harvested sustainably from mangrove forests without preservatives or added sugar.",
    ctaBn: "মধু কিনুন",
    ctaEn: "Shop Honey",
    image:
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "slide-3",
    badgeBn: "🛢️ কাঠের ঘানির খাঁটি সরিষার তেল & ঘি",
    badgeEn: "🛢️ Wood-Pressed Mustard Oil & Ghee",
    titleBn: "ঐতিহ্যবাহী কাঠের ঘানিতে ভাঙা খাঁটি তেল",
    titleEn: "Traditional Cold-Pressed Oils & Pure Ghee",
    subtitleBn: "পাবনার গাভীর ঘি এবং কোল্ড-প্রেসড সরিষার তেলের অতুলনীয় স্বাদ ও ঘ্রাণ।",
    subtitleEn: "Experience the authentic taste of pure unadulterated cold-pressed oils.",
    ctaBn: "তেল ও ঘি দেখুন",
    ctaEn: "Explore Oils",
    image:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80",
  },
];

function HomePage() {
  const categories = useCategories();
  const { lang, t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannersQuery = useQuery({
    queryKey: ["banners"],
    queryFn: fetchBanners,
  });

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["home-sections"],
    queryFn: fetchHomeSections,
  });

  const banners = bannersQuery.data && bannersQuery.data.length > 0 ? bannersQuery.data : [];

  // Hero auto slide timer
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const trustBadges = [
    {
      Icon: Leaf,
      titleKey: "trust1Title",
      descKey: "trust1Desc",
    },
    {
      Icon: ShieldCheck,
      titleKey: "trust2Title",
      descKey: "trust2Desc",
    },
    {
      Icon: Truck,
      titleKey: "trust3Title",
      descKey: "trust3Desc",
    },
    {
      Icon: Award,
      titleKey: "trust4Title",
      descKey: "trust4Desc",
    },
  ];

  return (
    <div className="pb-8">
      {/* HERO SECTION SLIDER */}
      <section className="relative px-3 pt-3 sm:px-6 sm:pt-4 max-w-7xl mx-auto">
        <div className="relative h-[280px] sm:h-[380px] md:h-[460px] lg:h-[500px] w-full overflow-hidden rounded-[24px] shadow-xl bg-[#0B2E13]">
          {banners.map((slide, index) => (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <AppImage
                src={slide.image}
                alt={slide.title || "Hero Banner"}
                width={1400}
                height={700}
                eager={index === 0}
                className="h-full w-full object-cover object-center"
              />
              {/* Dark Gradient Overlay for optimal readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

              {/* Banner Text Content */}
              <div className="absolute inset-0 flex items-center p-5 sm:p-8 md:p-12">
                <div className="max-w-xl text-white">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7CB342]/90 px-3 py-1 text-[11px] sm:text-xs font-bold text-white backdrop-blur-md shadow-xs">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>🌿 Farm Fresh • 100% Certified Organic</span>
                  </span>

                  <h1 className="mt-2.5 sm:mt-3 text-2xl font-extrabold sm:text-3xl md:text-4xl leading-tight drop-shadow-md">
                    {slide.title}
                  </h1>

                  {slide.subtitle && (
                    <p className="mt-2 text-xs sm:text-sm text-white/90 line-clamp-2 leading-relaxed max-w-md">
                      {slide.subtitle}
                    </p>
                  )}

                  <div className="mt-4 sm:mt-6">
                    <Link
                      to={(slide.ctaHref as string) || "/shop"}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#7CB342] hover:bg-[#689f38] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-transform active:scale-95"
                    >
                      <span>{slide.ctaLabel || (lang === "bn" ? "এখনই কিনুন" : "Shop Now")}</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Carousel Dots Indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center items-center gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide ? "w-6 bg-white" : "w-2 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CATEGORY HORIZONTAL SCROLL SECTION */}
      <section className="mt-6 mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base font-extrabold text-foreground sm:text-lg">
            {t("shopByCategory")}
          </h2>
          <Link
            to="/shop"
            className="flex items-center gap-0.5 text-xs font-bold text-[#7CB342] hover:underline"
          >
            <span>{t("viewAll")}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Circular Category Icons Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col items-center shrink-0 w-20 sm:w-24 text-center"
            >
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-border/80 bg-card p-1 shadow-xs transition-all duration-300 group-hover:border-[#7CB342] group-hover:scale-105 group-hover:shadow-md overflow-hidden flex items-center justify-center">
                <AppImage
                  src={
                    c.image ||
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80"
                  }
                  alt={c.name}
                  width={200}
                  height={200}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <span className="mt-2 text-[11px] font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FLASH SALE / LIMITED TIME OFFER COUNTDOWN SECTION */}
      <Container>
        <FlashSaleSection />
      </Container>

      {/* BEST SELLERS PRODUCT SECTION */}
      <Container className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7CB342]">
              {t("organicChoice")}
            </span>
            <h2 className="text-lg font-extrabold text-foreground sm:text-2xl">
              {t("bestSellers")} 🌿
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-colors"
          >
            <span>{t("viewAll")}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isPending && <ProductGridSkeleton count={12} />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && <ProductGrid products={data.home12 || data.bestSellers} />}
      </Container>

      {/* TRUST SECTION BADGES */}
      <section className="mt-10 border-y border-border/70 bg-card py-6 sm:py-8 shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {trustBadges.map(({ Icon, titleKey, descKey }) => (
              <div
                key={titleKey}
                className="flex items-center gap-3 rounded-2xl bg-primary/5 dark:bg-primary/10 p-3.5 border border-primary/10 transition-transform hover:scale-[1.02]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground sm:text-sm">{t(titleKey)}</h3>
                  <p className="text-[10px] text-muted-foreground leading-tight sm:text-xs">
                    {t(descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUTO-FLOW TESTIMONIALS REVIEWS */}
      <div className="mt-8">
        <TestimonialsSection />
      </div>
    </div>
  );
}
