import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, X, Package } from "lucide-react";
import { supabase, type Product, type Category } from "@/lib/supabase";

export const Route = createFileRoute("/admin/products")({
  component: ProductsManagement,
});

type ProductWithCategory = Product & { categories: { name: string } | null };

function ProductsManagement() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductWithCategory | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });
    setProducts((data as ProductWithCategory[]) ?? []);
    const { data: cats } = await supabase.from("categories").select("*").order("name");
    setCategories(cats ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  }

  function handleEdit(p: ProductWithCategory) {
    setEditing(p);
    setShowForm(true);
  }

  function handleAdd() {
    setEditing(null);
    setShowForm(true);
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} products in your store
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Add Product
        </button>
      </div>

      <div className="mt-6 flex items-center gap-2 border border-border bg-background px-3 py-2">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="mt-4 border border-border bg-background">
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Loading products...
          </p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <Package className="size-12 text-muted-foreground/30" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">
              {products.length === 0
                ? "No products yet. Click 'Add Product' to create your first one."
                : "No products match your search."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="size-10 border border-border object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {p.categories?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-semibold">৳{Number(p.price).toLocaleString()}</span>
                      {Number(p.old_price) > 0 && (
                        <span className="ml-1.5 text-xs text-muted-foreground line-through">
                          ৳{Number(p.old_price).toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(p)}
                          className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: ProductWithCategory | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [oldPrice, setOldPrice] = useState(String(product?.old_price ?? ""));
  const [image, setImage] = useState(product?.image ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [sizes, setSizes] = useState((product?.sizes ?? []).join(", "));
  const [colors, setColors] = useState(
    (product?.colors ?? []).map((c) => `${c.name}:${c.hex}`).join(", "),
  );
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const slugValue = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const sizesArr = sizes.split(",").map((s) => s.trim()).filter(Boolean);
    const colorsArr = colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const [name, hex] = c.split(":").map((p) => p.trim());
        return { name: name ?? c, hex: hex ?? "#000000" };
      });

    const payload = {
      slug: slugValue,
      name,
      category_id: categoryId || null,
      price: Number(price) || 0,
      old_price: Number(oldPrice) || 0,
      image: image || null,
      sku: sku || null,
      description: description || null,
      sizes: sizesArr,
      colors: colorsArr,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    if (product) {
      await supabase.from("products").update(payload).eq("id", product.id);
    } else {
      await supabase.from("products").insert({
        ...payload,
        gallery: [image].filter(Boolean),
        details: [],
        rating: 0,
        reviews: 0,
      });
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-2xl bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Slug (optional)
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated from name"
                className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Price (৳)
              </label>
              <input
                required
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Old Price (৳)
              </label>
              <input
                type="number"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Image URL
              </label>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                SKU
              </label>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sizes (comma separated)
            </label>
            <input
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              placeholder="S, M, L, XL"
              className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Colors (name:hex, comma separated)
            </label>
            <input
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="Olive:#6b7a34, Black:#1c1c1c"
              className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-ring"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4"
            />
            <span className="text-sm font-medium">Active (visible in store)</span>
          </label>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary px-6 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : product ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
