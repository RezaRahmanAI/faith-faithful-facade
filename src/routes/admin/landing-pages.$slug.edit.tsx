import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Settings,
  X,
  Rocket,
} from "lucide-react";
import { supabase, type LandingPage, type LandingPageSection, type Product } from "@/lib/supabase";

export const Route = createFileRoute("/admin/landing-pages/$slug/edit")({
  component: LandingPageBuilder,
});

const SECTION_TYPES: { type: string; label: string; icon: string }[] = [
  { type: "hero_banner", label: "Hero Banner", icon: "🖼️" },
  { type: "countdown_timer", label: "Countdown Timer", icon: "⏰" },
  { type: "offer_badge", label: "Offer Badge", icon: "🏷️" },
  { type: "product_images", label: "Product Images", icon: "📸" },
  { type: "product_video", label: "Product Video", icon: "🎥" },
  { type: "product_features", label: "Product Features", icon: "✨" },
  { type: "before_after", label: "Before / After", icon: "🔄" },
  { type: "customer_reviews", label: "Customer Reviews", icon: "⭐" },
  { type: "trust_badges", label: "Trust Badges", icon: "🛡️" },
  { type: "order_form", label: "Order Form", icon: "📝" },
  { type: "faq", label: "FAQ", icon: "❓" },
  { type: "shipping_info", label: "Shipping Information", icon: "🚚" },
  { type: "return_policy", label: "Return Policy", icon: "↩️" },
  { type: "sticky_buy_button", label: "Sticky Buy Button", icon: "📌" },
  { type: "floating_whatsapp", label: "Floating WhatsApp", icon: "💬" },
  { type: "floating_messenger", label: "Floating Messenger", icon: "💌" },
  { type: "footer", label: "Footer", icon: "📄" },
];

type Tab = "sections" | "settings" | "seo";

