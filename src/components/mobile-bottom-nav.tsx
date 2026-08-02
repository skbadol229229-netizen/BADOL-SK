import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/cart";

const items = [
  { to: "/" as const, label: "Home", Icon: Home },
  { to: "/shop" as const, label: "Shop", Icon: LayoutGrid },
  { to: "/search" as const, label: "Search", Icon: Search },
];

export function MobileBottomNav() {
  const { count } = useCart();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex h-14 flex-col items-center justify-center gap-1 text-muted-foreground"
              activeOptions={{ exact: to === "/" }}
              activeProps={{ className: "text-foreground" }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] tracking-wide">{label}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            to="/cart"
            className="relative flex h-14 flex-col items-center justify-center gap-1 text-muted-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-[22%] top-2 grid h-4 min-w-4 place-items-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                {count}
              </span>
            )}
            <span className="text-[10px] tracking-wide">Cart</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
