import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { AdminCard, AdminShell, Field } from "@/components/admin/admin-shell";
import { ImageUploader } from "@/components/admin/image-uploader";
import { formatImageUrl } from "@/lib/utils";
import type { Banner } from "@/data/types";
import {
  adminCreateBanner,
  adminDeleteBanner,
  adminListBanners,
  adminUpdateBanner,
  type BannerInput,
} from "@/lib/admin";

export const Route = createFileRoute("/admin/banners")({
  head: () => ({
    meta: [
      { title: "Banners — Trikon Admin" },
      { name: "description", content: "Manage the homepage hero banners for Trikon Clothing." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Banners — Trikon Admin" },
      { property: "og:description", content: "Homepage banner management." },
    ],
  }),
  component: AdminBannersPage,
});

const empty: BannerInput = {
  title: "",
  subtitle: "",
  ctaLabel: "Shop now",
  ctaHref: "/shop",
  image: "",
  imagePublicId: "",
  mobileImage: "",
  mobileImagePublicId: "",
  active: true,
  sortOrder: 0,
};

function AdminBannersPage() {
  const queryClient = useQueryClient();
  const banners = useQuery({ queryKey: ["admin-banners"], queryFn: adminListBanners });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerInput | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    queryClient.invalidateQueries({ queryKey: ["banners"] });
  };

  const save = useMutation({
    mutationFn: async (input: BannerInput) => {
      if (editingId) await adminUpdateBanner(editingId, input);
      else await adminCreateBanner(input);
    },
    onSuccess: () => {
      toast.success(editingId ? "Banner updated" : "Banner created");
      setForm(null);
      setEditingId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: adminDeleteBanner,
    onSuccess: () => {
      toast.success("Banner deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.title.trim()) return toast.error("Title is required");
    save.mutate({ ...form, sortOrder: Number(form.sortOrder) || 0 });
  }

  return (
    <AdminShell
      title="Banners"
      description="The first active banner is used as the homepage hero."
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
          New banner
        </button>
      }
    >
      {form && (
        <AdminCard className="mb-8">
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="a-input"
              />
            </Field>
            <Field label="Subtitle">
              <input
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="a-input"
              />
            </Field>
            <Field label="Button label">
              <input
                value={form.ctaLabel}
                onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                className="a-input"
              />
            </Field>
            <Field label="Button link" hint="For example /shop or /category/shirts">
              <input
                value={form.ctaHref}
                onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
                className="a-input"
              />
            </Field>
            <Field label="Desktop image" hint="Wide 16:9 artwork. Max 5 MB.">
              <ImageUploader
                aspect="aspect-video"
                value={{ url: form.image, publicId: form.imagePublicId ?? "" }}
                onChange={(next) =>
                  setForm({ ...form, image: next.url, imagePublicId: next.publicId })
                }
              />
            </Field>
            <Field label="Mobile image" hint="Optional 4:5 artwork shown on phones.">
              <ImageUploader
                aspect="aspect-[4/5]"
                value={{ url: form.mobileImage ?? "", publicId: form.mobileImagePublicId ?? "" }}
                onChange={(next) =>
                  setForm({ ...form, mobileImage: next.url, mobileImagePublicId: next.publicId })
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
            <label className="flex min-h-[44px] items-center gap-2 text-sm">
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
                {save.isPending ? "Saving…" : editingId ? "Save changes" : "Create banner"}
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

      {banners.isPending && <p className="text-sm text-muted-foreground">Loading…</p>}
      {banners.isError && (
        <p className="text-sm text-destructive">{(banners.error as Error).message}</p>
      )}
      {banners.data?.length === 0 && (
        <p className="text-sm text-muted-foreground">No banners yet.</p>
      )}

      <div className="space-y-3">
        {banners.data?.map((b: Banner) => (
          <AdminCard key={b.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                {b.image && (
                  <img
                    src={formatImageUrl(b.image)}
                    alt={b.title}
                    width={128}
                    height={72}
                    className="h-[72px] w-32 shrink-0 object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium">{b.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{b.subtitle}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {b.active ? "Active" : "Inactive"} · order {b.sortOrder} · {b.ctaHref}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(b.id);
                    const { id: _id, ...rest } = b;
                    setForm(rest);
                  }}
                  className="a-btn a-btn-outline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete banner "${b.title}"?`)) remove.mutate(b.id);
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
