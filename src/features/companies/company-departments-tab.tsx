"use client"

import Link from "next/link"
import { Crown, Network } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Agent, Company } from "@/lib/types"
import { AgentCard } from "@/components/hq/agent-card"
import { Panel } from "@/components/hq/panel"
import { EmptyState } from "@/components/hq/states"
import { StatusBadge } from "@/components/hq/status-badge"
import { rollupStatus } from "./company-utils"

export function CompanyDepartmentsTab({
  company,
  agentById,
  selectedId,
  onSelect,
}: {
  company: Company
  agentById: Map<string, Agent>
  selectedId?: string
  onSelect: (id: string) => void
}) {
  if (company.departments.length === 0)
    return <EmptyState icon={<Network className="size-4" />} title="No departments" description={`${company.shortName} has no departments yet.`} />

  const dept = company.departments.find((d) => d.id === selectedId) ?? company.departments[0]
  const lead = dept.leadAgentId ? agentById.get(dept.leadAgentId) : undefined
  const members = dept.agentIds.map((id) => agentById.get(id)).filter((a): a is Agent => Boolean(a))
  const missing = dept.agentIds.length - members.length

  return (
    <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
      <nav aria-label="Departments" className="min-w-0">
        <ul className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {company.departments.map((d) => {
            const active = d.id === dept.id
            const status = rollupStatus(d.agentIds.map((id) => agentById.get(id)?.status ?? "unknown"))
            return (
              <li key={d.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onSelect(d.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    active ? "border-foreground/20 bg-surface-2 font-medium" : "bg-card"
                  )}
                >
                  <span className="truncate">{d.name}</span>
                  <StatusBadge status={status} withTooltip={false} />
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="min-w-0 space-y-4">
        <Panel title={dept.name} description={`${dept.agentIds.length} ${dept.agentIds.length === 1 ? "agent" : "agents"}`}>
          <div className="flex items-center gap-2 text-sm">
            <Crown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="text-muted-foreground">Lead:</span>
            {lead ? (
              <Link href={`/agents/${lead.id}`} className="font-medium hover:underline">
                {lead.name}
              </Link>
            ) : (
              <span className="text-muted-foreground">No lead assigned</span>
            )}
          </div>
        </Panel>

        {members.length === 0 ? (
          <EmptyState title="No agents in this department" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {members.map((a) => (
              <AgentCard key={a.id} agent={a} companies={[company]} />
            ))}
          </div>
        )}
        {missing > 0 && (
          <p className="text-xs text-muted-foreground">
            {missing} assigned {missing === 1 ? "agent is" : "agents are"} not in the registry — status unknown.
          </p>
        )}
      </div>
    </div>
  )
}
