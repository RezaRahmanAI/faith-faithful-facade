import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Phone, MessageCircle, CircleCheck as CheckCircle2, Circle as XCircle, RotateCcw, FileText, Clock, X, Calendar, User, History } from "lucide-react";
import { supabase, type DraftOrder, type LandingPage, type LeadActivity, type RecoveryNote } from "@/lib/supabase";

export const Route = createFileRoute("/admin/incomplete-orders")({
  component: IncompleteOrders,
});

type DraftWithPage = DraftOrder & {
  landing_pages: { title: string; slug: string } | null;
};

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-blue-100 text-blue-800" },
  incomplete: { label: "Incomplete", color: "bg-orange-100 text-orange-800" },
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
};

const recoveryConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-gray-100 text-gray-600" },
  contacted: { label: "Contacted", color: "bg-blue-100 text-blue-800" },
  recovered: { label: "Recovered", color: "bg-green-100 text-green-800" },
  "not-interested": { label: "Not Interested", color: "bg-red-100 text-red-800" },
  "follow-up": { label: "Follow-up", color: "bg-yellow-100 text-yellow-800" },
};

function IncompleteOrders() {
  const [drafts, setDrafts] = useState<DraftWithPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRecovery, setFilterRecovery] = useState("all");
  const [viewing, setViewing] = useState<DraftWithPage | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("draft_orders")
      .select("*, landing_pages(title, slug)")
      .order("last_activity_at", { ascending: false });
    setDrafts((data as DraftWithPage[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateRecoveryStatus(id: string, status: string) {
    await supabase.from("draft_orders").update({ recovery_status: status }).eq("id", id);
    load();
  }

  async function convertToOrder(draft: DraftWithPage) {
    if (!confirm("Convert this draft to a confirmed order?")) return;

    const orderNum = `ORD-${Date.now().toString(36).toUpperCase()}`;
    await supabase.from("orders").insert({
      order_number: orderNum,
      customer_name: draft.customer_name,
      customer_phone: draft.customer_phone,
      customer_address: `${draft.customer_district ?? ""}, ${draft.customer_area ?? ""}, ${draft.customer_address ?? ""}`,
      items: [
        {
          slug: "",
          name: draft.product_name ?? "",
          size: "",
          color: "",
          qty: draft.quantity,
          price: draft.unit_price,
        },
      ],
      total: draft.total,
      status: "pending",
    });

    await supabase
      .from("draft_orders")
      .update({
        status: "confirmed",
        recovery_status: "recovered",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", draft.id);

    load();
  }

  async function deleteDraft(id: string) {
    if (!confirm("Delete this draft permanently?")) return;
    await supabase.from("draft_orders").delete().eq("id", id);
    load();
  }

  const filtered = drafts.filter((d) => {
    const matchesSearch =
      (d.customer_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (d.customer_phone ?? "").includes(search);
    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    const matchesRecovery = filterRecovery === "all" || d.recovery_status === filterRecovery;
    return matchesSearch && matchesStatus && matchesRecovery;
  });

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-bold">Incomplete Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {drafts.length} total · {drafts.filter((d) => d.status === "incomplete").length} incomplete · {drafts.filter((d) => d.recovery_status === "recovered").length} recovered
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 border border-border bg-background px-3 py-2">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-border bg-background px-3 py-2 text-sm outline-none">
          <option value="all">All Statuses</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterRecovery} onChange={(e) => setFilterRecovery(e.target.value)} className="border border-border bg-background px-3 py-2 text-sm outline-none">
          <option value="all">All Recovery</option>
          {Object.entries(recoveryConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="mt-4 border border-border bg-background">
        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
            <Clock className="size-12 text-muted-foreground/30" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">
              {drafts.length === 0 ? "No drafts yet. Incomplete orders will appear here when customers start but don't finish ordering." : "No drafts match your filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Landing Page</th>
                  <th className="px-4 py-3 font-semibold">Campaign</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Recovery</th>
                  <th className="px-4 py-3 font-semibold">Last Activity</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{d.customer_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{d.customer_phone ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{d.product_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {d.landing_pages?.title ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {d.utm_source ? `${d.utm_source} / ${d.utm_campaign ?? ""}` : "—"}
                    </td>
                    <td className="px-4 py-3 font-semibold">৳{Number(d.total).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[d.status]?.color ?? statusConfig.draft.color}`}>
                        {statusConfig[d.status]?.label ?? d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={d.recovery_status}
                        onChange={(e) => updateRecoveryStatus(d.id, e.target.value)}
                        className={`cursor-pointer rounded-full border-0 px-2.5 py-0.5 text-xs font-medium ${recoveryConfig[d.recovery_status]?.color ?? recoveryConfig.pending.color}`}
                      >
                        {Object.entries(recoveryConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(d.last_activity_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setViewing(d)} className="text-xs font-semibold text-primary hover:underline">View</button>
                        <button onClick={() => convertToOrder(d)} className="text-xs font-semibold text-green-600 hover:underline">Convert</button>
                        <button onClick={() => deleteDraft(d.id)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewing && <DraftDetail draft={viewing} onClose={() => setViewing(null)} onUpdated={load} />}
    </div>
  );
}

function DraftDetail({ draft, onClose, onUpdated }: { draft: DraftWithPage; onClose: () => void; onUpdated: () => void }) {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [notes, setNotes] = useState<RecoveryNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [staffName, setStaffName] = useState(draft.assigned_staff ?? "");

  async function loadDetail() {
    const [actRes, noteRes] = await Promise.all([
      supabase.from("lead_activities").select("*").eq("visitor_id", draft.visitor_id ?? "").order("created_at", { ascending: true }),
      supabase.from("recovery_notes").select("*").eq("draft_order_id", draft.id).order("created_at", { ascending: false }),
    ]);
    setActivities((actRes.data as LeadActivity[]) ?? []);
    setNotes((noteRes.data as RecoveryNote[]) ?? []);
  }

  useEffect(() => {
    loadDetail();
  }, [draft.id, draft.visitor_id]);

  async function addNote(type: string) {
    if (!newNote.trim()) return;
    await supabase.from("recovery_notes").insert({
      draft_order_id: draft.id,
      note_type: type,
      content: newNote,
      author: staffName || "Admin",
    });
    setNewNote("");
    loadDetail();
  }

  async function assignStaff() {
    await supabase.from("draft_orders").update({ assigned_staff: staffName }).eq("id", draft.id);
    if (staffName) {
      await supabase.from("recovery_assignments").insert({
        draft_order_id: draft.id,
        staff_name: staffName,
      });
    }
    onUpdated();
  }

  const activityIcons: Record<string, typeof Clock> = {
    visited: Clock,
    started_form: FileText,
    saved_draft: FileText,
    left_page: X,
    confirmed_order: CheckCircle2,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-2xl bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold">Lead Details</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded text-muted-foreground hover:bg-muted">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          {/* Left: Customer info */}
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</h3>
              <p className="text-sm font-bold">{draft.customer_name ?? "—"}</p>
              <p className="text-sm text-muted-foreground">{draft.customer_phone ?? "—"}</p>
              {draft.customer_district && <p className="text-sm text-muted-foreground">{draft.customer_district}, {draft.customer_area}</p>}
              {draft.customer_address && <p className="text-sm text-muted-foreground">{draft.customer_address}</p>}
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product</h3>
              <p className="text-sm font-medium">{draft.product_name ?? "—"}</p>
              <p className="text-sm text-muted-foreground">Qty: {draft.quantity} × ৳{Number(draft.unit_price).toLocaleString()}</p>
              <p className="text-sm font-bold">Total: ৳{Number(draft.total).toLocaleString()}</p>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campaign</h3>
              <div className="space-y-0.5 text-xs text-muted-foreground">
                {draft.utm_source && <p>Source: {draft.utm_source}</p>}
                {draft.utm_medium && <p>Medium: {draft.utm_medium}</p>}
                {draft.utm_campaign && <p>Campaign: {draft.utm_campaign}</p>}
                {draft.referrer && <p>Referrer: {draft.referrer}</p>}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recovery Actions</h3>
              <div className="flex flex-wrap gap-2">
                <a href={`tel:${draft.customer_phone}`} className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                  <Phone className="size-3.5" /> Call
                </a>
                <a href={`https://wa.me/88${draft.customer_phone?.replace(/^0/, "") ?? ""}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                  <MessageCircle className="size-3.5" /> WhatsApp
                </a>
                <button onClick={() => updateRecovery(draft.id, "recovered")} className="inline-flex items-center gap-1.5 border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50">
                  <CheckCircle2 className="size-3.5" /> Recovered
                </button>
                <button onClick={() => updateRecovery(draft.id, "not-interested")} className="inline-flex items-center gap-1.5 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">
                  <XCircle className="size-3.5" /> Not Interested
                </button>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assign Sales Executive</h3>
              <div className="flex gap-2">
                <input value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Staff name" className="h-9 flex-1 border border-border px-3 text-sm outline-none focus:border-ring" />
                <button onClick={assignStaff} className="bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90">Assign</button>
              </div>
            </div>
          </div>

          {/* Right: Timeline + Notes */}
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <History className="size-3.5" /> Customer Timeline
              </h3>
              <div className="space-y-2 border-l-2 border-border pl-4">
                {activities.map((a) => {
                  const Icon = activityIcons[a.activity_type] ?? Clock;
                  return (
                    <div key={a.id} className="relative">
                      <span className="absolute -left-[1.4rem] grid size-6 place-items-center rounded-full bg-background">
                        <Icon className="size-3.5 text-muted-foreground" />
                      </span>
                      <p className="text-sm font-medium">{a.description ?? a.activity_type}</p>
                      <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("en-GB")}</p>
                    </div>
                  );
                })}
                {activities.length === 0 && <p className="text-xs text-muted-foreground">No activity recorded.</p>}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Internal Notes</h3>
              <div className="space-y-2">
                {notes.map((n) => (
                  <div key={n.id} className="border border-border bg-muted/30 p-2">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">{n.author ?? "Admin"}</span> · {n.note_type} · {new Date(n.created_at).toLocaleString("en-GB")}
                    </p>
                    <p className="mt-1 text-sm">{n.content}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-1">
                <input value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a note..." className="h-9 flex-1 border border-border px-3 text-sm outline-none focus:border-ring" />
                <button onClick={() => addNote("note")} className="bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90">Add</button>
              </div>
              <div className="mt-1 flex gap-1">
                <button onClick={() => addNote("call")} className="text-xs font-semibold text-blue-600 hover:underline">+ Call Log</button>
                <button onClick={() => addNote("sms")} className="text-xs font-semibold text-blue-600 hover:underline">+ SMS Sent</button>
                <button onClick={() => addNote("follow-up")} className="text-xs font-semibold text-yellow-600 hover:underline">+ Follow-up</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  async function updateRecovery(id: string, status: string) {
    await supabase.from("draft_orders").update({ recovery_status: status }).eq("id", id);
    onUpdated();
    onClose();
  }
}
