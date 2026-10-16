# Alfred HQ — Frontend

The private, owner-only headquarters for the Alfred ecosystem. This repository is the **frontend prototype**: a fully navigable, responsive interface backed by typed **demo data**. It does not connect to Hermes, Photon, Alfred Memory, the Development Gateway, Research, or any other live system, and it performs no backend actions.

> Architecture reference: HQ-001 through HQ-033. Hermes stays the orchestrator; HQ is the visual command interface. The first live adapter will be read-only.

## Requirements

- Node.js 20 or newer (built and tested with Node 22)
- npm 10 or newer

## Getting started

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npx tsc --noEmit` | Type-check only |

No environment variables, database, or backend services are needed.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Lucide icons · React Flow (`@xyflow/react`) for the Brain Graph · Recharts for usage charts · next-themes for dark/light mode.

## What's in the app

| Route | Screen |
| --- | --- |
| `/` | Executive Command Center |
| `/chat`, `/chat/[id]` | Alfred Chat — sessions, local demo conversations |
| `/companies`, `/companies/[id]` | Company directory and private company overviews |
| `/agents`, `/agents/[id]` | Agent Workforce — directory, hierarchy, profiles |
| `/brain` | Brain & Memory — graph explorer (`?view=global\|company\|project\|local&node=…`) |
| `/development`, `/development/[id]` | Development HQ — CTO overview, requests, board, project detail |
| `/research`, `/research/[id]` | Research & Intelligence — pipeline, sources, example reports |
| `/projects`, `/projects/[id]` | Projects & Tasks (`?task=…` opens a task) |
| `/infrastructure` | Infrastructure & Devices mission control |
| `/integrations`, `/integrations/[id]` | Integration registry |
| `/activity` | Operational history timeline |
| `/notifications` | Notifications & Approvals (`?tab=approvals`) |
| `/resources` | Resources & Costs (illustrative figures) |
| `/settings` | Frontend preferences and data-source state preview |

Press **Ctrl/⌘ K** anywhere for universal search across demo records.

## Project structure

```
src/
  app/                    Route files — thin server components that render a feature view
  features/<module>/      Business screens (client components), one folder per module
  components/
    ui/                   shadcn/ui primitives (generated; keep presentation-agnostic)
    hq/                   Shared HQ components (StatusBadge, MetricCard, KnowledgeGraph, TaskBoard…)
    shell/                AppShell, Sidebar, TopBar, ContextInspector, CommandSearch, mobile nav
    providers/            Theme, tooltip, toast and HQ store providers
  lib/
    types.ts              Domain model — the contract for all providers
    data/provider.ts      HQDataProvider interface (read-only)
    data/mock-provider.ts MockDataProvider + simulated source states
    data/mock/*.ts        Deterministic demo datasets (fixed demo clock)
    data/index.ts         getDataProvider() — the single swap point for live data
    data/use-hq-query.ts  Minimal async query hook (loading/error/offline/success)
    format.ts, status.ts, routes.ts, nav.ts
  hooks/                  Generic hooks (useMediaQuery)
docs/
  HANDOFF.md              What is UI-only, what is unconnected, and integration points
```

See [docs/HANDOFF.md](docs/HANDOFF.md) for how to connect a live read-only provider later.

## Demo data rules

- Every page shows a **Demo data** badge, and the top bar shows **Demo · Not connected**.
- Simulated chat replies are labelled **Demo response** and state that nothing was sent to Hermes.
- Status values default to **Unknown**, never Healthy, when a record has no verified check.
- Actions that would touch real systems (approve, restart, deploy, change models, connect integrations) are disabled or show a "demo action — nothing was executed" toast.
- Local chat sessions and preferences are stored only in this browser's `localStorage`.

To preview non-happy paths, open **Settings → Data source preview** and choose *slow*, *error*, *offline* or *empty*.
