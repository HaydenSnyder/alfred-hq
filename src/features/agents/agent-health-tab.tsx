import { Activity, AlertTriangle, CheckCircle2, Timer } from "lucide-react"
import { formatDateTime, timeAgo } from "@/lib/format"
import { healthMeta } from "@/lib/status"
import type { Agent, Incident } from "@/lib/types"
import { agentHasStats, formatErrorRate, formatLatency } from "@/components/hq/agent-card"
import { IncidentCard } from "@/components/hq/incident-card"
import { MetricCard } from "@/components/hq/metric-card"
import { Panel, PropertyList } from "@/components/hq/panel"
import { UnknownState } from "@/components/hq/states"
import { StatusBadge } from "@/components/hq/status-badge"

export function AgentHealthTab({ agent, incidents }: { agent: Agent; incidents: Incident[] }) {
  const hasStats = agentHasStats(agent)
  const meta = healthMeta[agent.status] ?? healthMeta.unknown
  const err = agent.stats.errorRate7d
  const open = incidents.filter((i) => i.state !== "resolved")

  return (
    <div className="space-y-4">
      {!hasStats && (
        <UnknownState
          title={agent.status === "unconfigured" ? "Not registered with Hermes" : "No verified health data"}
          description="This agent has no verified checks, so statistics are unavailable. Status is not assumed healthy."
        />
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Status" icon={<Activity />} value={meta.label} tone={meta.tone === "neutral" ? undefined : meta.tone} hint={meta.description} />
        <MetricCard label="Tasks completed (7d)" icon={<CheckCircle2 />} value={hasStats ? agent.stats.tasksCompleted7d : "—"} />
        <MetricCard label="Avg latency (7d)" icon={<Timer />} value={hasStats ? formatLatency(agent.stats.avgLatencyMs) : "—"} />
        <MetricCard
          label="Error rate (7d)"
          icon={<AlertTriangle />}
          value={formatErrorRate(err, hasStats)}
          tone={hasStats ? (err >= 5 ? "danger" : err >= 2 ? "warning" : undefined) : undefined}
          hint={hasStats ? (err >= 5 ? "Above 5% threshold" : err >= 2 ? "Elevated" : "Within normal range") : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Health check" className="lg:col-span-1">
          <PropertyList
            items={[
              { label: "Status", value: <StatusBadge status={agent.status} /> },
              {
                label: "Last check",
                value: agent.lastCheckAt ? (
                  <span>
                    {timeAgo(agent.lastCheckAt)} <span className="text-xs text-muted-foreground">· {formatDateTime(agent.lastCheckAt)}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Never</span>
                ),
              },
              {
                label: "Last active",
                value: agent.lastActiveAt ? timeAgo(agent.lastActiveAt) : <span className="text-muted-foreground">Never</span>,
              },
            ]}
          />
          <p className="mt-3 text-[11px] text-muted-foreground">Statistics are demo values, not measured telemetry.</p>
        </Panel>
        <Panel title="Related incidents" description={`${open.length} open · ${incidents.length} total`} href="/infrastructure" hrefLabel="Infrastructure" className="lg:col-span-2">
          {incidents.length === 0 ? (
            <p className="text-xs text-muted-foreground">No incidents involve this agent.</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {incidents.map((i) => (
                <IncidentCard key={i.id} incident={i} />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
