import { Link } from "@tanstack/react-router";
import { MapPin, Search, ShoppingBag, User, Phone, ChevronDown, Menu } from "lucide-react";
import { useCart } from "@/lib/cart";


const categories = [
  "Panjabi",
  "Thobe",
  "Shirt",
  "T-shirt",
  "Polo Shirt",
  "Pant & Trouser",
  "Women's Clothing",
  "Attar",
  "Perfumes",
  "Gadgets",
  "Watch",
  "Sneakers",
  "Waistcoat",
  "Honey",
  "Tupi",
  "Combo Offers",
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="bg-topbar text-topbar-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs font-semibold tracking-wide">
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4 text-sale" />
            STORE LOCATIONS
          </span>
          <span className="inline-flex items-center gap-1">
            Settings <ChevronDown className="size-3.5" />
          </span>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <span className="grid size-9 place-items-center rounded-sm bg-primary text-primary-foreground font-black">
              N
            </span>
            <span className="text-2xl font-extrabold tracking-tight">nexora</span>
          </a>

          <form
            className="hidden flex-1 md:flex"
            onSubmit={(e) => e.preventDefault()}
            role="search"
          >
            <input
              type="search"
              placeholder="Search for Products..."
              aria-label="Search for products"
              className="h-11 w-full border border-border px-4 text-sm outline-none focus:border-ring"
            />
            <button
              type="submit"
              aria-label="Search"
              className="grid h-11 w-14 shrink-0 place-items-center bg-primary text-primary-foreground"
            >
              <Search className="size-5" />
            </button>
          </form>

          <div className="ml-auto flex items-center gap-5">
            <button className="hidden items-center gap-2 text-left sm:flex">
              <User className="size-7 text-muted-foreground" strokeWidth={1.5} />
              <span className="leading-tight">
                <span className="block text-xs text-muted-foreground">Sign In</span>
                <span className="block text-sm font-semibold">Your Account</span>
              </span>
            </button>
            <button aria-label="Cart" className="relative">
              <ShoppingBag className="size-7" strokeWidth={1.5} />
              <span className="absolute -right-2 -top-1 grid size-5 place-items-center rounded-full bg-sale text-[11px] font-bold text-sale-foreground">
                0
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-x-6 gap-y-2 px-4 py-3">
          <Menu className="size-5 md:hidden" />
          <nav className="hidden flex-1 flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium md:flex">
            {categories.map((c) => (
              <a
                key={c}
                href="/"
                className="inline-flex items-center gap-1 transition-colors hover:text-sale"
              >
                {c}
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </a>
            ))}
            <a href="/" className="font-bold text-sale">
              FLASH SALE
            </a>
          </nav>
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <Phone className="size-6 text-sale" strokeWidth={1.5} />
            <span className="leading-tight">
              <span className="block text-xs text-muted-foreground">Hotline:</span>
              <span className="block text-sm font-bold">09600 000 000</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
