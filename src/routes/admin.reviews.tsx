import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Star } from "lucide-react";
import { AdminCard, AdminShell, Field } from "@/components/admin/admin-shell";
import type { Review } from "@/data/types";
import {
  adminCreateReview,
  adminDeleteReview,
  adminListProducts,
  adminListReviews,
  adminUpdateReview,
  type ReviewInput,
} from "@/lib/admin";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Trikon Admin" },
      { name: "description", content: "Approve, edit and remove customer reviews." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Reviews — Trikon Admin" },
      { property: "og:description", content: "Customer review moderation." },
    ],
  }),
  component: AdminReviewsPage,
});

const empty: ReviewInput = {
  productSlug: "",
  author: "",
  rating: 5,
  body: "",
  approved: true,
  date: new Date().toISOString().slice(0, 10),
};

function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const reviews = useQuery({ queryKey: ["admin-reviews"], queryFn: adminListReviews });
  const products = useQuery({ queryKey: ["admin-products"], queryFn: adminListProducts });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewInput | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    queryClient.invalidateQueries({ queryKey: ["reviews"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const save = useMutation({
    mutationFn: async ({ id, input }: { id: string | null; input: ReviewInput }) => {
      if (id) await adminUpdateReview(id, input);
      else await adminCreateReview(input);
    },
    onSuccess: () => {
      toast.success("Review saved");
      setForm(null);
      setEditingId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: adminDeleteReview,
    onSuccess: () => {
      toast.success("Review deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const list = (reviews.data ?? []).filter((r) =>
    filter === "all" ? true : filter === "approved" ? r.approved : !r.approved,
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.productSlug) return toast.error("Pick a product");
    if (!form.author.trim()) return toast.error("Author is required");
    save.mutate({ id: editingId, input: { ...form, rating: Number(form.rating) || 5 } });
  }

  return (
    <AdminShell
      title="Reviews"
      description="Only approved reviews are visible on the storefront."
      actions={
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm({ ...empty, productSlug: products.data?.[0]?.slug ?? "" });
          }}
          className="a-btn a-btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          New review
        </button>
      }
    >
      {form && (
        <AdminCard className="mb-8">
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <Field label="Product">
              <select
                value={form.productSlug}
                onChange={(e) => setForm({ ...form, productSlug: e.target.value })}
                className="a-input"
              >
                <option value="">Select…</option>
                {(products.data ?? []).map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Author">
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="a-input"
              />
            </Field>
            <Field label="Rating (1-5)">
              <input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="a-input"
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="a-input"
              />
            </Field>
            <Field label="Review">
              <textarea
                rows={4}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="a-input"
              />
            </Field>
            <label className="flex min-h-[44px] items-center gap-2 self-end text-sm">
              <input
                type="checkbox"
                checked={form.approved}
                onChange={(e) => setForm({ ...form, approved: e.target.checked })}
                className="h-4 w-4"
              />
              Approved
            </label>
            <div className="flex gap-3 md:col-span-2">
              <button type="submit" disabled={save.isPending} className="a-btn a-btn-primary">
                {save.isPending ? "Saving…" : "Save review"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(null);
                  setEditingId(null);
                }}
                className="a-btn a-btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </AdminCard>
      )}

      <div className="mb-4 flex gap-2">
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`btn ${filter === f ? "btn-solid" : "btn-outline"} capitalize`}
          >
            {f}
          </button>
        ))}
      </div>

      {reviews.isPending && <p className="text-sm text-muted-foreground">Loading…</p>}
      {reviews.isError && (
        <p className="text-sm text-destructive">{(reviews.error as Error).message}</p>
      )}
      {reviews.data && list.length === 0 && (
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      )}

      <div className="space-y-3">
        {list.map((r: Review) => (
          <AdminCard key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {r.author}
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-current" />
                    {r.rating}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {r.productSlug} · {r.date} · {r.approved ? "Approved" : "Pending"}
                </p>
                <p className="mt-2 max-w-2xl text-sm">{r.body}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const { id, ...rest } = r;
                    save.mutate({ id, input: { ...rest, approved: !r.approved } });
                  }}
                  className="a-btn a-btn-outline"
                >
                  {r.approved ? "Unapprove" : "Approve"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(r.id);
                    const { id: _id, ...rest } = r;
                    setForm(rest);
                  }}
                  className="a-btn a-btn-outline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Delete this review?")) remove.mutate(r.id);
                  }}
                  className="a-btn a-btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>
    </AdminShell>
  );
}
