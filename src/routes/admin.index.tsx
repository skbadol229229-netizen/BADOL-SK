import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BadgeCheck,
  Boxes,
  Clock,
  Image as ImageIcon,
  MessageSquare,
  Package,
  Plus,
  ShoppingCart,
  Tags,
  TrendingUp,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminEmpty,
  AdminError,
  CardsSkeleton,
  OrderStatusBadge,
  SectionCard,
  StatCard,
  TableSkeleton,
} from "@/components/admin/ui";
import { ORDER_STATUSES } from "@/data/types";
import {
  fetchAdminStats,
  fetchBestSellers,
  fetchLowStock,
  fetchRecentOrders,
  fetchSalesSeries,
} from "@/lib/admin";
import { formatBDT } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Trikon Admin" },
      { name: "description", content: "Orders, revenue and stock overview for Trikon Clothing." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Dashboard — Trikon Admin" },
      { property: "og:description", content: "Store performance at a glance." },
    ],
  }),
  component: AdminDashboardPage,
});

const STATUS_COLOR: Record<string, string> = {
  Pending: "var(--admin-warning)",
  Confirmed: "var(--admin-info)",
  Processing: "var(--admin-purple)",
  Shipped: "var(--admin-indigo)",
  Delivered: "var(--color-success)",
  Cancelled: "var(--color-destructive)",
  Returned: "var(--admin-grey)",
};

