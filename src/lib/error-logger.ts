import { supabase } from "./supabase";
import { classifyError, type ClassifiedError } from "./error-handling";

type LogEntry = {
  error_type: string;
  severity: string;
  message: string;
  stack?: string;
  route?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
};

const QUEUE: LogEntry[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const FLUSH_DELAY = 3000;
const MAX_QUEUE = 10;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(flushQueue, FLUSH_DELAY);
}

async function flushQueue() {
  flushTimer = null;
  if (QUEUE.length === 0) return;
  const batch = QUEUE.splice(0, QUEUE.length);
  try {
    await supabase.from("error_logs").insert(batch);
  } catch {
    // If logging itself fails, re-queue a subset to avoid infinite growth
    QUEUE.unshift(...batch.slice(-MAX_QUEUE));
  }
}

export function logError(error: unknown, context: Record<string, unknown> = {}) {
  const classified = classifyError(error);
  const entry: LogEntry = {
    error_type: classified.type,
    severity: classified.severity,
    message: classified.message,
    route: typeof window !== "undefined" ? window.location.pathname : undefined,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    metadata: { ...context, statusCode: classified.statusCode },
  };
  if (classified.originalError instanceof Error && classified.originalError.stack) {
    entry.stack = classified.originalError.stack;
  }

  QUEUE.push(entry);
  if (QUEUE.length >= MAX_QUEUE) {
    void flushQueue();
  } else {
    scheduleFlush();
  }

  // Also report to Lovable if available
  if (typeof window !== "undefined" && window.__lovableReportRuntimeError) {
    window.__lovableReportRuntimeError({
      message: classified.message,
      stack: entry.stack,
      filename: entry.route,
    });
  }
}

export function logClassifiedError(classified: ClassifiedError, context: Record<string, unknown> = {}) {
  logError(classified.originalError, { ...context, classified: classified.type });
}

// Flush remaining errors when the page is closing
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (QUEUE.length > 0) void flushQueue();
  });
}
