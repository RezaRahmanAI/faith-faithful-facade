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
  addItem: (item: CartItem) => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartValue>(
    () => ({
      items,
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

    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
