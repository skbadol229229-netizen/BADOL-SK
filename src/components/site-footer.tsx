import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand-mark";
import { useCategories, useSettings } from "@/hooks/use-store";

export function SiteFooter() {
  const storeSettings = useSettings();
  const categories = useCategories();
  const linkClass =
    "inline-flex min-h-[36px] items-center text-muted-foreground transition-colors hover:text-foreground";

  return (
    <footer className="mt-16 border-t border-border bg-secondary md:mt-24">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        {/* Brand row */}
        <div className="flex flex-col gap-4 border-b border-border pb-10 md:flex-row md:items-end md:justify-between md:pb-12">
          <div className="max-w-sm">
            <BrandMark />
            <p className="type-small mt-3 text-muted-foreground">
              Considered menswear made for Bangladesh — heavier cottons, cleaner cuts, honest
              pricing.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="label-caps text-muted-foreground">Cash on delivery</p>
            <p className="type-small text-foreground">
              Inside Dhaka ৳70 · 1–2 days
              <span className="mx-2 text-border">|</span>
              Outside Dhaka ৳120 · 2–4 days
            </p>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 pt-10 md:grid-cols-4 md:gap-8 md:pt-12">
          <div>
            <p className="label-caps text-foreground">Shop</p>
            <ul className="mt-4 space-y-0.5 text-sm">
              <li>
                <Link to="/shop" className={linkClass}>
                  All products
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
            <p className="label-caps text-foreground">Information</p>
            <ul className="mt-4 space-y-0.5 text-sm">
              <li>
                <Link to="/about" className={linkClass}>
                  About us
                </Link>
              </li>
              <li>
                <Link to="/contact" className={linkClass}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/delivery-and-exchange" className={linkClass}>
                  Delivery &amp; exchange
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className={linkClass}>
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className={linkClass}>
                  Terms &amp; conditions
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <p className="label-caps text-foreground">Get in touch</p>
            <ul className="mt-4 space-y-0.5 text-sm">
              <li>
                <a href={`tel:${storeSettings.supportPhone}`} className={linkClass}>
                  {storeSettings.supportPhone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${storeSettings.supportEmail}`}
                  className={`${linkClass} break-all`}
                >
                  {storeSettings.supportEmail}
                </a>
              </li>
              <li className="pt-1 text-muted-foreground">Saturday–Thursday, 10am–8pm</li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <p className="label-caps text-foreground">Visit</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {storeSettings.address}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {storeSettings.storeName}. All rights reserved.
          </p>
          <p>Made in Bangladesh.</p>
        </div>
      </div>
    </footer>
  );
}
