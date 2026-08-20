"use client";

import { useEffect, useState } from "react";
import { Webhook, X } from "lucide-react";

export function CreateEndpointDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-endpoint-title"
        className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary-muted text-primary">
              <Webhook className="size-4" aria-hidden />
            </div>
            <div>
              <h2
                id="create-endpoint-title"
                className="text-sm font-semibold text-foreground"
              >
                New webhook endpoint
              </h2>
              <p className="text-xs text-muted-foreground">
                We&apos;ll generate a unique public URL for you.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <form onSubmit={submit} className="mt-5">
          <label
            htmlFor="endpoint-name"
            className="text-xs font-medium text-foreground"
          >
            Endpoint name
          </label>
          <input
            id="endpoint-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="e.g. Stripe Production"
            className="mt-1.5 w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            A friendly label to help you recognise the source.
          </p>

          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create endpoint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
