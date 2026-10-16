"use client"

import Link from "next/link"
import {
  Activity,
  AlertOctagon,
  BadgeCheck,
  CircleCheck,
  CirclePlus,
  GitPullRequest,
  LifeBuoy,
  Microscope,
  Settings2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime, timeAgo } from "@/lib/format"
import { hrefFor } from "@/lib/routes"
import { severityMeta, toneClasses } from "@/lib/status"
import type { Agent, OperationalEvent, OperationalEventType } from "@/lib/types"

export const eventTypeMeta: Record<OperationalEventType, { label: string; icon: typeof Activity }> = {
  agent_execution: { label: "Agent execution", icon: Activity },
  task_created: { label: "Task created", icon: CirclePlus },
  task_completed: { label: "Task completed", icon: CircleCheck },
  incident_detected: { label: "Incident detected", icon: AlertOctagon },
  recovery_attempt: { label: "Recovery attempt", icon: LifeBuoy },
  approval: { label: "Approval", icon: BadgeCheck },
  research_completed: { label: "Research completed", icon: Microscope },
  development_update: { label: "Development update", icon: GitPullRequest },
  config_change: { label: "Configuration change", icon: Settings2 },
}

export interface TimelineItem {
  id: string
  at: string
  title: string
  detail?: string
  icon?: typeof Activity
  tone?: keyof typeof toneClasses
  href?: string
  meta?: React.ReactNode
}

/** Generic vertical timeline. */
export function Timeline({ items, compact, className }: { items: TimelineItem[]; compact?: boolean; className?: string }) {
  return (
    <ol className={cn("relative", className)}>
      {items.map((item, i) => {
        const Icon = item.icon ?? Activity
        const tone = toneClasses[item.tone ?? "muted"]
        const content = (
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-sm">{item.title}</p>
              <time dateTime={item.at} title={formatDateTime(item.at)} className="shrink-0 text-xs text-muted-foreground tabular">
                {timeAgo(item.at)}
              </time>
            </div>
            {!compact && item.detail && <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>}
            {item.meta && <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">{item.meta}</div>}
          </div>
        )
        return (
          <li key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
            {i < items.length - 1 && <span className="absolute top-7 bottom-0 left-[13px] w-px bg-border" aria-hidden />}
            <span className={cn("relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border bg-card", tone.text)}>
              <Icon className="size-3.5" />
            </span>
            {item.href ? (
              <Link href={item.href} className="-mx-1.5 -my-1 flex min-w-0 flex-1 rounded-md px-1.5 py-1 transition-colors hover:bg-accent/60">
                {content}
              </Link>
            ) : (
              <div className="flex min-w-0 flex-1 py-1">{content}</div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Operational events rendered on the shared timeline. */
export function EventTimeline({
  events,
  agentById,
  compact,
  className,
}: {
  events: OperationalEvent[]
  agentById?: Map<string, Agent>
  compact?: boolean
  className?: string
}) {
  const items: TimelineItem[] = events.map((e) => {
    const meta = eventTypeMeta[e.type]
    const agent = e.agentId ? agentById?.get(e.agentId) : undefined
    return {
      id: e.id,
      at: e.at,
      title: e.title,
      detail: e.detail,
      icon: meta.icon,
      tone: e.severity === "info" ? "muted" : severityMeta[e.severity].tone,
      href: e.refs[0] ? hrefFor(e.refs[0]) : undefined,
      meta: compact ? undefined : (
        <>
          <span>{meta.label}</span>
          {agent && (
            <>
              <span aria-hidden>·</span>
              <span>{agent.name}</span>
            </>
          )}
        </>
      ),
    }
  })
  return <Timeline items={items} compact={compact} className={className} />
}
