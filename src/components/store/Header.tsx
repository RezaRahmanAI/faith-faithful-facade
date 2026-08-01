import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, Search, ShoppingBag, User, Phone, ChevronDown, Menu } from "lucide-react";
import { useCart } from "@/lib/cart";
import { MobileNav } from "@/components/store/MobileNav";

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
  const { count, setOpen } = useCart();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <header className="sticky top-0 z-40 bg-background transition-all duration-300">
        {/* Top bar — hides on scroll */}
        <div
          className={`overflow-hidden bg-topbar text-topbar-foreground transition-all duration-300 ${
            scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
          }`}
        >
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

        {/* Main header — shrinks on scroll */}
        <div className="border-b border-border transition-all duration-300">
          <div
            className={`mx-auto flex max-w-7xl items-center gap-4 px-4 transition-all duration-300 ${
              scrolled ? "py-2" : "py-4"
            }`}
          >
            <button
              className="md:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-6" />
            </button>

            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span
                className={`grid place-items-center rounded-sm bg-primary font-black text-primary-foreground transition-all duration-300 ${
                  scrolled ? "size-7 text-sm" : "size-9 text-base"
                }`}
              >
                N
              </span>
              <span
                className={`font-extrabold tracking-tight transition-all duration-300 ${
                  scrolled ? "text-xl" : "text-2xl"
                }`}
              >
                nexora
              </span>
            </Link>

            <form
              className="hidden flex-1 md:flex"
              onSubmit={(e) => e.preventDefault()}
              role="search"
            >
              <input
                type="search"
                placeholder="Search for Products..."
                aria-label="Search for products"
                className={`w-full border border-border px-4 text-sm outline-none focus:border-ring transition-all duration-300 ${
                  scrolled ? "h-9" : "h-11"
                }`}
              />
              <button
                type="submit"
                aria-label="Search"
                className={`grid shrink-0 place-items-center bg-primary text-primary-foreground transition-all duration-300 ${
                  scrolled ? "h-9 w-12" : "h-11 w-14"
                }`}
              >
                <Search className="size-5" />
              </button>
            </form>

            <div className="ml-auto flex items-center gap-5">
              <button className="hidden items-center gap-2 text-left sm:flex">
                <User
                  className={`text-muted-foreground transition-all duration-300 ${
                    scrolled ? "size-6" : "size-7"
                  }`}
                  strokeWidth={1.5}
                />
                <span className={`leading-tight transition-all duration-300 ${scrolled ? "hidden" : "block"}`}>
                  <span className="block text-xs text-muted-foreground">Sign In</span>
                  <span className="block text-sm font-semibold">Your Account</span>
                </span>
              </button>
              <button
                aria-label="Cart"
                onClick={() => setOpen(true)}
                className="relative cursor-pointer"
              >
                <ShoppingBag
                  className={`transition-all duration-300 ${
                    scrolled ? "size-6" : "size-7"
                  }`}
                  strokeWidth={1.5}
                />
                <span className="absolute -right-2 -top-1 grid size-5 place-items-center rounded-full bg-sale text-[11px] font-bold text-sale-foreground">
                  {count}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Category nav — stays sticky, compacts on scroll */}
        <div className="border-b border-border">
          <div
            className={`mx-auto flex max-w-7xl items-center gap-x-6 gap-y-2 px-4 transition-all duration-300 ${
              scrolled ? "py-2" : "py-3"
            }`}
          >
            <button
              className="flex items-center gap-2 text-sm font-bold md:hidden"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-5" />
              All Categories
            </button>
            <nav className="hidden flex-1 flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium md:flex">
              {categories.map((c) => (
                <a
                  key={c}
                  href="/"
                  className={`inline-flex items-center gap-1 transition-colors hover:text-sale ${
                    scrolled ? "text-[13px]" : "text-sm"
                  }`}
                >
                  {c}
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </a>
              ))}
              <a href="/" className="font-bold text-sale">
                FLASH SALE
              </a>
            </nav>
            <div
              className={`ml-auto hidden items-center gap-2 lg:flex transition-all duration-300 ${
                scrolled ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            >
              <Phone className="size-6 text-sale" strokeWidth={1.5} />
              <span className="leading-tight">
                <span className="block text-xs text-muted-foreground">Hotline:</span>
                <span className="block text-sm font-bold">09600 000 000</span>
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
