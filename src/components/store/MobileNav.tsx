import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

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

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: Props) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-topbar px-5 py-4">
          <Link to="/" onClick={onClose} className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-sm bg-topbar-foreground font-black text-topbar text-sm">
              N
            </span>
            <span className="text-lg font-extrabold tracking-tight text-topbar-foreground">
              nexora
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-8 place-items-center rounded-sm text-topbar-foreground/70 transition-colors hover:text-topbar-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Menu items */}
        <div className="flex-1 overflow-y-auto">
          <nav>
            <ul className="divide-y divide-border">
              {categories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() =>
                      setExpandedCategory(expandedCategory === cat ? null : cat)
                    }
                    className="flex w-full items-center justify-between px-5 py-3.5 text-left text-sm font-medium transition-colors hover:bg-muted hover:text-sale"
                  >
                    <span>{cat}</span>
                    <ChevronRight
                      className={`size-4 text-muted-foreground transition-transform duration-200 ${expandedCategory === cat ? "rotate-90" : ""}`}
                    />
                  </button>
                  {expandedCategory === cat && (
                    <div className="bg-muted/50 px-5 py-2">
                      <p className="text-xs text-muted-foreground">
                        Browse all {cat} products
                      </p>
                      <a
                        href="/"
                        onClick={onClose}
                        className="mt-1 block text-sm font-medium text-sale hover:underline"
                      >
                        View all →
                      </a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Footer links */}
        <div className="border-t border-border px-5 py-4 text-sm">
          <div className="flex flex-col gap-2 text-muted-foreground">
            <a href="/" className="hover:text-sale" onClick={onClose}>Track My Order</a>
            <a href="/" className="hover:text-sale" onClick={onClose}>Our Showroom</a>
            <a href="/" className="hover:text-sale" onClick={onClose}>Contact Us</a>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Hotline: 09600 000 000</p>
        </div>
      </aside>
    </>
  );
}
