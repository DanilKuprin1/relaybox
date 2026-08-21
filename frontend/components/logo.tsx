import { cn } from "@/lib/utils";

/**
 * RelayBox mark: three stacked "log lines" standing in for captured requests,
 * with the middle one active and carrying a live pulse dot — the same visual
 * language the dashboard uses for a selected request on a live endpoint.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="RelayBox"
      className={cn("size-6 text-primary", className)}
    >
      <rect
        x="2.2"
        y="4.8"
        width="12"
        height="2.6"
        rx="1.3"
        fill="currentColor"
        opacity="0.32"
      />
      <rect
        x="2.2"
        y="10.7"
        width="14.5"
        height="2.6"
        rx="1.3"
        fill="currentColor"
      />
      <rect
        x="2.2"
        y="16.6"
        width="10.5"
        height="2.6"
        rx="1.3"
        fill="currentColor"
        opacity="0.32"
      />
      <circle cx="19.6" cy="12" r="1.9" fill="var(--live)" />
    </svg>
  );
}
