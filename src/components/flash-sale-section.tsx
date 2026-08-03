import { useEffect, useState } from "react";
import { Clock, Flame, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchHomeSections } from "@/data/api";
import { ProductCard } from "@/components/product-card";
import { useSettings } from "@/hooks/use-store";
import { useLanguage } from "@/context/language";

export function FlashSaleSection() {
  const storeSettings = useSettings();
  const { lang } = useLanguage();

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 7, minutes: 45, seconds: 0 });

  const { data: homeData } = useQuery({
    queryKey: ["home-sections"],
    queryFn: fetchHomeSections,
  });

  const flashProducts = homeData?.newArrivals?.slice(0, 4) || [];

  useEffect(() => {
    if (!storeSettings.flashSaleEndTime) return;

    const calculateTime = () => {
      const target = new Date(storeSettings.flashSaleEndTime!).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [storeSettings.flashSaleEndTime]);

  if (storeSettings.flashSaleEnabled === false) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  const title =
    lang === "bn"
      ? storeSettings.flashSaleTitleBn || "🔥 সীমিত সময়ের ধামাকা অফার - অফার শেষ হতে বাকী!"
      : storeSettings.flashSaleTitleEn || "🔥 Limited Time Flash Deal - Ending Soon!";

  return (
    <section className="my-10 md:my-16 overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#123019] via-[#0B2E13] to-[#051A0A] p-5 sm:p-8 text-white shadow-2xl relative">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
            <Flame className="h-4 w-4 animate-bounce text-amber-400" />
            <span>{lang === "bn" ? "স্পেশাল ফ্ল্যাশ ডিল" : "Special Flash Deal"}</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/80 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>
              {lang === "bn"
                ? "১০০% খাঁটি ও তাজা অর্গানিক সামগ্রী সরাসরি ফার্ম থেকে"
                : "100% Authentic Organic Goods Direct From Farm"}
            </span>
          </p>
        </div>

        {/* Countdown Timer Display */}
        <div className="flex items-center gap-2 sm:gap-3 bg-black/40 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/10 shrink-0">
          <div className="flex items-center gap-1 text-amber-400 mr-2">
            <Clock className="h-5 w-5 animate-spin" style={{ animationDuration: "6s" }} />
          </div>

          <div className="text-center">
            <div className="flex h-11 w-12 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-mono text-lg font-black shadow-md">
              {pad(timeLeft.hours)}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200/80 mt-1 block">
              {lang === "bn" ? "ঘন্টা" : "Hours"}
            </span>
          </div>

          <span className="text-xl font-bold text-amber-400 pb-4">:</span>

          <div className="text-center">
            <div className="flex h-11 w-12 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-mono text-lg font-black shadow-md">
              {pad(timeLeft.minutes)}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200/80 mt-1 block">
              {lang === "bn" ? "মিনিট" : "Mins"}
            </span>
          </div>

          <span className="text-xl font-bold text-amber-400 pb-4">:</span>

          <div className="text-center">
            <div className="flex h-11 w-12 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-mono text-lg font-black shadow-md">
              {pad(timeLeft.seconds)}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200/80 mt-1 block">
              {lang === "bn" ? "সেকেন্ড" : "Secs"}
            </span>
          </div>
        </div>
      </div>

      {/* Product Items */}
      {flashProducts.length > 0 && (
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {flashProducts.map((product) => (
            <div
              key={product.id}
              className="relative group rounded-2xl bg-card p-2 text-foreground shadow-lg transition-transform hover:-translate-y-1"
            >
              <div className="absolute top-3 left-3 z-20 rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Zap className="h-3 w-3 fill-current" />
                <span>HOT</span>
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div className="relative z-10 mt-8 flex justify-center">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-amber-400 hover:scale-105 shadow-lg"
        >
          <span>{lang === "bn" ? "অফারের সব পণ্য দেখুন" : "View All Offer Items"}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
