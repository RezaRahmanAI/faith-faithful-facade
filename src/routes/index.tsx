import { createFileRoute } from "@tanstack/react-router";
import { Truck, ShieldCheck, RefreshCcw, Headphones, Star } from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import hero from "@/assets/hero-sneakers.jpg";
import showroom from "@/assets/showroom.jpg";
import catPanjabi from "@/assets/cat-panjabi.jpg";
import catShirt from "@/assets/cat-shirt.jpg";
import catTshirt from "@/assets/cat-tshirt.jpg";
import catPants from "@/assets/cat-pants.jpg";
import catAttar from "@/assets/cat-attar.jpg";
import catSneakers from "@/assets/cat-sneakers.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexora — Online Fashion & Lifestyle Store" },
      {
        name: "description",
        content:
          "Shop panjabi, shirts, t-shirts, trousers, sneakers, attar and gadgets at Nexora. Cash on delivery and nationwide shipping.",
      },
      { property: "og:title", content: "Nexora — Online Fashion & Lifestyle Store" },
      {
        property: "og:description",
        content:
          "Panjabi, shirts, sneakers, attar and more. Flash deals every week with nationwide delivery.",
      },
    ],
  }),
  component: Index,
});

const topCategories = [
  { name: "Panjabi", img: catPanjabi },
  { name: "Shirt", img: catShirt },
  { name: "T-shirt", img: catTshirt },
  { name: "Pant & Trouser", img: catPants },
  { name: "Attar", img: catAttar },
  { name: "Sneakers", img: catSneakers },
];

const products = [
  { name: "Embroidered Cotton Panjabi", price: 1890, old: 2450, img: catPanjabi, cat: "Panjabi" },
  { name: "Oxford Formal Shirt — Navy", price: 1290, old: 1650, img: catShirt, cat: "Shirt" },
  { name: "Premium Cotton Tee — Charcoal", price: 690, old: 950, img: catTshirt, cat: "T-shirt" },
  { name: "Slim Fit Chino Trouser", price: 1490, old: 1990, img: catPants, cat: "Pant" },
  { name: "Amber Oud Attar — 12ml", price: 850, old: 1200, img: catAttar, cat: "Attar" },
  { name: "Court Low Sneaker — White", price: 2390, old: 3100, img: catSneakers, cat: "Sneakers" },
  { name: "Mandarin Collar Panjabi", price: 2150, old: 2800, img: catPanjabi, cat: "Panjabi" },
  { name: "Everyday Polo — Olive", price: 990, old: 1350, img: catTshirt, cat: "Polo" },
];

const perks = [
  { icon: Truck, title: "Free Delivery", text: "On orders over ৳2,000" },
  { icon: RefreshCcw, title: "7-Day Exchange", text: "Hassle-free returns" },
  { icon: ShieldCheck, title: "Authentic Products", text: "100% genuine goods" },
  { icon: Headphones, title: "Support 10am–10pm", text: "Call 09600 000 000" },
];

function ProductCard({ p }: { p: (typeof products)[number] }) {
  const off = Math.round(((p.old - p.price) / p.old) * 100);
  return (
    <article className="group border border-border bg-card transition-shadow hover:shadow-lg">
      <div className="relative overflow-hidden bg-muted">
        <span className="absolute left-0 top-3 z-10 bg-sale px-2 py-1 text-xs font-bold text-sale-foreground">
          -{off}%
        </span>
        <img
          src={p.img}
          alt={p.name}
          loading="lazy"
          width={600}
          height={600}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.cat}</p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-medium">{p.name}</h3>
        <div className="mt-1 flex items-center gap-1 text-sale">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="size-3.5 fill-current" />
          ))}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold">৳{p.price.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground line-through">
            ৳{p.old.toLocaleString()}
          </span>
        </div>
        <button className="mt-3 w-full bg-primary py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-sale">
          Add to Cart
        </button>
      </div>
    </article>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <span className="h-px flex-1 bg-border" />
      <h2 className="text-center text-xl font-bold uppercase tracking-[0.15em] sm:text-2xl">
        {children}
      </h2>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />

      <main>
        <section className="mx-auto max-w-7xl px-4 pt-6">
          <div className="relative overflow-hidden">
            <img
              src={hero}
              alt="Lightweight sneakers built for everyday movement"
              width={1600}
              height={640}
              className="aspect-[5/2] w-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-center gap-4 p-6 sm:p-14">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
                New Season
              </p>
              <h1 className="max-w-md text-4xl font-black uppercase leading-[0.95] tracking-tight text-primary sm:text-6xl">
                Style in Motion
              </h1>
              <p className="max-w-xs text-sm text-primary/80">
                Built for everyday movement with effortless comfort.
              </p>
              <div>
                <a
                  href="/"
                  className="inline-block bg-primary px-7 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-sale"
                >
                  Shop Now
                </a>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 w-8 ${i === 0 ? "bg-sale" : "bg-border"}`}
                aria-hidden
              />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14">
          <SectionTitle>Top Categories</SectionTitle>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {topCategories.map((c) => (
              <a key={c.name} href="/" className="group block text-center">
                <div className="overflow-hidden border border-border bg-muted">
                  <img
                    src={c.img}
                    alt={c.name}
                    loading="lazy"
                    width={600}
                    height={600}
                    className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <p className="mt-2 text-sm font-semibold group-hover:text-sale">{c.name}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4">
          <div className="relative overflow-hidden">
            <img
              src={showroom}
              alt="Nexora flagship showroom"
              loading="lazy"
              width={1600}
              height={520}
              className="aspect-[3/1] w-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-start justify-center gap-3 bg-topbar/55 p-6 sm:p-14">
              <h2 className="text-3xl font-black uppercase tracking-tight text-topbar-foreground sm:text-5xl">
                Visit Our Showroom
              </h2>
              <p className="max-w-sm text-sm text-topbar-foreground/80">
                Six outlets across the country. Try before you buy, with in-store exclusive
                bundles.
              </p>
              <a
                href="/"
                className="mt-1 bg-sale px-6 py-3 text-sm font-bold uppercase tracking-wide text-sale-foreground"
              >
                Find a Store
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
            <h2 className="text-xl font-bold uppercase tracking-[0.15em] sm:text-2xl">
              Flash Sale <span className="text-sale">Live</span>
            </h2>
            <a href="/" className="text-sm font-semibold text-sale hover:underline">
              View all products →
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.name} p={p} />
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-muted">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((perk) => (
              <div key={perk.title} className="flex items-center gap-3">
                <perk.icon className="size-8 text-sale" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-bold">{perk.title}</p>
                  <p className="text-xs text-muted-foreground">{perk.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="flex flex-col items-center gap-4 border border-border p-10 text-center">
            <h2 className="text-2xl font-bold">Get 10% off your first order</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Subscribe for new arrivals, flash sale alerts and exclusive member pricing.
            </p>
            <form
              className="flex w-full max-w-md"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                aria-label="Email address"
                className="h-11 w-full border border-border px-4 text-sm outline-none focus:border-ring"
              />
              <button className="h-11 shrink-0 bg-primary px-6 text-sm font-bold text-primary-foreground transition-colors hover:bg-sale">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
