import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Tags, Eye, EyeOff } from "lucide-react";
import { supabase, type Category } from "@/lib/supabase";

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesManagement,
});

function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Products in it will remain but lose their category link.")) return;
    await supabase.from("categories").delete().eq("id", id);
    load();
  }

  async function toggleActive(cat: Category) {
    await supabase.from("categories").update({ is_active: !cat.is_active }).eq("id", cat.id);
    load();
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length} categories in your store
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Add Category
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full px-5 py-10 text-center text-sm text-muted-foreground">
            Loading categories...
          </p>
        ) : categories.length === 0 ? (
          <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center">
            <Tags className="size-12 text-muted-foreground/30" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">
              No categories yet. Click 'Add Category' to create your first one.
            </p>
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="border border-border bg-background p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="size-12 border border-border object-cover"
                    />
                  ) : (
                    <div className="grid size-12 place-items-center border border-border bg-muted">
                      <Tags className="size-5 text-muted-foreground/40" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(cat)}
                  className={`grid size-8 place-items-center rounded ${
                    cat.is_active
                      ? "text-green-600 hover:bg-green-50"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  aria-label={cat.is_active ? "Deactivate" : "Activate"}
                >
                  {cat.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    cat.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {cat.is_active ? "Active" : "Inactive"}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditing(cat);
                      setShowForm(true);
                    }}
                    className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Edit"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <CategoryForm
          category={editing}
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

function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [sortOrder, setSortOrder] = useState(String(category?.sort_order ?? 0));
  const [isActive, setIsActive] = useState(category?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const slugValue = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const payload = {
      name,
      slug: slugValue,
      image: image || null,
      sort_order: Number(sortOrder) || 0,
      is_active: isActive,
    };

    if (category) {
      await supabase.from("categories").update(payload).eq("id", category.id);
    } else {
      await supabase.from("categories").insert(payload);
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-md bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold">
            {category ? "Edit Category" : "Add Category"}
          </h2>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
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
              Sort Order
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring"
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
              {saving ? "Saving..." : category ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
