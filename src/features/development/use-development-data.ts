"use client"

import { useMemo } from "react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { inCompanyContext } from "@/lib/format"
import type { Agent, Approval, Company, Project, Task } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"

export interface DevelopmentData {
  /** Development projects visible in the current company context. */
  projects: Project[]
  /** Tasks belonging to those projects. */
  tasks: Task[]
  /** Plan / deployment approvals tied to development projects. */
  approvals: Approval[]
  agents: Agent[]
  companies: Company[]
  agentById: Map<string, Agent>
  projectById: Map<string, Project>
}

export function projectIdFromRefs(a: Approval): string | undefined {
  return a.refs.find((r) => r.kind === "project")?.id
}

export function useDevelopmentData() {
  const { companyContext } = useHQ()
  const q = useHQQuery("development", async (p) => {
    const [projects, tasks, approvals, agents, companies] = await Promise.all([
      p.listProjects(),
      p.listTasks(),
      p.listApprovals(),
      p.listAgents(),
      p.listCompanies(),
    ])
    return { projects, tasks, approvals, agents, companies }
  })

  const data = useMemo<DevelopmentData | undefined>(() => {
    if (!q.data) return undefined
    const projects = q.data.projects.filter((p) => p.kind === "development" && inCompanyContext(p.scope, companyContext))
    const ids = new Set(projects.map((p) => p.id))
    return {
      projects,
      tasks: q.data.tasks.filter((t) => t.projectId && ids.has(t.projectId)),
      approvals: q.data.approvals.filter((a) => {
        if (a.kind !== "plan" && a.kind !== "deployment") return false
        const pid = projectIdFromRefs(a)
        return pid ? ids.has(pid) : inCompanyContext(a.scope, companyContext)
      }),
      agents: q.data.agents,
      companies: q.data.companies,
      agentById: new Map(q.data.agents.map((a) => [a.id, a])),
      projectById: new Map(q.data.projects.map((p) => [p.id, p])),
    }
  }, [q.data, companyContext])

  return { status: q.status, error: q.error, refetch: q.refetch, data }
}
