import Link from "next/link"
import { Clock, Globe, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { scopeLabel, timeAgo } from "@/lib/format"
import type { Agent, AgentRole, Company, Scope } from "@/lib/types"
import { AgentAvatar, CompanyMark } from "./avatars"
import { StatusBadge } from "./status-badge"

export const agentRoleLabel: Record<AgentRole, string> = {
  orchestrator: "Orchestrator",
  executive: "Company Alfred",
  cto: "CTO",
  lead: "Lead",
  specialist: "Specialist",
  researcher: "Researcher",
  operator: "Operator",
}

/** Latency from the agent's 7-day stats; zero means no samples were recorded. */
export function formatLatency(ms: number): string {
  if (!ms) return "—"
  if (ms < 1000) return `${ms} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

export function formatErrorRate(rate: number, hasSamples = true): string {
  if (!hasSamples) return "—"
  return `${rate.toFixed(1)}%`
}

/** Agents without verified checks have no meaningful stats. */
export function agentHasStats(agent: Pick<Agent, "status" | "lastCheckAt">): boolean {
  return agent.status !== "unconfigured" && agent.status !== "unknown" && Boolean(agent.lastCheckAt)
}

export function errorRateTone(rate: number) {
  return rate >= 5 ? "text-status-danger" : rate >= 2 ? "text-status-warning" : undefined
}

/** Compact scope indicator: company mark, or a global / personal glyph. */
export function ScopeChip({ scope, companies, className }: { scope: Scope; companies?: Company[]; className?: string }) {
  const company = scope.kind === "company" ? companies?.find((c) => c.id === scope.companyId) : undefined
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground", className)}>
      {company ? (
        <CompanyMark company={company} size="sm" className="size-4 rounded text-[8px]" />
      ) : scope.kind === "personal" ? (
        <User className="size-3.5 shrink-0" aria-hidden />
      ) : (
        <Globe className="size-3.5 shrink-0" aria-hidden />
      )}
      <span className="truncate">{scopeLabel(scope, companies)}</span>
    </span>
  )
}

/** Directory card for an agent. Links to the agent profile. */
export function AgentCard({ agent, companies, className }: { agent: Agent; companies?: Company[]; className?: string }) {
  const hasStats = agentHasStats(agent)
  return (
    <Link
      href={`/agents/${agent.id}`}
      className={cn(
        "group flex min-w-0 flex-col rounded-xl border bg-card p-4 transition-colors hover:border-foreground/15 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AgentAvatar agent={agent} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{agent.name}</p>
          <p className="truncate text-xs text-muted-foreground">{agent.title}</p>
        </div>
        <StatusBadge status={agent.status} withTooltip={false} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <ScopeChip scope={agent.scope} companies={companies} />
        <span className="text-xs text-muted-foreground">{agentRoleLabel[agent.role]}</span>
        <span className="truncate font-mono text-[11px] text-muted-foreground">{agent.model.name}</span>
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{agent.description}</p>

      <dl className="mt-auto grid grid-cols-3 gap-2 border-t pt-3 text-xs">
        <div className="min-w-0">
          <dt className="text-muted-foreground">Tasks 7d</dt>
          <dd className="mt-0.5 font-medium tabular">{hasStats ? agent.stats.tasksCompleted7d : "—"}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">Latency</dt>
          <dd className="mt-0.5 font-medium tabular">{hasStats ? formatLatency(agent.stats.avgLatencyMs) : "—"}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-muted-foreground">Errors</dt>
          <dd className={cn("mt-0.5 font-medium tabular", hasStats && errorRateTone(agent.stats.errorRate7d))}>
            {formatErrorRate(agent.stats.errorRate7d, hasStats)}
          </dd>
        </div>
      </dl>
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Clock className="size-3" aria-hidden />
        {agent.lastCheckAt ? `Checked ${timeAgo(agent.lastCheckAt)}` : "No verified check"}
      </p>
    </Link>
  )
}
