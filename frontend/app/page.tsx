"use client";

import { useMemo, useState } from "react";
import {
  endpoints as seedEndpoints,
  type Endpoint,
} from "@/lib/mock-data";
import { EndpointsSidebar } from "@/components/endpoints-sidebar";
import { RequestList } from "@/components/request-list";
import { RequestDetail } from "@/components/request-detail";
import { CreateEndpointDialog } from "@/components/create-endpoint-dialog";

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

  const selectedRequestId = selectedByEndpoint[selectedEndpoint.id] ?? null;
  const selectedRequest =
    selectedEndpoint.requests.find((r) => r.id === selectedRequestId) ?? null;

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
    <div className="flex h-screen w-full overflow-hidden">
      <EndpointsSidebar
        endpoints={endpoints}
        selectedId={selectedEndpoint.id}
        onSelect={handleSelectEndpoint}
        onCreate={() => setDialogOpen(true)}
      />
      <RequestList
        endpoint={selectedEndpoint}
        selectedRequestId={selectedRequestId}
        onSelectRequest={handleSelectRequest}
        onToggleEnabled={handleToggleEnabled}
      />
      <RequestDetail request={selectedRequest} onDelete={handleDeleteRequest} />

      <CreateEndpointDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreateEndpoint}
      />
    </div>
  );
}
