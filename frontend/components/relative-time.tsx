"use client";

import { useSyncExternalStore } from "react";
import { relativeTime } from "@/lib/utils";

/**
 * One shared ticker drives every mounted `RelativeTime`, rather than each
 * instance owning an interval. The timer only runs while something is
 * subscribed.
 */
const listeners = new Set<() => void>();
let ticker: ReturnType<typeof setInterval> | null = null;

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  ticker ??= setInterval(() => {
    for (const listener of listeners) listener();
  }, 15_000);

  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0 && ticker !== null) {
      clearInterval(ticker);
      ticker = null;
    }
  };
}

/**
 * Renders a live "12s ago" style timestamp.
 *
 * `relativeTime` depends on `Date.now()`, so the server and the client compute
 * different strings for the same request. `useSyncExternalStore` models that
 * directly: React renders the server snapshot during hydration, then re-renders
 * with the client snapshot the moment hydration finishes. `suppressHydrationWarning`
 * stays because the server produced its HTML at a different instant than the
 * client's hydration-time snapshot.
 */
export function RelativeTime({ iso }: { iso: string }) {
  const label = useSyncExternalStore(
    subscribe,
    () => relativeTime(iso),
    () => relativeTime(iso),
  );

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {label}
    </time>
  );
}
