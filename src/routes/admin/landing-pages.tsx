import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plus,
  Copy,
  Trash2,
  Search,
  Rocket,
  Eye,
  EyeOff,
  ExternalLink,
  Pencil,
  X,
  Layers,
} from "lucide-react";
import { supabase, type LandingPage, type Product } from "@/lib/supabase";

export const Route = createFileRoute("/admin/landing-pages")({
  component: LandingPagesList,
});

type LandingPageWithProduct = LandingPage & { products: { name: string; image: string | null } | null };

function LandingPagesList() {
  const [pages, setPages] = useState<LandingPageWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("landing_pages")
      .select("*, products(name, image)")
      .order("created_at", { ascending: false });
    setPages((data as LandingPageWithProduct[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function togglePublish(page: LandingPage) {
    await supabase
      .from("landing_pages")
      .update({ is_published: !page.is_published, updated_at: new Date().toISOString() })
      .eq("id", page.id);
    load();
  }

  async function duplicate(page: LandingPage) {
    const newSlug = `${page.slug}-copy-${Date.now().toString(36).slice(-4)}`;
    const { data: newPage } = await supabase
      .from("landing_pages")
      .insert({
        slug: newSlug,
        product_id: page.product_id,
        title: `${page.title} (Copy)`,
        is_published: false,
        seo_title: page.seo_title,
        meta_description: page.meta_description,
        og_image: page.og_image,
        canonical_url: page.canonical_url,
        facebook_pixel: page.facebook_pixel,
        google_analytics: page.google_analytics,
        google_tag_manager: page.google_tag_manager,
        tiktok_pixel: page.tiktok_pixel,
        custom_header_script: page.custom_header_script,
        custom_footer_script: page.custom_footer_script,
      })
      .select()
      .single();

    const { data: sections } = await supabase
      .from("landing_page_sections")
      .select("*")
      .eq("landing_page_id", page.id)
      .order("sort_order");

    if (newPage && sections && sections.length > 0) {
      await supabase
        .from("landing_page_sections")
        .insert(
          sections.map((s) => ({
            landing_page_id: newPage.id,
            section_type: s.section_type,
            title: s.title,
            is_enabled: s.is_enabled,
            sort_order: s.sort_order,
            config: s.config,
          })),
        );
    }
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this landing page? This cannot be undone.")) return;
    await supabase.from("landing_pages").delete().eq("id", id);
    load();
  }

  const filtered = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Landing Pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pages.length} landing pages · {pages.filter((p) => p.is_published).length} published
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Create Landing Page
        </button>
      </div>

      <div className="mt-6 flex items-center gap-2 border border-border bg-background px-3 py-2">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search landing pages..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Rocket className="size-12 text-muted-foreground/30" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">
              {pages.length === 0
                ? "No landing pages yet. Create one to start your marketing campaigns."
                : "No pages match your search."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((page) => (
              <div
                key={page.id}
                className="border border-border bg-background transition-shadow hover:shadow-md"
              >
                <div className="relative h-32 overflow-hidden border-b border-border bg-muted">
                  {page.products?.image ? (
                    <img
                      src={page.products.image}
                      alt={page.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <Rocket className="size-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <span
                    className={`absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      page.is_published
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {page.is_published ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold">{page.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">/l/{page.slug}</p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold">{page.views}</p>
                      <p className="text-[11px] uppercase text-muted-foreground">Views</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{page.orders_count}</p>
                      <p className="text-[11px] uppercase text-muted-foreground">Orders</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-orange-500">{page.incomplete_orders_count}</p>
                      <p className="text-[11px] uppercase text-muted-foreground">Incomplete</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
                    <Link
                      to="/admin/landing-pages/$slug/edit"
                      params={{ slug: page.slug }}
                      className="inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Link>
                    <a
                      href={`/l/${page.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      <ExternalLink className="size-3.5" />
                      Preview
                    </a>
                    <button
                      onClick={() => duplicate(page)}
                      className="inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      <Copy className="size-3.5" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => togglePublish(page)}
                      className="inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      {page.is_published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      {page.is_published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="ml-auto inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && <CreateLandingPage onClose={() => setShowCreate(false)} onCreated={() => load()} />}
    </div>
  );
}

function CreateLandingPage({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [productId, setProductId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("products").select("*").order("name").then(({ data }) => {
      setProducts(data ?? []);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const slugValue =
      slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const { data, error } = await supabase
      .from("landing_pages")
      .insert({
        slug: slugValue,
        product_id: productId || null,
        title,
        is_published: false,
      })
      .select()
      .single();

    if (!error && data) {
      const defaultSections = [
        "hero_banner",
        "product_images",
        "product_features",
        "customer_reviews",
        "trust_badges",
        "order_form",
        "faq",
        "shipping_info",
        "sticky_buy_button",
        "footer",
      ];
      await supabase.from("landing_page_sections").insert(
        defaultSections.map((type, i) => ({
          landing_page_id: data.id,
          section_type: type,
          sort_order: i,
          config: {},
        })),
      );
    }

    setSaving(false);
    onCreated();
    if (data) navigate({ to: "/admin/landing-pages/$slug/edit", params: { slug: data.slug } });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-md bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Layers className="size-5" />
            New Landing Page
          </h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Page Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Premium Watch Campaign"
              className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              URL Slug
            </label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">/l/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated"
                className="h-10 flex-1 border border-border px-3 text-sm outline-none focus:border-ring"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Product (optional)
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring"
            >
              <option value="">None</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ৳{Number(p.price).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
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
              {saving ? "Creating..." : "Create & Edit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
