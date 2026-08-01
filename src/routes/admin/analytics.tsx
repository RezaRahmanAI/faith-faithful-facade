import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Eye, ShoppingCart, Clock, TrendingUp, DollarSign, ChartBar as BarChart3, Smartphone, Monitor } from "lucide-react";
import { supabase, type LandingPage, type LandingVisitor, type DraftOrder } from "@/lib/supabase";

export const Route = createFileRoute("/admin/analytics")({
  component: CampaignAnalytics,
});

type AnalyticsData = {
  totalVisitors: number;
  uniqueVisitors: number;
  totalOrders: number;
  incompleteOrders: number;
  recoveredOrders: number;
  totalRevenue: number;
  conversionRate: number;
  avgOrderValue: number;
  bounceRate: number;
  topSources: { source: string; count: number }[];
  topCampaigns: { campaign: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  districtOrders: { district: string; count: number }[];
  perPage: {
    id: string;
    title: string;
    slug: string;
    views: number;
    orders: number;
    incomplete: number;
    conversion: number;
    revenue: number;
  }[];
};

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: typeof Users; color: string }) {
  return (
    <div className="border border-border bg-background p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className={`grid size-10 place-items-center rounded-md ${color}`}>
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}

function CampaignAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [visitors, drafts, pages] = await Promise.all([
        supabase.from("landing_visitors").select("*"),
        supabase.from("draft_orders").select("*"),
        supabase.from("landing_pages").select("*").order("created_at", { ascending: false }),
      ]);

      const allVisitors = (visitors.data as LandingVisitor[]) ?? [];
      const allDrafts = (drafts.data as DraftOrder[]) ?? [];
      const allPages = (pages.data as LandingPage[]) ?? [];

      const confirmedOrders = allDrafts.filter((d) => d.status === "confirmed");
      const incompleteOrders = allDrafts.filter((d) => d.status === "incomplete" || d.status === "draft");
      const recoveredOrders = allDrafts.filter((d) => d.recovery_status === "recovered");
      const totalRevenue = confirmedOrders.reduce((sum, d) => sum + Number(d.total), 0);
      const uniqueSessions = new Set(allVisitors.map((v) => v.session_id)).size;
      const bounced = allVisitors.filter((v) => v.is_bounced).length;

      // Top sources
      const sourceMap = new Map<string, number>();
      allVisitors.forEach((v) => {
        const src = v.utm_source ?? "direct";
        sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1);
      });
      const topSources = Array.from(sourceMap.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top campaigns
      const campaignMap = new Map<string, number>();
      allVisitors.forEach((v) => {
        const c = v.utm_campaign ?? "organic";
        campaignMap.set(c, (campaignMap.get(c) ?? 0) + 1);
      });
      const topCampaigns = Array.from(campaignMap.entries())
        .map(([campaign, count]) => ({ campaign, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Device breakdown
      const deviceMap = new Map<string, number>();
      allVisitors.forEach((v) => {
        const d = v.device ?? "Unknown";
        deviceMap.set(d, (deviceMap.get(d) ?? 0) + 1);
      });
      const deviceBreakdown = Array.from(deviceMap.entries()).map(([device, count]) => ({ device, count }));

      // District orders
      const districtMap = new Map<string, number>();
      confirmedOrders.forEach((d) => {
        const dist = d.customer_district ?? "Unknown";
        districtMap.set(dist, (districtMap.get(dist) ?? 0) + 1);
      });
      const districtOrders = Array.from(districtMap.entries())
        .map(([district, count]) => ({ district, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Per page stats
      const perPage = allPages.map((p) => {
        const pageVisitors = allVisitors.filter((v) => v.landing_page_id === p.id);
        const pageOrders = allDrafts.filter((d) => d.landing_page_id === p.id && d.status === "confirmed");
        const pageIncomplete = allDrafts.filter((d) => d.landing_page_id === p.id && (d.status === "incomplete" || d.status === "draft"));
        const pageRevenue = pageOrders.reduce((sum, d) => sum + Number(d.total), 0);
        const conversion = pageVisitors.length > 0 ? (pageOrders.length / pageVisitors.length) * 100 : 0;
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          views: p.views,
          orders: pageOrders.length,
          incomplete: pageIncomplete.length,
          conversion: Math.round(conversion * 100) / 100,
          revenue: pageRevenue,
        };
      });

      setData({
        totalVisitors: allVisitors.length,
        uniqueVisitors: uniqueSessions,
        totalOrders: confirmedOrders.length,
        incompleteOrders: incompleteOrders.length,
        recoveredOrders: recoveredOrders.length,
        totalRevenue,
        conversionRate: allVisitors.length > 0 ? Math.round((confirmedOrders.length / allVisitors.length) * 10000) / 100 : 0,
        avgOrderValue: confirmedOrders.length > 0 ? Math.round(totalRevenue / confirmedOrders.length) : 0,
        bounceRate: allVisitors.length > 0 ? Math.round((bounced / allVisitors.length) * 100) : 0,
        topSources,
        topCampaigns,
        deviceBreakdown,
        districtOrders,
        perPage,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading || !data) {
    return <div className="p-20 text-center text-sm text-muted-foreground">Loading analytics...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Campaign Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">Performance overview across all landing pages</p>

      {/* Top stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Visitors" value={String(data.totalVisitors)} icon={Users} color="bg-blue-100 text-blue-700" />
        <StatCard label="Orders" value={String(data.totalOrders)} icon={ShoppingCart} color="bg-green-100 text-green-700" />
        <StatCard label="Incomplete" value={String(data.incompleteOrders)} icon={Clock} color="bg-orange-100 text-orange-700" />
        <StatCard label="Recovered" value={String(data.recoveredOrders)} icon={TrendingUp} color="bg-purple-100 text-purple-700" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={`৳${data.totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-green-100 text-green-700" />
        <StatCard label="Conversion Rate" value={`${data.conversionRate}%`} icon={BarChart3} color="bg-blue-100 text-blue-700" />
        <StatCard label="Avg Order Value" value={`৳${data.avgOrderValue.toLocaleString()}`} icon={TrendingUp} color="bg-purple-100 text-purple-700" />
        <StatCard label="Bounce Rate" value={`${data.bounceRate}%`} icon={Eye} color="bg-red-100 text-red-700" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top Traffic Sources */}
        <div className="border border-border bg-background">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wide">Top Traffic Sources</h2>
          </div>
          <div className="space-y-2 p-5">
            {data.topSources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              data.topSources.map((s) => {
                const pct = data.totalVisitors > 0 ? (s.count / data.totalVisitors) * 100 : 0;
                return (
                  <div key={s.source}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{s.source}</span>
                      <span className="text-muted-foreground">{s.count} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Campaigns */}
        <div className="border border-border bg-background">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wide">Top Campaigns</h2>
          </div>
          <div className="space-y-2 p-5">
            {data.topCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              data.topCampaigns.map((c) => {
                const pct = data.totalVisitors > 0 ? (c.count / data.totalVisitors) * 100 : 0;
                return (
                  <div key={c.campaign}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{c.campaign}</span>
                      <span className="text-muted-foreground">{c.count} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="border border-border bg-background">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wide">Device Breakdown</h2>
          </div>
          <div className="p-5">
            {data.deviceBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            ) : (
              <div className="flex items-center gap-6">
                {data.deviceBreakdown.map((d) => (
                  <div key={d.device} className="text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted">
                      {d.device === "Mobile" ? <Smartphone className="size-6 text-muted-foreground" /> : <Monitor className="size-6 text-muted-foreground" />}
                    </div>
                    <p className="mt-2 text-lg font-bold">{d.count}</p>
                    <p className="text-xs text-muted-foreground">{d.device}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* District-wise Orders */}
        <div className="border border-border bg-background">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wide">District-wise Orders</h2>
          </div>
          <div className="space-y-2 p-5">
            {data.districtOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              data.districtOrders.map((d) => (
                <div key={d.district} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{d.district}</span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">{d.count} orders</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Per-page stats */}
      <div className="mt-6 border border-border bg-background">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold uppercase tracking-wide">Landing Page Performance</h2>
        </div>
        {data.perPage.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No landing pages yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">Page</th>
                  <th className="px-5 py-3 font-semibold">Views</th>
                  <th className="px-5 py-3 font-semibold">Orders</th>
                  <th className="px-5 py-3 font-semibold">Incomplete</th>
                  <th className="px-5 py-3 font-semibold">Conv. %</th>
                  <th className="px-5 py-3 font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.perPage.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/50">
                    <td className="px-5 py-3">
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">/l/{p.slug}</p>
                    </td>
                    <td className="px-5 py-3">{p.views}</td>
                    <td className="px-5 py-3 font-semibold text-green-600">{p.orders}</td>
                    <td className="px-5 py-3 font-semibold text-orange-500">{p.incomplete}</td>
                    <td className="px-5 py-3">{p.conversion}%</td>
                    <td className="px-5 py-3 font-semibold">৳{p.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
