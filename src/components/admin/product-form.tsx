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
  "Sizes & colours",
  "Inventory",
  "Details",
  "Visibility",
  "SEO",
] as const;
type Tab = (typeof TABS)[number];

const BASE_SIZES = ["S", "M", "L", "XL", "XXL"];

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
    const next = customSize.trim().toUpperCase();
    if (!next || form.sizes.includes(next)) return;
    set({ sizes: [...form.sizes, next] });
    setCustomSize("");
  }

  function updateColor(index: number, patch: Partial<ProductColor>) {
    const colors = form.colors.map((c, i) => (i === index ? { ...c, ...patch } : c));
    set({ colors });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close product form"
        onClick={onCancel}
        className="absolute inset-0 bg-foreground/40"
      />
      <div className="relative flex h-full w-full max-w-3xl flex-col border-l border-border bg-card">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">
              {editing ? "Edit product" : "New product"}
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              {form.name || "Untitled product"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="a-btn a-btn-ghost a-btn-icon"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="a-scroll border-b border-border bg-secondary">
          <div className="flex min-w-max gap-1 px-2 py-2">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`a-btn ${tab === t ? "a-btn-primary" : "a-btn-ghost"}`}
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
          className="flex-1 overflow-y-auto px-4 py-5"
        >
          {tab === "Basic" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Product name" hint="Shown across the storefront.">
                <input
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  className="a-input"
                  placeholder="Oxford Cotton Shirt"
                />
              </Field>
              <Field label="URL slug" hint="Leave blank to generate from the name.">
                <input
                  value={form.slug}
                  onChange={(e) => set({ slug: e.target.value })}
                  className="a-input"
                  placeholder={slugify(form.name) || "oxford-cotton-shirt"}
                />
              </Field>
              <Field label="Category" hint="Drives storefront navigation and filters.">
                <select
                  value={form.categorySlug}
                  onChange={(e) => set({ categorySlug: e.target.value })}
                  className="a-input"
                >
                  <option value="">Select a category…</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="SKU" hint="Your internal stock reference.">
                <input
                  value={form.sku}
                  onChange={(e) => set({ sku: e.target.value })}
                  className="a-input"
                />
              </Field>
              <div className="md:col-span-2">
                <Field
                  label="Short description"
                  hint="One or two lines used on cards and previews."
                >
                  <textarea
                    rows={3}
                    value={form.shortDescription}
                    onChange={(e) => set({ shortDescription: e.target.value })}
                    className="a-input"
                  />
                </Field>
              </div>
            </div>
          )}

          {tab === "Pricing" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Regular price (৳)">
                <input
                  type="number"
                  min={0}
                  value={form.regularPrice}
                  onChange={(e) => set({ regularPrice: Number(e.target.value) })}
                  className="a-input"
                />
              </Field>
              <Field label="Sale price (৳)" hint="Leave empty for no discount.">
                <input
                  type="number"
                  min={0}
                  value={form.salePrice ?? ""}
                  onChange={(e) =>
                    set({ salePrice: e.target.value ? Number(e.target.value) : null })
                  }
                  className="a-input"
                />
              </Field>
              <div className="a-card p-3 md:col-span-2">
                <p className="text-xs text-muted-foreground">Customer sees</p>
                <p className="mt-1 text-sm">
                  {form.salePrice && form.salePrice < form.regularPrice ? (
                    <>
                      <span className="font-medium">{formatBDT(form.salePrice)}</span>{" "}
                      <span className="text-muted-foreground line-through">
                        {formatBDT(form.regularPrice)}
                      </span>{" "}
                      <span className="a-badge a-badge-accent ml-1">
                        {Math.round(
                          ((form.regularPrice - form.salePrice) / form.regularPrice) * 100,
                        ) || 0}
                        % off
                      </span>
                    </>
                  ) : (
                    <span className="font-medium">{formatBDT(form.regularPrice)}</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {tab === "Images" && (
            <Field
              label="Product images"
              hint="Drag a tile to reorder. The first image is the cover. Uploaded to Cloudinary and compressed automatically."
            >
              <ImageGalleryUploader
                urls={form.images}
                publicIds={form.imagePublicIds ?? []}
                onChange={(urls, publicIds) => set({ images: urls, imagePublicIds: publicIds })}
              />
            </Field>
          )}

          {tab === "Sizes & colours" && (
            <div className="space-y-6">
              <div>
                <p className="a-label">Sizes</p>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => {
                    const on = form.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`a-btn ${on ? "a-btn-primary" : "a-btn-outline"} min-w-[3rem]`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomSize();
                      }
                    }}
                    placeholder="Add a custom size, e.g. 3XL"
                    className="a-input max-w-xs"
                  />
                  <button type="button" onClick={addCustomSize} className="a-btn a-btn-outline">
                    Add size
                  </button>
                </div>
                <p className="a-hint">Selected: {form.sizes.join(", ") || "none"}</p>
              </div>

              <div>
                <p className="a-label">Colours</p>
                <div className="space-y-2">
                  {form.colors.map((c, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2">
                      <input
                        value={c.name}
                        onChange={(e) => updateColor(i, { name: e.target.value })}
                        placeholder="Colour name"
                        className="a-input min-w-0 flex-1"
                      />
                      <input
                        type="color"
                        value={/^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex : "#000000"}
                        onChange={(e) => updateColor(i, { hex: e.target.value })}
                        className="h-11 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-card"
                        aria-label="Colour picker"
                      />
                      <input
                        value={c.hex}
                        onChange={(e) => updateColor(i, { hex: e.target.value })}
                        placeholder="#000000"
                        className="a-input w-28 shrink-0"
                      />
                      <button
                        type="button"
                        onClick={() => set({ colors: form.colors.filter((_, j) => j !== i) })}
                        className="a-btn a-btn-danger shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => set({ colors: [...form.colors, { name: "", hex: "#000000" }] })}
                  className="a-btn a-btn-outline mt-3"
                >
                  Add colour
                </button>
              </div>
            </div>
          )}

          {tab === "Inventory" && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Stock quantity" hint="Reduced automatically when an order is placed.">
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => set({ stock: Number(e.target.value) })}
                  className="a-input"
                />
              </Field>
              <Field label="Sort order" hint="Lower numbers appear first in listings.">
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => set({ sortOrder: Number(e.target.value) })}
                  className="a-input"
                />
              </Field>
            </div>
          )}

          {tab === "Details" && (
            <Field label="Full description" hint="Fabric, fit, care instructions.">
              <textarea
                rows={10}
                value={form.fullDescription}
                onChange={(e) => set({ fullDescription: e.target.value })}
                className="a-input"
              />
            </Field>
          )}

          {tab === "Visibility" && (
            <div className="grid gap-3 md:grid-cols-2">
              <ToggleRow
                label="Active"
                hint="Visible on the storefront."
                checked={form.active}
                onChange={(v) => set({ active: v })}
              />
              <ToggleRow
                label="Featured"
                hint="Shown in the featured homepage row."
                checked={form.featured}
                onChange={(v) => set({ featured: v })}
              />
              <ToggleRow
                label="Best seller"
                hint="Adds a best-seller placement."
                checked={form.bestSeller}
                onChange={(v) => set({ bestSeller: v })}
              />
              <ToggleRow
                label="New arrival"
                hint="Adds a new-arrival placement."
                checked={form.newArrival}
                onChange={(v) => set({ newArrival: v })}
              />
            </div>
          )}

          {tab === "SEO" && (
            <div className="space-y-4">
              <Field label="URL slug" hint="Used as the product page address.">
                <input
                  value={form.slug}
                  onChange={(e) => set({ slug: e.target.value })}
                  className="a-input"
                  placeholder={slugify(form.name)}
                />
              </Field>
              <Field
                label="Meta description"
                hint={`${form.shortDescription.length}/160 characters — this is the short description shown in search results.`}
              >
                <textarea
                  rows={3}
                  value={form.shortDescription}
                  onChange={(e) => set({ shortDescription: e.target.value })}
                  className="a-input"
                />
              </Field>
              <div className="a-card p-3">
                <p className="text-xs text-muted-foreground">Search preview</p>
                <p className="mt-2 truncate text-sm text-[color:var(--admin-info)]">
                  {form.name || "Product name"} — Trikon Clothing
                </p>
                <p className="text-xs text-muted-foreground">/product/{previewSlug || "slug"}</p>
                <p className="mt-1 line-clamp-2 text-xs">
                  {form.shortDescription || "Add a short description to control this snippet."}
                </p>
              </div>
            </div>
          )}
        </form>

        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-card px-4 py-3">
          <button type="button" onClick={onCancel} className="a-btn a-btn-outline">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => onSubmit({ ...form, active: false }, true)}
            className="a-btn a-btn-outline"
          >
            Save as draft
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="a-btn a-btn-primary"
          >
            {saving && <Spinner />}
            {editing ? "Save changes" : "Create product"}
          </button>
        </footer>
      </div>
    </div>
  );
}
