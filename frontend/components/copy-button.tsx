"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground",
        className,
      )}
      aria-label={copied ? "Copied" : label ?? "Copy to clipboard"}
    >
      {copied ? (
        <Check className="size-3.5 text-live" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
      {label ? <span>{copied ? "Copied" : label}</span> : null}
    </button>
  );
}
