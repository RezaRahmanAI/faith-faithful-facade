import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Clock, Truck, CheckCircle2, XCircle, ShoppingCart, X } from "lucide-react";
import { supabase, type Order } from "@/lib/supabase";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersManagement,
});

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
};

const statuses = ["pending", "processing", "delivered", "cancelled"];

function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewing, setViewing] = useState<Order | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(orderId: string, status: string) {
    await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    load();
  }

  async function deleteOrder(orderId: string) {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    await supabase.from("orders").delete().eq("id", orderId);
    load();
  }

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search);
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} total orders
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 border border-border bg-background px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, name, or phone..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
        >
          <option value="all">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {statusConfig[s]?.label ?? s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 border border-border bg-background">
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Loading orders...
          </p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <ShoppingCart className="size-12 text-muted-foreground/30" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">
              {orders.length === 0
                ? "No orders yet. Orders will appear here when customers buy from your store."
                : "No orders match your filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Order #</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((order) => {
                  const s = statusConfig[order.status] ?? statusConfig.pending!;
                  return (
                    <tr key={order.id} className="hover:bg-muted/50">
                      <td className="px-5 py-3 font-medium">{order.order_number}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3 font-semibold">
                        ৳{Number(order.total).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`cursor-pointer rounded-full border-0 px-2.5 py-0.5 text-xs font-medium ${s.color}`}
                        >
                          {statuses.map((st) => (
                            <option key={st} value={st}>
                              {statusConfig[st]?.label ?? st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setViewing(order)}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="text-xs font-semibold text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewing && <OrderDetail order={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  const s = statusConfig[order.status] ?? statusConfig.pending!;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-lg bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-bold">{order.order_number}</h2>
            <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
              <s.icon className="size-3" />
              {s.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Customer
            </h3>
            <p className="text-sm font-medium">{order.customer_name}</p>
            <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
            {order.customer_address && (
              <p className="mt-1 text-sm text-muted-foreground">{order.customer_address}</p>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Items
            </h3>
            {(!order.items || order.items.length === 0) ? (
              <p className="text-sm text-muted-foreground">No items recorded.</p>
            ) : (
              <ul className="divide-y divide-border border border-border">
                {order.items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.color} · Size {item.size} · Qty {item.qty}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      ৳{(item.price * item.qty).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm font-semibold uppercase tracking-wide">Total</span>
            <span className="text-xl font-bold">৳{Number(order.total).toLocaleString()}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Placed on {new Date(order.created_at).toLocaleString("en-GB")}
          </p>
        </div>
      </div>
    </div>
  );
}
