import type { RecordRef, SearchResult } from "@/lib/types"
import { hrefFor } from "@/lib/routes"
import { agents } from "./mock/agents"
import { companies } from "./mock/companies"
import { devices, incidents, services } from "./mock/infrastructure"
import { knowledgeEdges, knowledgeNodes } from "./mock/knowledge"
import { approvals, budgets, events, integrations, notifications, usage } from "./mock/operations"
import { research } from "./mock/research"
import { messages, projects, sessions, tasks } from "./mock/work"
import { DataSourceError, type HQDataProvider, type SourceSimulation } from "./provider"

let simulation: SourceSimulation = "normal"

/** Used by Settings → Data source preview to exercise loading/error/offline/empty UI. */
export function setSourceSimulation(next: SourceSimulation) {
  simulation = next
}

export function getSourceSimulation() {
  return simulation
}

async function respond<T>(value: T, emptyValue: T): Promise<T> {
  const delay = simulation === "slow" ? 2200 : 120 + Math.random() * 160
  await new Promise((resolve) => setTimeout(resolve, delay))
  if (simulation === "error") throw new DataSourceError("The demo data source returned an error (simulated).", "error")
  if (simulation === "offline") throw new DataSourceError("The data source is unreachable (simulated offline).", "offline")
  if (simulation === "empty") return emptyValue
  // Return copies so views can't mutate the shared dataset.
  return structuredClone(value)
}

const list = <T,>(items: T[]) => respond(items, [] as T[])
const one = <T,>(item: T | undefined) => respond(item, undefined)

function matches(query: string, ...fields: (string | undefined)[]) {
  return fields.some((f) => f?.toLowerCase().includes(query))
}

export class MockDataProvider implements HQDataProvider {
  readonly label = "Demo data"
  readonly origin = "demo" as const

  listCompanies = () => list(companies)
  getCompany = (id: string) => one(companies.find((c) => c.id === id))

  listAgents = (filter?: { companyId?: string }) =>
    list(
      filter?.companyId
        ? agents.filter((a) => a.scope.kind === "company" && a.scope.companyId === filter.companyId)
        : agents
    )
  getAgent = (id: string) => one(agents.find((a) => a.id === id))

  listDevices = () => list(devices)
  getDevice = (id: string) => one(devices.find((d) => d.id === id))
  listServices = () => list(services)
  listIncidents = () => list(incidents)
  getIncident = (id: string) => one(incidents.find((i) => i.id === id))

  listNotifications = () => list(notifications)
  listApprovals = () => list(approvals)
  getApproval = (id: string) => one(approvals.find((a) => a.id === id))

  listProjects = () => list(projects)
  getProject = (id: string) => one(projects.find((p) => p.id === id))
  listTasks = (filter?: { projectId?: string; agentId?: string }) =>
    list(
      tasks.filter(
        (t) =>
          (!filter?.projectId || t.projectId === filter.projectId) &&
          (!filter?.agentId || t.assigneeAgentId === filter.agentId)
      )
    )
  getTask = (id: string) => one(tasks.find((t) => t.id === id))

  listSessions = () => list(sessions)
  getSession = (id: string) => one(sessions.find((s) => s.id === id))
  listMessages = (sessionId: string) => list(messages.filter((m) => m.sessionId === sessionId))

  listResearch = () => list(research)
  getResearch = (id: string) => one(research.find((r) => r.id === id))

  getKnowledgeGraph = () =>
    respond({ nodes: knowledgeNodes, edges: knowledgeEdges }, { nodes: [], edges: [] })

  listIntegrations = () => list(integrations)
  getIntegration = (id: string) => one(integrations.find((i) => i.id === id))

  listEvents = () => list(events)
  listUsage = () => list(usage)
  listBudgets = () => list(budgets)

  search = (raw: string) => {
    const q = raw.trim().toLowerCase()
    if (!q) return list<SearchResult>([])
    const results: SearchResult[] = []
    const push = (ref: RecordRef, title: string, subtitle: string) =>
      results.push({ ref, title, subtitle, href: hrefFor(ref) })

    companies.filter((c) => matches(q, c.name, c.industry)).forEach((c) => push({ kind: "company", id: c.id }, c.name, c.industry))
    agents.filter((a) => matches(q, a.name, a.title, a.description)).forEach((a) => push({ kind: "agent", id: a.id }, a.name, a.title))
    projects.filter((p) => matches(q, p.name, p.key, p.summary)).forEach((p) => push({ kind: "project", id: p.id }, p.name, `Project · ${p.key}`))
    tasks.filter((t) => matches(q, t.title, t.key)).forEach((t) => push({ kind: "task", id: t.id }, t.title, `Task · ${t.key}`))
    sessions.filter((s) => matches(q, s.title)).forEach((s) => push({ kind: "session", id: s.id }, s.title, "Chat session"))
    incidents.filter((i) => matches(q, i.title, i.summary)).forEach((i) => push({ kind: "incident", id: i.id }, i.title, `Incident · ${i.severity}`))
    research.filter((r) => matches(q, r.title, r.question)).forEach((r) => push({ kind: "research", id: r.id }, r.title, "Research"))
    knowledgeNodes.filter((n) => matches(q, n.label, n.summary)).forEach((n) => push({ kind: "node", id: n.id }, n.label, `Brain · ${n.type}`))
    integrations.filter((i) => matches(q, i.provider, i.description)).forEach((i) => push({ kind: "integration", id: i.id }, i.provider, "Integration"))
    devices.filter((d) => matches(q, d.name, d.hostname)).forEach((d) => push({ kind: "device", id: d.id }, d.name, d.hostname))
    services.filter((s) => matches(q, s.name, s.system)).forEach((s) => push({ kind: "service", id: s.id }, s.name, "Service"))

    return list(results.slice(0, 40))
  }
}
