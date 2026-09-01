"use client";

import { useMemo, useState } from "react";
import { Plus, Webhook } from "lucide-react";
import { CreateEndpointDialog } from "@/components/create-endpoint-dialog";
import { EndpointsSidebar } from "@/components/endpoints-sidebar";
import { RequestDetail } from "@/components/request-detail";
import { RequestList } from "@/components/request-list";
import {
  useEndpoints,
  useRequestEvents,
  useRequests,
} from "@/hooks/use-relaybox";
import { cn } from "@/lib/utils";

/**
 * On mobile only the active pane is shown; from `lg` up every pane is visible
 * side by side as the classic three-pane inspector.
 */
function paneClass(active: boolean) {
  return active ? "flex" : "hidden lg:flex";
}

export function Dashboard() {
  const { endpoints, loading, error, create, remove } = useEndpoints();
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(
    null,
  );
  const [selectedByEndpoint, setSelectedByEndpoint] = useState<
    Record<string, string | null>
  >({});
  const [dialogOpen, setDialogOpen] = useState(false);
  // Mobile uses a drill-down: endpoints -> requests -> detail.
  // On lg+ all three panes are visible at once and this is ignored.
  const [mobileView, setMobileView] = useState<
    "endpoints" | "requests" | "detail"
  >("endpoints");

  const selectedEndpoint = useMemo(
    () =>
      endpoints.find((e) => e.publicId === selectedEndpointId) ?? endpoints[0],
    [endpoints, selectedEndpointId],
  );

  const activeId = selectedEndpoint?.publicId ?? null;
  const { requests } = useRequests(activeId);

  useRequestEvents();

  const selectedRequestId = activeId
    ? (selectedByEndpoint[activeId] ?? null)
    : null;
  const selectedRequest =
    requests.find((r) => r.publicId === selectedRequestId) ?? null;

  function handleSelectEndpoint(id: string) {
    setSelectedEndpointId(id);
    setMobileView("requests");
  }

  function handleSelectRequest(id: string) {
    if (!activeId) return;
    setSelectedByEndpoint((prev) => ({ ...prev, [activeId]: id }));
    setMobileView("detail");
  }

  function handleDismissRequest(id: string) {
    if (activeId && selectedRequestId === id) {
      setSelectedByEndpoint((prev) => ({ ...prev, [activeId]: null }));
    }
    setMobileView("requests");
  }

  async function handleDeleteEndpoint(id: string) {
    await remove(id);
    if (id === activeId) {
      setSelectedEndpointId(null);
      setMobileView("endpoints");
    }
    setSelectedByEndpoint((prev) => {
      const rest = { ...prev };
      delete rest[id];
      return rest;
    });
  }

  async function handleCreateEndpoint(name: string) {
    const created = await create(name);
    setSelectedEndpointId(created.publicId);
    setMobileView("requests");
    setDialogOpen(false);
  }

  if (loading) {
    return <Centered>Loading endpoints…</Centered>;
  }

  if (error) {
    return <Centered>Couldn’t reach the API — {error}</Centered>;
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <EndpointsSidebar
        endpoints={endpoints}
        selectedId={activeId ?? ""}
        onSelect={handleSelectEndpoint}
        onCreate={() => setDialogOpen(true)}
        onDelete={(id) => void handleDeleteEndpoint(id)}
        className={paneClass(mobileView === "endpoints")}
      />
      {selectedEndpoint ? (
        <>
          <RequestList
            endpoint={selectedEndpoint}
            requests={requests}
            selectedRequestId={selectedRequestId}
            onSelectRequest={handleSelectRequest}
            onBack={() => setMobileView("endpoints")}
            className={paneClass(mobileView === "requests")}
          />
          <RequestDetail
            request={selectedRequest}
            onDelete={handleDismissRequest}
            onBack={() => setMobileView("requests")}
            className={paneClass(mobileView === "detail")}
          />
        </>
      ) : (
        <NoEndpoints
          onCreate={() => setDialogOpen(true)}
          className={paneClass(mobileView !== "endpoints")}
        />
      )}

      <CreateEndpointDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={(name) => void handleCreateEndpoint(name)}
      />
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-background text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function NoEndpoints({
  onCreate,
  className,
}: {
  onCreate: () => void;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex-1 flex-col items-center justify-center bg-background px-6 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-surface-muted text-muted-foreground ring-1 ring-border">
        <Webhook className="size-6" aria-hidden />
      </div>
      <h2 className="mt-5 text-base font-semibold text-foreground">
        No endpoints yet
      </h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Create your first webhook endpoint to start capturing incoming requests.
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
