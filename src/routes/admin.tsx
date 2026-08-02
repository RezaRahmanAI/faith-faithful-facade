import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingCart, Tags, Store, LogOut, Rocket, Clock, ChartBar as BarChart3 } from "lucide-react";
import { useAdminNotifications } from "@/lib/use-admin-notifications";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const navSections = [
  {
    label: "Store",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true, badgeKey: null },
      { to: "/admin/products", label: "Products", icon: Package, end: false, badgeKey: null },
      { to: "/admin/orders", label: "Orders", icon: ShoppingCart, end: false, badgeKey: "newOrders" as const },
      { to: "/admin/categories", label: "Categories", icon: Tags, end: false, badgeKey: null },
    ],
  },
  {
    label: "Marketing",
    items: [
      { to: "/admin/landing-pages", label: "Landing Pages", icon: Rocket, end: false, badgeKey: null },
      { to: "/admin/incomplete-orders", label: "Incomplete Orders", icon: Clock, end: false, badgeKey: "newIncomplete" as const },
      { to: "/admin/analytics", label: "Campaign Analytics", icon: BarChart3, end: false, badgeKey: null },
    ],
  },
];

function AdminLayout() {
  const { counts } = useAdminNotifications();
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="flex items-center gap-2 border-b border-border px-6 py-5">
          <span className="grid size-8 place-items-center rounded-sm bg-primary text-primary-foreground font-black text-sm">
            N
          </span>
          <span className="text-lg font-extrabold tracking-tight">nexora</span>
          <span className="ml-auto text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Admin
          </span>
        </div>
        <nav className="flex-1 space-y-4 overflow-y-auto p-4">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const badge = item.badgeKey ? counts[item.badgeKey] : 0;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&.active]:bg-primary [&.active]:text-primary-foreground"
                    >
                      <item.icon className="size-4.5" />
                      {item.label}
                      {badge > 0 && (
                        <span className="ml-auto grid size-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                          {badge > 9 ? "9+" : badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Store className="size-4.5" />
            View Store
          </Link>
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <LogOut className="size-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-sm bg-primary text-primary-foreground font-black text-xs">
            N
          </span>
          <span className="font-extrabold">nexora Admin</span>
        </div>
        <Link to="/" className="text-sm font-semibold text-sale">
          View Store
        </Link>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-border bg-background px-2 py-2 md:hidden">
        {navSections.flatMap((s) => s.items).map((item) => {
          const badge = item.badgeKey ? counts[item.badgeKey] : 0;
          return (
            <Link
              key={item.to}
              to={item.to}
              end={item.end}
              className="flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted [&.active]:bg-primary [&.active]:text-primary-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
              {badge > 0 && (
                <span className="grid size-4 place-items-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
