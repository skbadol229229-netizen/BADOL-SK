import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Banknote, RefreshCw, ShieldCheck, Truck } from "lucide-react";
import { Container, ErrorState, SectionHeading } from "@/components/ui-states";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-card";
import { AppImage } from "@/components/app-image";
import { fetchBanners, fetchHomeSections } from "@/data/api";
import { useCategories, useSettings } from "@/hooks/use-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GreenHarvest — Farm-Fresh Organic Food Store" },
      {
        name: "description",
        content:
          "Order 100% certified organic vegetables, farm fruits, pure raw Sundarban honey, pasture milk, and natural pantry essentials delivered fresh in Dhaka.",
      },
      { property: "og:title", content: "GreenHarvest — Farm-Fresh Organic Food Store" },
      {
        property: "og:description",
        content:
          "Fresh pesticide-free produce direct from local organic farms. Cold-chain delivery, cash on delivery.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const storeSettings = useSettings();
  const categories = useCategories();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["home-sections"],
    queryFn: fetchHomeSections,
  });
  const { data: banners } = useQuery({
    queryKey: ["banners"],
    queryFn: fetchBanners,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
  const hero = banners?.find((b) => b.image || b.mobileImage) ?? null;

  const trust = [
    {
      Icon: Truck,
      title: "Cold-chain fresh delivery",
      body: `${storeSettings.deliveryTimeInside} in eco-insulated bags.`,
    },
    { Icon: Banknote, title: "Cash on delivery", body: "Pay when your fresh produce arrives." },
    {
      Icon: RefreshCw,
      title: "100% Freshness Guarantee",
      body: "Unsatisfied with produce quality? Instant hassle-free replacement.",
    },
    {
      Icon: ShieldCheck,
      title: "Customer Support",
      body: `${storeSettings.supportPhone}, 8am-9pm.`,
    },
  ];

  return (
    <div>
      {hero && (
        <section className="relative overflow-hidden bg-muted">
          <AppImage
            src={hero.image}
            mobileSrc={hero.mobileImage || undefined}
            alt={hero.title}
            width={1920}
            height={1200}
            eager
            className="h-[60vh] max-h-[680px] min-h-[420px] w-full object-cover object-center md:h-[72vh]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-black/30"
          />
          <div className="absolute inset-0 flex items-end">
            <Container className="pb-10 md:pb-16 lg:pb-20">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/90 px-3.5 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-xs">
                  🌱 100% Certified Organic • Chemical-Free Produce
                </span>
                <h1 className="type-display mt-3 text-white drop-shadow-sm sm:mt-4">
                  {hero.title}
                </h1>
                <p className="mt-3 text-sm text-white/90 sm:text-base md:mt-4 md:max-w-xl">
                  {hero.subtitle}
                </p>
                <div className="mt-6 flex flex-wrap gap-4 md:mt-8">
                  <a
                    href={hero.ctaHref || "/shop"}
                    className="btn btn-solid shadow-md hover:scale-[1.02] transition-transform"
                  >
                    {hero.ctaLabel || "Shop Organic Harvest"}
                  </a>
                  <Link
                    to="/about"
                    className="btn btn-outline bg-background/80 backdrop-blur-xs hover:bg-background"
                  >
                    Our Organic Guarantee
                  </Link>
                </div>
              </div>
            </Container>
          </div>
        </section>
      )}

      <Container className="section-y">
        <SectionHeading
          title="Shop by Category"
          action={{ label: "View all categories", to: "/shop" }}
        />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5 md:gap-5">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group relative block aspect-[4/5] min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-secondary shadow-xs transition-all duration-300 hover:border-primary hover:shadow-md"
            >
              {c.image && (
                <AppImage
                  src={c.image}
                  alt={c.name}
                  width={800}
                  height={1000}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                />
              )}
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity group-hover:opacity-90"
              />
              <div className="absolute inset-x-3 bottom-3 flex flex-col items-center text-center text-white sm:bottom-4">
                <span className="text-xs font-bold tracking-wide text-white drop-shadow-xs sm:text-sm lg:text-base">
                  {c.name}
                </span>
                <span className="mt-1 hidden text-[11px] text-white/80 transition-opacity group-hover:block sm:inline-block">
                  Explore Collection →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>

      <Container className="pb-12 md:pb-20">
        <SectionHeading title="New arrivals" action={{ label: "Shop all", to: "/shop" }} />
        {isPending && <ProductGridSkeleton count={4} />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && <ProductGrid products={data.newArrivals.slice(0, 4)} />}
      </Container>

      <section className="border-y border-border bg-secondary">
        <Container className="grid grid-cols-2 gap-x-5 gap-y-8 py-10 md:grid-cols-4 md:gap-8 md:py-14">
          {trust.map(({ Icon, title, body }) => (
            <div key={title} className="min-w-0">
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <p className="mt-3 text-[13px] font-medium md:text-sm">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground md:text-[13px]">
                {body}
              </p>
            </div>
          ))}
        </Container>
      </section>

      <Container className="section-y">
        <SectionHeading title="Best sellers" action={{ label: "Shop all", to: "/shop" }} />
        {isPending && <ProductGridSkeleton count={8} />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && <ProductGrid products={data.bestSellers} />}
      </Container>

      <section className="bg-secondary">
        <div>
          <div className="flex items-center px-4 py-12 md:px-14 md:py-20">
            <div className="max-w-md">
              <p className="label-caps text-muted-foreground">The GreenHarvest Standard</p>
              <h2 className="type-h2 mt-3">Pure Soil. Pure Nutrition.</h2>
              <p className="type-body mt-4 text-muted-foreground">
                We work directly with certified organic farms to bring chemical-free vegetables,
                seasonal fruits, raw Sundarban honey, and unadulterated pasture dairy straight to
                your table.
              </p>
              <Link to="/about" className="btn btn-outline mt-7">
                Our harvest story
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
