import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Star,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  RefreshCcw,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { getProduct, products, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product unavailable — Nexora" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — Nexora`;
    return {
      meta: [
        { title },
        { name: "description", content: product.description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: product.description.slice(0, 155) },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  return <ProductView key={product.slug} product={product} />;
}

function ProductView({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [active, setActive] = useState(0);
  const [size, setSize] = useState(product.sizes[0]!);
  const [color, setColor] = useState(product.colors[0]!.name);
  const [qty, setQty] = useState(1);

  const off = Math.round(((product.old - product.price) / product.old) * 100);
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 4);

  const handleAdd = () => {
    addItem({
      slug: product.slug,
      name: product.name,
      img: product.img,
      price: product.price,
      size,
      color,
      qty,
    });
    toast.success("Added to cart", {
      description: `${product.name} · ${color} · Size ${size} · Qty ${qty}`,
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Link to="/" className="hover:text-sale">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <span>{product.cat}</span>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col-reverse gap-4 sm:flex-row">
            <div className="flex gap-3 sm:flex-col">
              {product.gallery.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={active === i}
                  className={`w-20 shrink-0 border-2 ${
                    active === i ? "border-sale" : "border-border"
                  }`}
                >
                  <img
                    src={g}
                    alt={`${product.name} view ${i + 1}`}
                    loading="lazy"
                    width={600}
                    height={600}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
            <div className="relative flex-1 overflow-hidden border border-border bg-muted">
              <span className="absolute left-0 top-4 z-10 bg-sale px-2.5 py-1 text-xs font-bold text-sale-foreground">
                -{off}%
              </span>
              <img
                src={product.gallery[active]}
                alt={product.name}
                width={600}
                height={600}
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {product.cat}
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{product.name}</h1>

            <div className="mt-3 flex items-center gap-3">
              <span className="flex items-center gap-0.5 text-sale">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${i < Math.round(product.rating) ? "fill-current" : ""}`}
                  />
                ))}
              </span>
              <span className="text-sm text-muted-foreground">
                {product.rating} · {product.reviews} reviews
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-bold">৳{product.price.toLocaleString()}</span>
              <span className="text-lg text-muted-foreground line-through">
                ৳{product.old.toLocaleString()}
              </span>
              <span className="bg-sale/10 px-2 py-1 text-xs font-bold text-sale">
                Save ৳{(product.old - product.price).toLocaleString()}
              </span>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-7">
              <p className="text-sm font-semibold">
                Colour: <span className="font-normal text-muted-foreground">{color}</span>
              </p>
              <div className="mt-3 flex gap-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    aria-label={c.name}
                    aria-pressed={color === c.name}
                    className={`size-9 rounded-full border-2 p-0.5 ${
                      color === c.name ? "border-sale" : "border-border"
                    }`}
                  >
                    <span
                      className="block size-full rounded-full"
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold">
                Size: <span className="font-normal text-muted-foreground">{size}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`min-w-14 border px-4 py-2 text-sm font-medium transition-colors ${
                      size === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <div className="flex items-center border border-border">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="grid size-11 place-items-center hover:bg-muted"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  aria-label="Increase quantity"
                  className="grid size-11 place-items-center hover:bg-muted"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 bg-primary px-8 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-sale sm:flex-none"
              >
                <ShoppingBag className="size-4" />
                Add to Cart
              </button>
              <button className="h-11 border border-primary px-8 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-primary hover:text-primary-foreground">
                Buy Now
              </button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              SKU: {product.sku} · In stock, ships within 24 hours
            </p>

            <ul className="mt-7 grid gap-3 border-t border-border pt-6 text-sm sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <Truck className="size-5 text-sale" strokeWidth={1.5} /> Free over ৳2,000
              </li>
              <li className="flex items-center gap-2">
                <RefreshCcw className="size-5 text-sale" strokeWidth={1.5} /> 7-day exchange
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-sale" strokeWidth={1.5} /> Authentic
              </li>
            </ul>
          </div>
        </div>

        <section className="mt-14 border-t border-border pt-10">
          <h2 className="text-lg font-bold uppercase tracking-[0.15em]">Product Details</h2>
          <div className="mt-5 grid gap-8 md:grid-cols-2">
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {product.details.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 bg-sale" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="mb-6 text-lg font-bold uppercase tracking-[0.15em]">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <Link
                key={p.slug}
                to="/product/$slug"
                params={{ slug: p.slug }}
                className="group border border-border bg-card transition-shadow hover:shadow-lg"
              >
                <div className="overflow-hidden bg-muted">
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
                  <h3 className="line-clamp-2 min-h-10 text-sm font-medium">{p.name}</h3>
                  <p className="mt-1 text-base font-bold">৳{p.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
