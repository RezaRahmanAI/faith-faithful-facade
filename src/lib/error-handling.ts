export type ErrorType =
  | "network"
  | "api"
  | "validation"
  | "auth"
  | "offline"
  | "runtime"
  | "unknown";

export type ErrorSeverity = "error" | "warning" | "info";

export type ClassifiedError = {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  retryable: boolean;
  statusCode?: number;
  originalError: unknown;
};

const USER_MESSAGES: Record<ErrorType, string> = {
  network: "Connection problem. Please check your internet and try again.",
  api: "The server couldn't handle that request. Please try again in a moment.",
  validation: "Some information was missing or incorrect. Please review and try again.",
  auth: "Your session has expired. Please sign in again.",
  offline: "You're currently offline. Your changes will sync when you reconnect.",
  runtime: "Something went wrong on our end. We've been notified and are looking into it.",
  unknown: "An unexpected error occurred. Please try again.",
};

export function classifyError(error: unknown): ClassifiedError {
  // Offline / network
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return {
      type: "offline",
      severity: "warning",
      message: describeError(error),
      userMessage: USER_MESSAGES.offline,
      retryable: true,
      originalError: error,
    };
  }

  // Supabase error shape: { message, code, details, hint }
  if (typeof error === "object" && error !== null && "message" in error) {
    const supa = error as { message: string; code?: string; details?: string };
    if (supa.code === "23505" || /duplicate/i.test(supa.message)) {
      return {
        type: "validation",
        severity: "warning",
        message: supa.message,
        userMessage: "This item already exists. Please use a different value.",
        retryable: false,
        originalError: error,
      };
    }
    if (supa.code === "42501" || /permission|policy|rls/i.test(supa.message)) {
      return {
        type: "auth",
        severity: "error",
        message: supa.message,
        userMessage: USER_MESSAGES.auth,
        retryable: false,
        originalError: error,
      };
    }
  }

  // Fetch / Response errors
  if (error instanceof Response) {
    const type = error.status >= 500 ? "api" : error.status === 401 || error.status === 403 ? "auth" : "api";
    return {
      type,
      severity: "error",
      message: `HTTP ${error.status}`,
      userMessage: type === "auth" ? USER_MESSAGES.auth : USER_MESSAGES.api,
      retryable: error.status >= 500,
      statusCode: error.status,
      originalError: error,
    };
  }

  // TypeError often means network failure
  if (error instanceof TypeError && /fetch|network|Failed to fetch/i.test(error.message)) {
    return {
      type: "network",
      severity: "error",
      message: error.message,
      userMessage: USER_MESSAGES.network,
      retryable: true,
      originalError: error,
    };
  }

  // Zod / validation errors
  if (error instanceof Error && /validation|invalid|required/i.test(error.message)) {
    return {
      type: "validation",
      severity: "warning",
      message: error.message,
      userMessage: USER_MESSAGES.validation,
      retryable: false,
      originalError: error,
    };
  }

  // Generic Error
  if (error instanceof Error) {
    return {
      type: "runtime",
      severity: "error",
      message: error.message,
      userMessage: USER_MESSAGES.runtime,
      retryable: true,
      originalError: error,
    };
  }

  return {
    type: "unknown",
    severity: "error",
    message: describeError(error),
    userMessage: USER_MESSAGES.unknown,
    retryable: true,
    originalError: error,
  };
}

export function describeError(error: unknown): string {
  if (error instanceof Error) return error.stack ?? `${error.name}: ${error.message}`;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error) ?? String(error);
  } catch {
    return String(error);
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; delayMs?: number; retryable?: (e: ClassifiedError) => boolean } = {},
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, retryable } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const classified = classifyError(error);
      const shouldRetry = retryable ? retryable(classified) : classified.retryable;
      if (!shouldRetry || attempt === maxRetries) throw error;
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}
