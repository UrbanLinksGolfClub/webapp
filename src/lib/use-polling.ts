"use client";

import { useEffect, useRef } from "react";

/** Calls `callback` on an interval, and immediately whenever the tab
 * regains focus/visibility -- so a member sees changes made by someone
 * else (a booking, a join) without needing to manually reload. */
export function usePolling(callback: () => void, intervalMs: number) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    const tick = () => savedCallback.current();
    const interval = setInterval(tick, intervalMs);

    function onVisibility() {
      if (document.visibilityState === "visible") tick();
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", tick);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", tick);
    };
  }, [intervalMs]);
}
