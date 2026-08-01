import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingCart, Tags, Store, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart, end: false },
  { to: "/admin/categories", label: "Categories", icon: Tags, end: false },
];

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
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
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              end={item.end}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [&.active]:bg-primary [&.active]:text-primary-foreground"
            >
              <item.icon className="size-4.5" />
              {item.label}
            </Link>
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

      {/* Mobile top bar */}
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

      {/* Mobile nav */}
      <nav className="flex gap-1 overflow-x-auto border-b border-border bg-background px-2 py-2 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            end={item.end}
            className="flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted [&.active]:bg-primary [&.active]:text-primary-foreground"
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
