import { useEffect, useState, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    function goOnline() {
      setIsOnline(true);
    }
    function goOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
}

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [visible, setVisible] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Show "back online" briefly, then hide
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isOnline, wasOffline]);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white transition-transform ${
        isOnline ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="size-4" />
          Back online — your changes are syncing
        </>
      ) : (
        <>
          <WifiOff className="size-4" />
          You're offline — changes will sync when you reconnect
        </>
      )}
    </div>
  );
}

export function useNetworkRetry() {
  const isOnline = useOnlineStatus();
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  return { isOnline, retryCount, retry };
}

export function OfflineRetryButton({ onRetry, isRetrying }: { onRetry: () => void; isRetrying?: boolean }) {
  return (
    <button
      onClick={onRetry}
      disabled={isRetrying}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
    >
      <RefreshCw className={`size-4 ${isRetrying ? "animate-spin" : ""}`} />
      {isRetrying ? "Retrying..." : "Retry"}
    </button>
  );
}
