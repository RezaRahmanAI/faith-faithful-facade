import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type NotificationCounts = {
  newDrafts: number;
  newIncomplete: number;
  newOrders: number;
  recovered: number;
};

const ZERO: NotificationCounts = { newDrafts: 0, newIncomplete: 0, newOrders: 0, recovered: 0 };
const POLL_INTERVAL = 30_000;
const RECENT_THRESHOLD_MINUTES = 30;

export function useAdminNotifications() {
  const [counts, setCounts] = useState<NotificationCounts>(ZERO);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchCounts() {
      const threshold = new Date(Date.now() - RECENT_THRESHOLD_MINUTES * 60 * 1000).toISOString();

      const [draftsResult, incompleteResult, ordersResult, recoveredResult] = await Promise.all([
        supabase
          .from("draft_orders")
          .select("id", { count: "exact", head: true })
          .eq("status", "draft")
          .gte("created_at", threshold),
        supabase
          .from("draft_orders")
          .select("id", { count: "exact", head: true })
          .eq("status", "incomplete")
          .eq("recovery_status", "pending")
          .gte("updated_at", threshold),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .gte("created_at", threshold),
        supabase
          .from("draft_orders")
          .select("id", { count: "exact", head: true })
          .eq("recovery_status", "recovered")
          .gte("updated_at", threshold),
      ]);

      setCounts({
        newDrafts: draftsResult.count ?? 0,
        newIncomplete: incompleteResult.count ?? 0,
        newOrders: ordersResult.count ?? 0,
        recovered: recoveredResult.count ?? 0,
      });
      setLastChecked(new Date());
    }

    fetchCounts();
    const interval = setInterval(fetchCounts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const total = counts.newDrafts + counts.newIncomplete + counts.newOrders + counts.recovered;

  return { counts, total, lastChecked };
}
