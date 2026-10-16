import type { Agent, AgentRole, Company, HealthStatus } from "@/lib/types"

export type StatusFilter = "all" | "attention" | HealthStatus
export type ViewMode = "grid" | "list" | "hierarchy"

export const statusFilterOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "attention", label: "Needs attention" },
  { value: "working", label: "Working" },
  { value: "idle", label: "Idle" },
  { value: "healthy", label: "Healthy" },
  { value: "degraded", label: "Degraded" },
  { value: "offline", label: "Offline" },
  { value: "unknown", label: "Unknown" },
  { value: "unconfigured", label: "Unconfigured" },
]

export const roleOptions: AgentRole[] = ["orchestrator", "executive", "cto", "lead", "specialist", "researcher", "operator"]

export function parseStatusFilter(raw: string | null): StatusFilter {
  return statusFilterOptions.some((o) => o.value === raw) ? (raw as StatusFilter) : "all"
}

export function needsAttention(agent: Pick<Agent, "status">): boolean {
  return agent.status === "degraded" || agent.status === "offline"
}

export function isUnverified(agent: Pick<Agent, "status">): boolean {
  return agent.status === "unknown" || agent.status === "unconfigured"
}

export interface AgentFilterState {
  status: StatusFilter
  /** "all" | "global" | "personal" | company id */
  scope: string
  /** "all" | department id (only applied with a company scope) */
  department: string
  role: "all" | AgentRole
  query: string
}

export const emptyFilters: Omit<AgentFilterState, "status"> = { scope: "all", department: "all", role: "all", query: "" }

export function matchesScope(agent: Agent, scope: string): boolean {
  if (scope === "all") return true
  if (scope === "global" || scope === "personal") return agent.scope.kind === scope
  return agent.scope.kind === "company" && agent.scope.companyId === scope
}

export function filterAgents(agents: Agent[], f: AgentFilterState, companies: Company[]): Agent[] {
  const q = f.query.trim().toLowerCase()
  const companyName = (a: Agent) => {
    const s = a.scope
    return s.kind === "company" ? companies.find((c) => c.id === s.companyId)?.name : undefined
  }
  return agents.filter((a) => {
    if (f.status === "attention" ? !needsAttention(a) : f.status !== "all" && a.status !== f.status) return false
    if (!matchesScope(a, f.scope)) return false
    if (f.department !== "all" && a.departmentId !== f.department) return false
    if (f.role !== "all" && a.role !== f.role) return false
    if (q) {
      const hay = [a.name, a.title, a.description, a.model.name, companyName(a)].filter(Boolean).join(" ").toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

/** Ancestors of the given agents (via parentAgentId), for hierarchy context. */
export function withAncestors(subset: Agent[], all: Agent[]): Agent[] {
  const byId = new Map(all.map((a) => [a.id, a]))
  const out = new Map(subset.map((a) => [a.id, a]))
  for (const a of subset) {
    let parent = a.parentAgentId ? byId.get(a.parentAgentId) : undefined
    while (parent && !out.has(parent.id)) {
      out.set(parent.id, parent)
      parent = parent.parentAgentId ? byId.get(parent.parentAgentId) : undefined
    }
  }
  return Array.from(out.values())
}

export function departmentName(agent: Agent, companies: Company[]): string | undefined {
  if (agent.scope.kind !== "company" || !agent.departmentId) return undefined
  const companyId = agent.scope.companyId
  return companies.find((c) => c.id === companyId)?.departments.find((d) => d.id === agent.departmentId)?.name
}
