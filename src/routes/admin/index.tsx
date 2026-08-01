import { createFileRoute } from "@tanstack/react-router";
import { Package, ShoppingCart, Tags, TrendingUp, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase, type Product, type Order, type Category } from "@/lib/supabase";

export const Route = createFileRoute("/admin/")({
  component: DashboardOverview,
});

type Stats = {
  productCount: number;
  orderCount: number;
  categoryCount: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: Order[];
};

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Package;
  accent: string;
}) {
  return (
    <div className="border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className={`grid size-10 place-items-center rounded-md ${accent}`}>
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
};

function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [products, orders, categories] = await Promise.all([
        supabase.from("products").select("*"),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("categories").select("*"),
      ]);

      const allOrders = orders.data as Order[];
      const revenue = (allOrders as Order[]).reduce(
        (sum, o) => (o.status !== "cancelled" ? sum + Number(o.total) : sum),
        0,
      );
      const pending = (allOrders as Order[]).filter((o) => o.status === "pending").length;

      setStats({
        productCount: products.data?.length ?? 0,
        orderCount: orders.data?.length ?? 0,
        categoryCount: categories.data?.length ?? 0,
        totalRevenue: revenue,
        pendingOrders: pending,
        recentOrders: allOrders.slice(0, 5),
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center p-20">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Welcome back. Here's what's happening in your store.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={`৳${stats.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          accent="bg-green-100 text-green-700"
        />
        <StatCard
          label="Orders"
          value={String(stats.orderCount)}
          icon={ShoppingCart}
          accent="bg-blue-100 text-blue-700"
        />
        <StatCard
          label="Products"
          value={String(stats.productCount)}
          icon={Package}
          accent="bg-purple-100 text-purple-700"
        />
        <StatCard
          label="Categories"
          value={String(stats.categoryCount)}
          icon={Tags}
          accent="bg-orange-100 text-orange-700"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="border border-border bg-background lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wide">Recent Orders</h2>
            <span className="text-xs text-muted-foreground">
              {stats.pendingOrders} pending
            </span>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No orders yet. Orders will appear here when customers buy.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Order</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentOrders.map((order) => {
                  const s = statusConfig[order.status] ?? statusConfig.pending!;
                  return (
                    <tr key={order.id} className="hover:bg-muted/50">
                      <td className="px-5 py-3 font-medium">{order.order_number}</td>
                      <td className="px-5 py-3">{order.customer_name}</td>
                      <td className="px-5 py-3 font-semibold">
                        ৳{Number(order.total).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.color}`}>
                          <s.icon className="size-3" />
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick Status */}
        <div className="border border-border bg-background">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wide">Quick Stats</h2>
          </div>
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Orders</span>
              <span className="text-lg font-bold text-yellow-600">{stats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Products</span>
              <span className="text-lg font-bold">{stats.productCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Categories</span>
              <span className="text-lg font-bold">{stats.categoryCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <span className="text-lg font-bold text-green-600">
                ৳{stats.totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
