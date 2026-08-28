"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, Inbox, Search } from "lucide-react";
import type { CapturedRequest, Endpoint } from "@/lib/mock-data";
import { endpointUrl } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { RelativeTime } from "@/components/relative-time";
import { MethodBadge } from "@/components/method-badge";
import { CopyButton } from "@/components/copy-button";

export function RequestList({
  endpoint,
  selectedRequestId,
  onSelectRequest,
  onToggleEnabled,
  onBack,
  className,
}: {
  endpoint: Endpoint;
  selectedRequestId: string | null;
  onSelectRequest: (id: string) => void;
  onToggleEnabled: () => void;
  onBack?: () => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return endpoint.requests;
    return endpoint.requests.filter(
      (r) =>
        r.method.toLowerCase().includes(q) ||
        r.path.toLowerCase().includes(q) ||
        r.sourceIp.includes(q),
    );
  }, [endpoint.requests, query]);

  return (
    <section
      className={cn(
        "w-full shrink-0 flex-col border-border bg-surface lg:w-[400px] lg:border-r",
        className,
      )}
    >
      {/* Endpoint header */}
      <header className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to endpoints"
              className="-ml-1.5 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground lg:hidden"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
          )}
          <h1 className="mr-auto truncate text-sm font-semibold text-foreground">
            {endpoint.name}
          </h1>
          <button
            type="button"
            role="switch"
            aria-checked={endpoint.enabled}
            onClick={onToggleEnabled}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
              endpoint.enabled ? "bg-live" : "bg-border-strong",
            )}
          >
            <span className="sr-only">Toggle endpoint</span>
            <span
              className={cn(
                "inline-block size-4 transform rounded-full bg-surface shadow transition-transform",
                endpoint.enabled ? "translate-x-4" : "translate-x-0.5",
              )}
            />
          </button>
        </div>

        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-border bg-surface-muted p-1 pl-2.5">
          <span className="truncate font-mono text-xs text-muted-foreground">
            {endpointUrl(endpoint.publicKey)}
          </span>
          <CopyButton
            value={endpointUrl(endpoint.publicKey)}
            className="ml-auto shrink-0"
            label="Copy"
          />
        </div>
      </header>

      {/* Search */}
      <div className="border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted px-2.5 py-1.5 focus-within:border-border-strong">
          <Search className="size-3.5 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by method, event, or IP"
            className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Requests */}
      <div className="scroll-thin flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyRequests hasQuery={query.trim().length > 0} />
        ) : (
          <ul>
            {filtered.map((req) => (
              <RequestRow
                key={req.id}
                request={req}
                active={req.id === selectedRequestId}
                onSelect={() => onSelectRequest(req.id)}
              />
            ))}
          </ul>
        )}
      </div>

      <footer className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        Showing{" "}
        <span className="font-mono tabular-nums text-foreground">
          {filtered.length}
        </span>{" "}
        of {endpoint.requests.length} · retains last 100
      </footer>
    </section>
  );
}

function RequestRow({
  request,
  active,
  onSelect,
}: {
  request: CapturedRequest;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className={cn(
          "flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left transition-colors",
          active
            ? "border-l-primary bg-primary-muted/40"
            : "border-l-transparent hover:bg-surface-muted",
        )}
      >
        <MethodBadge method={request.method} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-xs font-medium text-foreground">
            {request.path}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <span className="tabular-nums">{request.sourceIp}</span>
            <span aria-hidden>·</span>
            <RelativeTime iso={request.receivedAt} />
          </span>
        </span>
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-live">
          {request.status}
        </span>
      </button>
    </li>
  );
}

function EmptyRequests({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-surface-muted">
        <Inbox className="size-5 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-sm font-medium text-foreground">
        {hasQuery ? "No matching requests" : "Waiting for requests"}
      </p>
      <p className="max-w-[220px] text-xs text-muted-foreground">
        {hasQuery
          ? "Try a different method, event type, or IP address."
          : "Send an HTTP request to this endpoint's URL and it will appear here instantly."}
      </p>
    </div>
  );
}
