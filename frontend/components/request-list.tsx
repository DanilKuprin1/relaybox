"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, Inbox, Search } from "lucide-react";
import type { CapturedRequest, Endpoint } from "@/lib/types";
import { endpointUrl } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RelativeTime } from "@/components/relative-time";
import { MethodBadge } from "@/components/method-badge";
import { CopyButton } from "@/components/copy-button";

export function RequestList({
  endpoint,
  requests,
  selectedRequestId,
  onSelectRequest,
  onBack,
  className,
}: {
  endpoint: Endpoint;
  requests: CapturedRequest[];
  selectedRequestId: string | null;
  onSelectRequest: (id: string) => void;
  onBack?: () => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter(
      (r) =>
        r.method.toLowerCase().includes(q) ||
        r.path.toLowerCase().includes(q) ||
        (r.sourceIp?.includes(q) ?? false),
    );
  }, [requests, query]);

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
          <span
            aria-label={endpoint.enabled ? "Active" : "Paused"}
            className={cn(
              "size-2 shrink-0 rounded-full",
              endpoint.enabled ? "bg-live" : "bg-border-strong",
            )}
          />
        </div>

        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-border bg-surface-muted p-1 pl-2.5">
          <span className="truncate font-mono text-xs text-muted-foreground">
            {endpointUrl(endpoint.ingestKey)}
          </span>
          <CopyButton
            value={endpointUrl(endpoint.ingestKey)}
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
                key={req.publicId}
                request={req}
                active={req.publicId === selectedRequestId}
                onSelect={() => onSelectRequest(req.publicId)}
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
        of {requests.length} · retains last 100
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
