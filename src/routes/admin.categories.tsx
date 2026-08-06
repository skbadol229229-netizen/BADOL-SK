import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { AdminCard, AdminShell, Field } from "@/components/admin/admin-shell";
import { ImageUploader } from "@/components/admin/image-uploader";
import { formatImageUrl } from "@/lib/utils";
import type { Category } from "@/data/types";
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminListCategories,
  adminUpdateCategory,
  type CategoryInput,
} from "@/lib/admin";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Categories — PureBengal Admin" },
      { name: "description", content: "Manage organic categories shown across PureBengal." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Categories — PureBengal Admin" },
      { property: "og:description", content: "Category management." },
    ],
  }),
  component: AdminCategoriesPage,
});

const empty: CategoryInput = {
  name: "",
  slug: "",
  description: "",
  image: "",
  imagePublicId: "",
  active: true,
  sortOrder: 0,
};

function slugify(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const categories = useQuery({ queryKey: ["admin-categories"], queryFn: adminListCategories });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryInput | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const save = useMutation({
    mutationFn: async (input: CategoryInput) => {
      if (editingId) await adminUpdateCategory(editingId, input);
      else await adminCreateCategory(input);
    },
    onSuccess: () => {
      toast.success(editingId ? "Category updated" : "Category created");
      setForm(null);
      setEditingId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: adminDeleteCategory,
    onSuccess: () => {
      toast.success("Category deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.name.trim()) return toast.error("Name is required");
    save.mutate({
      ...form,
      slug: form.slug.trim() || slugify(form.name),
      sortOrder: Number(form.sortOrder) || 0,
    });
  }

  return (
    <AdminShell
      title="Categories"
      description="Organic food categories for storefront navigation."
      actions={
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm(empty);
          }}
          className="a-btn a-btn-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </button>
      }
    >
      {form && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            aria-hidden="true"
            onClick={() => {
              setForm(null);
              setEditingId(null);
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">
                {editingId ? "Edit Organic Category" : "Add Organic Category"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setForm(null);
                  setEditingId(null);
                }}
                className="a-btn a-btn-ghost a-btn-icon rounded-full hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={submit} className="mt-4 space-y-4">
              <Field label="Category Name">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="a-input mt-1"
                  placeholder="e.g. Pure Honey, Organic Mustard Oil"
                />
              </Field>
              <Field label="URL Slug" hint="Leave blank to generate automatically.">
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="a-input mt-1"
                  placeholder={slugify(form.name) || "pure-honey"}
                />
              </Field>
              <Field label="Category Image" hint="Square or banner image for category cards.">
                <div className="mt-1">
                  <ImageUploader
                    aspect="aspect-square"
                    value={{ url: form.image, publicId: form.imagePublicId ?? "" }}
                    onChange={(next) =>
                      setForm({ ...form, image: next.url, imagePublicId: next.publicId })
                    }
                  />
                </div>
              </Field>
              <Field label="Sort Order">
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="a-input mt-1"
                />
              </Field>
              <Field label="Description">
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="a-input mt-1"
                  placeholder="Short summary of items in this category"
                />
              </Field>
              <label className="flex items-center gap-2 pt-1 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="h-4 w-4 accent-primary"
                />
                Active (Visible on website)
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
                <button type="submit" disabled={save.isPending} className="a-btn a-btn-primary">
                  {save.isPending ? "Saving…" : editingId ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categories.isPending && <p className="text-sm text-muted-foreground">Loading…</p>}
      {categories.isError && (
        <p className="text-sm text-destructive">{(categories.error as Error).message}</p>
      )}
      {categories.data?.length === 0 && (
        <p className="text-sm text-muted-foreground">No categories yet.</p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {categories.data?.map((c: Category) => (
          <AdminCard key={c.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                {c.image && (
                  <img
                    src={formatImageUrl(c.image)}
                    alt={c.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 shrink-0 object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">/{c.slug}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {c.active ? "Active" : "Inactive"} · order {c.sortOrder}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(c.id);
                    const { id: _id, ...rest } = c;
                    setForm(rest);
                  }}
                  className="a-btn a-btn-outline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete ${c.name}?`)) remove.mutate(c.id);
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
