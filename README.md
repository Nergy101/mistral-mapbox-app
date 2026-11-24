# mistral-mapbox-app

An interactive Mapbox map of Paris areas with a chat assistant powered by the Mistral API. Click an
area on the map to select it, then ask questions about the selected area or any area on the map —
answers are grounded in the same data the map renders.

## Stack

- **web** (`apps/web`, port 3001) — TanStack Start (React 19, Vite, Nitro, Tailwind CSS 4) with
  Mapbox GL JS. The chat runs through a TanStack Start server function that calls the Mistral API
  with the official `@mistralai/mistralai` TypeScript SDK (`mistral-small-latest`). The API key is
  read server-side only and never reaches the browser bundle.
- **api** (`apps/api`, port 3000) — FastAPI backend.
- **postgres** — managed Postgres for local dev (Docker) and on the platform.

## Setup

```sh
mistral apps install        # uv lock + bun install (run once after cloning)
```

Environment variables:

| Variable | Where | Purpose |
| --- | --- | --- |
| `MISTRAL_API_KEY` | workspace-root `.env` (gitignored) | Server-only key for the chat. On the deployed app, set it as a workspace secret (console.mistral.ai/secrets) or the web module's env var |
| `VITE_MAPBOX_ACCESS_TOKEN` | `apps/web/.env` (gitignored) | Public Mapbox token for map tiles/styles; also the default build arg in `deploy/docker/Dockerfile.web` |

Copy `.env.example` to `.env` at the root and `apps/web/.env.example` to `apps/web/.env`, then fill
in the values.

## Develop

```sh
mistral apps dev            # full local stack: gateway + api (:3000) + web (:3001) + postgres
mistral apps dev --filter web --no-gateway   # web only
```

Or just the web app on its own:

```sh
cd apps/web && bun run dev  # http://localhost:3001 — / redirects to /map
```

Open http://localhost:3001/map, click an area polygon, and chat in the right-hand panel.

## Test and build

```sh
bunx nx run web:test        # bun tests for apps/web
bunx nx run web:build       # production build (Vite + Nitro)
bun run check               # all modules
```

## Deploy (Mistral Apps / Studio)

```sh
mistral apps deploy         # builds the Docker images and deploys; then visible in Mistral Studio
mistral apps list           # list deployed apps
mistral apps logs           # build/runtime logs
```

## Layout

```
apps/web/src/map/areas.ts        area data shared by the map and the chat prompt
apps/web/src/map/map-view.tsx    Mapbox map with selectable area polygons
apps/web/src/map/chat-panel.tsx  chat UI
apps/web/src/server/chat.ts      server function: Mistral SDK, mistral-small-latest
apps/web/src/server/prompt.ts    system prompt built from the map areas + selection
apps/web/src/server/env.ts       server-only MISTRAL_API_KEY resolution
apps/web/src/routes/map.tsx      the /map page (landing route)
apps/api/                        FastAPI backend
deploy/docker/                   Dockerfiles used by `mistral apps deploy`
mistral.json                     Mistral Apps module definitions
```
