"use client";

import { Plus, Radio, Webhook } from "lucide-react";
import type { Endpoint } from "@/lib/mock-data";
import { MAX_ENDPOINTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function EndpointsSidebar({
  endpoints,
  selectedId,
  onSelect,
  onCreate,
}: {
  endpoints: Endpoint[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
}) {
  const atLimit = endpoints.length >= MAX_ENDPOINTS;

  return (
    <aside className="flex w-[264px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
          <Webhook className="size-4" aria-hidden />
        </div>
        <span className="font-semibold tracking-tight">RelayBox</span>
      </div>

      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Endpoints
        </span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {endpoints.length}/{MAX_ENDPOINTS}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2">
        {endpoints.map((ep) => {
          const active = ep.id === selectedId;
          return (
            <button
              key={ep.id}
              type="button"
              onClick={() => onSelect(ep.id)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "group flex flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors",
                active
                  ? "border-border-strong bg-surface-muted"
                  : "border-transparent hover:bg-surface-muted",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-foreground">
                  {ep.name}
                </span>
                {ep.enabled ? (
                  <span className="flex items-center gap-1 text-live">
                    <span className="relative flex size-1.5">
                      <span className="animate-live-pulse absolute inline-flex size-full rounded-full bg-live" />
                    </span>
                  </span>
                ) : (
                  <span className="size-1.5 rounded-full bg-border-strong" />
                )}
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                <Radio className="size-3" aria-hidden />
                {ep.requests.length} captured
                {!ep.enabled && (
                  <span className="ml-auto rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border">
                    Disabled
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-3">
        <button
          type="button"
          onClick={onCreate}
          disabled={atLimit}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            atLimit
              ? "cursor-not-allowed bg-surface-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:opacity-90",
          )}
        >
          <Plus className="size-4" aria-hidden />
          New endpoint
        </button>
        {atLimit && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Endpoint limit reached ({MAX_ENDPOINTS} max)
          </p>
        )}
      </div>
    </aside>
  );
}
