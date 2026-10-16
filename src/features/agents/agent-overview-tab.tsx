import Link from "next/link"
import { formatCompact, scopeLabel } from "@/lib/format"
import type { Agent, Company } from "@/lib/types"
import { AgentAvatar } from "@/components/hq/avatars"
import { agentRoleLabel } from "@/components/hq/agent-card"
import { Panel, PropertyList } from "@/components/hq/panel"
import { StatusBadge, ToneBadge } from "@/components/hq/status-badge"
import { departmentName } from "./agent-utils"

const toolKindTone = { read: "info", write: "warning", external: "neutral" } as const

function AgentLink({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="-mx-2 flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/60"
    >
      <AgentAvatar agent={agent} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{agent.name}</span>
        <span className="block truncate text-[11px] text-muted-foreground">{agent.title}</span>
      </span>
      <StatusBadge status={agent.status} withTooltip={false} />
    </Link>
  )
}

export function AgentOverviewTab({ agent, agents, companies }: { agent: Agent; agents: Agent[]; companies: Company[] }) {
  const parent = agent.parentAgentId ? agents.find((a) => a.id === agent.parentAgentId) : undefined
  const reports = agents.filter((a) => a.parentAgentId === agent.id).sort((a, b) => a.name.localeCompare(b.name))
  const companyId = agent.scope.kind === "company" ? agent.scope.companyId : undefined
  const dept = departmentName(agent, companies)

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Panel title="About">
          <p className="text-sm text-foreground/90">{agent.description}</p>
          <PropertyList
            className="mt-4"
            items={[
              { label: "Role", value: agentRoleLabel[agent.role] },
              {
                label: "Scope",
                value: companyId ? (
                  <Link href={`/companies/${companyId}`} className="text-brand hover:underline">
                    {scopeLabel(agent.scope, companies)}
                  </Link>
                ) : (
                  scopeLabel(agent.scope, companies)
                ),
              },
              { label: "Department", value: dept ?? <span className="text-muted-foreground">—</span> },
              { label: "Model", value: <span className="font-mono text-xs">{agent.model.name}</span> },
              { label: "Provider", value: agent.model.provider },
              { label: "Context window", value: `${formatCompact(agent.model.contextWindow)} tokens` },
            ]}
          />
        </Panel>

        <Panel title="Tools" description="Capabilities granted to this agent">
          {agent.tools.length === 0 ? (
            <p className="text-xs text-muted-foreground">No tools granted.</p>
          ) : (
            <ul className="divide-y">
              {agent.tools.map((t) => (
                <li key={t.name} className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:gap-3">
                  <span className="flex items-center gap-2 sm:w-44 sm:shrink-0">
                    <code className="font-mono text-xs">{t.name}</code>
                    <ToneBadge tone={toolKindTone[t.kind]} dot={false}>
                      {t.kind}
                    </ToneBadge>
                  </span>
                  <span className="text-xs text-muted-foreground">{t.description}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="space-y-4">
        <Panel title="Reports to">
          {parent ? (
            <AgentLink agent={parent} />
          ) : (
            <p className="text-xs text-muted-foreground">
              {agent.role === "orchestrator" ? "Top of the hierarchy — reports to you." : "No reporting line registered."}
            </p>
          )}
        </Panel>
        <Panel title="Direct reports" description={`${reports.length} ${reports.length === 1 ? "agent" : "agents"}`}>
          {reports.length === 0 ? (
            <p className="text-xs text-muted-foreground">No agents report to {agent.name}.</p>
          ) : (
            <div>
              {reports.map((r) => (
                <AgentLink key={r.id} agent={r} />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
