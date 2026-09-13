# Relaybox

Real-time webhook inspection for developers.

[![CI](https://github.com/DanilKuprin1/relaybox/actions/workflows/ci.yaml/badge.svg)](https://github.com/DanilKuprin1/relaybox/actions/workflows/ci.yaml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Live](https://img.shields.io/badge/live-relaybox.cloud-2ea44f)](https://relaybox.cloud)

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Clerk](https://img.shields.io/badge/Clerk-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)
[![Sentry](https://img.shields.io/badge/Sentry-362D59?logo=sentry&logoColor=white)](https://sentry.io/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

**Live:** https://relaybox.cloud

Relaybox gives each user unique webhook endpoints, captures incoming HTTP requests, stores them in PostgreSQL, and streams new requests to the dashboard in real time.

![Relaybox demo: create an endpoint, send a webhook, and inspect its payload, headers, and query parameters](docs/relaybox-demo.gif)


## What it does

- Creates unique webhook ingestion endpoints
- Captures payloads, headers, query parameters, method, and request metadata
- Persists request history in PostgreSQL
- Streams new requests to authenticated users with Server-Sent Events
- Provides authenticated webhook management and per-user access control
- Includes production monitoring, structured logging, automated tests, and CI

## Architecture

```mermaid
flowchart LR
    A["External service"] -->|HTTP request| B["/hooks/:ingestKey"]
    B --> C["NestJS API"]
    C --> D[("PostgreSQL")]
    C --> E["SSE event stream"]
    E --> F["Next.js dashboard"]
    G["User"] -->|Clerk auth| F
    F -->|Authenticated API| C
```

Public webhook ingestion is separated from authenticated management APIs. Incoming requests are persisted first, while SSE provides low-latency updates to connected clients.

## Tech stack

**Backend:** TypeScript, NestJS, PostgreSQL, Prisma, Clerk, Server-Sent Events, Zod, Sentry, Pino, Vitest

**Frontend:** Next.js, React, TypeScript, Tailwind CSS, TanStack Query, Clerk, Sentry

**Tooling:** Docker Compose, pnpm, GitHub Actions, ESLint

## Engineering highlights

### Public ingestion + authenticated ownership

Webhook traffic is accepted through:

```text
/hooks/:ingestKey
```

The ingestion key identifies the destination webhook. Management APIs and event streams require authentication, keeping request data scoped to the correct user.

### Real-time delivery without polling

Newly captured requests are pushed to the dashboard using Server-Sent Events:

```ts
@Sse()
stream(@CurrentUser() user: DbUser) {
  return this.events
    .streamFor(user.id)
    .pipe(map((event) => ({ data: JSON.stringify(event) })));
}
```

PostgreSQL remains the durable source of truth, so request history survives client disconnects.

### Production-oriented backend

The project includes:

- Clerk authentication integrated into NestJS guards/interceptors
- Versioned PostgreSQL migrations
- Runtime validation with Zod
- Sentry error monitoring
- Structured logging with Pino
- Backend test coverage with Vitest
- CI on every pull request and push to `main`

## Repository structure

```text
relaybox/
├── backend/              # NestJS API, auth, ingestion, events, persistence
│   └── migrations/       # Versioned PostgreSQL migrations
├── frontend/             # Next.js dashboard
├── .github/workflows/    # CI
├── docs/                 # Screenshots
└── docker-compose.yaml   # Local PostgreSQL
```

## Run locally

### Prerequisites

- Node.js 24
- pnpm 11
- Docker
- A Clerk application (development instance)

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env     # defaults already match docker-compose.yaml
pnpm install
pnpm db:migrate          # creates the users, webhooks and requests tables
pnpm start:dev           # http://localhost:3001
```

### 3. Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev                 # http://localhost:3000
```

Both apps must point at the **same** Clerk application. If the publishable key is
missing, Clerk falls back to keyless mode and every authenticated API call returns
`401`. If the two apps use different Clerk applications, tokens are rejected with
`jwk-kid-mismatch`.

After editing `backend/src/prisma/contract.prisma`, regenerate the contract
artifacts with `pnpm contract:emit` and plan a migration with
`pnpm exec prisma migration plan`.

## Tests and CI

Backend:

```bash
cd backend
pnpm test
pnpm test:cov
```

Frontend:

```bash
cd frontend
pnpm lint
pnpm build
```

GitHub Actions runs backend coverage and frontend lint/build checks automatically.

## Why I built it

Webhook integrations are difficult to debug because the interesting part often happens at a system boundary: an external service sends a request, but the receiving application gives little visibility into what actually arrived.

Relaybox gave me a practical way to design around those boundaries: public ingestion, authenticated ownership, durable persistence, real-time delivery, observability, and testing in a TypeScript/NestJS application.

## License

MIT — see [LICENSE](LICENSE).

## Author

**Danil Kuprin**

- LinkedIn: https://www.linkedin.com/in/danilkuprin1
- Live project: https://relaybox.cloud