function AdminDashboardPage() {
  const stats = useQuery({ queryKey: ["admin-stats"], queryFn: fetchAdminStats });
  const lowStock = useQuery({ queryKey: ["admin-low-stock"], queryFn: () => fetchLowStock(5) });
  const recent = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: () => fetchRecentOrders(8),
  });
  const sales = useQuery({ queryKey: ["admin-sales-series"], queryFn: () => fetchSalesSeries(30) });
  const best = useQuery({ queryKey: ["admin-best-sellers"], queryFn: () => fetchBestSellers(5) });

  const s = stats.data;
  const lowStockCount = (lowStock.data ?? []).filter((p) => p.stock > 0).length;

  const cards = [
    {
      label: "Total orders",
      value: s ? String(s.totalOrders) : "—",
      Icon: ShoppingCart,
      tone: "neutral" as const,
    },
    {
      label: "Pending orders",
      value: s ? String(s.pendingOrders) : "—",
      Icon: Clock,
      tone: "warning" as const,
    },
    {
      label: "Delivered revenue",
      value: s ? formatBDT(Number(s.revenue)) : "—",
      Icon: TrendingUp,
      tone: "success" as const,
    },
    {
      label: "Active products",
      value: s ? `${s.activeProducts}/${s.totalProducts}` : "—",
      Icon: Package,
      tone: "accent" as const,
    },
    {
      label: "Out of stock",
      value: s ? String(s.outOfStock) : "—",
      Icon: AlertTriangle,
      tone: "danger" as const,
    },
    {
      label: "Low stock",
      value: lowStock.data ? String(lowStockCount) : "—",
      Icon: Boxes,
      tone: "warning" as const,
    },
    {
      label: "Categories",
      value: s ? String(s.totalCategories) : "—",
      Icon: Tags,
      tone: "neutral" as const,
    },
    {
      label: "Reviews awaiting",
      value: s ? String(s.pendingReviews) : "—",
      Icon: MessageSquare,
      tone: "info" as const,
    },
  ];

  const statusData = ORDER_STATUSES.map((status) => ({
    status,
    count: s?.statusCounts?.[status] ?? 0,
  })).filter((d) => d.count > 0);

  const hasSales = (sales.data ?? []).some((p) => p.revenue > 0);

  return (
    <AdminShell
      title="Dashboard"
      description="Live numbers from your store."
      actions={
        <Link to="/admin/products" className="a-btn a-btn-primary">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add product</span>
        </Link>
      }
    >
      {stats.isError ? (
        <AdminError message={(stats.error as Error).message} onRetry={() => stats.refetch()} />
      ) : stats.isPending ? (
        <CardsSkeleton count={8} />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {cards.map((c) => (
            <StatCard key={c.label} label={c.label} value={c.value} Icon={c.Icon} tone={c.tone} />
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Sales overview"
          description="Delivered and in-flight revenue, last 30 days"
          className="xl:col-span-2"
        >
          {sales.isPending ? (
            <div className="a-skeleton h-56 w-full" />
          ) : sales.isError ? (
            <AdminError message={(sales.error as Error).message} onRetry={() => sales.refetch()} />
          ) : !hasSales ? (
            <AdminEmpty
              title="No sales in the last 30 days"
              description="The chart fills in as orders come through checkout."
            />
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sales.data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--admin-accent)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--admin-accent)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [formatBDT(Number(value)), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--admin-accent)"
                    strokeWidth={2}
                    fill="url(#rev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Orders by status" description="All orders ever placed">
          {stats.isPending ? (
            <div className="a-skeleton h-56 w-full" />
          ) : statusData.length === 0 ? (
            <AdminEmpty title="No orders yet" description="Statuses appear once you take orders." />
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical" margin={{ left: 4, right: 12 }}>
                  <CartesianGrid stroke="var(--color-border)" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="status"
                    width={78}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-secondary)" }}
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {statusData.map((d) => (
                      <Cell key={d.status} fill={STATUS_COLOR[d.status] ?? "var(--admin-grey)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Recent orders"
          description="Latest 8 orders"
          className="xl:col-span-2"
          action={
            <Link to="/admin/orders" className="a-btn a-btn-outline">
              All orders
            </Link>
          }
        >
          {recent.isPending ? (
            <TableSkeleton rows={5} />
          ) : recent.isError ? (
            <AdminError
              message={(recent.error as Error).message}
              onRetry={() => recent.refetch()}
            />
          ) : (recent.data ?? []).length === 0 ? (
            <AdminEmpty title="No orders yet" description="New orders will show up here." />
          ) : (
            <div className="a-scroll -mx-4 -mb-4">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.data?.map((o) => (
                    <tr key={o.id}>
                      <td className="font-medium">{o.orderNumber}</td>
                      <td className="max-w-[10rem] truncate">{o.fullName}</td>
                      <td className="tabular-nums">{formatBDT(o.total)}</td>
                      <td>
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="whitespace-nowrap text-muted-foreground">
                        {new Date(o.createdAt).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Quick actions">
            <div className="grid grid-cols-2 gap-2">
              <Link to="/admin/products" className="a-btn a-btn-outline">
                <Package className="h-4 w-4" />
                Products
              </Link>
              <Link to="/admin/orders" className="a-btn a-btn-outline">
                <ShoppingCart className="h-4 w-4" />
                Orders
              </Link>
              <Link to="/admin/banners" className="a-btn a-btn-outline">
                <ImageIcon className="h-4 w-4" />
                Banners
              </Link>
              <Link to="/admin/reviews" className="a-btn a-btn-outline">
                <BadgeCheck className="h-4 w-4" />
                Reviews
              </Link>
            </div>
          </SectionCard>

          <SectionCard title="Best sellers" description="By units sold">
            {best.isPending ? (
              <TableSkeleton rows={3} />
            ) : best.isError ? (
              <AdminError message={(best.error as Error).message} onRetry={() => best.refetch()} />
            ) : (best.data ?? []).length === 0 ? (
              <AdminEmpty title="No sales data yet" />
            ) : (
              <ul className="space-y-3">
                {best.data?.map((p) => (
                  <li key={p.productSlug || p.name} className="flex items-center gap-3">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-10 w-10 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{p.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {p.quantity} sold · {formatBDT(p.revenue)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Low stock"
            description="5 units or fewer"
            action={
              <Link to="/admin/products" className="a-btn a-btn-outline">
                Restock
              </Link>
            }
          >
            {lowStock.isPending ? (
              <TableSkeleton rows={3} />
            ) : lowStock.isError ? (
              <AdminError
                message={(lowStock.error as Error).message}
                onRetry={() => lowStock.refetch()}
              />
            ) : (lowStock.data ?? []).length === 0 ? (
              <AdminEmpty title="Every product is well stocked" />
            ) : (
              <ul className="space-y-2 text-sm">
                {lowStock.data?.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate">{p.name}</span>
                    <span
                      className={`a-badge ${p.stock === 0 ? "a-badge-danger" : "a-badge-warning"}`}
                    >
                      {p.stock} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </div>
    </AdminShell>
  );
}
