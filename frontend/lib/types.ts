export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Endpoint = {
  publicId: string;
  name: string;
  ingestKey: string;
  enabled: boolean;
  createdAt: string;
};

export type CapturedRequest = {
  publicId: string;
  method: string;
  path: string;
  status: number;
  sourceIp: string | null;
  userAgent: string | null;
  contentType: string | null;
  contentLength: number | null;
  protocol: string;
  receivedAt: string;
  rawQuery: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body: unknown | null;
  rawBody: string;
  bodySize: number;
  bodyTruncated: boolean;
};

export type RequestReceivedEvent = {
  type: "request.received";
  webhookPublicId: string;
  requestPublicId: string;
  method: string;
  path: string;
  status: number;
  receivedAt: string;
};

const INGEST_BASE =
  process.env.NEXT_PUBLIC_INGEST_URL ?? "http://localhost:3001/hooks";

export function endpointUrl(ingestKey: string) {
  return `${INGEST_BASE}/${ingestKey}`;
}
export const MAX_ENDPOINTS = 3;
