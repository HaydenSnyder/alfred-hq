import { scopeLabel } from "@/lib/format"
import { hrefFor } from "@/lib/routes"
import { severityMeta } from "@/lib/status"
import type { Agent, Company } from "@/lib/types"
import { eventTypeMeta, Timeline, type TimelineItem } from "@/components/hq/event-timeline"
import { SeverityBadge } from "@/components/hq/status-badge"
import type { DayGroup } from "./activity-filters"

export function ActivityDayGroup({
  group,
  agentById,
  companies,
}: {
  group: DayGroup
  agentById: Map<string, Agent>
  companies: Company[]
}) {
  const items: TimelineItem[] = group.events.map((e) => {
    const meta = eventTypeMeta[e.type]
    const agent = e.agentId ? agentById.get(e.agentId) : undefined
    return {
      id: e.id,
      at: e.at,
      title: e.title,
      detail: e.detail,
      icon: meta.icon,
      tone: e.severity === "info" ? "muted" : severityMeta[e.severity].tone,
      href: e.refs[0] ? hrefFor(e.refs[0]) : undefined,
      meta: (
        <>
          {e.severity !== "info" && <SeverityBadge severity={e.severity} />}
          <span>{meta.label}</span>
          {agent && (
            <>
              <span aria-hidden>·</span>
              <span>{agent.name}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span>{scopeLabel(e.scope, companies)}</span>
          <span aria-hidden>·</span>
          <time dateTime={e.at} className="tabular">
            {new Date(e.at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" })} UTC
          </time>
        </>
      ),
    }
  })

  return (
    <section aria-labelledby={`day-${group.key}`} className="min-w-0">
      <div className="sticky top-0 z-20 -mx-1 mb-2 flex items-baseline justify-between gap-3 bg-background/95 px-1 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <h2 id={`day-${group.key}`} className="text-sm font-medium">
          {group.label} <span className="ml-1 text-xs font-normal text-muted-foreground">{group.sublabel}</span>
        </h2>
        <span className="shrink-0 text-xs text-muted-foreground tabular">
          {group.events.length} event{group.events.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <Timeline items={items} />
      </div>
    </section>
  )
}
