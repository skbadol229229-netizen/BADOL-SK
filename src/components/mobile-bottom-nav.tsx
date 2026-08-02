import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, Search, PackageCheck, User } from "lucide-react";
import { useLanguage } from "@/context/language";

export function MobileBottomNav() {
  const { t } = useLanguage();

  const items = [
    { to: "/" as const, labelKey: "home", defaultLabel: "Home", Icon: Home },
    { to: "/shop" as const, labelKey: "shop", defaultLabel: "Shop", Icon: LayoutGrid },
    { to: "/search" as const, labelKey: "search", defaultLabel: "Search", Icon: Search },
    { to: "/cart" as const, labelKey: "orders", defaultLabel: "Orders", Icon: PackageCheck },
    { to: "/admin/login" as const, labelKey: "account", defaultLabel: "Account", Icon: User },
  ];

  return (
    <nav
      aria-label="Primary Mobile Navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 backdrop-blur-md md:hidden shadow-lg"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {items.map(({ to, labelKey, Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex h-14 flex-col items-center justify-center gap-0.5 text-muted-foreground transition-colors hover:text-primary"
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "text-[#0B2E13] font-bold" }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium tracking-tight">{t(labelKey)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
