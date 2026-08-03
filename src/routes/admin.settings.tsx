import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminCard, AdminShell, Field } from "@/components/admin/admin-shell";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { StoreSettings } from "@/data/types";
import {
  adminFetchSettings,
  adminUpdateSettings,
  getAdminEmail,
  updateAdminCredentials,
} from "@/lib/admin";

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

  // Admin Account Credentials State
  const [adminEmail, setAdminEmail] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingAuth, setUpdatingAuth] = useState(false);

  useEffect(() => {
    getAdminEmail().then((email) => {
      setAdminEmail(email);
      setNewAdminEmail(email);
    });
  }, []);

  useEffect(() => {
    if (settings.data && !form) setForm(settings.data);
  }, [settings.data, form]);

  const handleUpdateAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (newAdminPassword && newAdminPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      setUpdatingAuth(true);
      await updateAdminCredentials(adminEmail, newAdminEmail, newAdminPassword);
      setAdminEmail(newAdminEmail);
      setNewAdminPassword("");
      setConfirmPassword("");
      toast.success("Admin email and password updated successfully!");
    } catch (e) {
      toast.error((e as Error).message || "Failed to update admin credentials.");
    } finally {
      setUpdatingAuth(false);
    }
  };

  const save = useMutation({
    mutationFn: adminUpdateSettings,
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      queryClient.invalidateQueries({ queryKey: ["home-sections"] });
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
                  setForm((f) => (f ? { ...f, logoUrl: next.url, logoPublicId: next.publicId } : f))
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
          <p className="a-section-title">Flash Sale / Limited Time Offer</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Control the high-converting countdown section displayed on the storefront home page.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex min-h-[44px] items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={form.flashSaleEnabled ?? true}
                onChange={(e) => set("flashSaleEnabled", e.target.checked)}
                className="h-4 w-4"
              />
              Show Flash Sale countdown section on homepage
            </label>
            <Field label="Banner Title (Bangla)">
              <input
                value={form.flashSaleTitleBn ?? ""}
                onChange={(e) => set("flashSaleTitleBn", e.target.value)}
                placeholder="🔥 সীমিত সময়ের জন্য ধামাকা অফার - অফার শেষ হতে বাকী!"
                className="a-input"
              />
            </Field>
            <Field label="Banner Title (English)">
              <input
                value={form.flashSaleTitleEn ?? ""}
                onChange={(e) => set("flashSaleTitleEn", e.target.value)}
                placeholder="🔥 Limited Time Flash Offer - Ending Soon!"
                className="a-input"
              />
            </Field>
            <Field
              label="Offer End Time (ISO Date/Time or timestamp)"
              hint="e.g. 2026-08-03T23:59:59"
            >
              <div className="space-y-2">
                <input
                  type="text"
                  value={form.flashSaleEndTime ?? ""}
                  onChange={(e) => set("flashSaleEndTime", e.target.value)}
                  placeholder="2026-08-03T23:59:59"
                  className="a-input"
                />
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      set("flashSaleEndTime", new Date(Date.now() + 24 * 3600 * 1000).toISOString())
                    }
                    className="rounded-md bg-secondary px-2.5 py-1 font-medium hover:bg-secondary/80"
                  >
                    Set +24 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "flashSaleEndTime",
                        new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
                      )
                    }
                    className="rounded-md bg-secondary px-2.5 py-1 font-medium hover:bg-secondary/80"
                  >
                    Set +3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "flashSaleEndTime",
                        new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
                      )
                    }
                    className="rounded-md bg-secondary px-2.5 py-1 font-medium hover:bg-secondary/80"
                  >
                    Set +7 Days
                  </button>
                </div>
              </div>
            </Field>
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

        {/* ADMIN ACCOUNT SECURITY SETTINGS */}
        <div className="pt-2">
          <AdminCard>
            <p className="a-section-title">Admin Account Credentials (email & password)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Update the email address and password used to log into this admin panel.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Admin Email">
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="a-input"
                  required
                />
              </Field>
              <Field label="New Password (leave blank to keep current)">
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="a-input"
                />
              </Field>
              <Field label="Confirm New Password">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="a-input"
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-start">
              <button
                type="button"
                onClick={handleUpdateAdminAuth}
                disabled={updatingAuth}
                className="a-btn a-btn-secondary"
              >
                {updatingAuth ? "Updating Admin Auth…" : "Update Admin Account Details"}
              </button>
            </div>
          </AdminCard>
        </div>

        <button type="submit" disabled={save.isPending} className="a-btn a-btn-primary">
          {save.isPending ? "Saving…" : "Save settings"}
        </button>
      </form>
    </AdminShell>
  );
}
