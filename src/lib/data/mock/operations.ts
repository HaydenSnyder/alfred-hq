import type { Approval, Budget, Integration, Notification, OperationalEvent, UsageRecord } from "@/lib/types"
import { DEMO_NOW, daysAgo, demo, hoursAgo, hoursFromNow, minutesAgo, seeded } from "./clock"

export const approvals: Approval[] = [
  {
    ...demo,
    id: "apr-photon-restart",
    title: "Restart Photon helper on Mac Studio",
    description: "Sentinel proposes restarting the Photon helper to clear the Messages database lock causing delivery delays.",
    kind: "config_change",
    state: "pending",
    requestedByAgentId: "ag-sentinel",
    scope: { kind: "global" },
    risk: "medium",
    expiresAt: hoursFromNow(2),
    refs: [{ kind: "incident", id: "inc-photon-latency" }, { kind: "service", id: "svc-photon" }],
    createdAt: minutesAgo(30),
    updatedAt: minutesAgo(30),
  },
  {
    ...demo,
    id: "apr-hq-plan",
    title: "Approve HQ frontend implementation plan",
    description: "Atlas requests sign-off on the four-step plan for the HQ frontend shell.",
    kind: "plan",
    state: "pending",
    requestedByAgentId: "ag-atlas",
    scope: { kind: "personal" },
    risk: "low",
    refs: [{ kind: "project", id: "prj-hq" }, { kind: "task", id: "task-hq-3" }],
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
  },
  {
    ...demo,
    id: "apr-nw-po",
    title: "Purchase order: linen samples ($840)",
    description: "Quartermaster drafted a sample order for the Hartley residence project.",
    kind: "purchase",
    state: "pending",
    requestedByAgentId: "ag-nw-procure",
    scope: { kind: "company", companyId: "co-northwind" },
    risk: "low",
    expiresAt: hoursFromNow(30),
    refs: [{ kind: "company", id: "co-northwind" }],
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },
  {
    ...demo,
    id: "apr-adapter-plan",
    title: "Approve adapter contract proposal",
    description: "Keystone proposes the read-only endpoint list for the HQ adapter.",
    kind: "plan",
    state: "pending",
    requestedByAgentId: "ag-keystone",
    scope: { kind: "personal" },
    risk: "low",
    refs: [{ kind: "project", id: "prj-adapter" }],
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
  },
  {
    ...demo,
    id: "apr-portal-staging",
    title: "Deploy portal v2.0.0-beta.4 to staging",
    description: "Release candidate for the Northwind portal.",
    kind: "deployment",
    state: "approved",
    requestedByAgentId: "ag-atlas",
    scope: { kind: "company", companyId: "co-northwind" },
    risk: "medium",
    decidedAt: daysAgo(1),
    refs: [{ kind: "project", id: "prj-nw-portal" }],
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    ...demo,
    id: "apr-compass-model",
    title: "Switch Compass to a larger model",
    description: "Route optimisation requested a model upgrade. Rejected pending evaluation results.",
    kind: "agent_change",
    state: "rejected",
    requestedByAgentId: "ag-hf-alfred",
    scope: { kind: "company", companyId: "co-halcyon" },
    risk: "medium",
    decidedAt: daysAgo(2),
    refs: [{ kind: "agent", id: "ag-hf-routes" }],
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
  },
  {
    ...demo,
    id: "apr-dash-publish",
    title: "Publish dashboard patterns research",
    description: "Sage requested publication to the HQ project Brain.",
    kind: "research_publish",
    state: "approved",
    requestedByAgentId: "ag-sage",
    scope: { kind: "personal" },
    risk: "info",
    decidedAt: daysAgo(10),
    refs: [{ kind: "research", id: "rr-dashboards" }],
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
]

export const notifications: Notification[] = [
  { ...demo, id: "nt-1", title: "Meridian booking API returning 503s", body: "Critical incident opened by Cadence. Read-only booking mode active.", severity: "critical", category: "incident", read: false, scope: { kind: "company", companyId: "co-meridian" }, refs: [{ kind: "incident", id: "inc-meridian-booking" }, { kind: "company", id: "co-meridian" }], channels: ["hq", "imessage", "push"], createdAt: minutesAgo(22), updatedAt: minutesAgo(22) },
  { ...demo, id: "nt-2", title: "Approval requested: restart Photon helper", body: "Sentinel needs approval to restart a service.", severity: "high", category: "approval", read: false, scope: { kind: "global" }, refs: [{ kind: "approval", id: "apr-photon-restart" }, { kind: "incident", id: "inc-photon-latency" }], channels: ["hq", "push"], createdAt: minutesAgo(30), updatedAt: minutesAgo(30) },
  { ...demo, id: "nt-3", title: "Photon message delivery delayed", body: "Outbound iMessage notifications queueing up to 2 minutes.", severity: "high", category: "incident", read: false, scope: { kind: "global" }, refs: [{ kind: "incident", id: "inc-photon-latency" }, { kind: "service", id: "svc-photon" }], channels: ["hq", "push"], createdAt: minutesAgo(47), updatedAt: minutesAgo(47) },
  { ...demo, id: "nt-4", title: "Portal tests failing", body: "3 failing tests on northwind/client-portal after PR #139.", severity: "medium", category: "development", read: false, scope: { kind: "company", companyId: "co-northwind" }, refs: [{ kind: "project", id: "prj-nw-portal" }, { kind: "task", id: "task-nw-3" }], channels: ["hq"], createdAt: hoursAgo(2), updatedAt: hoursAgo(2) },
  { ...demo, id: "nt-5", title: "Approval requested: linen samples PO", body: "Quartermaster drafted an $840 sample order.", severity: "low", category: "approval", read: true, scope: { kind: "company", companyId: "co-northwind" }, refs: [{ kind: "approval", id: "apr-nw-po" }], channels: ["hq"], createdAt: hoursAgo(2), updatedAt: hoursAgo(2) },
  { ...demo, id: "nt-6", title: "HQ frontend plan ready for review", body: "Atlas published a four-step plan.", severity: "info", category: "approval", read: true, scope: { kind: "personal" }, refs: [{ kind: "approval", id: "apr-hq-plan" }, { kind: "project", id: "prj-hq" }], channels: ["hq"], createdAt: hoursAgo(3), updatedAt: hoursAgo(3) },
  { ...demo, id: "nt-7", title: "Nightly backup did not report", body: "backup-node silent for 20 hours.", severity: "medium", category: "incident", read: true, scope: { kind: "global" }, refs: [{ kind: "incident", id: "inc-backup-missed" }, { kind: "device", id: "dev-backup" }], channels: ["hq", "push"], createdAt: hoursAgo(19), updatedAt: hoursAgo(19) },
  { ...demo, id: "nt-8", title: "Research verification complete", body: "Dashboard patterns report verified and published.", severity: "info", category: "research", read: true, scope: { kind: "personal" }, refs: [{ kind: "research", id: "rr-dashboards" }], channels: ["hq"], createdAt: daysAgo(10), updatedAt: daysAgo(10) },
  { ...demo, id: "nt-9", title: "MacBook Pro connector offline", body: "Last check-in 14 hours ago.", severity: "low", category: "system", read: true, scope: { kind: "global" }, refs: [{ kind: "device", id: "dev-macbook" }], channels: ["hq"], createdAt: hoursAgo(14), updatedAt: hoursAgo(14) },
]

export const integrations: Integration[] = [
  { ...demo, id: "int-hermes", provider: "Hermes", key: "hermes", category: "orchestration", description: "Central Alfred orchestration. HQ's primary data source once the read-only adapter exists.", scope: { kind: "global" }, status: "unconfigured", mode: "planned", capabilities: ["Agent registry", "Task state", "Session history", "Service health"], notes: "Adapter planned (project ADP). HQ currently shows demo data only.", createdAt: daysAgo(14), updatedAt: daysAgo(1) },
  { ...demo, id: "int-photon", provider: "Photon", key: "photon", category: "messaging", description: "iMessage communication bridge for owner notifications.", scope: { kind: "global" }, status: "unconfigured", mode: "planned", capabilities: ["Notification delivery status", "Conversation metadata"], notes: "HQ will observe delivery state only. No routing changes.", createdAt: daysAgo(14), updatedAt: daysAgo(1) },
  { ...demo, id: "int-devgw", provider: "Development Gateway", key: "dev-gateway", category: "code", description: "Development request intake and CTO agent coordination.", scope: { kind: "global" }, status: "unconfigured", mode: "planned", capabilities: ["Request list", "Plan status", "Execution timeline"], notes: "Never called by the prototype.", createdAt: daysAgo(14), updatedAt: daysAgo(1) },
  { ...demo, id: "int-github", provider: "GitHub", key: "github", category: "code", description: "Repositories, pull requests and checks.", scope: { kind: "global" }, status: "unconfigured", mode: "planned", capabilities: ["Repository metadata", "Pull requests", "Check runs"], notes: "No OAuth in this phase.", createdAt: daysAgo(14), updatedAt: daysAgo(1) },
  { ...demo, id: "int-t3", provider: "T3 Code", key: "t3-code", category: "code", description: "Agentic coding threads used by the CTO.", scope: { kind: "global" }, status: "unconfigured", mode: "planned", capabilities: ["Thread references", "Thread status"], notes: "Thread links displayed as references only.", createdAt: daysAgo(14), updatedAt: daysAgo(1) },
  { ...demo, id: "int-memory", provider: "Alfred Memory", key: "memory", category: "knowledge", description: "Alfred's long-term memory — the source for the Brain Graph.", scope: { kind: "global" }, status: "unconfigured", mode: "planned", capabilities: ["Graph nodes", "Relationships", "Source references"], notes: "HQ does not write memories.", createdAt: daysAgo(14), updatedAt: daysAgo(1) },
  { ...demo, id: "int-obsidian", provider: "Obsidian", key: "obsidian", category: "knowledge", description: "Optional vault connection for viewing notes alongside the Brain.", scope: { kind: "personal" }, status: "unconfigured", mode: "planned", capabilities: ["Vault note links (optional)"], notes: "Optional. The HQ Brain works without Obsidian.", createdAt: daysAgo(14), updatedAt: daysAgo(1) },
  { ...demo, id: "int-research", provider: "Research & Intelligence", key: "research", category: "knowledge", description: "Research pipeline records and reports.", scope: { kind: "global" }, status: "unconfigured", mode: "planned", capabilities: ["Research records", "Source verification", "Reports"], notes: "Read-only when connected.", createdAt: daysAgo(14), updatedAt: daysAgo(1) },
  { ...demo, id: "int-linux", provider: "Linux hosts", key: "linux", category: "infrastructure", description: "Host metrics for alfred-core and alfred-build.", scope: { kind: "global" }, status: "unconfigured", mode: "planned", capabilities: ["CPU / memory / disk", "Service units", "Uptime"], notes: "Metrics only; no remote commands.", createdAt: daysAgo(14), updatedAt: daysAgo(1) },
  { ...demo, id: "int-nw-site", provider: "Northwind website", key: "co-northwind-site", category: "company", description: "Northwind's independent website and client portal.", scope: { kind: "company", companyId: "co-northwind" }, status: "unconfigured", mode: "planned", capabilities: ["Uptime", "Company Alfred status"], notes: "Company site keeps its own login.", createdAt: daysAgo(14), updatedAt: daysAgo(1) },
  { ...demo, id: "int-md-site", provider: "Meridian website", key: "co-meridian-site", category: "company", description: "Meridian's independent website and booking flow.", scope: { kind: "company", companyId: "co-meridian" }, status: "unconfigured", mode: "planned", capabilities: ["Uptime", "Booking health"], notes: "Company site keeps its own login.", createdAt: daysAgo(14), updatedAt: daysAgo(1) },
]

type EventSeed = Omit<OperationalEvent, "origin" | "createdAt" | "updatedAt" | "refs"> & Partial<Pick<OperationalEvent, "refs">>
function ev(seed: EventSeed): OperationalEvent {
  return { ...demo, refs: [], createdAt: seed.at, updatedAt: seed.at, ...seed }
}

export const events: OperationalEvent[] = [
  ev({ id: "ev-1", type: "agent_execution", title: "Alfred answered digest follow-up", severity: "info", scope: { kind: "personal" }, agentId: "ag-alfred", at: minutesAgo(12), refs: [{ kind: "session", id: "ses-digest" }] }),
  ev({ id: "ev-2", type: "recovery_attempt", title: "Read-only booking mode enabled", detail: "Cadence switched Meridian bookings to read-only.", severity: "high", scope: { kind: "company", companyId: "co-meridian" }, agentId: "ag-md-scheduler", at: minutesAgo(18), refs: [{ kind: "incident", id: "inc-meridian-booking" }] }),
  ev({ id: "ev-3", type: "incident_detected", title: "Booking API returning 503s", severity: "critical", scope: { kind: "company", companyId: "co-meridian" }, agentId: "ag-md-scheduler", at: minutesAgo(22), refs: [{ kind: "incident", id: "inc-meridian-booking" }] }),
  ev({ id: "ev-4", type: "approval", title: "Restart approval requested for Photon helper", severity: "medium", scope: { kind: "global" }, agentId: "ag-sentinel", at: minutesAgo(30), refs: [{ kind: "approval", id: "apr-photon-restart" }] }),
  ev({ id: "ev-5", type: "development_update", title: "PR #18 updated: app shell", severity: "info", scope: { kind: "personal" }, agentId: "ag-forge", at: minutesAgo(35), refs: [{ kind: "project", id: "prj-hq" }] }),
  ev({ id: "ev-6", type: "recovery_attempt", title: "Photon outbound queue flushed", severity: "medium", scope: { kind: "global" }, agentId: "ag-sentinel", at: minutesAgo(44), refs: [{ kind: "incident", id: "inc-photon-latency" }] }),
  ev({ id: "ev-7", type: "incident_detected", title: "Photon delivery delayed", severity: "high", scope: { kind: "global" }, agentId: "ag-sentinel", at: minutesAgo(47), refs: [{ kind: "incident", id: "inc-photon-latency" }] }),
  ev({ id: "ev-8", type: "task_created", title: "MDB-3 created for Warden", severity: "info", scope: { kind: "company", companyId: "co-meridian" }, agentId: "ag-md-alfred", at: minutesAgo(16), refs: [{ kind: "task", id: "task-md-2" }] }),
  ev({ id: "ev-9", type: "development_update", title: "Tests failing on client-portal", detail: "3 snapshot tests failed.", severity: "medium", scope: { kind: "company", companyId: "co-northwind" }, agentId: "ag-atlas", at: hoursAgo(2), refs: [{ kind: "project", id: "prj-nw-portal" }] }),
  ev({ id: "ev-10", type: "agent_execution", title: "Sage drafted model-tier findings", severity: "info", scope: { kind: "personal" }, agentId: "ag-sage", at: hoursAgo(3), refs: [{ kind: "research", id: "rr-models" }] }),
  ev({ id: "ev-11", type: "task_completed", title: "HFR-5 late-consignment report completed", severity: "info", scope: { kind: "company", companyId: "co-halcyon" }, agentId: "ag-hf-dispatch", at: hoursAgo(6), refs: [{ kind: "task", id: "task-hf-1" }] }),
  ev({ id: "ev-12", type: "config_change", title: "Compass disabled pending evaluation", severity: "low", scope: { kind: "company", companyId: "co-halcyon" }, agentId: "ag-hf-alfred", at: hoursAgo(26), refs: [{ kind: "agent", id: "ag-hf-routes" }] }),
  ev({ id: "ev-13", type: "incident_detected", title: "Nightly backup did not report", severity: "medium", scope: { kind: "global" }, agentId: "ag-sentinel", at: hoursAgo(19), refs: [{ kind: "incident", id: "inc-backup-missed" }] }),
  ev({ id: "ev-14", type: "recovery_attempt", title: "Ping backup-node failed", severity: "medium", scope: { kind: "global" }, agentId: "ag-sentinel", at: hoursAgo(18), refs: [{ kind: "incident", id: "inc-backup-missed" }] }),
  ev({ id: "ev-15", type: "approval", title: "Portal staging deploy approved", severity: "info", scope: { kind: "company", companyId: "co-northwind" }, agentId: "ag-atlas", at: daysAgo(1), refs: [{ kind: "approval", id: "apr-portal-staging" }] }),
  ev({ id: "ev-16", type: "approval", title: "Compass model change rejected", severity: "low", scope: { kind: "company", companyId: "co-halcyon" }, agentId: "ag-hf-alfred", at: daysAgo(2), refs: [{ kind: "approval", id: "apr-compass-model" }] }),
  ev({ id: "ev-17", type: "research_completed", title: "Dashboard patterns report published", severity: "info", scope: { kind: "personal" }, agentId: "ag-sage", at: daysAgo(10), refs: [{ kind: "research", id: "rr-dashboards" }] }),
  ev({ id: "ev-18", type: "incident_detected", title: "Development Gateway unavailable", severity: "high", scope: { kind: "global" }, agentId: "ag-sentinel", at: daysAgo(13), refs: [{ kind: "incident", id: "inc-devgw-outage" }] }),
  ev({ id: "ev-19", type: "recovery_attempt", title: "Gateway restarted (owner approved)", severity: "medium", scope: { kind: "global" }, agentId: "ag-keystone", at: daysAgo(13), refs: [{ kind: "incident", id: "inc-devgw-outage" }] }),
  ev({ id: "ev-20", type: "config_change", title: "Descriptor limit raised on alfred-build", severity: "low", scope: { kind: "global" }, agentId: "ag-keystone", at: daysAgo(12), refs: [{ kind: "device", id: "dev-build" }] }),
  ev({ id: "ev-21", type: "task_created", title: "HQ-15 Brain graph explorer created", severity: "info", scope: { kind: "personal" }, agentId: "ag-atlas", at: daysAgo(3), refs: [{ kind: "task", id: "task-hq-4" }] }),
  ev({ id: "ev-22", type: "task_completed", title: "HQ-11 design tokens completed", severity: "info", scope: { kind: "personal" }, agentId: "ag-forge", at: daysAgo(2), refs: [{ kind: "task", id: "task-hq-7" }] }),
]

// ---------------------------------------------------------------------------
// Usage: 30 days × (company/agent, model) rows, deterministic.
// ---------------------------------------------------------------------------

const usagePlan: { companyId?: string; agentId: string; model: string; base: number }[] = [
  { agentId: "ag-alfred", model: "claude-opus-5-5", base: 9.5 },
  { agentId: "ag-atlas", model: "claude-opus-5-5", base: 7.2 },
  { agentId: "ag-forge", model: "claude-sonnet-5-5", base: 4.1 },
  { agentId: "ag-sage", model: "claude-opus-5-5", base: 5.3 },
  { agentId: "ag-scout", model: "claude-haiku-5-5", base: 1.2 },
  { agentId: "ag-sentinel", model: "claude-haiku-5-5", base: 0.9 },
  { companyId: "co-northwind", agentId: "ag-nw-alfred", model: "claude-opus-5-5", base: 3.6 },
  { companyId: "co-northwind", agentId: "ag-nw-design", model: "claude-sonnet-5-5", base: 2.2 },
  { companyId: "co-meridian", agentId: "ag-md-alfred", model: "claude-opus-5-5", base: 4.0 },
  { companyId: "co-meridian", agentId: "ag-md-scheduler", model: "claude-haiku-5-5", base: 1.6 },
  { companyId: "co-halcyon", agentId: "ag-hf-alfred", model: "claude-opus-5-5", base: 2.4 },
  { companyId: "co-halcyon", agentId: "ag-hf-dispatch", model: "claude-sonnet-5-5", base: 1.9 },
]

function buildUsage(): UsageRecord[] {
  const rand = seeded(97)
  const rows: UsageRecord[] = []
  for (let day = 29; day >= 0; day--) {
    const date = new Date(DEMO_NOW.getTime() - day * 86_400_000).toISOString().slice(0, 10)
    const weekday = new Date(date).getUTCDay()
    const weekend = weekday === 0 || weekday === 6 ? 0.55 : 1
    for (const p of usagePlan) {
      const cost = +(p.base * weekend * (0.75 + rand() * 0.5)).toFixed(2)
      rows.push({
        id: `u-${date}-${p.agentId}`,
        origin: "demo",
        date,
        companyId: p.companyId,
        agentId: p.agentId,
        model: p.model,
        category: "model",
        inputTokens: Math.round(cost * 52_000),
        outputTokens: Math.round(cost * 9_000),
        costUsd: cost,
      })
    }
    rows.push({ id: `u-${date}-api`, origin: "demo", date, model: "external APIs", category: "api", inputTokens: 0, outputTokens: 0, costUsd: +(2.1 + rand() * 1.2).toFixed(2) })
    rows.push({ id: `u-${date}-infra`, origin: "demo", date, model: "hosting", category: "infrastructure", inputTokens: 0, outputTokens: 0, costUsd: 6.4 })
  }
  return rows
}

export const usage: UsageRecord[] = buildUsage()

export const budgets: Budget[] = [
  { id: "bd-global", scope: { kind: "global" }, label: "Total monthly", monthlyLimitUsd: 2200 },
  { id: "bd-personal", scope: { kind: "personal" }, label: "Alfred core & personal", monthlyLimitUsd: 1100 },
  { id: "bd-nw", scope: { kind: "company", companyId: "co-northwind" }, label: "Northwind", monthlyLimitUsd: 250 },
  { id: "bd-md", scope: { kind: "company", companyId: "co-meridian" }, label: "Meridian", monthlyLimitUsd: 180 },
  { id: "bd-hf", scope: { kind: "company", companyId: "co-halcyon" }, label: "Halcyon", monthlyLimitUsd: 160 },
]
