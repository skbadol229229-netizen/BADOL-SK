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
      { title: "Trikon Clothing — Premium Menswear in Bangladesh" },
      {
        name: "description",
        content:
          "Heavyweight tees, oxford shirts, polos, shorts and boxers for men. Cash on delivery across Bangladesh, delivery in 1–4 days.",
      },
      { property: "og:title", content: "Trikon Clothing — Premium Menswear in Bangladesh" },
      {
        property: "og:description",
        content:
          "Considered menswear made for Bangladesh. Cash on delivery, 7 day exchange, nationwide shipping.",
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
      title: "Fast delivery",
      body: `${storeSettings.deliveryTimeInside} inside Dhaka, ${storeSettings.deliveryTimeOutside} outside.`,
    },
    { Icon: Banknote, title: "Cash on delivery", body: "Pay the courier when your parcel arrives." },
    {
      Icon: RefreshCw,
      title: `${storeSettings.exchangeWindowDays} day exchange`,
      body: "Wrong size? Exchange it, unworn with tags.",
    },
    { Icon: ShieldCheck, title: "Real support", body: `${storeSettings.supportPhone}, 10am-8pm.` },
  ];

  return (
    <div>
      {hero && (
      <section className="relative">
        <AppImage
          src={hero.image}
          mobileSrc={hero.mobileImage || undefined}
          alt={hero.title}
          width={1920}
          height={1200}
          eager
          className="h-[66vh] max-h-[720px] min-h-[430px] w-full object-cover object-[62%_18%] md:h-[74vh] md:object-[center_32%]"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-background via-background/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <Container className="pb-10 md:pb-16">
            <div className="max-w-[16ch] md:max-w-md">
              <p className="label-caps text-foreground/75">{hero.subtitle}</p>
              <h1 className="type-display mt-3">{hero.title}</h1>
              <a href={hero.ctaHref || "/shop"} className="btn btn-solid mt-7">
                {hero.ctaLabel || "Shop the collection"}
              </a>
            </div>
          </Container>
        </div>
      </section>
      )}

      <Container className="section-y">
        <SectionHeading title="Shop by Category" action={{ label: "Shop all", to: "/shop" }} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="group relative block aspect-[4/5] min-w-0 overflow-hidden rounded-[18px] bg-secondary md:aspect-[3/4]"
            >
              {c.image && (
                <AppImage
                  src={c.image}
                  alt={c.name}
                  width={800}
                  height={1000}
                  className="h-full w-full object-cover group-hover:scale-105"
                />
              )}
              <span
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-black/60 via-black/15 to-transparent"
              />
              <span className="absolute inset-x-2 bottom-4 text-center text-[13px] font-semibold tracking-wide text-white uppercase md:bottom-6 md:text-base">
                {c.name}
              </span>
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
              <p className="label-caps text-muted-foreground">The Trikon standard</p>
              <h2 className="type-h2 mt-3">Heavier cotton. Cleaner cuts.</h2>
              <p className="type-body mt-4 text-muted-foreground">
                We work with a small number of mills, buy heavier fabric than the market average,
                and keep the range tight. Fewer products, made properly.
              </p>
              <Link to="/about" className="btn btn-outline mt-7">
                Our story
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
