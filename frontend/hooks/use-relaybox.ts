"use client";

import { useAuth } from "@clerk/nextjs";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { api, API_BASE } from "@/lib/api";
import type { RequestReceivedEvent } from "@/lib/types";

function useToken() {
  const { getToken } = useAuth();
  return useCallback(async () => {
    const token = await getToken();
    if (!token) throw new Error("Not signed in");
    return token;
  }, [getToken]);
}

export const queryKeys = {
  endpoints: ["endpoints"] as const,
  requests: (endpointId: string) => ["requests", endpointId] as const,
};

export function useEndpoints() {
  const token = useToken();
  const client = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.endpoints,
    queryFn: async () => api.listEndpoints(await token()),
  });

  const create = useMutation({
    mutationFn: async (name: string) => api.createEndpoint(await token(), name),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.endpoints }),
  });

  const remove = useMutation({
    mutationFn: async (publicId: string) =>
      api.deleteEndpoint(await token(), publicId),
    onSuccess: (_, publicId) => {
      void client.invalidateQueries({ queryKey: queryKeys.endpoints });
      client.removeQueries({ queryKey: queryKeys.requests(publicId) });
    },
  });

  return {
    endpoints: query.data ?? [],
    loading: query.isPending,
    error: query.error?.message ?? null,
    create: create.mutateAsync,
    remove: remove.mutateAsync,
  };
}

export function useRequests(endpointId: string | null) {
  const token = useToken();

  const query = useQuery({
    queryKey: queryKeys.requests(endpointId ?? ""),
    queryFn: async () => api.listRequests(await token(), endpointId!),
    enabled: Boolean(endpointId),
  });

  return {
    requests: query.data ?? [],
    loading: query.isPending && Boolean(endpointId),
  };
}

export function useRequestEvents() {
  const token = useToken();
  const client = useQueryClient();
  const clientRef = useRef(client);
  clientRef.current = client;

  useEffect(() => {
    const controller = new AbortController();

    async function listen() {
      const res = await fetch(`${API_BASE}/events`, {
        headers: {
          authorization: `Bearer ${await token()}`,
          accept: "text/event-stream",
        },
        signal: controller.signal,
      });
      if (!res.body) return;

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += value;

        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const data = frame
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trim())
            .join("");
          if (!data) continue;
          try {
            const event = JSON.parse(data) as RequestReceivedEvent;
            void clientRef.current.invalidateQueries({
              queryKey: queryKeys.requests(event.webhookPublicId),
            });
          } catch {
          }
        }
      }
    }

    void listen().catch(() => {
    });

    return () => controller.abort();
  }, [token]);
}
