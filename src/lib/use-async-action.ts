import { useCallback, useState } from "react";
import { toast } from "sonner";
import { classifyError, withRetry, type ClassifiedError } from "./error-handling";
import { logError } from "./error-logger";

type AsyncState<T> = {
  data: T | null;
  error: ClassifiedError | null;
  loading: boolean;
};

export function useAsyncAction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: {
    successMessage?: string;
    retryable?: boolean;
    context?: string;
  } = {},
) {
  const [state, setState] = useState<AsyncState<TResult>>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const result = options.retryable
          ? await withRetry(() => fn(...args))
          : await fn(...args);
        setState({ data: result, error: null, loading: false });
        if (options.successMessage) toast.success(options.successMessage);
        return result;
      } catch (error) {
        const classified = classifyError(error);
        setState({ data: null, error: classified, loading: false });
        logError(error, { action: options.context ?? "async_action" });
        toast.error(classified.userMessage);
        return null;
      }
    },
    [fn, options.retryable, options.successMessage, options.context],
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return { ...state, execute, reset };
}

export function useSafeAsync() {
  return useCallback(async function safeAsync<T>(
    fn: () => Promise<T>,
    options: { successMessage?: string; errorMessage?: string; context?: string } = {},
  ): Promise<T | null> {
    try {
      const result = await fn();
      if (options.successMessage) toast.success(options.successMessage);
      return result;
    } catch (error) {
      const classified = classifyError(error);
      logError(error, { action: options.context ?? "safe_async" });
      toast.error(options.errorMessage ?? classified.userMessage);
      return null;
    }
  }, []);
}
