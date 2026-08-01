import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { Shield, Truck, RotateCcw, Star, ChevronDown, ShoppingBag, Phone, MapPin, MessageCircle, Clock, CircleCheck as CheckCircle2, Zap } from "lucide-react";
import { supabase, type LandingPage, type LandingPageSection, type Product } from "@/lib/supabase";

export const Route = createFileRoute("/l/$slug")({
  component: PublicLandingPage,
});

type SectionConfig = Record<string, unknown>;

function PublicLandingPage() {
  const { slug } = useParams({ from: "/l/$slug" });
  const [page, setPage] = useState<LandingPage | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [sections, setSections] = useState<LandingPageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [visitorId, setVisitorId] = useState<string>("");
  const [draftId, setDraftId] = useState<string>("");
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStartedTyping = useRef(false);
  const draftCreated = useRef(false);

  // Parse UTM and campaign params from URL
  function getCampaignParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") ?? "",
      utm_medium: params.get("utm_medium") ?? "",
      utm_campaign: params.get("utm_campaign") ?? "",
      utm_content: params.get("utm_content") ?? "",
      utm_term: params.get("utm_term") ?? "",
      fbclid: params.get("fbclid") ?? "",
      gclid: params.get("gclid") ?? "",
      referrer: document.referrer ?? "",
    };
  }

  function detectDevice() {
    const ua = navigator.userAgent;
    const device = /Mobile|Android|iPhone|iPad/i.test(ua) ? "Mobile" : "Desktop";
    let browser = "Unknown";
    if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = "Chrome";
    else if (/Firefox/i.test(ua)) browser = "Firefox";
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
    else if (/Edg/i.test(ua)) browser = "Edge";
    let os = "Unknown";
    if (/Windows/i.test(ua)) os = "Windows";
    else if (/Android/i.test(ua)) os = "Android";
    else if (/iPhone|iPad/i.test(ua)) os = "iOS";
    else if (/Mac/i.test(ua)) os = "macOS";
    else if (/Linux/i.test(ua)) os = "Linux";
    return { device, browser, os };
  }

  // Initialize visitor session
  useEffect(() => {
    async function init() {
      const { data: pageData, error } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error || !pageData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPage(pageData as LandingPage);

      // Increment view count
      await supabase
        .from("landing_pages")
        .update({ views: (pageData as LandingPage).views + 1 })
        .eq("id", pageData.id);

      // Load product
      if (pageData.product_id) {
        const { data: productData } = await supabase
          .from("products")
          .select("*")
          .eq("id", pageData.product_id)
          .maybeSingle();
        setProduct(productData as Product | null);
      }

      // Load sections
      const { data: sectionData } = await supabase
        .from("landing_page_sections")
        .select("*")
        .eq("landing_page_id", pageData.id)
        .eq("is_enabled", true)
        .order("sort_order");
      setSections((sectionData as LandingPageSection[]) ?? []);

      // Create visitor session
      const sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      setSessionId(sid);
      const campaign = getCampaignParams();
      const device = detectDevice();

      const { data: visitor } = await supabase
        .from("landing_visitors")
        .insert({
          session_id: sid,
          landing_page_id: pageData.id,
          ...campaign,
          device: device.device,
          browser: device.browser,
          os: device.os,
        })
        .select()
        .single();

      if (visitor) {
        setVisitorId(visitor.id);
        // Log visit activity
        await supabase.from("lead_activities").insert({
          visitor_id: visitor.id,
          activity_type: "visited",
          description: "Landed on landing page",
          metadata: { url: window.location.href, ...campaign },
        });
      }

      setLoading(false);
    }
    init();
  }, [slug]);

  // Auto-save draft with debounce
  const autoSaveDraft = useCallback(async () => {
    if (!page || !visitorId || draftCreated.current === false) return;

    const campaign = getCampaignParams();
    const unitPrice = product ? Number(product.price) : 0;
    const total = unitPrice * quantity;

    const draftData = {
      visitor_id: visitorId,
      landing_page_id: page.id,
      product_id: product?.id ?? null,
      product_name: product?.name ?? null,
      quantity,
      customer_name: name || null,
      customer_phone: phone || null,
      customer_district: district || null,
      customer_area: area || null,
      customer_address: address || null,
      customer_notes: notes || null,
      unit_price: unitPrice,
      total,
      ...campaign,
      status: "draft",
      last_activity_at: new Date().toISOString(),
    };

    if (draftId) {
      await supabase.from("draft_orders").update(draftData).eq("id", draftId);
    } else {
      const { data } = await supabase
        .from("draft_orders")
        .insert(draftData)
        .select()
        .single();
      if (data) {
        setDraftId(data.id);
        await supabase.from("lead_activities").insert({
          visitor_id: visitorId,
          draft_order_id: data.id,
          activity_type: "started_form",
          description: "Started filling the order form",
        });
      }
    }
  }, [page, visitorId, draftId, product, quantity, name, phone, district, area, address, notes]);

  // Trigger auto-save on field changes (debounced)
  useEffect(() => {
    if (!hasStartedTyping.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      autoSaveDraft();
    }, 2000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [name, phone, district, area, address, notes, quantity, autoSaveDraft]);

  // Mark as incomplete on unload
  useEffect(() => {
    function handleBeforeUnload() {
      if (draftId && !orderConfirmed) {
        // Use sendBeacon for reliability on page unload
        const payload = JSON.stringify({
          status: "incomplete",
          last_activity_at: new Date().toISOString(),
        });
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/draft_orders?id=eq.${draftId}`,
          new Blob([payload], { type: "application/json" }),
        );
      }
      // Mark visitor as left
      if (visitorId) {
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/landing_visitors?id=eq.${visitorId}`,
          new Blob(
            [JSON.stringify({ left_at: new Date().toISOString() })],
            { type: "application/json" },
          ),
        );
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [draftId, visitorId, orderConfirmed]);

  async function handleConfirmOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !draftId) return;

    setOrderConfirmed(true);

    await supabase
      .from("draft_orders")
      .update({
        status: "confirmed",
        customer_name: name,
        customer_phone: phone,
        customer_district: district,
        customer_area: area,
        customer_address: address,
        customer_notes: notes,
        quantity,
        confirmed_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", draftId);

    // Also create a confirmed order in the orders table
    if (product) {
      const orderNum = `ORD-${Date.now().toString(36).toUpperCase()}`;
      await supabase.from("orders").insert({
        order_number: orderNum,
        customer_name: name,
        customer_phone: phone,
        customer_address: `${district}, ${area}, ${address}`,
        items: [
          {
            slug: product.slug,
            name: product.name,
            size: "",
            color: "",
            qty: quantity,
            price: Number(product.price),
          },
        ],
        total: Number(product.price) * quantity,
        status: "pending",
      });
    }

    // Update landing page stats
    if (page) {
      await supabase
        .from("landing_pages")
        .update({
          orders_count: page.orders_count + 1,
          revenue: Number(page.revenue) + Number(product?.price ?? 0) * quantity,
        })
        .eq("id", page.id);
    }

    // Log activity
    await supabase.from("lead_activities").insert({
      visitor_id: visitorId,
      draft_order_id: draftId,
      activity_type: "confirmed_order",
      description: "Customer confirmed the order",
    });
  }

  function markStartedTyping() {
    if (!hasStartedTyping.current) {
      hasStartedTyping.current = true;
      draftCreated.current = true;
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Page Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This landing page may be unpublished or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  if (orderConfirmed) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-green-100">
            <CheckCircle2 className="size-8 text-green-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Order Confirmed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you, {name}! We've received your order and will call you at {phone} shortly to confirm.
          </p>
        </div>
      </div>
    );
  }

  const enabledSections = sections.filter((s) => s.is_enabled);

  return (
    <div className="min-h-screen bg-background">
      {enabledSections.map((section) => {
        const config = section.config as SectionConfig;
        switch (section.section_type) {
          case "hero_banner":
            return <HeroSection key={section.id} product={product} config={config} title={section.title} />;
          case "countdown_timer":
            return <CountdownSection key={section.id} config={config} />;
          case "offer_badge":
            return <OfferBadgeSection key={section.id} product={product} config={config} />;
          case "product_images":
            return <ProductImagesSection key={section.id} product={product} config={config} />;
          case "product_video":
            return <ProductVideoSection key={section.id} config={config} />;
          case "product_features":
            return <ProductFeaturesSection key={section.id} product={product} config={config} />;
          case "before_after":
            return <BeforeAfterSection key={section.id} config={config} />;
          case "customer_reviews":
            return <ReviewsSection key={section.id} product={product} config={config} />;
          case "trust_badges":
            return <TrustBadgesSection key={section.id} config={config} />;
          case "order_form":
            return (
              <OrderFormSection
                key={section.id}
                product={product}
                quantity={quantity}
                setQuantity={setQuantity}
                name={name}
                setName={(v) => { markStartedTyping(); setName(v); }}
                phone={phone}
                setPhone={(v) => { markStartedTyping(); setPhone(v); }}
                district={district}
                setDistrict={(v) => { markStartedTyping(); setDistrict(v); }}
                area={area}
                setArea={(v) => { markStartedTyping(); setArea(v); }}
                address={address}
                setAddress={(v) => { markStartedTyping(); setAddress(v); }}
                notes={notes}
                setNotes={(v) => { markStartedTyping(); setNotes(v); }}
                onConfirm={handleConfirmOrder}
              />
            );
          case "faq":
            return <FaqSection key={section.id} config={config} />;
          case "shipping_info":
            return <ShippingSection key={section.id} config={config} />;
          case "return_policy":
            return <ReturnPolicySection key={section.id} config={config} />;
          case "sticky_buy_button":
            return <StickyBuyButton key={section.id} product={product} quantity={quantity} />;
          case "floating_whatsapp":
            return <FloatingWhatsApp key={section.id} config={config} />;
          case "floating_messenger":
            return <FloatingMessenger key={section.id} config={config} />;
          case "footer":
            return <FooterSection key={section.id} config={config} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

// ============ Section Components ============

function HeroSection({ product, config, title }: { product: Product | null; config: SectionConfig; title: string | null }) {
  const heading = (config.heading as string) || title || product?.name || "Premium Product";
  const subheading = (config.subheading as string) || product?.description || "";
  const image = (config.image as string) || product?.image || "";
  const bgGradient = (config.bg_gradient as string) || "from-gray-900 to-gray-800";

  return (
    <section className={`relative bg-gradient-to-br ${bgGradient} text-white`}>
      <div className="mx-auto grid max-w-5xl items-center gap-6 px-4 py-12 md:grid-cols-2 md:py-20">
        <div>
          <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">{heading}</h1>
          {subheading && <p className="mt-4 text-lg text-white/80">{subheading}</p>}
          {product && (
            <div className="mt-6 flex items-center gap-3">
              <span className="text-3xl font-bold">৳{Number(product.price).toLocaleString()}</span>
              {Number(product.old_price) > 0 && (
                <span className="text-xl text-white/50 line-through">
                  ৳{Number(product.old_price).toLocaleString()}
                </span>
              )}
            </div>
          )}
          <a
            href="#order-form"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-bold text-gray-900 transition-transform hover:scale-105"
          >
            <ShoppingBag className="size-5" />
            Order Now
          </a>
        </div>
        {image && (
          <div className="relative">
            <img src={image} alt={heading} className="rounded-2xl shadow-2xl" />
          </div>
        )}
      </div>
    </section>
  );
}

function CountdownSection({ config }: { config: SectionConfig }) {
  const [remaining, setRemaining] = useState(0);
  const endTime = (config.end_time as string) || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  useEffect(() => {
    const end = new Date(endTime).getTime();
    const interval = setInterval(() => {
      setRemaining(Math.max(0, end - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  return (
    <section className="bg-red-50 py-6">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-red-600">
          {(config.label as string) || "Limited Time Offer — Order Before Time Runs Out!"}
        </p>
        <div className="mt-4 flex justify-center gap-3">
          {[
            { label: "Hours", value: hours },
            { label: "Minutes", value: minutes },
            { label: "Seconds", value: seconds },
          ].map((t) => (
            <div key={t.label} className="grid size-20 place-items-center rounded-lg bg-red-600 text-white">
              <span className="text-2xl font-bold tabular-nums">{String(t.value).padStart(2, "0")}</span>
              <span className="text-[10px] uppercase">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OfferBadgeSection({ product, config }: { product: Product | null; config: SectionConfig }) {
  const text = (config.text as string) || "Special Discount";
  const discount = product && Number(product.old_price) > 0
    ? Math.round(((Number(product.old_price) - Number(product.price)) / Number(product.old_price)) * 100)
    : (config.discount_percent as number) || 0;

  return (
    <section className="bg-primary py-3 text-center text-primary-foreground">
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 px-4">
        <Zap className="size-5" />
        <span className="text-sm font-bold">
          {text} — {discount}% OFF
        </span>
      </div>
    </section>
  );
}

function ProductImagesSection({ product, config }: { product: Product | null; config: SectionConfig }) {
  const images = (config.images as string[]) || (product?.gallery ?? [product?.image].filter(Boolean) as string[]);
  const [active, setActive] = useState(0);

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          {images[active] && (
            <img src={images[active]} alt={product?.name ?? ""} className="aspect-square w-full rounded-xl border border-border object-cover" />
          )}
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActive(i)} className={`size-16 overflow-hidden rounded-lg border-2 ${active === i ? "border-primary" : "border-border"}`}>
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{product?.name}</h2>
          {product && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`size-4 ${s <= Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>
          )}
          {product && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-3xl font-bold">৳{Number(product.price).toLocaleString()}</span>
              {Number(product.old_price) > 0 && (
                <span className="text-lg text-muted-foreground line-through">৳{Number(product.old_price).toLocaleString()}</span>
              )}
            </div>
          )}
          {product?.sizes && product.sizes.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold">Available Sizes:</p>
              <div className="mt-1 flex gap-2">
                {product.sizes.map((s) => (
                  <span key={s} className="border border-border px-3 py-1 text-sm">{s}</span>
                ))}
              </div>
            </div>
          )}
          {product?.colors && product.colors.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold">Available Colors:</p>
              <div className="mt-1 flex gap-2">
                {product.colors.map((c) => (
                  <span key={c.name} className="inline-flex items-center gap-1.5 border border-border px-3 py-1 text-sm">
                    <span className="size-3 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          <a href="#order-form" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-105">
            <ShoppingBag className="size-5" />
            Order Now
          </a>
        </div>
      </div>
    </section>
  );
}

function ProductVideoSection({ config }: { config: SectionConfig }) {
  const url = (config.video_url as string) ?? "";
  if (!url) return null;
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  const embedUrl = isYouTube
    ? url.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
    : url;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-border">
        {isYouTube ? (
          <iframe src={embedUrl} className="h-full w-full" allowFullScreen />
        ) : (
          <video src={url} controls className="h-full w-full" />
        )}
      </div>
    </section>
  );
}

function ProductFeaturesSection({ product, config }: { product: Product | null; config: SectionConfig }) {
  const features = (config.features as string[]) || (product?.details ?? []);
  if (features.length === 0) return null;

  return (
    <section className="bg-muted/30 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-2xl font-bold">Product Features</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-2 border border-border bg-background p-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BeforeAfterSection({ config }: { config: SectionConfig }) {
  const beforeImg = (config.before_image as string) ?? "";
  const afterImg = (config.after_image as string) ?? "";
  const label = (config.label as string) || "Before / After";
  if (!beforeImg && !afterImg) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h2 className="text-center text-2xl font-bold">{label}</h2>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-center text-sm font-semibold text-muted-foreground">Before</p>
          {beforeImg && <img src={beforeImg} alt="Before" className="aspect-square w-full rounded-xl border border-border object-cover" />}
        </div>
        <div>
          <p className="mb-2 text-center text-sm font-semibold text-muted-foreground">After</p>
          {afterImg && <img src={afterImg} alt="After" className="aspect-square w-full rounded-xl border border-border object-cover" />}
        </div>
      </div>
    </section>
  );
}

function ReviewsSection({ product, config }: { product: Product | null; config: SectionConfig }) {
  const reviews = (config.reviews as Array<{ name: string; text: string; rating: number }>) ?? [
    { name: "Rahim", text: "Excellent quality product! Highly recommended.", rating: 5 },
    { name: "Karim", text: "Fast delivery and great product.", rating: 5 },
    { name: "Sadia", text: "Loved it, exactly as described.", rating: 4 },
  ];

  return (
    <section className="bg-muted/30 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-2xl font-bold">Customer Reviews</h2>
        <div className="mt-6 space-y-3">
          {reviews.map((r, i) => (
            <div key={i} className="border border-border bg-background p-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`size-4 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
                <span className="text-sm font-bold">{r.name}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBadgesSection({ config }: { config: SectionConfig }) {
  const badges = (config.badges as Array<{ icon: string; text: string }>) ?? [
    { icon: "shield", text: "100% Secure Payment" },
    { icon: "truck", text: "Cash on Delivery" },
    { icon: "rotate", text: "Easy Returns" },
    { icon: "phone", text: "24/7 Support" },
  ];

  const iconMap: Record<string, typeof Shield> = {
    shield: Shield,
    truck: Truck,
    rotate: RotateCcw,
    phone: Phone,
  };

  return (
    <section className="border-y border-border bg-background py-6">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 px-4 sm:grid-cols-4">
        {badges.map((b, i) => {
          const Icon = iconMap[b.icon] ?? Shield;
          return (
            <div key={i} className="flex flex-col items-center gap-2 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <span className="text-xs font-semibold">{b.text}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OrderFormSection({
  product,
  quantity,
  setQuantity,
  name,
  setName,
  phone,
  setPhone,
  district,
  setDistrict,
  area,
  setArea,
  address,
  setAddress,
  notes,
  setNotes,
  onConfirm,
}: {
  product: Product | null;
  quantity: number;
  setQuantity: (n: number) => void;
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  district: string;
  setDistrict: (v: string) => void;
  area: string;
  setArea: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  onConfirm: (e: React.FormEvent) => void;
}) {
  const districts = [
    "Dhaka", "Chattogram", "Khulna", "Rajshahi", "Sylhet", "Barishal", "Rangpur", "Mymensingh",
  ];

  return (
    <section id="order-form" className="bg-muted/30 py-10">
      <div className="mx-auto max-w-lg px-4">
        <div className="border border-border bg-background p-6 shadow-lg">
          <h2 className="text-center text-2xl font-bold">Place Your Order</h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Fill in your details and we'll call to confirm
          </p>

          {product && (
            <div className="mt-4 flex items-center gap-3 border border-border bg-muted/50 p-3">
              {product.image && <img src={product.image} alt="" className="size-12 border border-border object-cover" />}
              <div className="flex-1">
                <p className="text-sm font-bold">{product.name}</p>
                <p className="text-sm font-semibold text-primary">৳{Number(product.price).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid size-8 place-items-center border border-border">−</button>
                <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                <button type="button" onClick={() => setQuantity(quantity + 1)} className="grid size-8 place-items-center border border-border">+</button>
              </div>
            </div>
          )}

          <form onSubmit={onConfirm} className="mt-4 space-y-3">
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name *" className="h-12 w-full border border-border px-4 text-sm outline-none focus:border-ring" />
            <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number *" className="h-12 w-full border border-border px-4 text-sm outline-none focus:border-ring" />
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className="h-12 w-full border border-border px-4 text-sm outline-none focus:border-ring">
              <option value="">Select District</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area / Thana" className="h-12 w-full border border-border px-4 text-sm outline-none focus:border-ring" />
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full Address" rows={2} className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-ring" />
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Order Notes (optional)" rows={2} className="w-full border border-border px-4 py-3 text-sm outline-none focus:border-ring" />

            {product && (
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">৳{(Number(product.price) * quantity).toLocaleString()}</span>
              </div>
            )}

            <button type="submit" className="w-full bg-primary py-4 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02]">
              Confirm Order
            </button>
            <p className="text-center text-xs text-muted-foreground">
              <Shield className="mr-1 inline size-3" />
              Your information is safe and will only be used for order processing
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

function FaqSection({ config }: { config: SectionConfig }) {
  const faqs = (config.faqs as Array<{ q: string; a: string }>) ?? [
    { q: "How long does delivery take?", a: "Delivery usually takes 1-3 business days within Bangladesh." },
    { q: "Is Cash on Delivery available?", a: "Yes, Cash on Delivery is available all over Bangladesh." },
    { q: "Can I return the product?", a: "Yes, you can return within 7 days if the product is unused." },
  ];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h2 className="text-center text-2xl font-bold">Frequently Asked Questions</h2>
      <div className="mt-6 space-y-2">
        {faqs.map((f, i) => (
          <div key={i} className="border border-border bg-background">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left">
              <span className="text-sm font-semibold">{f.q}</span>
              <ChevronDown className={`size-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <div className="border-t border-border p-4 text-sm text-muted-foreground">{f.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function ShippingSection({ config }: { config: SectionConfig }) {
  const info = (config.info as string) || "We deliver all over Bangladesh. Delivery charge: ৳60 inside Dhaka, ৳120 outside Dhaka. Delivery time: 1-3 business days.";
  return (
    <section className="bg-muted/30 py-8">
      <div className="mx-auto flex max-w-3xl items-start gap-3 px-4">
        <Truck className="mt-0.5 size-6 shrink-0 text-primary" />
        <div>
          <h3 className="text-sm font-bold">Shipping Information</h3>
          <p className="mt-1 text-sm text-muted-foreground">{info}</p>
        </div>
      </div>
    </section>
  );
}

function ReturnPolicySection({ config }: { config: SectionConfig }) {
  const policy = (config.policy as string) || "7-day easy return policy. If you're not satisfied, return the product for a full refund.";
  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-start gap-3">
        <RotateCcw className="mt-0.5 size-6 shrink-0 text-primary" />
        <div>
          <h3 className="text-sm font-bold">Return Policy</h3>
          <p className="mt-1 text-sm text-muted-foreground">{policy}</p>
        </div>
      </div>
    </section>
  );
}

function StickyBuyButton({ product, quantity }: { product: Product | null; quantity: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible || !product) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:bottom-4 md:left-auto md:right-4 md:w-72 md:rounded-lg md:border md:shadow-xl">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">{product.name}</p>
          <p className="text-lg font-bold text-primary">৳{(Number(product.price) * quantity).toLocaleString()}</p>
        </div>
        <a href="#order-form" className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
          Buy Now
        </a>
      </div>
    </div>
  );
}

function FloatingWhatsApp({ config }: { config: SectionConfig }) {
  const phone = (config.phone as string) ?? "8801000000000";
  const message = (config.message as string) ?? "Hello, I'm interested in this product";
  return (
    <a
      href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 grid size-14 place-items-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110"
      aria-label="WhatsApp"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}

function FloatingMessenger({ config }: { config: SectionConfig }) {
  const pageId = (config.page_id as string) ?? "";
  if (!pageId) return null;
  return (
    <a
      href={`https://m.me/${pageId}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-20 z-40 grid size-14 place-items-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-110"
      aria-label="Messenger"
    >
      <MessageCircle className="size-7" />
    </a>
  );
}

function FooterSection({ config }: { config: SectionConfig }) {
  const text = (config.text as string) || "© 2025 Nexora. All rights reserved.";
  return (
    <footer className="border-t border-border bg-background py-6">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <p className="text-xs text-muted-foreground">{text}</p>
      </div>
    </footer>
  );
}
