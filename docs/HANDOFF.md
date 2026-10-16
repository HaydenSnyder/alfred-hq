# Alfred HQ Frontend — Handoff

**Phase:** Frontend prototype / backend-ready UI
**Status:** All 14 screens are navigable on desktop and phone, using typed demo data.
**Live systems touched:** None. Nothing was installed on, configured on, or connected to the Alfred server, Hermes, Photon, Memory, the Development Gateway, Research, GitHub, T3 Code or Obsidian.

## 1. What is UI-only

| Area | Works in the browser | Not connected |
| --- | --- | --- |
| Navigation, layout, theming | Sidebar, rail, mobile drawer and tab bar, inspector, dark/light/system themes | — |
| Command Center | Metrics, incidents, approvals, tasks, activity, company status computed from demo data | Real health or metrics |
| Alfred Chat | New local sessions, sending, a simulated reply after about 1s, company/project context, attachment chips | Hermes delivery, real agent replies, file upload (files are never read) |
| Companies / Agents | Directory, filters, hierarchy, profiles, inspector | Agent creation, model changes, restarts (disabled) |
| Brain & Memory | Graph exploration, filters, search, document viewer, local neighbourhood | Memory indexing or writing, Obsidian vault access |
| Development | Projects, requests, board, plan review, PR/T3 references | Development Gateway, GitHub, T3 Code; plan approval (disabled) |
| Research | Pipeline, sources, example reports | Research pipeline, publishing to the Brain (disabled) |
| Projects & Tasks | Lists, boards, filters, linked records | Task creation and editing |
| Infrastructure | Hosts, services, uptime strips, incidents, recovery history | Host metrics, restarts (disabled) |
| Notifications & Approvals | Inbox filtering, local read state, approval review, proposed channel preferences | Real approvals, iMessage/push delivery |
| Integrations | Registry and detail views | OAuth and credential storage (none built) |
| Activity, Resources, Settings | Filtering, charts, preferences stored in `localStorage` | Billing data, server configuration |

## 2. Integration points

### 2.1 The data provider (primary seam)

All screens read through one interface:

- `src/lib/data/provider.ts` — `HQDataProvider`, read-only by design. It has no mutation methods for operational systems.
- `src/lib/data/index.ts` — `getDataProvider()` returns `MockDataProvider` today.

To go live, implement `HermesReadOnlyProvider implements HQDataProvider` against the HQ read-only adapter and return it from `getDataProvider()`. No view code needs to change. Recommended steps:

1. Map adapter payloads to `src/lib/types.ts`, and set `origin: "live"` on every record.
2. Carry `lastCheckAt` (freshness) on every health-bearing record. The UI shows staleness and treats a missing check as **Unknown**.
3. Throw `DataSourceError(message, "offline")` for unreachable sources and `"error"` for failures. The UI renders the matching states, with retry.
4. Remove or gate the *demo* labels per record using `origin`: `DemoDataIndicator` usage and the top-bar connection popover (`src/components/shell/top-bar.tsx`).
5. Replace the demo clock: `timeAgo()` in `src/lib/format.ts` defaults to `DEMO_NOW`. Pass the real time once data is live.

`useHQQuery` (`src/lib/data/use-hq-query.ts`) is deliberately small, so it can be swapped for TanStack Query or server components without touching view markup.

### 2.2 Write paths (future, separately authorised)

These controls exist visually but are disabled or demo-only. Each would need a new, explicitly authorised provider method:

- Approvals: approve or reject (`features/notifications`, `features/development` plan review)
- Agent operations: create, change model, restart (`features/agents`)
- Service restarts (`features/infrastructure`)
- Integration connect and OAuth (`features/integrations`)
- Chat delivery to Hermes: `send()` in `src/features/chat/chat-context.tsx` is the single function to replace. `buildDemoReply` then goes away.
- Research publishing to the Brain (`features/research`)

### 2.3 Optional Obsidian

The Brain Graph runs entirely on `KnowledgeNode`/`KnowledgeEdge`. Obsidian appears only as an optional, not-connected setting (Settings → Brain Graph display) and a disabled "Open in Obsidian" button. Nothing reads from disk.

## 3. Conventions for future work

- Route files in `src/app` stay thin; screens live in `src/features/<module>`.
- Shared business presentation goes in `src/components/hq`; generic primitives stay in `src/components/ui`.
- Every list view handles loading, error, offline, empty and not-found states. Use `QueryView`, `LoadingState`, `ErrorState` and `EmptyState`.
- Links between records go through `hrefFor(ref)` in `src/lib/routes.ts`.
- Health badges never default to Healthy (`StatusBadge` defaults to `unknown`).

## 4. Known limitations

- Local demo sessions and preferences are per browser (`localStorage`) and are cleared from Settings.
- Demo timestamps are relative to a fixed demo clock (Oct 16 2026, 15:00 UTC). Chat messages you create use real time.
- The data-source simulation (Settings) is per tab and resets on reload.
- No authentication is implemented. HQ is owner-only by design, and that boundary must be enforced by the deployment and adapter, not by this prototype.
