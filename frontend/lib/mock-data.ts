export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type CapturedRequest = {
  id: string;
  method: HttpMethod;
  path: string;
  status: number;
  sourceIp: string;
  userAgent: string;
  contentType: string;
  contentLength: number;
  protocol: string;
  receivedAt: string; // ISO
  query: Record<string, string>;
  headers: Record<string, string>;
  body: unknown | null;
  rawBody: string;
};

export type Endpoint = {
  id: string;
  name: string;
  publicKey: string;
  enabled: boolean;
  createdAt: string;
  requests: CapturedRequest[];
};

const BASE_URL = "https://relaybox.dev/hooks";

export function endpointUrl(publicKey: string) {
  return `${BASE_URL}/${publicKey}`;
}

// Fixed anchor instead of Date.now(): mock timestamps must be identical on the
// server and the client, otherwise the absolute timestamp rendered in the
// detail pane triggers a hydration mismatch. Captured requests have fixed
// capture times anyway; the live "ago" labels are handled by <RelativeTime />.
const now = new Date("2026-08-28T16:17:24Z").getTime();
const ago = (mins: number) => new Date(now - mins * 60_000).toISOString();
const agoSec = (secs: number) => new Date(now - secs * 1000).toISOString();

export const endpoints: Endpoint[] = [
  {
    id: "ep_stripe",
    name: "Stripe Development",
    publicKey: "ZHLcrYJ6KlaH3qN8vT2wD9x",
    enabled: true,
    createdAt: ago(60 * 24 * 4),
    requests: [
      {
        id: "req_9f3c",
        method: "POST",
        path: "/hooks/ZHLcrYJ6KlaH3qN8vT2wD9x",
        status: 200,
        sourceIp: "54.187.174.169",
        userAgent: "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
        contentType: "application/json",
        contentLength: 412,
        protocol: "HTTP/1.1",
        receivedAt: agoSec(12),
        query: {},
        headers: {
          host: "relaybox.dev",
          "content-type": "application/json",
          "stripe-signature":
            "t=1709145600,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd",
          "user-agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
          "content-length": "412",
        },
        body: {
          id: "evt_1P2xY3",
          type: "payment_intent.payment_failed",
          data: {
            object: {
              id: "pi_3P2xY3",
              amount: 4900,
              currency: "usd",
              customer: "cus_QabcXyz",
              last_payment_error: {
                code: "card_declined",
                decline_code: "insufficient_funds",
                message: "Your card has insufficient funds.",
              },
            },
          },
        },
        rawBody:
          '{"id":"evt_1P2xY3","type":"payment_intent.payment_failed","data":{"object":{"id":"pi_3P2xY3","amount":4900,"currency":"usd","customer":"cus_QabcXyz","last_payment_error":{"code":"card_declined","decline_code":"insufficient_funds","message":"Your card has insufficient funds."}}}}',
      },
      {
        id: "req_7a21",
        method: "POST",
        path: "/hooks/ZHLcrYJ6KlaH3qN8vT2wD9x",
        status: 200,
        sourceIp: "54.187.205.235",
        userAgent: "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
        contentType: "application/json",
        contentLength: 528,
        protocol: "HTTP/1.1",
        receivedAt: ago(8),
        query: {},
        headers: {
          host: "relaybox.dev",
          "content-type": "application/json",
          "stripe-signature":
            "t=1709145100,v1=9931b2fc0a2e0e2f1c8a7d6e5b4a3f2e1d0c9b8a7f6e5d4c3b2a1908f7e6d5c4",
          "user-agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
          "content-length": "528",
        },
        body: {
          id: "evt_1P2wA9",
          type: "checkout.session.completed",
          data: {
            object: {
              id: "cs_test_a1b2c3",
              amount_total: 12900,
              currency: "usd",
              customer_email: "jordan@example.com",
              payment_status: "paid",
            },
          },
        },
        rawBody:
          '{"id":"evt_1P2wA9","type":"checkout.session.completed","data":{"object":{"id":"cs_test_a1b2c3","amount_total":12900,"currency":"usd","customer_email":"jordan@example.com","payment_status":"paid"}}}',
      },
      {
        id: "req_5c88",
        method: "POST",
        path: "/hooks/ZHLcrYJ6KlaH3qN8vT2wD9x",
        status: 200,
        sourceIp: "54.187.174.169",
        userAgent: "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
        contentType: "application/json",
        contentLength: 367,
        protocol: "HTTP/1.1",
        receivedAt: ago(23),
        query: {},
        headers: {
          host: "relaybox.dev",
          "content-type": "application/json",
          "stripe-signature":
            "t=1709144200,v1=1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
          "user-agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
          "content-length": "367",
        },
        body: {
          id: "evt_1P2vB7",
          type: "customer.subscription.updated",
          data: {
            object: {
              id: "sub_1P2vB7",
              status: "active",
              current_period_end: 1711824000,
            },
          },
        },
        rawBody:
          '{"id":"evt_1P2vB7","type":"customer.subscription.updated","data":{"object":{"id":"sub_1P2vB7","status":"active","current_period_end":1711824000}}}',
      },
    ],
  },
  {
    id: "ep_github",
    name: "GitHub Webhooks",
    publicKey: "Q9mKf2Lp7Rt4Ws8Yx3Vb6Nc",
    enabled: true,
    createdAt: ago(60 * 24 * 11),
    requests: [
      {
        id: "req_gh01",
        method: "POST",
        path: "/hooks/Q9mKf2Lp7Rt4Ws8Yx3Vb6Nc",
        status: 200,
        sourceIp: "140.82.115.246",
        userAgent: "GitHub-Hookshot/8f4a1c2",
        contentType: "application/json",
        contentLength: 743,
        protocol: "HTTP/1.1",
        receivedAt: ago(2),
        query: {},
        headers: {
          host: "relaybox.dev",
          "content-type": "application/json",
          "x-github-event": "push",
          "x-github-delivery": "72d3162e-cc78-11e3-81ab-4c9367dc0958",
          "x-hub-signature-256":
            "sha256=757107ea0eb2509fc211221cce984b8a37570b6d7586c22c46f4379c8b043e17",
          "user-agent": "GitHub-Hookshot/8f4a1c2",
          "content-length": "743",
        },
        body: {
          ref: "refs/heads/main",
          before: "9049f1265b7d61be4a8904a9a27120d2064dab3b",
          after: "0d1a26e67d8f5eaf1f6ba5c3465e8f5c3b1c9b2a",
          repository: { name: "relaybox", full_name: "acme/relaybox" },
          pusher: { name: "danil", email: "danil@example.com" },
          commits: [
            {
              id: "0d1a26e",
              message: "feat: capture raw request body",
              author: { name: "Danil" },
            },
          ],
        },
        rawBody:
          '{"ref":"refs/heads/main","before":"9049f12","after":"0d1a26e","repository":{"name":"relaybox","full_name":"acme/relaybox"},"pusher":{"name":"danil","email":"danil@example.com"},"commits":[{"id":"0d1a26e","message":"feat: capture raw request body","author":{"name":"Danil"}}]}',
      },
      {
        id: "req_gh02",
        method: "POST",
        path: "/hooks/Q9mKf2Lp7Rt4Ws8Yx3Vb6Nc",
        status: 200,
        sourceIp: "140.82.115.247",
        userAgent: "GitHub-Hookshot/3b9d0e1",
        contentType: "application/json",
        contentLength: 611,
        protocol: "HTTP/1.1",
        receivedAt: ago(19),
        query: { installation: "48291043" },
        headers: {
          host: "relaybox.dev",
          "content-type": "application/json",
          "x-github-event": "pull_request",
          "x-github-delivery": "8a2b1c9d-dd88-22f4-92bc-5da478ed1069",
          "user-agent": "GitHub-Hookshot/3b9d0e1",
          "content-length": "611",
        },
        body: {
          action: "opened",
          number: 42,
          pull_request: {
            title: "Add rate limiting to ingestion route",
            user: { login: "danil" },
            head: { ref: "feat/rate-limit" },
            base: { ref: "main" },
          },
        },
        rawBody:
          '{"action":"opened","number":42,"pull_request":{"title":"Add rate limiting to ingestion route","user":{"login":"danil"},"head":{"ref":"feat/rate-limit"},"base":{"ref":"main"}}}',
      },
      {
        id: "req_gh03",
        method: "POST",
        path: "/hooks/Q9mKf2Lp7Rt4Ws8Yx3Vb6Nc",
        status: 200,
        sourceIp: "140.82.115.246",
        userAgent: "GitHub-Hookshot/1a0b9c8",
        contentType: "application/json",
        contentLength: 198,
        protocol: "HTTP/1.1",
        receivedAt: ago(64),
        query: {},
        headers: {
          host: "relaybox.dev",
          "content-type": "application/json",
          "x-github-event": "ping",
          "user-agent": "GitHub-Hookshot/1a0b9c8",
          "content-length": "198",
        },
        body: { zen: "Non-blocking is better than blocking.", hook_id: 12345678 },
        rawBody:
          '{"zen":"Non-blocking is better than blocking.","hook_id":12345678}',
      },
    ],
  },
  {
    id: "ep_shopify",
    name: "Shopify Orders",
    publicKey: "Bx4Hn9Qw2Es7Rt1Yu6Ip3Ol",
    enabled: false,
    createdAt: ago(60 * 24 * 2),
    requests: [
      {
        id: "req_sh01",
        method: "POST",
        path: "/hooks/Bx4Hn9Qw2Es7Rt1Yu6Ip3Ol",
        status: 200,
        sourceIp: "23.227.38.32",
        userAgent: "Shopify-Captain-Hook",
        contentType: "application/json",
        contentLength: 489,
        protocol: "HTTP/1.1",
        receivedAt: ago(140),
        query: {},
        headers: {
          host: "relaybox.dev",
          "content-type": "application/json",
          "x-shopify-topic": "orders/create",
          "x-shopify-hmac-sha256": "XWmrwMey6OsLMeiZKwP4FppHH3cImS3n1z74vP6ekLk=",
          "x-shopify-shop-domain": "acme-dev.myshopify.com",
          "user-agent": "Shopify-Captain-Hook",
          "content-length": "489",
        },
        body: {
          id: 820982911946154508,
          order_number: 1234,
          total_price: "129.00",
          currency: "USD",
          customer: { first_name: "Alex", last_name: "Rivera" },
          line_items: [{ title: "Standard Plan", quantity: 1 }],
        },
        rawBody:
          '{"id":820982911946154508,"order_number":1234,"total_price":"129.00","currency":"USD","customer":{"first_name":"Alex","last_name":"Rivera"},"line_items":[{"title":"Standard Plan","quantity":1}]}',
      },
    ],
  },
];

export const MAX_ENDPOINTS = 3;
