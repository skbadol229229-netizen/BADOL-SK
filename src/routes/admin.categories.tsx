import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { AdminCard, AdminShell, Field } from "@/components/admin/admin-shell";
import { ImageUploader } from "@/components/admin/image-uploader";
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
      { title: "Categories — Trikon Admin" },
      { name: "description", content: "Manage the categories shown across the Trikon storefront." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Categories — Trikon Admin" },
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
      description="Categories drive the storefront navigation and filters."
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
          New category
        </button>
      }
    >
      {form && (
        <AdminCard className="mb-8">
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="a-input"
              />
            </Field>
            <Field label="Slug" hint="Leave blank to generate from the name.">
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="a-input"
              />
            </Field>
            <Field label="Image" hint="Uploaded to Cloudinary. Max 5 MB.">
              <ImageUploader
                aspect="aspect-[4/5]"
                value={{ url: form.image, publicId: form.imagePublicId ?? "" }}
                onChange={(next) =>
                  setForm({ ...form, image: next.url, imagePublicId: next.publicId })
                }
              />
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="a-input"
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="a-input"
              />
            </Field>
            <label className="flex min-h-[44px] items-center gap-2 self-end text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="h-4 w-4"
              />
              Active
            </label>
            <div className="flex gap-3 md:col-span-2">
              <button type="submit" disabled={save.isPending} className="a-btn a-btn-primary">
                {save.isPending ? "Saving…" : editingId ? "Save changes" : "Create category"}
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
                    src={c.image}
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
