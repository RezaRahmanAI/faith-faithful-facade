import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart";

export function CartDrawer() {
  const { items, open, setOpen, total, count, removeItem, updateQty } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5" />
            <h2 className="text-base font-bold uppercase tracking-wide">Shopping Cart</h2>
            {count > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-sale text-[11px] font-bold text-sale-foreground">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close cart"
            className="grid size-8 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <ShoppingBag className="size-16 text-muted-foreground/30" strokeWidth={1} />
              <p className="text-sm font-medium text-muted-foreground">Your Cart is empty</p>
              <button
                onClick={() => setOpen(false)}
                className="mt-2 bg-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-sale"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li
                  key={`${item.slug}-${item.size}-${item.color}`}
                  className="flex gap-4 px-5 py-4"
                >
                  <Link
                    to="/product/$slug"
                    params={{ slug: item.slug }}
                    onClick={() => setOpen(false)}
                    className="shrink-0"
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="size-20 border border-border object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Link
                      to="/product/$slug"
                      params={{ slug: item.slug }}
                      onClick={() => setOpen(false)}
                      className="line-clamp-2 text-sm font-semibold leading-snug hover:text-sale"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {item.color} · Size {item.size}
                    </p>
                    <p className="text-sm font-bold text-sale">
                      ৳{(item.price * item.qty).toLocaleString()}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() =>
                            item.qty > 1
                              ? updateQty(item.slug, item.size, item.color, item.qty - 1)
                              : removeItem(item.slug, item.size, item.color)
                          }
                          aria-label="Decrease quantity"
                          className="grid size-7 place-items-center text-muted-foreground hover:bg-muted"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold">{item.qty}</span>
                        <button
                          onClick={() =>
                            updateQty(item.slug, item.size, item.color, Math.min(10, item.qty + 1))
                          }
                          aria-label="Increase quantity"
                          className="grid size-7 place-items-center text-muted-foreground hover:bg-muted"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.slug, item.size, item.color)}
                        aria-label="Remove item"
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide">Subtotal</span>
              <span className="text-lg font-bold">৳{total.toLocaleString()}</span>
            </div>
            <p className="mb-4 text-center text-xs text-muted-foreground">
              Shipping & taxes calculated at checkout
            </p>
            <button
              onClick={() => setOpen(false)}
              className="w-full bg-primary py-3.5 text-sm font-bold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-sale"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={() => setOpen(false)}
              className="mt-2 w-full border border-border py-3 text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-muted"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
