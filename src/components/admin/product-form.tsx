import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { ImageGalleryUploader } from "@/components/admin/image-gallery-uploader";
import { Field } from "@/components/admin/admin-shell";
import { Spinner, ToggleRow } from "@/components/admin/ui";
import type { Category, ProductColor } from "@/data/types";
import type { ProductInput } from "@/lib/admin";
import { formatBDT } from "@/lib/format";

const TABS = [
  "Basic",
  "Pricing",
  "Images",
  "Pack Sizes",
  "Inventory",
  "Details",
  "Visibility",
  "SEO",
] as const;
type Tab = (typeof TABS)[number];

const BASE_SIZES = ["250g", "500g", "1kg", "2kg", "5kg", "500ml", "1 Liter", "5 Liters"];

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({
  value,
  categories,
  editing,
  saving,
  onChange,
  onSubmit,
  onCancel,
}: {
  value: ProductInput;
  categories: Category[];
  editing: boolean;
  saving: boolean;
  onChange: (next: ProductInput) => void;
  onSubmit: (input: ProductInput, asDraft: boolean) => void;
  onCancel: () => void;
}) {
  const [tab, setTab] = useState<Tab>("Basic");
  const [customSize, setCustomSize] = useState("");
  const form = value;
  const set = (patch: Partial<ProductInput>) => onChange({ ...form, ...patch });

  const previewSlug = form.slug.trim() || slugify(form.name);
  const sizeOptions = useMemo(() => [...new Set([...BASE_SIZES, ...form.sizes])], [form.sizes]);

  function toggleSize(size: string) {
    set({
      sizes: form.sizes.includes(size)
        ? form.sizes.filter((s) => s !== size)
        : [...form.sizes, size],
    });
  }

  function addCustomSize() {
    const next = customSize.trim();
    if (!next || form.sizes.includes(next)) return;
    set({ sizes: [...form.sizes, next] });
    setCustomSize("");
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      {/* Overlay Backdrop */}
      <div
        aria-hidden="true"
        onClick={onCancel}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Popup Modal Box */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-foreground">
              {editing ? "Edit Organic Product" : "Add New Organic Product"}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {form.name || "Untitled Product"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="a-btn a-btn-ghost a-btn-icon rounded-full hover:bg-secondary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="a-scroll border-b border-border bg-secondary/60">
          <div className="flex min-w-max gap-1 px-3 py-2">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`a-btn text-xs ${tab === t ? "a-btn-primary bg-primary text-primary-foreground font-semibold" : "a-btn-ghost"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <form
          id="product-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form, false);
          }}
          className="flex-1 overflow-y-auto px-5 py-6 space-y-4"
        >
          {tab === "Basic" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Product Name" hint="Shown across the storefront.">
                <input
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  className="a-input mt-1"
                  placeholder="Sundarban Raw Wild Honey"
                />
              </Field>
              <Field label="URL Slug" hint="Leave blank to generate from the name.">
                <input
                  value={form.slug}
                  onChange={(e) => set({ slug: e.target.value })}
                  className="a-input mt-1"
                  placeholder={slugify(form.name) || "sundarban-raw-wild-honey"}
                />
              </Field>
              <Field label="Organic Category" hint="Drives storefront navigation & filters.">
                <select
                  value={form.categorySlug}
                  onChange={(e) => set({ categorySlug: e.target.value })}
                  className="a-input mt-1"
                >
                  <option value="">Select a category…</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="SKU / Item Code" hint="Your internal stock reference.">
                <input
                  value={form.sku}
                  onChange={(e) => set({ sku: e.target.value })}
                  className="a-input mt-1"
                  placeholder="HNY-SND-01"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Short Description" hint="Used on product cards & order summary.">
                  <textarea
                    rows={3}
                    value={form.shortDescription}
                    onChange={(e) => set({ shortDescription: e.target.value })}
                    className="a-input mt-1"
                    placeholder="100% Pure, unrefined raw forest honey direct from Sundarban."
                  />
                </Field>
              </div>
            </div>
          )}

          {tab === "Pricing" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Regular Price (৳)">
                <input
                  type="number"
                  min={0}
                  value={form.regularPrice}
                  onChange={(e) => set({ regularPrice: Number(e.target.value) })}
                  className="a-input mt-1"
                />
              </Field>
              <Field label="Offer / Discount Price (৳)" hint="Leave empty if no discount.">
                <input
                  type="number"
                  min={0}
                  value={form.salePrice ?? ""}
                  onChange={(e) =>
                    set({ salePrice: e.target.value ? Number(e.target.value) : null })
                  }
                  className="a-input mt-1"
                />
              </Field>
              <div className="a-card p-4 md:col-span-2 bg-secondary/30 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground font-medium">Customer Price Preview</p>
                <p className="mt-1 text-base font-semibold">
                  {form.salePrice && form.salePrice < form.regularPrice ? (
                    <>
                      <span className="text-primary">{formatBDT(form.salePrice)}</span>{" "}
                      <span className="text-muted-foreground line-through text-sm">
                        {formatBDT(form.regularPrice)}
                      </span>{" "}
                      <span className="a-badge a-badge-accent ml-2 bg-accent text-accent-foreground">
                        {Math.round(
                          ((form.regularPrice - form.salePrice) / form.regularPrice) * 100,
                        ) || 0}
                        % OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-primary">{formatBDT(form.regularPrice)}</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {tab === "Images" && (
            <Field
              label="Product Gallery Images"
              hint="Upload high quality product photos. First image is used as thumbnail."
            >
              <div className="mt-2">
                <ImageGalleryUploader
                  urls={form.images}
                  publicIds={form.imagePublicIds ?? []}
                  onChange={(urls, publicIds) => set({ images: urls, imagePublicIds: publicIds })}
                />
              </div>
            </Field>
          )}

          {tab === "Pack Sizes" && (
            <div className="space-y-4">
              <div>
                <p className="a-label">Available Weights & Pack Sizes</p>
                <p className="a-hint mb-3">
                  Select available weight packages for this item (e.g. 500g, 1kg, 1 Liter).
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => {
                    const on = form.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`a-btn ${on ? "a-btn-primary bg-primary text-primary-foreground font-medium" : "a-btn-outline"} min-w-[3.5rem]`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSize();
                      }
                    }}
                    placeholder="Custom pack size, e.g. 250ml or 1 Dozen"
                    className="a-input max-w-xs"
                  />
                  <button type="button" onClick={addCustomSize} className="a-btn a-btn-outline">
                    Add Size
                  </button>
                </div>
                <p className="a-hint mt-2">
                  Selected:{" "}
                  <strong className="text-foreground">{form.sizes.join(", ") || "None"}</strong>
                </p>
              </div>
            </div>
          )}

          {tab === "Inventory" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Stock Quantity (Items/Kg)" hint="Stock decreases on user order.">
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => set({ stock: Number(e.target.value) })}
                  className="a-input mt-1"
                />
              </Field>
              <Field label="Sort Priority" hint="Lower number appears first on homepage.">
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => set({ sortOrder: Number(e.target.value) })}
                  className="a-input mt-1"
                />
              </Field>
            </div>
          )}

          {tab === "Details" && (
            <Field
              label="Full Description & Organic Purity Notes"
              hint="Detail ingredients, source, nutritional benefits, harvest process & storage guidelines."
            >
              <textarea
                rows={9}
                value={form.fullDescription}
                onChange={(e) => set({ fullDescription: e.target.value })}
                className="a-input mt-1"
                placeholder="100% natural and pesticide-free. Processed naturally without heat..."
              />
            </Field>
          )}

          {tab === "Visibility" && (
            <div className="grid gap-3 md:grid-cols-2">
              <ToggleRow
                label="Active Status"
                hint="Visible to customers on website."
                checked={form.active}
                onChange={(v) => set({ active: v })}
              />
              <ToggleRow
                label="Featured Product"
                hint="Highlight on home page featured list."
                checked={form.featured}
                onChange={(v) => set({ featured: v })}
              />
              <ToggleRow
                label="Best Seller Badge"
                hint="Display Best Seller tag."
                checked={form.bestSeller}
                onChange={(v) => set({ bestSeller: v })}
              />
              <ToggleRow
                label="New Harvest / Arrival"
                hint="Display New Harvest badge."
                checked={form.newArrival}
                onChange={(v) => set({ newArrival: v })}
              />
            </div>
          )}

          {tab === "SEO" && (
            <div className="space-y-4">
              <Field label="URL Slug" hint="Used in address bar.">
                <input
                  value={form.slug}
                  onChange={(e) => set({ slug: e.target.value })}
                  className="a-input mt-1"
                  placeholder={slugify(form.name)}
                />
              </Field>
              <Field label="Meta Description" hint="Snippet shown in search result previews.">
                <textarea
                  rows={3}
                  value={form.shortDescription}
                  onChange={(e) => set({ shortDescription: e.target.value })}
                  className="a-input mt-1"
                />
              </Field>
              <div className="a-card p-4 bg-secondary/30 rounded-xl border border-border">
                <p className="text-xs text-muted-foreground font-medium">Google Search Preview</p>
                <p className="mt-1 truncate text-sm font-semibold text-primary">
                  {form.name || "Product Name"} — PureBengal Organic
                </p>
                <p className="text-xs text-muted-foreground">/product/{previewSlug || "slug"}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {form.shortDescription || "Pure Organic food products from Bangladesh."}
                </p>
              </div>
            </div>
          )}
        </form>

        <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-border bg-card px-5 py-4">
          <button type="button" onClick={onCancel} className="a-btn a-btn-outline">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onSubmit({ ...form, active: false }, true)}
            className="a-btn a-btn-outline"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="a-btn a-btn-primary bg-primary text-primary-foreground font-medium"
          >
            {saving && <Spinner />}
            {editing ? "Save Changes" : "Create Product"}
          </button>
        </footer>
      </div>
    </div>
  );
}
