"use client"

import { AlertOctagon, Bot, ChevronRight, ListTodo, MessagesSquare } from "lucide-react"
import type { Agent, Company, Incident, Task } from "@/lib/types"
import { IncidentCard } from "@/components/hq/incident-card"
import { MetricCard } from "@/components/hq/metric-card"
import { Panel, PropertyList } from "@/components/hq/panel"
import { EmptyState, UnknownState } from "@/components/hq/states"
import { StatusBadge } from "@/components/hq/status-badge"
import { Button } from "@/components/ui/button"
import { rollupStatus } from "./company-utils"

export function CompanyOverviewTab({
  company,
  agents,
  tasks,
  incidents,
  sessionCount,
  agentById,
  onOpenDepartment,
  onOpenKnowledge,
}: {
  company: Company
  agents: Agent[]
  tasks: Task[]
  incidents: Incident[]
  sessionCount: number
  agentById: Map<string, Agent>
  onOpenDepartment: (id: string) => void
  onOpenKnowledge: () => void
}) {
  const activeTasks = tasks.filter((t) => t.status !== "done")
  const blocked = tasks.filter((t) => t.status === "blocked").length
  const attention = agents.filter((a) => a.status === "degraded" || a.status === "offline").length
  const unverifiedCompany = company.health === "unknown" || company.health === "unconfigured"

  return (
    <div className="space-y-4">
      {unverifiedCompany && (
        <UnknownState
          title={company.health === "unconfigured" ? "Not configured" : "Health not verified"}
          description={`${company.shortName} has no verified health data yet. Nothing here is assumed healthy.`}
        />
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Agents" icon={<Bot />} value={agents.length} hint={`${attention} need attention`} tone={attention ? "warning" : undefined} />
        <MetricCard label="Active tasks" icon={<ListTodo />} value={activeTasks.length} hint={`${blocked} blocked`} />
        <MetricCard label="Open incidents" icon={<AlertOctagon />} value={incidents.length} tone={incidents.length ? "danger" : undefined} />
        <MetricCard label="Sessions" icon={<MessagesSquare />} value={sessionCount} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel title="Departments" description="Select a department to see its agents and lead">
            {company.departments.length === 0 ? (
              <EmptyState title="No departments" className="py-6" />
            ) : (
              <ul className="-mx-2">
                {company.departments.map((dep) => {
                  const lead = dep.leadAgentId ? agentById.get(dep.leadAgentId) : undefined
                  const status = rollupStatus(dep.agentIds.map((id) => agentById.get(id)?.status ?? "unknown"))
                  return (
                    <li key={dep.id}>
                      <button
                        type="button"
                        onClick={() => onOpenDepartment(dep.id)}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-accent/60"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm">{dep.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {lead ? `Led by ${lead.name}` : "No lead assigned"} · {dep.agentIds.length}{" "}
                            {dep.agentIds.length === 1 ? "agent" : "agents"}
                          </span>
                        </span>
                        <StatusBadge status={status} withTooltip={false} />
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Open incidents" description="Select to inspect" href="/infrastructure">
            {incidents.length === 0 ? (
              <EmptyState title="No open incidents" description={`Nothing open for ${company.shortName}.`} className="py-6" />
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {incidents.map((i) => (
                  <IncidentCard key={i.id} incident={i} />
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Health">
            <PropertyList
              items={[
                { label: "Overall", value: <StatusBadge status={company.health} /> },
                { label: "Website", value: <StatusBadge status={company.website.status} /> },
                { label: "Company Alfred", value: <StatusBadge status={company.companyAlfred.status} /> },
                {
                  label: "Agents",
                  value: (
                    <span className="text-xs">
                      {agents.filter((a) => a.status === "working").length} working · {attention} degraded/offline ·{" "}
                      {agents.filter((a) => a.status === "unknown" || a.status === "unconfigured").length} unverified
                    </span>
                  ),
                },
              ]}
            />
          </Panel>

          <Panel title="Authorised knowledge">
            <p className="text-sm text-foreground/90">{company.knowledgeSummary}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onOpenKnowledge}>
              View knowledge
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  )
}
