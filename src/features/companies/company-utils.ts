import type { Agent, Company, HealthStatus, Incident, Task } from "@/lib/types"

export type HealthFilter = "all" | "healthy" | "attention" | "unverified"

export const healthFilterOptions: { value: HealthFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "healthy", label: "Healthy" },
  { value: "attention", label: "Needs attention" },
  { value: "unverified", label: "Unverified" },
]

export function matchesHealthFilter(status: HealthStatus, filter: HealthFilter): boolean {
  switch (filter) {
    case "all":
      return true
    case "healthy":
      return status === "healthy" || status === "working" || status === "idle"
    case "attention":
      return status === "degraded" || status === "offline"
    case "unverified":
      return status === "unknown" || status === "unconfigured"
  }
}

export function isCompanyScoped(scope: { kind: string; companyId?: string }, companyId: string): boolean {
  return scope.kind === "company" && scope.companyId === companyId
}

export function companyStats(companyId: string, agents: Agent[], tasks: Task[]) {
  return {
    agents: agents.filter((a) => isCompanyScoped(a.scope, companyId)).length,
    activeTasks: tasks.filter((t) => isCompanyScoped(t.scope, companyId) && t.status !== "done").length,
  }
}

/** Open incidents linked to the company, by id or by scope. */
export function companyIncidents(company: Company, incidents: Incident[]): Incident[] {
  return incidents.filter(
    (i) => i.state !== "resolved" && (company.openIncidentIds.includes(i.id) || isCompanyScoped(i.scope, company.id))
  )
}

/**
 * Roll up several agent statuses into one. Problems win; when nothing is
 * verified the result is `unknown`, never healthy.
 */
export function rollupStatus(statuses: HealthStatus[]): HealthStatus {
  if (statuses.length === 0) return "unknown"
  if (statuses.includes("offline")) return "offline"
  if (statuses.includes("degraded")) return "degraded"
  const verified = statuses.filter((s) => s !== "unknown" && s !== "unconfigured")
  if (verified.length === 0) return statuses.every((s) => s === "unconfigured") ? "unconfigured" : "unknown"
  if (verified.includes("working")) return "working"
  if (verified.includes("healthy")) return "healthy"
  return "idle"
}
