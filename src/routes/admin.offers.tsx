import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock, Flame, Save, Sparkles, Tag, Zap } from "lucide-react";
import { AdminCard, AdminShell, Field } from "@/components/admin/admin-shell";
import { ActiveBadge } from "@/components/admin/ui";
import {
  adminFetchSettings,
  adminListProducts,
  adminUpdateProduct,
  adminUpdateSettings,
} from "@/lib/admin";
import { formatBDT } from "@/lib/format";
import { formatImageUrl } from "@/lib/utils";
import type { Product, StoreSettings } from "@/data/types";

export const Route = createFileRoute("/admin/offers")({
  head: () => ({
    meta: [
      { title: "Flash Sale & Offers — Trikon Admin" },
      {
        name: "description",
        content: "Manage Flash Sales, promotional discounts, and countdown timers.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminOffersPage,
});

function AdminOffersPage() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({ queryKey: ["admin-settings"], queryFn: adminFetchSettings });
  const productsQuery = useQuery({ queryKey: ["admin-products"], queryFn: adminListProducts });

  const [form, setForm] = useState<StoreSettings | null>(null);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempRegular, setTempRegular] = useState<number>(0);
  const [tempSale, setTempSale] = useState<number | null>(null);

  useEffect(() => {
    if (settingsQuery.data && !form) {
      setForm(settingsQuery.data);
    }
  }, [settingsQuery.data, form]);

  const saveSettings = useMutation({
    mutationFn: adminUpdateSettings,
    onSuccess: () => {
      toast.success("Flash Sale settings saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      queryClient.invalidateQueries({ queryKey: ["home-sections"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateProductPrice = useMutation({
    mutationFn: async ({
      product,
      regularPrice,
      salePrice,
    }: {
      product: Product;
      regularPrice: number;
      salePrice: number | null;
    }) => {
      const { id, createdAt, ...input } = product;
      await adminUpdateProduct(id, {
        ...input,
        regularPrice,
        salePrice,
      });
    },
    onSuccess: () => {
      toast.success("Product discount updated!");
      setEditingPriceId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["home-sections"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (settingsQuery.isPending || productsQuery.isPending || !form) {
    return (
      <AdminShell title="Flash Sale & Offers">
        <p className="text-sm text-muted-foreground">Loading offer controls…</p>
      </AdminShell>
    );
  }

  function set<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    saveSettings.mutate(form);
  }

  const products = productsQuery.data || [];
  const flashSaleProducts = products.filter((p) => p.salePrice && p.salePrice < p.regularPrice);

  function applyDiscountPercent(p: Product, percent: number) {
    const discounted = Math.round(p.regularPrice * (1 - percent / 100));
    updateProductPrice.mutate({
      product: p,
      regularPrice: p.regularPrice,
      salePrice: discounted,
    });
  }

  function removeDiscount(p: Product) {
    updateProductPrice.mutate({
      product: p,
      regularPrice: p.regularPrice,
      salePrice: null,
    });
  }

  // Convert ISO string to datetime-local format
  const toLocalDatetime = (isoStr?: string) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return "";
      const tzOffset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  return (
    <AdminShell
      title="🔥 Flash Sale & Dynamic Offers"
      description="Control the limited-time banner countdown and manage promotional product discounts."
    >
      <div className="space-y-6">
        {/* FLASH SALE SETTINGS CARD */}
        <form onSubmit={handleSaveSettings}>
          <AdminCard>
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
                <h2 className="text-base font-bold text-foreground">
                  Flash Sale Countdown Controls
                </h2>
              </div>
              <button
                type="submit"
                disabled={saveSettings.isPending}
                className="a-btn a-btn-primary flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" />
                <span>{saveSettings.isPending ? "Saving..." : "Save Settings"}</span>
              </button>
            </div>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-border/80 bg-secondary/40 p-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-foreground">Enable Flash Sale Banner</p>
                  <p className="text-xs text-muted-foreground">
                    Shows or hides the dynamic offer section on the homepage.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.flashSaleEnabled ?? true}
                    onChange={(e) => set("flashSaleEnabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <Field label="Banner Title (Bangla)">
                <input
                  type="text"
                  value={form.flashSaleTitleBn ?? ""}
                  onChange={(e) => set("flashSaleTitleBn", e.target.value)}
                  placeholder="🔥 সীমিত সময়ের জন্য ধামাকা অফার - অফার শেষ হতে বাকী!"
                  className="a-input"
                />
              </Field>

              <Field label="Banner Title (English)">
                <input
                  type="text"
                  value={form.flashSaleTitleEn ?? ""}
                  onChange={(e) => set("flashSaleTitleEn", e.target.value)}
                  placeholder="🔥 Limited Time Flash Offer - Ending Soon!"
                  className="a-input"
                />
              </Field>

              <div className="md:col-span-2">
                <Field
                  label="Offer End Date & Time"
                  hint="The countdown timer will calculate remaining time until this target date."
                >
                  <div className="mt-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="datetime-local"
                        value={toLocalDatetime(form.flashSaleEndTime)}
                        onChange={(e) => {
                          if (e.target.value) {
                            set("flashSaleEndTime", new Date(e.target.value).toISOString());
                          }
                        }}
                        className="a-input max-w-xs"
                      />
                      <span className="text-xs text-muted-foreground">
                        Current Target:{" "}
                        <strong className="text-foreground">
                          {form.flashSaleEndTime
                            ? new Date(form.flashSaleEndTime).toLocaleString()
                            : "Not Set"}
                        </strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "flashSaleEndTime",
                            new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                          )
                        }
                        className="a-btn a-btn-ghost rounded-lg border border-border bg-card px-3 py-1.5 font-medium hover:bg-secondary"
                      >
                        + 24 Hours
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "flashSaleEndTime",
                            new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
                          )
                        }
                        className="a-btn a-btn-ghost rounded-lg border border-border bg-card px-3 py-1.5 font-medium hover:bg-secondary"
                      >
                        + 3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "flashSaleEndTime",
                            new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
                          )
                        }
                        className="a-btn a-btn-ghost rounded-lg border border-border bg-card px-3 py-1.5 font-medium hover:bg-secondary"
                      >
                        + 7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            "flashSaleEndTime",
                            new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
                          )
                        }
                        className="a-btn a-btn-ghost rounded-lg border border-border bg-card px-3 py-1.5 font-medium hover:bg-secondary"
                      >
                        + 30 Days
                      </button>
                    </div>
                  </div>
                </Field>
              </div>
            </div>
          </AdminCard>
        </form>

        {/* PRODUCTS OFFER & DISCOUNT MANAGEMENT */}
        <AdminCard>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">
                  Offer Products & Discounts ({flashSaleProducts.length} Active On Sale)
                </h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Products with a reduced sale price automatically feature in the Flash Sale section.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/40 uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Regular Price</th>
                  <th className="py-3 px-4">Sale Price</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {products.map((p) => {
                  const isOnSale = p.salePrice && p.salePrice < p.regularPrice;
                  const discountPct = isOnSale
                    ? Math.round(((p.regularPrice - p.salePrice!) / p.regularPrice) * 100)
                    : 0;
                  const isEditing = editingPriceId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              p.images[0]
                                ? formatImageUrl(p.images[0])
                                : "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=100&q=80"
                            }
                            alt={p.name}
                            className="h-10 w-10 shrink-0 rounded-lg object-cover border border-border"
                          />
                          <div>
                            <p className="font-semibold text-foreground line-clamp-1">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              SKU: {p.sku || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground capitalize">
                        {p.categorySlug.replace(/-/g, " ")}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {isEditing ? (
                          <input
                            type="number"
                            value={tempRegular}
                            onChange={(e) => setTempRegular(Number(e.target.value))}
                            className="a-input h-8 w-20 text-xs"
                          />
                        ) : (
                          formatBDT(p.regularPrice)
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={tempSale ?? ""}
                            onChange={(e) =>
                              setTempSale(e.target.value ? Number(e.target.value) : null)
                            }
                            placeholder="None"
                            className="a-input h-8 w-20 text-xs"
                          />
                        ) : isOnSale ? (
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatBDT(p.salePrice!)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No Discount</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isOnSale ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Zap className="h-3 w-3" />
                            {discountPct}% OFF
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                updateProductPrice.mutate({
                                  product: p,
                                  regularPrice: tempRegular,
                                  salePrice: tempSale,
                                });
                              }}
                              className="a-btn a-btn-primary h-7 px-2.5 text-xs"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPriceId(null)}
                              className="a-btn a-btn-ghost h-7 px-2 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => applyDiscountPercent(p, 10)}
                              className="rounded-md bg-secondary/80 px-2 py-1 text-[11px] font-semibold hover:bg-secondary hover:text-foreground"
                            >
                              10% Off
                            </button>
                            <button
                              type="button"
                              onClick={() => applyDiscountPercent(p, 15)}
                              className="rounded-md bg-secondary/80 px-2 py-1 text-[11px] font-semibold hover:bg-secondary hover:text-foreground"
                            >
                              15% Off
                            </button>
                            <button
                              type="button"
                              onClick={() => applyDiscountPercent(p, 20)}
                              className="rounded-md bg-secondary/80 px-2 py-1 text-[11px] font-semibold hover:bg-secondary hover:text-foreground"
                            >
                              20% Off
                            </button>

                            {isOnSale && (
                              <button
                                type="button"
                                onClick={() => removeDiscount(p)}
                                className="rounded-md bg-rose-500/10 text-rose-600 px-2 py-1 text-[11px] font-semibold hover:bg-rose-500/20"
                              >
                                Remove
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setEditingPriceId(p.id);
                                setTempRegular(p.regularPrice);
                                setTempSale(p.salePrice);
                              }}
                              className="a-btn a-btn-ghost h-7 px-2 text-xs"
                            >
                              Custom
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
