import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand-mark";
import { useCategories, useSettings } from "@/hooks/use-store";
import { useLanguage } from "@/context/language";

export function SiteFooter() {
  const storeSettings = useSettings();
  const categories = useCategories();
  const { lang } = useLanguage();
  const linkClass =
    "inline-flex min-h-[32px] items-center text-xs font-medium text-muted-foreground transition-colors hover:text-primary";

  return (
    <footer className="mt-12 border-t border-border bg-[#0B2E13]/5 md:mt-20">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        {/* Brand row */}
        <div className="flex flex-col gap-4 border-b border-border/80 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-sm">
            <BrandMark />
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {lang === "bn"
                ? "সারাদেশে ১০০% অর্গানিক, রাসায়নিক কীটনাশকমুক্ত খাঁটি খাদ্যদ্রব্য, সুন্দরবনের মধু, ঘি ও সরাসরি খামারের সতেজ শাক-সবজি পৌঁছে দিচ্ছে PureBengal।"
                : "Delivering 100% certified pesticide-free organic produce, raw Sundarban honey, pure cow ghee, and cold-pressed oils across Bangladesh."}
            </p>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <p className="font-bold text-[#0B2E13]">
              {lang === "bn" ? "🚚 এক্সপ্রেস ডেলিভারি চার্ট" : "🚚 Express Delivery Rate"}
            </p>
            <p className="text-muted-foreground">
              {lang === "bn"
                ? "ঢাকার ভিতরে ৳৬০ (সেম ডে ডেলিভারি) | ঢাকার বাইরে ৳১২০ (ক্যাশ অন ডেলিভারি)"
                : "Inside Dhaka ৳60 (Same day) | Outside Dhaka ৳120 (Cash on delivery)"}
            </p>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 pt-8 md:grid-cols-4 md:gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0B2E13]">
              {lang === "bn" ? "শপ ক্যাটাগরি" : "Shop Categories"}
            </p>
            <ul className="mt-3 space-y-0.5">
              <li>
                <Link to="/shop" className={linkClass}>
                  {lang === "bn" ? "সকল পণ্যসমূহ" : "All Products"}
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to="/category/$slug" params={{ slug: c.slug }} className={linkClass}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#0B2E13]">
              {lang === "bn" ? "তথ্য ও সহায়িকা" : "Information"}
            </p>
            <ul className="mt-3 space-y-0.5">
              <li>
                <Link to="/about" className={linkClass}>
                  {lang === "bn" ? "আমাদের সম্পর্কে" : "About Us"}
                </Link>
              </li>
              <li>
                <Link to="/contact" className={linkClass}>
                  {lang === "bn" ? "যোগাযোগ" : "Contact Us"}
                </Link>
              </li>
              <li>
                <Link to="/delivery-and-exchange" className={linkClass}>
                  {lang === "bn" ? "ডেলিভারি নীতি" : "Delivery Policy"}
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0B2E13]">
              {lang === "bn" ? "হটলাইন & যোগাযোগ" : "Contact & Support"}
            </p>
            <ul className="mt-3 space-y-1 text-xs">
              <li className="font-bold text-primary">📞 {storeSettings.supportPhone}</li>
              <li className="text-muted-foreground break-all">✉️ {storeSettings.supportEmail}</li>
              <li className="text-muted-foreground pt-1">
                {lang === "bn" ? "সকাল ৯টা - রাত ১০টা (প্রতিদিন)" : "Sat - Thu: 9am - 10pm"}
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0B2E13]">
              {lang === "bn" ? "আমাদের ঠিকানা" : "Main Office"}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {storeSettings.address}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/80 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {storeSettings.storeName}.{" "}
            {lang === "bn" ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
          </p>
          <p>Made with ❤️ in Bangladesh.</p>
        </div>
      </div>
    </footer>
  );
}
