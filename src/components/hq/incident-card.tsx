"use client"

import { AlertOctagon } from "lucide-react"
import { cn } from "@/lib/utils"
import { timeAgo, titleCase } from "@/lib/format"
import { severityMeta, toneClasses } from "@/lib/status"
import type { Incident } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { SeverityBadge, ToneBadge } from "./status-badge"

export function IncidentCard({ incident, className }: { incident: Incident; className?: string }) {
  const { inspect, inspector } = useHQ()
  const tone = severityMeta[incident.severity].tone
  const active = inspector.selection?.kind === "incident" && inspector.selection.id === incident.id
  const resolved = incident.state === "resolved"
  return (
    <button
      type="button"
      onClick={() => inspect({ kind: "incident", id: incident.id })}
      className={cn(
        "group flex w-full min-w-0 gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        active && "border-foreground/20 bg-surface-2",
        className
      )}
      aria-pressed={active}
    >
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md",
          resolved ? "bg-muted text-muted-foreground" : cn(toneClasses[tone].bg, toneClasses[tone].text)
        )}
      >
        <AlertOctagon className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={cn("text-sm font-medium", resolved && "text-muted-foreground")}>{incident.title}</span>
          <span className="shrink-0 text-xs text-muted-foreground tabular">{timeAgo(incident.detectedAt)}</span>
        </span>
        <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">{incident.summary}</span>
        <span className="mt-2 flex flex-wrap items-center gap-1.5">
          <SeverityBadge severity={incident.severity} />
          <ToneBadge tone={resolved ? "success" : incident.state === "mitigated" ? "info" : "warning"} dot={false}>
            {titleCase(incident.state)}
          </ToneBadge>
        </span>
      </span>
    </button>
  )
}
