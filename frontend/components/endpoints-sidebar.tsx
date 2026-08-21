"use client";

import { Plus, Radio, Trash2, Webhook } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import type { Endpoint } from "@/lib/mock-data";
import { MAX_ENDPOINTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function EndpointsSidebar({
  endpoints,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  className,
}: {
  endpoints: Endpoint[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  className?: string;
}) {
  const { user } = useUser();
  const atLimit = endpoints.length >= MAX_ENDPOINTS;

  return (
    <aside
      className={cn(
        "w-full shrink-0 flex-col border-border bg-surface lg:w-[264px] lg:border-r",
        className,
      )}
    >
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

      <nav className="scroll-thin flex flex-1 flex-col gap-1 overflow-y-auto px-2">
        {endpoints.map((ep) => {
          const active = ep.id === selectedId;
          return (
            <div
              key={ep.id}
              className={cn(
                "group relative rounded-lg border transition-colors",
                active
                  ? "border-border-strong bg-surface-muted"
                  : "border-transparent hover:bg-surface-muted",
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(ep.id)}
                aria-current={active ? "true" : undefined}
                className="flex w-full flex-col gap-1 px-3 py-2.5 text-left"
              >
                <span className="flex items-center justify-between gap-2 pr-6">
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
              <button
                type="button"
                onClick={() => onDelete(ep.id)}
                aria-label={`Delete ${ep.name}`}
                className="absolute right-1.5 top-1.5 rounded-md p-2 text-muted-foreground transition-all hover:bg-danger-muted hover:text-danger focus-visible:opacity-100 lg:p-1 lg:opacity-0 lg:group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </div>
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

      <div className="flex items-center gap-2.5 border-t border-border px-3 py-3">
        <UserButton
          appearance={{ elements: { avatarBox: "size-7" } }}
          afterSignOutUrl="/"
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-xs font-medium text-foreground">
            {user?.fullName ?? user?.username ?? "Signed in"}
          </span>
          <span className="truncate font-mono text-[11px] text-muted-foreground">
            {user?.primaryEmailAddress?.emailAddress ?? ""}
          </span>
        </div>
      </div>
    </aside>
  );
}
