"use client";

import { useState } from "react";
import { ChevronLeft, MousePointerClick, Trash2 } from "lucide-react";
import type { CapturedRequest } from "@/lib/types";
import { cn, formatBytes, fullTimestamp } from "@/lib/utils";
import { MethodBadge } from "@/components/method-badge";
import { CopyButton } from "@/components/copy-button";
import { JsonViewer } from "@/components/json-viewer";

type Tab = "body" | "headers" | "query" | "raw" | "meta";

const TABS: { id: Tab; label: string }[] = [
  { id: "body", label: "Body" },
  { id: "headers", label: "Headers" },
  { id: "query", label: "Query" },
  { id: "raw", label: "Raw" },
  { id: "meta", label: "Meta" },
];

export function RequestDetail({
  request,
  onDelete,
  onBack,
  className,
}: {
  request: CapturedRequest | null;
  onDelete: (id: string) => void;
  onBack?: () => void;
  className?: string;
}) {
  const [tab, setTab] = useState<Tab>("body");

  if (!request) {
    return (
      <section
        className={cn(
          "flex-1 flex-col items-center justify-center gap-3 bg-background px-6 text-center",
          className,
        )}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-surface-muted">
          <MousePointerClick className="size-5 text-muted-foreground" aria-hidden />
        </div>
        <p className="text-sm font-medium text-foreground">No request selected</p>
        <p className="max-w-xs text-xs text-muted-foreground">
          Pick a captured request from the list to inspect its headers, body,
          and metadata.
        </p>
      </section>
    );
  }

  const headerEntries = Object.entries(request.headers);
  const queryEntries = Object.entries(request.query);

  return (
    <section
      className={cn("min-w-0 flex-1 flex-col bg-background", className)}
    >
      {/* Detail header */}
      <header className="flex flex-col gap-3 border-b border-border bg-surface px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 lg:px-6 lg:py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Back to requests"
                className="-ml-1.5 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground lg:hidden"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
            )}
            <MethodBadge method={request.method} size="md" />
            <span className="truncate font-mono text-sm font-medium text-foreground">
              {request.path}
            </span>
          </div>
          <p className="mt-1.5 font-mono text-xs text-muted-foreground">
            {fullTimestamp(request.receivedAt)} · id{" "}
            <span className="text-foreground">{request.publicId}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <CopyButton value={request.rawBody} label="Copy body" />
          <button
            type="button"
            onClick={() => onDelete(request.publicId)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-danger transition-colors hover:border-danger/40 hover:bg-danger/5"
          >
            <Trash2 className="size-3.5" aria-hidden />
            Delete
          </button>
        </div>
      </header>

      {/* Quick facts */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-surface">
        <Fact label="Status" value={String(request.status)} accent="live" />
        <Fact label="Size" value={formatBytes(request.contentLength ?? request.bodySize)} />
        <Fact label="Protocol" value={request.protocol} />
      </div>

      {/* Tabs */}
      <div className="scroll-thin flex items-center gap-1 overflow-x-auto border-b border-border bg-surface px-2 lg:px-4">
        {TABS.map((t) => {
          const count =
            t.id === "headers"
              ? headerEntries.length
              : t.id === "query"
                ? queryEntries.length
                : undefined;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors",
                tab === t.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {count !== undefined && (
                <span className="rounded bg-surface-muted px-1 font-mono text-[10px] tabular-nums text-muted-foreground">
                  {count}
                </span>
              )}
              {tab === t.id && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="scroll-thin flex-1 overflow-y-auto p-4 lg:p-6">
        {tab === "body" &&
          (request.body !== null ? (
            <JsonViewer data={request.body} />
          ) : (
            <EmptyState text="This request had no parsed body." />
          ))}

        {tab === "raw" && (
          <pre className="scroll-thin overflow-auto rounded-lg border border-border bg-surface-muted p-4 font-mono text-xs leading-relaxed text-foreground">
            <code className="whitespace-pre-wrap break-all">
              {request.rawBody}
            </code>
          </pre>
        )}

        {tab === "headers" && <KeyValueTable entries={headerEntries} mono />}

        {tab === "query" &&
          (queryEntries.length ? (
            <KeyValueTable entries={queryEntries} mono />
          ) : (
            <EmptyState text="No query parameters on this request." />
          ))}

        {tab === "meta" && (
          <KeyValueTable
            entries={[
              ["Request ID", request.publicId],
              ["Method", request.method],
              ["Path", request.path],
              ["Source IP", request.sourceIp ?? "—"],
              ["User agent", request.userAgent ?? "—"],
              ["Content type", request.contentType ?? "—"],
              ["Content length", formatBytes(request.contentLength ?? request.bodySize)],
              ["Protocol", request.protocol],
              ["Received at", fullTimestamp(request.receivedAt)],
            ]}
            mono
          />
        )}
      </div>
    </section>
  );
}

function Fact({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "live";
}) {
  return (
    <div className="px-4 py-3 lg:px-6">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 font-mono text-sm font-medium tabular-nums",
          accent === "live" ? "text-live" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function KeyValueTable({
  entries,
  mono,
}: {
  entries: [string, string][];
  mono?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full border-collapse text-xs">
        <tbody>
          {entries.map(([k, v], i) => (
            <tr
              key={k}
              className={cn(
                "align-top",
                i % 2 === 0 ? "bg-surface" : "bg-surface-muted/50",
              )}
            >
              <td className="w-[38%] border-b border-border px-3 py-2.5 font-mono font-medium break-words text-muted-foreground lg:px-4">
                {k}
              </td>
              <td
                className={cn(
                  "border-b border-border px-3 py-2.5 break-all text-foreground lg:px-4",
                  mono && "font-mono",
                )}
              >
                {v}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center rounded-lg border border-dashed border-border">
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}
