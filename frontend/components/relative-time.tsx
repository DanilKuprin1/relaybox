"use client";

import { useEffect, useState } from "react";
import { relativeTime } from "@/lib/utils";

/**
 * Renders a live "12s ago" style timestamp.
 *
 * `relativeTime` depends on `Date.now()`, so the server and the client compute
 * different strings for the same request. `suppressHydrationWarning` is the
 * sanctioned escape hatch for exactly this case: the client value is the
 * correct one and it replaces the server value on mount. The interval then
 * keeps the label fresh while the pane stays open.
 */
export function RelativeTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState(() => relativeTime(iso));

  useEffect(() => {
    setLabel(relativeTime(iso));
    const id = setInterval(() => setLabel(relativeTime(iso)), 15_000);
    return () => clearInterval(id);
  }, [iso]);

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {label}
    </time>
  );
}
