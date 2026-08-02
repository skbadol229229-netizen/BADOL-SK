import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminCard, AdminShell, Field } from "@/components/admin/admin-shell";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { StoreSettings } from "@/data/types";
import { adminFetchSettings, adminUpdateSettings } from "@/lib/admin";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Store settings — Trikon Admin" },
      {
        name: "description",
        content: "Delivery charges, announcement text and contact details for Trikon Clothing.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Store settings — Trikon Admin" },
      { property: "og:description", content: "Store configuration." },
    ],
  }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ["admin-settings"], queryFn: adminFetchSettings });
  const [form, setForm] = useState<StoreSettings | null>(null);

  useEffect(() => {
    if (settings.data && !form) setForm(settings.data);
  }, [settings.data, form]);

  const save = useMutation({
    mutationFn: adminUpdateSettings,
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (settings.isPending || !form) {
    return (
      <AdminShell title="Store settings">
        <p className="text-sm text-muted-foreground">Loading settings…</p>
      </AdminShell>
    );
  }

  function set<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    save.mutate({
      ...form,
      deliveryInsideDhaka: Number(form.deliveryInsideDhaka) || 0,
      deliveryOutsideDhaka: Number(form.deliveryOutsideDhaka) || 0,
      exchangeWindowDays: Number(form.exchangeWindowDays) || 0,
    });
  }

  return (
    <AdminShell
      title="Store settings"
      description="These values appear across the storefront and checkout."
    >
      <form onSubmit={submit} className="space-y-6">
        <AdminCard>
          <p className="a-section-title">Branding</p>
          <p className="mt-1 text-xs text-muted-foreground">
            The logo appears in the storefront header, mobile menu, footer and admin panel. Without
            a logo the store name is shown instead.
          </p>
          <div className="mt-4">
            <Field label="Website logo">
              <ImageUploader
                value={{ url: form.logoUrl, publicId: form.logoPublicId }}
                onChange={(next) =>
                  setForm((f) =>
                    f ? { ...f, logoUrl: next.url, logoPublicId: next.publicId } : f,
                  )
                }
                aspect="aspect-square"
                previewClassName="max-w-[140px] rounded-full"
                assistiveText="Square image works best — it is shown as a circle across the site"

              />
            </Field>
          </div>
        </AdminCard>

        <AdminCard>
          <p className="a-section-title">Store</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Store name">
              <input
                value={form.storeName}
                onChange={(e) => set("storeName", e.target.value)}
                className="a-input"
              />
            </Field>
            <Field label="Announcement bar">
              <input
                value={form.announcement}
                onChange={(e) => set("announcement", e.target.value)}
                className="a-input"
              />
            </Field>
          </div>
        </AdminCard>

        <AdminCard>
          <p className="a-section-title">Delivery</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Inside Dhaka charge (৳)">
              <input
                type="number"
                min={0}
                value={form.deliveryInsideDhaka}
                onChange={(e) => set("deliveryInsideDhaka", Number(e.target.value))}
                className="a-input"
              />
            </Field>
            <Field label="Outside Dhaka charge (৳)">
              <input
                type="number"
                min={0}
                value={form.deliveryOutsideDhaka}
                onChange={(e) => set("deliveryOutsideDhaka", Number(e.target.value))}
                className="a-input"
              />
            </Field>
            <Field label="Inside Dhaka delivery time">
              <input
                value={form.deliveryTimeInside}
                onChange={(e) => set("deliveryTimeInside", e.target.value)}
                className="a-input"
              />
            </Field>
            <Field label="Outside Dhaka delivery time">
              <input
                value={form.deliveryTimeOutside}
                onChange={(e) => set("deliveryTimeOutside", e.target.value)}
                className="a-input"
              />
            </Field>
            <Field label="Exchange window (days)">
              <input
                type="number"
                min={0}
                value={form.exchangeWindowDays}
                onChange={(e) => set("exchangeWindowDays", Number(e.target.value))}
                className="a-input"
              />
            </Field>
            <label className="flex min-h-[44px] items-center gap-2 self-end text-sm">
              <input
                type="checkbox"
                checked={form.codEnabled}
                onChange={(e) => set("codEnabled", e.target.checked)}
                className="h-4 w-4"
              />
              Cash on delivery enabled
            </label>
          </div>
        </AdminCard>

        <AdminCard>
          <p className="a-section-title">Contact</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Support phone">
              <input
                value={form.supportPhone}
                onChange={(e) => set("supportPhone", e.target.value)}
                className="a-input"
              />
            </Field>
            <Field label="WhatsApp">
              <input
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                className="a-input"
              />
            </Field>
            <Field label="Support email">
              <input
                value={form.supportEmail}
                onChange={(e) => set("supportEmail", e.target.value)}
                className="a-input"
              />
            </Field>
            <Field label="Address">
              <input
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className="a-input"
              />
            </Field>
            <Field label="Facebook URL">
              <input
                value={form.facebookUrl}
                onChange={(e) => set("facebookUrl", e.target.value)}
                className="a-input"
              />
            </Field>
            <Field label="Instagram URL">
              <input
                value={form.instagramUrl}
                onChange={(e) => set("instagramUrl", e.target.value)}
                className="a-input"
              />
            </Field>
            <Field label="YouTube URL">
              <input
                value={form.youtubeUrl}
                onChange={(e) => set("youtubeUrl", e.target.value)}
                className="a-input"
              />
            </Field>
          </div>
        </AdminCard>

        <button type="submit" disabled={save.isPending} className="a-btn a-btn-primary">
          {save.isPending ? "Saving…" : "Save settings"}
        </button>
      </form>
    </AdminShell>
  );
}
