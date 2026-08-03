import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import {
  BadgePercent,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  X,
} from "lucide-react";
import { checkAdmin, fetchAdminStats, getAdminEmail, signOutAdmin } from "@/lib/admin";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSettings } from "@/hooks/use-store";

const nav = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/categories", label: "Categories", Icon: Tags },
  { to: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { to: "/admin/offers", label: "Flash Sale & Offers", Icon: BadgePercent },
  { to: "/admin/banners", label: "Banners", Icon: ImageIcon },
  { to: "/admin/reviews", label: "Reviews", Icon: MessageSquare },
  { to: "/admin/settings", label: "Settings", Icon: Settings },
] as const;

type RailMode = "auto" | "collapsed" | "expanded";

function railWidth(mode: RailMode) {
  if (mode === "collapsed") return "md:w-16";
  if (mode === "expanded") return "md:w-60";
  return "md:w-16 lg:w-60";
}

function railOffset(mode: RailMode) {
  if (mode === "collapsed") return "md:pl-16";
  if (mode === "expanded") return "md:pl-60";
  return "md:pl-16 lg:pl-60";
}

function labelVisibility(mode: RailMode) {
  if (mode === "collapsed") return "hidden";
  if (mode === "expanded") return "inline";
  return "hidden lg:inline";
}

export function AdminShell({
  title,
  description,
  actions,
  toolbar,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rail, setRail] = useState<RailMode>("auto");
  const [email, setEmail] = useState<string>("");
  const settings = useSettings();
  const storeName = settings.storeName;
  const brandBadge = settings.logoUrl ? (
    <img
      src={settings.logoUrl}
      alt={storeName}
      className="h-8 w-8 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-[13px] font-semibold text-background">
      {storeName.charAt(0).toUpperCase()}
    </span>
  );

  const { data: isAdmin, isPending } = useQuery({
    queryKey: ["admin-session"],
    queryFn: checkAdmin,
    retry: false,
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    enabled: isAdmin === true,
  });

  useEffect(() => {
    if (!isPending && isAdmin === false) {
      navigate({ to: "/admin/login", replace: true });
    }
  }, [isPending, isAdmin, navigate]);

  useEffect(() => {
    getAdminEmail().then((e) => setEmail(e));
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOutAdmin();
    navigate({ to: "/admin/login", replace: true });
  }

  if (isPending || !isAdmin) {
    return (
      <div className="admin-theme grid min-h-screen place-items-center">
        <p className="text-sm text-muted-foreground">
          {isPending ? "Checking your session…" : "Redirecting to sign in…"}
        </p>
      </div>
    );
  }

  const pending = (stats?.pendingOrders ?? 0) + (stats?.pendingReviews ?? 0);
  const labels = labelVisibility(rail);

  const navList = (mode: RailMode, onNavigate?: () => void) => (
    <nav className="flex-1 space-y-1 overflow-y-auto p-2">
      {nav.map(({ to, label, Icon }) => {
        const active = to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            title={label}
            className={`flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className={labelVisibility(mode)}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const footerLinks = (mode: RailMode) => (
    <div className="space-y-1 border-t border-border p-2">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        title="View store"
        className="flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <ExternalLink className="h-4 w-4 shrink-0" />
        <span className={labelVisibility(mode)}>View store</span>
      </a>
      <button
        type="button"
        onClick={signOut}
        title="Sign out"
        className="flex min-h-[44px] w-full items-center gap-3 rounded-md px-3 text-left text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span className={labelVisibility(mode)}>Sign out</span>
      </button>
    </div>
  );

  return (
    <div className="admin-theme min-h-screen">
      {/* Desktop / tablet rail */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-card md:flex ${railWidth(
          rail,
        )}`}
      >
        <div className="flex h-14 items-center gap-2 border-b border-border px-3">
          {brandBadge}
          <span className={`min-w-0 truncate text-sm font-semibold ${labels}`}>
            {storeName} Admin
          </span>
        </div>
        {navList(rail)}
        {footerLinks(rail)}
        <div className="border-t border-border p-2">
          <button
            type="button"
            onClick={() => setRail(rail === "expanded" ? "collapsed" : "expanded")}
            className="flex min-h-[40px] w-full items-center gap-3 rounded-md px-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Toggle sidebar"
          >
            {rail === "expanded" ? (
              <ChevronsLeft className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronsRight className="h-4 w-4 shrink-0" />
            )}
            <span className={labels}>Collapse</span>
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-foreground/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col border-r border-border bg-card">
            <div className="flex h-14 items-center justify-between border-b border-border px-3">
              <div className="flex items-center gap-2">
                {brandBadge}
                <span className="text-sm font-semibold">{storeName} Admin</span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="a-btn a-btn-ghost a-btn-icon"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {navList("expanded", () => setDrawerOpen(false))}
            {footerLinks("expanded")}
          </div>
        </div>
      )}

      <div className={railOffset(rail)}>
        <header className="sticky top-0 z-30 border-b border-border bg-card">
          <div className="flex min-h-14 items-center gap-3 px-3 py-2 md:px-6">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="a-btn a-btn-ghost a-btn-icon md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold md:text-lg">{title}</h1>
              {description && (
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              )}
            </div>

            <ThemeToggle className="a-btn a-btn-ghost a-btn-icon" />

            <Link
              to="/admin/orders"
              className="a-btn a-btn-ghost a-btn-icon relative"
              aria-label={`${pending} items need attention`}
              title={`${pending} items need attention`}
            >
              <Bell className="h-4 w-4" />
              {pending > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {pending > 99 ? "99+" : pending}
                </span>
              )}
            </Link>

            <div className="hidden items-center gap-2 border-l border-border pl-3 sm:flex">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold uppercase">
                {(email || "A").slice(0, 1)}
              </span>
              <span className="max-w-[10rem] truncate text-xs text-muted-foreground">
                {email || "Admin"}
              </span>
            </div>

            {actions && <div className="shrink-0">{actions}</div>}
          </div>
          {toolbar && <div className="border-t border-border px-3 py-2 md:px-6">{toolbar}</div>}
        </header>

        <main className="px-3 py-5 md:px-6 md:py-7">{children}</main>
      </div>
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`a-card a-card-pad ${className}`}>{children}</div>;
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="a-label">{label}</span>
      {children}
      {hint && <span className="a-hint">{hint}</span>}
    </label>
  );
}

export function StatusPill({ children }: { children: ReactNode }) {
  return <span className="a-badge a-badge-neutral">{children}</span>;
}

export const DiscountIcon = BadgePercent;
