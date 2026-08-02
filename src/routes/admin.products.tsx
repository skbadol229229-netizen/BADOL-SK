import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  ActiveBadge,
  AdminEmpty,
  AdminError,
  ConfirmDialog,
  Pager,
  SectionCard,
  StockBadge,
  TableSkeleton,
} from "@/components/admin/ui";
import { ProductForm, slugify } from "@/components/admin/product-form";
import type { Product } from "@/data/types";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminListCategories,
  adminListProducts,
  adminSetProductActive,
  adminUpdateProduct,
  type ProductInput,
} from "@/lib/admin";
import { formatBDT } from "@/lib/format";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [
      { title: "Products — Trikon Admin" },
      { name: "description", content: "Create, edit and manage the Trikon product catalogue." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Products — Trikon Admin" },
      { property: "og:description", content: "Catalogue management." },
    ],
  }),
  component: AdminProductsPage,
});

const PAGE_SIZE = 12;

const emptyProduct: ProductInput = {
  name: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  categorySlug: "",
  images: [],
  imagePublicIds: [],
  regularPrice: 0,
  salePrice: null,
  sizes: [],
  colors: [],
  stock: 0,
  sku: "",
  featured: false,
  bestSeller: false,
  newArrival: false,
  active: true,
  sortOrder: 0,
};

function toInput(p: Product): ProductInput {
  const { id: _id, createdAt: _createdAt, ...rest } = p;
  return rest;
}

function AdminProductsPage() {
  const queryClient = useQueryClient();
  const products = useQuery({ queryKey: ["admin-products"], queryFn: adminListProducts });
  const categories = useQuery({ queryKey: ["admin-categories"], queryFn: adminListCategories });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductInput | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<"all" | "active" | "draft">("all");
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    queryClient.invalidateQueries({ queryKey: ["admin-low-stock"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["home-sections"] });
    queryClient.invalidateQueries({ queryKey: ["product-facets"] });
  };

  const save = useMutation({
    mutationFn: async (input: ProductInput) => {
      if (editingId) await adminUpdateProduct(editingId, input);
      else await adminCreateProduct(input);
    },
    onSuccess: () => {
      toast.success(editingId ? "Product updated" : "Product created");
      setForm(null);
      setEditingId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => {
      toast.success("Product deleted");
      setPendingDelete(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminSetProductActive(id, active),
    onSuccess: () => invalidate(),
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (products.data ?? []).filter((p) => {
      if (category !== "all" && p.categorySlug !== category) return false;
      if (status === "active" && !p.active) return false;
      if (status === "draft" && p.active) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categorySlug.includes(q)
      );
    });
  }, [products.data, search, category, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function startCreate() {
    setEditingId(null);
    setForm({ ...emptyProduct, categorySlug: categories.data?.[0]?.slug ?? "" });
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm(toInput(p));
  }

  function submit(input: ProductInput, asDraft: boolean) {
    if (!input.name.trim()) return toast.error("Name is required");
    if (!input.categorySlug) return toast.error("Pick a category");
    save.mutate({
      ...input,
      active: asDraft ? false : input.active,
      slug: input.slug.trim() || slugify(input.name),
      regularPrice: Number(input.regularPrice) || 0,
      salePrice: input.salePrice ? Number(input.salePrice) : null,
      stock: Number(input.stock) || 0,
      sortOrder: Number(input.sortOrder) || 0,
    });
  }

  return (
    <AdminShell
      title="Products"
      description="Everything in the catalogue, including drafts."
      actions={
        <button type="button" onClick={startCreate} className="a-btn a-btn-primary">
          <Plus className="h-4 w-4" />
          New product
        </button>
      }
    >
      <SectionCard title="Catalogue" description={`${filtered.length} product(s)`}>
        <div className="mb-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, SKU or category"
              className="a-input pl-9"
            />
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="a-input sm:w-44"
          >
            <option value="all">All categories</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as typeof status);
              setPage(1);
            }}
            className="a-input sm:w-36"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {products.isPending ? (
          <TableSkeleton rows={6} />
        ) : products.isError ? (
          <AdminError
            message={(products.error as Error).message}
            onRetry={() => products.refetch()}
          />
        ) : rows.length === 0 ? (
          <AdminEmpty
            title="No products match these filters"
            description="Adjust the search, or create a new product."
            action={
              <button type="button" onClick={startCreate} className="a-btn a-btn-primary">
                <Plus className="h-4 w-4" />
                New product
              </button>
            }
          />
        ) : (
          <div className="a-scroll -mx-4">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="hidden md:table-cell">Category</th>
                  <th>Price</th>
                  <th className="hidden sm:table-cell">Stock</th>
                  <th className="hidden lg:table-cell">Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="flex min-w-0 items-center gap-3">
                        {p.images[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="h-11 w-11 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-secondary">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block max-w-[16rem] truncate text-sm font-medium">
                            {p.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {p.sku || "No SKU"}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell text-muted-foreground">{p.categorySlug}</td>
                    <td className="tabular-nums">
                      {p.salePrice && p.salePrice < p.regularPrice ? (
                        <span className="whitespace-nowrap">
                          {formatBDT(p.salePrice)}{" "}
                          <span className="text-xs text-muted-foreground line-through">
                            {formatBDT(p.regularPrice)}
                          </span>
                        </span>
                      ) : (
                        formatBDT(p.regularPrice)
                      )}
                    </td>
                    <td className="hidden sm:table-cell">
                      <StockBadge stock={p.stock} />
                    </td>
                    <td className="hidden lg:table-cell">
                      <ActiveBadge active={p.active} />
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => toggleActive.mutate({ id: p.id, active: !p.active })}
                          className="a-btn a-btn-ghost"
                        >
                          {p.active ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="a-btn a-btn-ghost a-btn-icon"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(p)}
                          className="a-btn a-btn-ghost a-btn-icon text-destructive"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pager page={current} pageCount={pageCount} total={filtered.length} onPage={setPage} />
      </SectionCard>

      {form && (
        <ProductForm
          value={form}
          categories={categories.data ?? []}
          editing={Boolean(editingId)}
          saving={save.isPending}
          onChange={setForm}
          onSubmit={submit}
          onCancel={() => {
            setForm(null);
            setEditingId(null);
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.name ?? "product"}?`}
        description="This permanently removes the product from the catalogue."
        busy={remove.isPending}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </AdminShell>
  );
}
