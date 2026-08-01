import { Facebook, Instagram, Youtube, Mail, PhoneCall, MapPin } from "lucide-react";

const columns = [
  {
    title: "Quick Links",
    links: ["Track My Order", "Our Showroom", "About Us", "Blog", "Contact Us"],
  },
  {
    title: "Customer Care",
    links: ["Return & Refund", "Exchange Policy", "Shipping Info", "FAQ", "Size Guide"],
  },
  {
    title: "Categories",
    links: ["Panjabi", "Shirt", "T-shirt", "Sneakers", "Attar & Perfume"],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 bg-topbar text-topbar-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-sm bg-topbar-foreground text-topbar font-black">
              N
            </span>
            <span className="text-2xl font-extrabold tracking-tight">nexora</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-topbar-foreground/70">
            Everyday essentials for men and women — clothing, footwear, fragrance and
            gadgets, delivered nationwide.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-topbar-foreground/80">
            <li className="flex items-center gap-2">
              <PhoneCall className="size-4 text-sale" /> 09600 000 000
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-sale" /> support@nexora.shop
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-sale" /> Gulshan Avenue, Dhaka
            </li>
          </ul>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-bold uppercase tracking-wider">{col.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-topbar-foreground/70">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="/" className="transition-colors hover:text-sale">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-topbar-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-xs text-topbar-foreground/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Nexora. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/" aria-label="Facebook" className="hover:text-sale">
              <Facebook className="size-5" />
            </a>
            <a href="/" aria-label="Instagram" className="hover:text-sale">
              <Instagram className="size-5" />
            </a>
            <a href="/" aria-label="YouTube" className="hover:text-sale">
              <Youtube className="size-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
