import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, X } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  AdminEmpty,
  AdminError,
  OrderStatusBadge,
  Pager,
  SectionCard,
  StatCard,
  TableSkeleton,
} from "@/components/admin/ui";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/data/types";
import { adminListOrders, adminUpdateOrderStatus } from "@/lib/admin";
import { formatBDT } from "@/lib/format";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Trikon Admin" },
      { name: "description", content: "Review cash-on-delivery orders and update their status." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Orders — Trikon Admin" },
      { property: "og:description", content: "Order management." },
    ],
  }),
  component: AdminOrdersPage,
});

const PAGE_SIZE = 15;

function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: adminListOrders });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | OrderStatus>("All");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const update = useMutation({
    mutationFn: ({ id, next }: { id: string; next: OrderStatus }) =>
      adminUpdateOrderStatus(id, next),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-recent-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-sales-series"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const all = orders.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((o) => {
      if (status !== "All" && o.status !== status) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.fullName.toLowerCase().includes(q) ||
        o.mobile.includes(q) ||
        o.district.toLowerCase().includes(q)
      );
    });
  }, [all, search, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const selected = all.find((o) => o.id === openId) ?? null;

  const pending = all.filter((o) => o.status === "Pending").length;
  const delivered = all.filter((o) => o.status === "Delivered");
  const revenue = delivered.reduce((sum, o) => sum + o.total, 0);

  return (
    <AdminShell title="Orders" description="Every cash-on-delivery order placed on the store.">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total orders" value={String(all.length)} loading={orders.isPending} />
        <StatCard
          label="Pending"
          value={String(pending)}
          tone="warning"
          loading={orders.isPending}
        />
        <StatCard
          label="Delivered"
          value={String(delivered.length)}
          tone="success"
          loading={orders.isPending}
        />
        <StatCard
          label="Delivered revenue"
          value={formatBDT(revenue)}
          tone="accent"
          loading={orders.isPending}
        />
      </div>

      <SectionCard
        title="All orders"
        description={`${filtered.length} order(s) matching your filters`}
        className="mt-4"
      >
        <div className="mb-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search order number, name, mobile or district"
              className="a-input pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as "All" | OrderStatus);
              setPage(1);
            }}
            className="a-input sm:w-44"
          >
            <option value="All">All statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {orders.isPending ? (
          <TableSkeleton rows={8} />
        ) : orders.isError ? (
          <AdminError message={(orders.error as Error).message} onRetry={() => orders.refetch()} />
        ) : rows.length === 0 ? (
          <AdminEmpty
            title="No orders match these filters"
            description="Try a different search term or status."
          />
        ) : (
          <div className="a-scroll -mx-4">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th className="hidden md:table-cell">Location</th>
                  <th className="hidden sm:table-cell">Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o: Order) => (
                  <tr key={o.id}>
                    <td>
                      <span className="block text-sm font-medium">{o.orderNumber}</span>
                      <span className="block whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString("en-GB")}
                      </span>
                    </td>
                    <td>
                      <span className="block max-w-[12rem] truncate text-sm">{o.fullName}</span>
                      <span className="block text-xs text-muted-foreground">{o.mobile}</span>
                    </td>
                    <td className="hidden md:table-cell text-muted-foreground">
                      {o.area}, {o.district}
                    </td>
                    <td className="hidden sm:table-cell tabular-nums">{o.items.length}</td>
                    <td className="whitespace-nowrap tabular-nums">{formatBDT(o.total)}</td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <OrderStatusBadge status={o.status} />
                        <select
                          value={o.status}
                          onChange={(e) =>
                            update.mutate({ id: o.id, next: e.target.value as OrderStatus })
                          }
                          className="a-input h-9 w-[9.5rem] py-0 text-xs"
                          aria-label={`Change status for ${o.orderNumber}`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => setOpenId(o.id)}
                        className="a-btn a-btn-outline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pager page={current} pageCount={pageCount} total={filtered.length} onPage={setPage} />
      </SectionCard>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Close order details"
            onClick={() => setOpenId(null)}
            className="absolute inset-0 bg-foreground/40"
          />
          <aside className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card">
            <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold">{selected.orderNumber}</h2>
                <p className="truncate text-xs text-muted-foreground">
                  {new Date(selected.createdAt).toLocaleString("en-GB")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                className="a-btn a-btn-ghost a-btn-icon"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
              <div className="flex items-center justify-between gap-3">
                <OrderStatusBadge status={selected.status} />
                <select
                  value={selected.status}
                  onChange={(e) =>
                    update.mutate({ id: selected.id, next: e.target.value as OrderStatus })
                  }
                  className="a-input h-10 w-40 py-0 text-xs"
                  aria-label="Change status"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="a-label">Delivery address</p>
                <p className="text-sm leading-relaxed">
                  {selected.fullName}
                  <br />
                  {selected.address}
                  <br />
                  {selected.area}, {selected.district}
                  <br />
                  {selected.mobile}
                </p>
                {selected.note && (
                  <p className="mt-2 text-sm text-muted-foreground">Note: {selected.note}</p>
                )}
              </div>

              <div>
                <p className="a-label">Items</p>
                <ul className="space-y-3">
                  {selected.items.map((i) => (
                    <li key={i.id} className="flex items-center gap-3">
                      {i.image && (
                        <img
                          src={i.image}
                          alt={i.name}
                          className="h-12 w-12 shrink-0 rounded-md object-cover"
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{i.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {[i.size, i.color].filter(Boolean).join(" · ")}
                          {i.size || i.color ? " · " : ""}Qty {i.quantity}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm tabular-nums">
                        {formatBDT(i.unitPrice * i.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <dl className="space-y-1 border-t border-border pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatBDT(selected.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="tabular-nums">{formatBDT(selected.deliveryCharge)}</dd>
                </div>
                <div className="flex justify-between font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatBDT(selected.total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Payment</dt>
                  <dd>Cash on delivery</dd>
                </div>
              </dl>
            </div>

            <footer className="border-t border-border px-4 py-3">
              <a href={`tel:${selected.mobile}`} className="a-btn a-btn-primary w-full">
                Call {selected.mobile}
              </a>
            </footer>
          </aside>
        </div>
      )}
    </AdminShell>
  );
}