function LandingPageBuilder() {
  const { slug } = useParams({ from: "/admin/landing-pages/$slug/edit" });
  const [page, setPage] = useState<LandingPage | null>(null);
  const [sections, setSections] = useState<LandingPageSection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("sections");
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: pageData } = await supabase
      .from("landing_pages")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    setPage(pageData as LandingPage | null);

    if (pageData) {
      const { data: sectionData } = await supabase
        .from("landing_page_sections")
        .select("*")
        .eq("landing_page_id", pageData.id)
        .order("sort_order");
      setSections((sectionData as LandingPageSection[]) ?? []);
    }

    const { data: productData } = await supabase.from("products").select("*").order("name");
    setProducts(productData ?? []);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function moveSection(id: string, direction: "up" | "down") {
    const index = sections.findIndex((s) => s.id === id);
    if (index < 0) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const reordered = [...sections];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];

    const updates = reordered.map((s, i) => ({ id: s.id, sort_order: i }));
    for (const u of updates) {
      await supabase.from("landing_page_sections").update({ sort_order: u.sort_order }).eq("id", u.id);
    }
    setSections(reordered);
  }

  async function toggleSection(section: LandingPageSection) {
    const updated = sections.map((s) =>
      s.id === section.id ? { ...s, is_enabled: !s.is_enabled } : s,
    );
    setSections(updated);
    await supabase
      .from("landing_page_sections")
      .update({ is_enabled: !section.is_enabled })
      .eq("id", section.id);
  }

  async function deleteSection(id: string) {
    await supabase.from("landing_page_sections").delete().eq("id", id);
    setSections(sections.filter((s) => s.id !== id));
  }

  async function addSection(sectionType: string) {
    const newOrder = sections.length;
    const { data } = await supabase
      .from("landing_page_sections")
      .insert({
        landing_page_id: page!.id,
        section_type: sectionType,
        sort_order: newOrder,
        config: {},
      })
      .select()
      .single();
    if (data) setSections([...sections, data as LandingPageSection]);
    setShowAddSection(false);
  }

  async function updateSectionConfig(sectionId: string, config: Record<string, unknown>) {
    await supabase
      .from("landing_page_sections")
      .update({ config, updated_at: new Date().toISOString() })
      .eq("id", sectionId);
  }

  async function saveSettings(settings: Partial<LandingPage>) {
    setSaving(true);
    await supabase
      .from("landing_pages")
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq("id", page!.id);
    setSaving(false);
    load();
  }

  if (loading) {
    return <div className="p-20 text-center text-sm text-muted-foreground">Loading builder...</div>;
  }

  if (!page) {
    return <div className="p-20 text-center text-sm text-muted-foreground">Landing page not found.</div>;
  }

  const selectedProduct = products.find((p) => p.id === page.product_id);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/landing-pages"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <span className="text-border">|</span>
          <h1 className="text-sm font-bold">{page.title}</h1>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              page.is_published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
            }`}
          >
            {page.is_published ? "Published" : "Draft"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/l/${page.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
          >
            <Rocket className="size-3.5" />
            Preview
          </a>
          <button
            onClick={() => saveSettings({ is_published: !page.is_published })}
            className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
          >
            {page.is_published ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl p-4 md:p-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {(["sections", "settings", "seo"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors ${
                tab === t
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "seo" ? "SEO & Tracking" : t}
            </button>
          ))}
        </div>

        {/* Sections tab */}
        {tab === "sections" && (
          <div className="mt-6">
            {selectedProduct && (
              <div className="mb-4 flex items-center gap-3 border border-border bg-background p-3">
                {selectedProduct.image && (
                  <img src={selectedProduct.image} alt="" className="size-12 border border-border object-cover" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-bold">{selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ৳{Number(selectedProduct.price).toLocaleString()}
                    {Number(selectedProduct.old_price) > 0 && (
                      <span className="ml-1.5 line-through">
                        ৳{Number(selectedProduct.old_price).toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>
                <Link
                  to="/admin/products"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Change
                </Link>
              </div>
            )}

            <div className="space-y-2">
              {sections.map((section, index) => {
                const meta = SECTION_TYPES.find((t) => t.type === section.section_type);
                return (
                  <div
                    key={section.id}
                    className={`flex items-center gap-2 border border-border bg-background p-3 transition-opacity ${
                      !section.is_enabled ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveSection(section.id, "up")}
                        disabled={index === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                      >
                        <ChevronUp className="size-4" />
                      </button>
                      <GripVertical className="size-4 text-muted-foreground/30" />
                      <button
                        onClick={() => moveSection(section.id, "down")}
                        disabled={index === sections.length - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-20"
                      >
                        <ChevronDown className="size-4" />
                      </button>
                    </div>

                    <span className="text-lg">{meta?.icon ?? "📦"}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {section.title || meta?.label || section.section_type}
                      </p>
                      <p className="text-xs text-muted-foreground">{section.section_type}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                        className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Settings className="size-4" />
                      </button>
                      <button
                        onClick={() => toggleSection(section)}
                        className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-muted"
                      >
                        {section.is_enabled ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </button>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    {editingSection === section.id && (
                      <SectionEditor
                        section={section}
                        onClose={() => setEditingSection(null)}
                        onSave={(config, title) => {
                          updateSectionConfig(section.id, config);
                          supabase
                            .from("landing_page_sections")
                            .update({ title })
                            .eq("id", section.id);
                          setSections(
                            sections.map((s) =>
                              s.id === section.id ? { ...s, config, title } : s,
                            ),
                          );
                          setEditingSection(null);
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowAddSection(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 border-2 border-dashed border-border py-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="size-4" />
              Add Section
            </button>

            {showAddSection && (
              <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
                <div className="my-8 w-full max-w-lg bg-background shadow-2xl">
                  <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="text-lg font-bold">Add Section</h2>
                    <button onClick={() => setShowAddSection(false)} className="grid size-8 place-items-center rounded hover:bg-muted">
                      <X className="size-5" />
                    </button>
                  </div>
                  <div className="grid max-h-[60vh] gap-2 overflow-y-auto p-6 sm:grid-cols-2">
                    {SECTION_TYPES.map((s) => (
                      <button
                        key={s.type}
                        onClick={() => addSection(s.type)}
                        className="flex items-center gap-3 border border-border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
                      >
                        <span className="text-xl">{s.icon}</span>
                        <span className="text-sm font-semibold">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings tab */}
        {tab === "settings" && page && (
          <SettingsTab page={page} products={products} onSave={saveSettings} saving={saving} />
        )}

        {/* SEO tab */}
        {tab === "seo" && page && <SeoTab page={page} onSave={saveSettings} saving={saving} />}
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  onClose,
  onSave,
}: {
  section: LandingPageSection;
  onClose: () => void;
  onSave: (config: Record<string, unknown>, title: string) => void;
}) {
  const [title, setTitle] = useState(section.title ?? "");
  const [configJson, setConfigJson] = useState(() => {
    try {
      return JSON.stringify(section.config, null, 2);
    } catch {
      return "{}";
    }
  });
  const [error, setError] = useState("");

  function handleSave() {
    try {
      const parsed = JSON.parse(configJson);
      onSave(parsed, title);
    } catch {
      setError("Invalid JSON");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-lg bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold">Edit Section</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Section Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Section Config (JSON)
            </label>
            <textarea
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              rows={10}
              className="w-full border border-border px-3 py-2 font-mono text-xs outline-none focus:border-ring"
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">
              Cancel
            </button>
            <button onClick={handleSave} className="bg-primary px-6 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({
  page,
  products,
  onSave,
  saving,
}: {
  page: LandingPage;
  products: Product[];
  onSave: (s: Partial<LandingPage>) => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [productId, setProductId] = useState(page.product_id ?? "");

  return (
    <div className="mt-6 space-y-4 border border-border bg-background p-6">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Page Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
            className="h-10 flex-1 border border-border px-3 text-sm outline-none focus:border-ring"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Linked Product
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
      <button
        onClick={() => onSave({ title, slug, product_id: productId || null })}
        disabled={saving}
        className="bg-primary px-6 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

function SeoTab({
  page,
  onSave,
  saving,
}: {
  page: LandingPage;
  onSave: (s: Partial<LandingPage>) => void;
  saving: boolean;
}) {
  const [seoTitle, setSeoTitle] = useState(page.seo_title ?? "");
  const [metaDesc, setMetaDesc] = useState(page.meta_description ?? "");
  const [ogImage, setOgImage] = useState(page.og_image ?? "");
  const [canonical, setCanonical] = useState(page.canonical_url ?? "");
  const [fbPixel, setFbPixel] = useState(page.facebook_pixel ?? "");
  const [ga, setGa] = useState(page.google_analytics ?? "");
  const [gtm, setGtm] = useState(page.google_tag_manager ?? "");
  const [tiktokPixel, setTiktokPixel] = useState(page.tiktok_pixel ?? "");
  const [headerScript, setHeaderScript] = useState(page.custom_header_script ?? "");
  const [footerScript, setFooterScript] = useState(page.custom_footer_script ?? "");

  return (
    <div className="mt-6 space-y-5 border border-border bg-background p-6">
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">SEO</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              SEO Title
            </label>
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Meta Description
            </label>
            <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={2} className="w-full border border-border px-3 py-2 text-sm outline-none focus:border-ring" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              OG Image URL
            </label>
            <input value={ogImage} onChange={(e) => setOgImage(e.target.value)} className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Canonical URL
            </label>
            <input value={canonical} onChange={(e) => setCanonical(e.target.value)} className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">Tracking Pixels</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Facebook Pixel ID
            </label>
            <input value={fbPixel} onChange={(e) => setFbPixel(e.target.value)} placeholder="123456789012345" className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Google Analytics ID
            </label>
            <input value={ga} onChange={(e) => setGa(e.target.value)} placeholder="G-XXXXXXXXXX" className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Google Tag Manager ID
            </label>
            <input value={gtm} onChange={(e) => setGtm(e.target.value)} placeholder="GTM-XXXXXXX" className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              TikTok Pixel ID
            </label>
            <input value={tiktokPixel} onChange={(e) => setTiktokPixel(e.target.value)} className="h-10 w-full border border-border px-3 text-sm outline-none focus:border-ring" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide">Custom Scripts</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Custom Header Script
            </label>
            <textarea value={headerScript} onChange={(e) => setHeaderScript(e.target.value)} rows={4} className="w-full border border-border px-3 py-2 font-mono text-xs outline-none focus:border-ring" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Custom Footer Script
            </label>
            <textarea value={footerScript} onChange={(e) => setFooterScript(e.target.value)} rows={4} className="w-full border border-border px-3 py-2 font-mono text-xs outline-none focus:border-ring" />
          </div>
        </div>
      </div>

      <button
        onClick={() =>
          onSave({
            seo_title: seoTitle,
            meta_description: metaDesc,
            og_image: ogImage,
            canonical_url: canonical,
            facebook_pixel: fbPixel,
            google_analytics: ga,
            google_tag_manager: gtm,
            tiktok_pixel: tiktokPixel,
            custom_header_script: headerScript,
            custom_footer_script: footerScript,
          })
        }
        disabled={saving}
        className="bg-primary px-6 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save All Settings"}
      </button>
    </div>
  );
}
