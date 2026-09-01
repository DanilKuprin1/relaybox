"use client";

import type { CapturedRequest, Endpoint } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, `${init.method ?? "GET"} ${path} failed`);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  return (await res.json()) as T;
}

export const api = {
  listEndpoints: (token: string) =>
    request<{ data: Endpoint[] }>(token, "/webhooks").then((r) => r.data),

  createEndpoint: (token: string, name: string) =>
    request<Endpoint>(token, "/webhooks", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  deleteEndpoint: (token: string, publicId: string) =>
    request<void>(token, `/webhooks/${publicId}`, { method: "DELETE" }),

  listRequests: (token: string, publicId: string) =>
    request<{ data: CapturedRequest[] }>(
      token,
      `/webhooks/${publicId}/requests`,
    ).then((r) => r.data),
};

export { API_BASE };
