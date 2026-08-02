import { Component, type ReactNode } from "react";
import { logError } from "@/lib/error-logger";
import { classifyError } from "@/lib/error-handling";
import { TriangleAlert as AlertTriangle, RefreshCw, Hop as Home } from "lucide-react";

type Props = {
  children: ReactNode;
  fallback?: (error: ClassifiedErrorInfo, retry: () => void) => ReactNode;
  context?: string;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

type ClassifiedErrorInfo = {
  type: string;
  userMessage: string;
  retryable: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    logError(error, { boundary: this.props.context ?? "error_boundary" });
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const classified = classifyError(this.state.error);
      const info: ClassifiedErrorInfo = {
        type: classified.type,
        userMessage: classified.userMessage,
        retryable: classified.retryable,
      };

      if (this.props.fallback) {
        return this.props.fallback(info, this.retry);
      }

      return <DefaultFallback info={info} retry={this.retry} />;
    }
    return this.props.children;
  }
}

function DefaultFallback({ info, retry }: { info: ClassifiedErrorInfo; retry: () => void }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-8 text-destructive" />
      </div>
      <h2 className="mt-4 text-lg font-bold">{info.userMessage}</h2>
      <p className="mt-1 text-sm text-muted-foreground">Error type: {info.type}</p>
      <div className="mt-6 flex gap-2">
        {info.retryable && (
          <button
            onClick={retry}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        )}
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
        >
          <Home className="size-4" />
          Go home
        </a>
      </div>
    </div>
  );
}
