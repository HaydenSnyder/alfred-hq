"use client"

import { useState } from "react"
import { AlertOctagon, CheckCircle2, CircleDashed, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime, scopeLabel, timeAgo, titleCase } from "@/lib/format"
import { severityMeta, toneClasses } from "@/lib/status"
import type { Agent, Company, Device, Incident, ServiceHealth } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { Panel } from "@/components/hq/panel"
import { EmptyState } from "@/components/hq/states"
import { SeverityBadge, ToneBadge } from "@/components/hq/status-badge"
import { Timeline } from "@/components/hq/event-timeline"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const outcomeIcon = { succeeded: CheckCircle2, failed: XCircle, pending: CircleDashed }

function duration(from: string, to: string) {
  const mins = Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000))
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  if (h < 48) return `${h}h ${mins % 60}m`
  return `${Math.floor(h / 24)}d`
}

function IncidentEntry({
  incident,
  serviceName,
  deviceName,
  agents,
  companies,
}: {
  incident: Incident
  serviceName?: string
  deviceName?: string
  agents: Agent[]
  companies: Company[]
}) {
  const { inspect, inspector } = useHQ()
  const active = inspector.selection?.kind === "incident" && inspector.selection.id === incident.id
  const resolved = incident.state === "resolved"
  const tone = severityMeta[incident.severity].tone
  const affected = [serviceName, deviceName].filter(Boolean).join(" on ")

  return (
    <li className={cn("rounded-lg border bg-card", active && "border-foreground/25 bg-surface-2")}>
      <button
        type="button"
        onClick={() => inspect({ kind: "incident", id: incident.id })}
        aria-pressed={active}
        className="flex w-full min-w-0 gap-3 rounded-t-lg p-3 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
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
          <span className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
            <span className={cn("text-sm font-medium", resolved && "text-foreground/75")}>{incident.title}</span>
            <time dateTime={incident.detectedAt} title={formatDateTime(incident.detectedAt)} className="shrink-0 text-xs text-muted-foreground tabular">
              Detected {timeAgo(incident.detectedAt)}
            </time>
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">{incident.summary}</span>
          <span className="mt-2 flex flex-wrap items-center gap-1.5">
            <SeverityBadge severity={incident.severity} />
            <ToneBadge tone={resolved ? "success" : incident.state === "mitigated" ? "info" : "warning"} dot={false}>
              {titleCase(incident.state)}
            </ToneBadge>
            <span className="text-[11px] text-muted-foreground">
              {scopeLabel(incident.scope, companies)}
              {affected && ` · ${affected}`}
              {resolved && incident.resolvedAt && ` · resolved in ${duration(incident.detectedAt, incident.resolvedAt)}`}
            </span>
          </span>
        </span>
      </button>
      <div className="border-t px-3 py-3">
        <p className="mb-2 text-[11px] font-medium text-muted-foreground">Recovery history</p>
        {incident.recovery.length === 0 ? (
          <p className="text-xs text-muted-foreground">No recovery actions recorded.</p>
        ) : (
          <Timeline
            compact
            items={incident.recovery.map((r, i) => ({
              id: `${incident.id}-r${i}`,
              at: r.at,
              title: r.action,
              icon: outcomeIcon[r.outcome],
              tone: r.outcome === "succeeded" ? "success" : r.outcome === "failed" ? "danger" : "warning",
              meta: <span>{titleCase(r.outcome)}</span>,
            }))}
          />
        )}
        {agents.length > 0 && (
          <p className="mt-2 text-[11px] text-muted-foreground">Involved: {agents.map((a) => a.name).join(", ")}</p>
        )}
      </div>
    </li>
  )
}

export function IncidentsPanel({
  incidents,
  services,
  devices,
  agentById,
  companies,
  initialTab,
}: {
  incidents: Incident[]
  services: ServiceHealth[]
  devices: Device[]
  agentById: Map<string, Agent>
  companies: Company[]
  initialTab?: "open" | "resolved"
}) {
  const [tab, setTab] = useState<"open" | "resolved">(initialTab ?? "open")
  const open = incidents
    .filter((i) => i.state !== "resolved")
    .sort((a, b) => severityMeta[a.severity].rank - severityMeta[b.severity].rank || b.detectedAt.localeCompare(a.detectedAt))
  const resolved = incidents.filter((i) => i.state === "resolved").sort((a, b) => (b.resolvedAt ?? "").localeCompare(a.resolvedAt ?? ""))

  const render = (list: Incident[], emptyTitle: string) =>
    list.length === 0 ? (
      <EmptyState title={emptyTitle} description="Nothing recorded in this company context." className="py-8" />
    ) : (
      <ul className="space-y-2">
        {list.map((i) => (
          <IncidentEntry
            key={i.id}
            incident={i}
            serviceName={i.serviceId ? services.find((s) => s.id === i.serviceId)?.name : undefined}
            deviceName={i.deviceId ? devices.find((d) => d.id === i.deviceId)?.name : undefined}
            agents={i.agentIds.map((id) => agentById.get(id)).filter((a): a is Agent => !!a)}
            companies={companies}
          />
        ))}
      </ul>
    )

  return (
    <Panel title="Incidents" description="Select an incident to inspect it. Recovery actions are recorded, not executed, by HQ.">
      <Tabs value={tab} onValueChange={(v) => setTab(v as "open" | "resolved")}>
        <TabsList variant="line" className="mb-2">
          <TabsTrigger value="open">
            Open <span className="text-xs text-muted-foreground tabular">{open.length}</span>
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved <span className="text-xs text-muted-foreground tabular">{resolved.length}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="open">{render(open, "No open incidents")}</TabsContent>
        <TabsContent value="resolved">{render(resolved, "No resolved incidents")}</TabsContent>
      </Tabs>
    </Panel>
  )
}
