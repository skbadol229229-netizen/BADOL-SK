import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import type { OrderStatus } from "@/data/types";

/* --------------------------------- cards --------------------------------- */

export function StatCard({
  label,
  value,
  hint,
  Icon,
  tone = "neutral",
  loading,
}: {
  label: string;
  value: string;
  hint?: string;
  Icon?: React.ComponentType<{ className?: string }>;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger" | "info";
  loading?: boolean;
}) {
  return (
    <div className="a-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className={`a-badge a-badge-${tone} h-6 w-6 justify-center rounded-md p-0`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      {loading ? (
        <div className="a-skeleton mt-3 h-7 w-20" />
      ) : (
        <p className="mt-2 text-xl font-semibold tabular-nums md:text-2xl">{value}</p>
      )}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`a-card ${className}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 className="a-section-title truncate">{title}</h2>
          {description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

/* -------------------------------- badges --------------------------------- */

const ORDER_TONE: Record<OrderStatus, string> = {
  Pending: "a-badge-warning",
  Confirmed: "a-badge-info",
  Processing: "a-badge-purple",
  Shipped: "a-badge-indigo",
  Delivered: "a-badge-success",
  Cancelled: "a-badge-danger",
  Returned: "a-badge-neutral",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`a-badge ${ORDER_TONE[status] ?? "a-badge-neutral"}`}>{status}</span>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`a-badge ${active ? "a-badge-success" : "a-badge-neutral"}`}>
      {active ? "Active" : "Draft"}
    </span>
  );
}

export function StockBadge({ stock }: { stock: number }) {
  const tone = stock === 0 ? "a-badge-danger" : stock <= 5 ? "a-badge-warning" : "a-badge-neutral";
  const label = stock === 0 ? "Out of stock" : `${stock} in stock`;
  return <span className={`a-badge ${tone}`}>{label}</span>;
}

/* ---------------------------- states / feedback --------------------------- */

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2 p-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="a-skeleton h-10 w-10 shrink-0" />
          <div className="a-skeleton h-4 flex-1" />
          <div className="a-skeleton hidden h-4 w-24 sm:block" />
          <div className="a-skeleton hidden h-4 w-16 md:block" />
        </div>
      ))}
    </div>
  );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="a-card p-4">
          <div className="a-skeleton h-3 w-20" />
          <div className="a-skeleton mt-3 h-7 w-16" />
        </div>
      ))}
    </div>
  );
}

export function AdminEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center px-4 py-12 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function AdminError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="grid place-items-center px-4 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" />
      <p className="mt-3 text-sm font-medium">Something went wrong</p>
      <p className="mt-1 max-w-md text-xs text-muted-foreground">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="a-btn a-btn-outline mt-4">
          Try again
        </button>
      )}
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`h-4 w-4 animate-spin ${className}`} />;
}

/* ----------------------------- confirm dialog ----------------------------- */

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  destructive = true,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-foreground/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="a-card relative w-full max-w-sm p-5 shadow-lg"
      >
        <h2 className="text-sm font-semibold">{title}</h2>
        {description && <p className="mt-2 text-xs text-muted-foreground">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="a-btn a-btn-outline">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`a-btn ${destructive ? "a-btn-danger" : "a-btn-primary"}`}
          >
            {busy && <Spinner />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- pagination ------------------------------- */

export function Pager({
  page,
  pageCount,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPage: (p: number) => void;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">
        Page {page} of {pageCount} · {total} item{total === 1 ? "" : "s"}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="a-btn a-btn-outline"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="a-btn a-btn-outline"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* -------------------------------- switches -------------------------------- */

export function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-4 rounded-md border border-border px-3 py-2">
      <span className="min-w-0">
        <span className="block text-sm">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 accent-[var(--admin-accent)]"
      />
    </label>
  );
}
