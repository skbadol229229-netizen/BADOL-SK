import { Star, ShieldCheck, Quote } from "lucide-react";
import { useLanguage } from "@/context/language";

interface Review {
  id: string;
  name: string;
  location: string;
  product: string;
  rating: number;
  date: string;
  commentBn: string;
  commentEn: string;
  avatar: string;
}

const reviews: Review[] = [
  {
    id: "r1",
    name: "রেজোয়ান খান",
    location: "ধানমন্ডি, ঢাকা",
    product: "সুন্দরবনের খাঁটি বুনো মধু (500g)",
    rating: 5,
    date: "২ দিন আগে",
    commentBn:
      "সুন্দরবনের আসল খাঁটি মধু পেলাম। ল্যাবে টেস্ট করেও কোনো ভেজাল পাওয়া যায়নি। প্যাকেজিং এবং স্মেল অসাধারণ!",
    commentEn:
      "Received genuine Sundarban wild honey. Tested in lab, 100% pure! Packaging and aroma are brilliant.",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "r2",
    name: "তাসনিম জাহান",
    location: "নাসিরাবাদ, চট্টগ্রাম",
    product: "পাবনার গাভীর খাঁটি ঘি & সরিষার তেল",
    rating: 5,
    date: "১ সপ্তাহ আগে",
    commentBn:
      "পাবনার খাঁটি গাভীর ঘি এবং কাঠের ঘানির দেশি সরিষার তেলের অরিজিনাল স্বাদ পেলাম। রান্নায় দারুণ ঘ্রাণ আসে।",
    commentEn:
      "Pure Pabna cow ghee and cold-pressed mustard oil! The aroma during cooking is genuinely traditional.",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "r3",
    name: "ড. আব্দুল করিম",
    location: "উত্তরা, ঢাকা",
    product: "অর্গানিক শাক-সবজি প্যাকেজ",
    rating: 5,
    date: "৩ দিন আগে",
    commentBn:
      "সবজিগুলো একদম সতেজ, মেছ অথবা কোনো রাসায়নিক কীটনাশকের গন্ধ নেই। সেম-ডে ডেলিভারির জন্য ধন্যবাদ।",
    commentEn:
      "Crisp and fresh organic vegetables with zero pesticides smell. Appreciate the same-day delivery!",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "r4",
    name: "ফারহানা আকতার",
    location: "জিন্দাবাজার, সিলেট",
    product: "কালোজিরা বীজ & চিয়া সিড",
    rating: 5,
    date: "৫ দিন আগে",
    commentBn:
      "কালোজিরা এবং চিয়া সিড একদম ধুলোবালি মুক্ত ও পরিষ্কার। সুন্দর প্যাকেজিং ও ক্যাশ অন ডেলিভারি সার্ভিস নিখুঁত।",
    commentEn:
      "Black seed and chia seeds were completely sifted and clean. Great COD service in Sylhet.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "r5",
    name: "আসিফ মাহমুদ",
    location: "সোনাডাঙ্গা, খুলনা",
    product: "গাঙ্গেয় অর্গানিক দেশি চাল & মসুর ডাল",
    rating: 5,
    date: "৪ দিন আগে",
    commentBn:
      "ন্যাচারাল অর্গানিক চাল আর লাল মসুর ডাল রান্নার পর পরিবারের সবাই প্রশংসা করেছে। আবার অর্ডার করবো!",
    commentEn:
      "Top tier natural organic rice and lentils. My family loved the taste. Highly recommended PureBengal!",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
];

export function TestimonialsSection() {
  const { lang, t } = useLanguage();

  return (
    <section className="overflow-hidden bg-[#0B2E13]/5 py-10 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <Quote className="h-3.5 w-3.5" />
            {t("customerReviews")}
          </span>
          <h2 className="mt-2 text-xl font-extrabold text-[#0B2E13] sm:text-2xl md:text-3xl">
            {lang === "bn" ? "আমাদের সন্তুষ্ট গ্রাহকদের মতামত" : "Real Reviews From Our Customers"}
          </h2>
          <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">
            {lang === "bn"
              ? "সারাদেশে খাঁটি ও অর্গানিক পণ্যের বিশ্বস্ত প্রতিষ্ঠান PureBengal"
              : "Trusted by thousands of families across Bangladesh for pure organic food"}
          </p>
        </div>

        {/* Auto-Flowing Continuous Marquee Carousel */}
        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee flex gap-4 sm:gap-6 py-2">
            {[...reviews, ...reviews].map((rev, index) => (
              <div
                key={`${rev.id}-${index}`}
                className="w-[280px] shrink-0 sm:w-[320px] rounded-[20px] border border-border/80 bg-card p-4 sm:p-5 shadow-xs transition-transform hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-foreground sm:text-sm">{rev.name}</h4>
                      <span className="text-[11px] text-muted-foreground">{rev.location}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                    ))}
                    <span className="ml-1 text-[11px] text-muted-foreground">{rev.date}</span>
                  </div>
                  <p className="mt-2 text-xs font-medium leading-relaxed text-foreground/90">
                    “{lang === "bn" ? rev.commentBn : rev.commentEn}”
                  </p>
                  <span className="mt-2 block text-[10px] font-semibold text-primary">
                    📦 {rev.product}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
