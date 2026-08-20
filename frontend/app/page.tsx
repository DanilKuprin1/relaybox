"use client";

import { useMemo, useState } from "react";
import {
  endpoints as seedEndpoints,
  type Endpoint,
} from "@/lib/mock-data";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Plus, Webhook } from "lucide-react";
import { EndpointsSidebar } from "@/components/endpoints-sidebar";
import { RequestList } from "@/components/request-list";
import { RequestDetail } from "@/components/request-detail";
import { CreateEndpointDialog } from "@/components/create-endpoint-dialog";
import { SignInGate } from "@/components/sign-in-gate";

function randomKey(len = 24) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export default function Home() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>(seedEndpoints);
  const [selectedEndpointId, setSelectedEndpointId] = useState(
    seedEndpoints[0].id,
  );
  const [selectedByEndpoint, setSelectedByEndpoint] = useState<
    Record<string, string | null>
  >({ [seedEndpoints[0].id]: seedEndpoints[0].requests[0]?.id ?? null });
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedEndpoint = useMemo(
    () => endpoints.find((e) => e.id === selectedEndpointId) ?? endpoints[0],
    [endpoints, selectedEndpointId],
  );

  const selectedRequestId = selectedEndpoint
    ? selectedByEndpoint[selectedEndpoint.id] ?? null
    : null;
  const selectedRequest =
    selectedEndpoint?.requests.find((r) => r.id === selectedRequestId) ?? null;

  function handleSelectEndpoint(id: string) {
    setSelectedEndpointId(id);
    setSelectedByEndpoint((prev) => {
      if (prev[id] !== undefined) return prev;
      const ep = endpoints.find((e) => e.id === id);
      return { ...prev, [id]: ep?.requests[0]?.id ?? null };
    });
  }

  function handleSelectRequest(id: string) {
    setSelectedByEndpoint((prev) => ({ ...prev, [selectedEndpoint.id]: id }));
  }

  function handleToggleEnabled() {
    setEndpoints((prev) =>
      prev.map((e) =>
        e.id === selectedEndpoint.id ? { ...e, enabled: !e.enabled } : e,
      ),
    );
  }

  function handleDeleteRequest(id: string) {
    setEndpoints((prev) =>
      prev.map((e) =>
        e.id === selectedEndpoint.id
          ? { ...e, requests: e.requests.filter((r) => r.id !== id) }
          : e,
      ),
    );
    setSelectedByEndpoint((prev) => {
      const remaining = selectedEndpoint.requests.filter((r) => r.id !== id);
      return { ...prev, [selectedEndpoint.id]: remaining[0]?.id ?? null };
    });
  }

  function handleDeleteEndpoint(id: string) {
    setEndpoints((prev) => {
      const next = prev.filter((e) => e.id !== id);
      // If we deleted the active endpoint, move selection to the first remaining one.
      if (id === selectedEndpointId && next.length > 0) {
        setSelectedEndpointId(next[0].id);
        setSelectedByEndpoint((sel) =>
          sel[next[0].id] !== undefined
            ? sel
            : { ...sel, [next[0].id]: next[0].requests[0]?.id ?? null },
        );
      }
      return next;
    });
    setSelectedByEndpoint((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function handleCreateEndpoint(name: string) {
    const newEndpoint: Endpoint = {
      id: `ep_${randomKey(6)}`,
      name,
      publicKey: randomKey(24),
      enabled: true,
      createdAt: new Date().toISOString(),
      requests: [],
    };
    setEndpoints((prev) => [...prev, newEndpoint]);
    setSelectedEndpointId(newEndpoint.id);
    setSelectedByEndpoint((prev) => ({ ...prev, [newEndpoint.id]: null }));
    setDialogOpen(false);
  }

  return (
    <>
      <SignedOut>
        <SignInGate />
      </SignedOut>
      <SignedIn>
        <div className="flex h-screen w-full overflow-hidden">
          <EndpointsSidebar
            endpoints={endpoints}
            selectedId={selectedEndpoint?.id ?? ""}
            onSelect={handleSelectEndpoint}
            onCreate={() => setDialogOpen(true)}
            onDelete={handleDeleteEndpoint}
          />
          {selectedEndpoint ? (
            <>
              <RequestList
                endpoint={selectedEndpoint}
                selectedRequestId={selectedRequestId}
                onSelectRequest={handleSelectRequest}
                onToggleEnabled={handleToggleEnabled}
              />
              <RequestDetail
                request={selectedRequest}
                onDelete={handleDeleteRequest}
              />
            </>
          ) : (
            <NoEndpoints onCreate={() => setDialogOpen(true)} />
          )}

          <CreateEndpointDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onCreate={handleCreateEndpoint}
          />
        </div>
      </SignedIn>
    </>
  );
}

function NoEndpoints({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center bg-background px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-surface-muted text-muted-foreground ring-1 ring-border">
        <Webhook className="size-6" aria-hidden />
      </div>
      <h2 className="mt-5 text-base font-semibold text-foreground">
        No endpoints yet
      </h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Create your first webhook endpoint to start capturing incoming
        requests.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Plus className="size-4" aria-hidden />
        New endpoint
      </button>
    </section>
  );
}
