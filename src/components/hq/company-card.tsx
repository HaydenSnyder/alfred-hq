import Link from "next/link"
import { AlertOctagon, Bot, Globe, ListTodo, Network } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Company } from "@/lib/types"
import { CompanyMark } from "./avatars"
import { StatusBadge } from "./status-badge"

export interface CompanyStats {
  agents: number
  activeTasks: number
}

export function CompanyCard({ company, stats, className }: { company: Company; stats: CompanyStats; className?: string }) {
  const incidents = company.openIncidentIds.length
  return (
    <Link
      href={`/companies/${company.id}`}
      className={cn(
        "group flex min-w-0 flex-col rounded-xl border bg-card p-4 transition-colors hover:border-foreground/15 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <CompanyMark company={company} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{company.name}</p>
          <p className="truncate text-xs text-muted-foreground">{company.tagline}</p>
        </div>
        <StatusBadge status={company.health} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <Globe className="size-3.5" /> Website
          </dt>
          <dd>
            <StatusBadge status={company.website.status} withTooltip={false} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <Bot className="size-3.5" /> Alfred
          </dt>
          <dd>
            <StatusBadge status={company.companyAlfred.status} withTooltip={false} />
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Network className="size-3.5" /> {company.departments.length} depts
        </span>
        <span className="flex items-center gap-1.5">
          <Bot className="size-3.5" /> {stats.agents} agents
        </span>
        <span className="flex items-center gap-1.5">
          <ListTodo className="size-3.5" /> {stats.activeTasks} active
        </span>
        <span className={cn("flex items-center gap-1.5", incidents > 0 && "text-status-danger")}>
          <AlertOctagon className="size-3.5" /> {incidents} {incidents === 1 ? "incident" : "incidents"}
        </span>
      </div>
    </Link>
  )
}

/** Dense row variant for dashboards. */
export function CompanyRow({ company, stats }: { company: Company; stats: CompanyStats }) {
  return (
    <Link
      href={`/companies/${company.id}`}
      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <CompanyMark company={company} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{company.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {stats.agents} agents · {stats.activeTasks} active tasks
          {company.openIncidentIds.length > 0 && (
            <span className="text-status-danger"> · {company.openIncidentIds.length} incident</span>
          )}
        </span>
      </span>
      <StatusBadge status={company.health} withTooltip={false} />
    </Link>
  )
}
