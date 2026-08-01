import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  slug: string;
  name: string;
  img: string;
  price: number;
  size: string;
  color: string;
  qty: number;
};

type CartValue = {
  items: CartItem[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (slug: string, size: string, color: string) => void;
  updateQty: (slug: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const value = useMemo<CartValue>(
    () => ({
      items,
      open,
      setOpen,
      count: items.reduce((n, i) => n + i.qty, 0),
      total: items.reduce((n, i) => n + i.qty * i.price, 0),
      addItem: (item) =>
        setItems((prev) => {
          const idx = prev.findIndex(
            (i) => i.slug === item.slug && i.size === item.size && i.color === item.color,
          );
          const existing = idx === -1 ? undefined : prev[idx];
          if (!existing) return [...prev, item];
          const next = [...prev];
          next[idx] = { ...existing, qty: existing.qty + item.qty };
          return next;
        }),
      removeItem: (slug, size, color) =>
        setItems((prev) =>
          prev.filter((i) => !(i.slug === slug && i.size === size && i.color === color)),
        ),
      updateQty: (slug, size, color, qty) =>
        setItems((prev) =>
          prev.map((i) =>
            i.slug === slug && i.size === size && i.color === color ? { ...i, qty } : i,
          ),
        ),
      clearCart: () => setItems([]),
    }),
    [items, open],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
