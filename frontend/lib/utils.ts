import type { HttpMethod } from "./mock-data";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.round(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export function fullTimestamp(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const METHOD_TOKENS: Record<HttpMethod, { text: string; bg: string; border: string }> = {
  GET: { text: "text-method-get", bg: "bg-method-get/10", border: "border-method-get/25" },
  POST: { text: "text-method-post", bg: "bg-method-post/10", border: "border-method-post/25" },
  PUT: { text: "text-method-put", bg: "bg-method-put/10", border: "border-method-put/25" },
  PATCH: { text: "text-method-patch", bg: "bg-method-patch/10", border: "border-method-patch/25" },
  DELETE: { text: "text-method-delete", bg: "bg-method-delete/10", border: "border-method-delete/25" },
};

export function methodTokens(method: HttpMethod) {
  return METHOD_TOKENS[method];
}
