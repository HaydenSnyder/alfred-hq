"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertOctagon, BadgeCheck, Bot, HeartPulse, ListTodo } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { DEMO_NOW } from "@/lib/data/mock/clock"
import { inCompanyContext, scopeLabel, timeAgo } from "@/lib/format"
import { severityMeta } from "@/lib/status"
import { useHQ } from "@/components/providers/hq-store"
import { ChatComposer } from "@/components/hq/chat-composer"
import { CompanyRow } from "@/components/hq/company-card"
import { DemoDataIndicator } from "@/components/hq/demo-data-indicator"
import { EventTimeline } from "@/components/hq/event-timeline"
import { IncidentCard } from "@/components/hq/incident-card"
import { MetricCard } from "@/components/hq/metric-card"
import { Panel } from "@/components/hq/panel"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { PriorityBadge, SeverityBadge, StatusBadge, TaskStatusBadge } from "@/components/hq/status-badge"
import { AgentAvatar } from "@/components/hq/avatars"

function greeting(date: Date) {
  const h = date.getUTCHours()
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"
}

export function CommandCenterView() {
  const router = useRouter()
  const { companyContext, preferences, inspect } = useHQ()
  const w = preferences.dashboardWidgets

  const q = useHQQuery("command-center", async (p) => {
    const [companies, agents, services, incidents, approvals, tasks, events] = await Promise.all([
      p.listCompanies(),
      p.listAgents(),
      p.listServices(),
      p.listIncidents(),
      p.listApprovals(),
      p.listTasks(),
      p.listEvents(),
    ])
    return { companies, agents, services, incidents, approvals, tasks, events }
  })

  const header = (
    <div className="mb-6 space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {DEMO_NOW.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })} · demo clock
          </p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{greeting(DEMO_NOW)}.</h1>
        </div>
        <DemoDataIndicator variant="pill" label="All metrics are demo data" />
      </div>
      <ChatComposer
        placeholder="Ask Alfred anything — starts a local demo session"
        onSubmit={(text) => router.push(`/chat?new=1&prompt=${encodeURIComponent(text)}`)}
        footnote="Starts a local demo session. Nothing is delivered to Hermes."
      />
    </div>
  )

  if (q.status === "loading")
    return (
      <>
        {header}
        <LoadingState variant="metrics" />
        <LoadingState variant="cards" rows={3} className="mt-4" />
      </>
    )
  if (q.status === "error" || q.status === "offline")
    return (
      <>
        {header}
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )

  const d = q.data
  const scoped = <T extends { scope: Parameters<typeof inCompanyContext>[0] }>(items: T[]) =>
    items.filter((i) => inCompanyContext(i.scope, companyContext))

  const agents = scoped(d.agents)
  const tasks = scoped(d.tasks)
  const approvals = scoped(d.approvals).filter((a) => a.state === "pending")
  const incidents = scoped(d.incidents).filter((i) => i.state !== "resolved")
  const events = scoped(d.events).sort((a, b) => b.at.localeCompare(a.at))
  const companies =
    companyContext === "all" ? d.companies : companyContext === "personal" ? [] : d.companies.filter((c) => c.id === companyContext)
  const activeTasks = tasks.filter((t) => t.status !== "done" && t.status !== "backlog")
  const critical = incidents.filter((i) => i.severity === "critical")

  const verified = d.services.filter((s) => s.status !== "unknown" && s.status !== "unconfigured")
  const healthyCount = verified.filter((s) => ["healthy", "working", "idle"].includes(s.status)).length
  const attention = d.services.filter((s) => s.status === "degraded" || s.status === "offline")
  const unverified = d.services.length - verified.length
  const agentWorking = agents.filter((a) => a.status === "working").length
  const agentAttention = agents.filter((a) => a.status === "degraded" || a.status === "offline").length

  const agentById = new Map(d.agents.map((a) => [a.id, a]))
  const statsFor = (companyId: string) => ({
    agents: d.agents.filter((a) => a.scope.kind === "company" && a.scope.companyId === companyId).length,
    activeTasks: d.tasks.filter((t) => t.scope.kind === "company" && t.scope.companyId === companyId && t.status !== "done").length,
  })

  const summary = [
    critical.length ? `${critical.length} critical incident${critical.length > 1 ? "s" : ""} open` : "No critical incidents",
    `${approvals.length} approval${approvals.length === 1 ? "" : "s"} waiting on you`,
    `${agentWorking} agents working`,
    attention.length ? `${attention.length} services need attention` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <>
      {header}

      <p className="mb-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Executive summary (demo):</span> {summary}.
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {w.health && (
          <MetricCard
            label="System health"
            icon={<HeartPulse />}
            value={`${healthyCount}/${verified.length}`}
            hint={`${attention.length} need attention · ${unverified} unverified`}
            tone={attention.length ? "warning" : undefined}
            href="/infrastructure"
            className="col-span-2 lg:col-span-1"
          />
        )}
        {w.agents && (
          <MetricCard
            label="Registered agents"
            icon={<Bot />}
            value={agents.length}
            hint={`${agentWorking} working · ${agentAttention} degraded/offline`}
            href="/agents"
          />
        )}
        {w.tasks && <MetricCard label="Active tasks" icon={<ListTodo />} value={activeTasks.length} hint={`${tasks.filter((t) => t.status === "blocked").length} blocked`} href="/projects" />}
        {w.approvals && (
          <MetricCard
            label="Pending approvals"
            icon={<BadgeCheck />}
            value={approvals.length}
            hint="Review only in this phase"
            tone={approvals.length ? "info" : undefined}
            href="/notifications?tab=approvals"
          />
        )}
        {w.incidents && (
          <MetricCard
            label="Critical incidents"
            icon={<AlertOctagon />}
            value={critical.length}
            hint={`${incidents.length} open in total`}
            tone={critical.length ? "danger" : undefined}
            href="/infrastructure"
          />
        )}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {w.incidents && (
            <Panel title="Open incidents" description="Select to inspect" href="/infrastructure">
              {incidents.length === 0 ? (
                <EmptyState title="No open incidents" description="Nothing open in this context." className="py-6" />
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {incidents
                    .sort((a, b) => severityMeta[a.severity].rank - severityMeta[b.severity].rank)
                    .map((i) => (
                      <IncidentCard key={i.id} incident={i} />
                    ))}
                </div>
              )}
            </Panel>
          )}

          {w.tasks && (
            <Panel title="Active tasks" href="/projects">
              {activeTasks.length === 0 ? (
                <EmptyState title="No active tasks" className="py-6" />
              ) : (
                <ul className="-mx-2 divide-y">
                  {activeTasks.slice(0, 6).map((t) => {
                    const assignee = t.assigneeAgentId ? agentById.get(t.assigneeAgentId) : undefined
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => inspect({ kind: "task", id: t.id })}
                          className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition-colors hover:bg-accent/60"
                        >
                          <span className="w-14 shrink-0 font-mono text-[11px] text-muted-foreground">{t.key}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm">{t.title}</span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {scopeLabel(t.scope, d.companies)}
                              {assignee && ` · ${assignee.name}`}
                            </span>
                          </span>
                          <span className="hidden sm:inline-flex">
                            <PriorityBadge priority={t.priority} />
                          </span>
                          <TaskStatusBadge status={t.status} />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Panel>
          )}

          {w.activity && (
            <Panel title="Recent operational activity" href="/activity">
              {events.length === 0 ? (
                <EmptyState title="No recent activity" className="py-6" />
              ) : (
                <EventTimeline events={events.slice(0, 7)} agentById={agentById} />
              )}
            </Panel>
          )}
        </div>

        <div className="space-y-4">
          {w.approvals && (
            <Panel title="Pending approvals" description="Display only — approvals are not executed from HQ" href="/notifications?tab=approvals">
              {approvals.length === 0 ? (
                <EmptyState title="Nothing awaiting approval" className="py-6" />
              ) : (
                <ul className="space-y-2">
                  {approvals.map((a) => {
                    const agent = agentById.get(a.requestedByAgentId)
                    return (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => inspect({ kind: "approval", id: a.id })}
                          className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-surface-2"
                        >
                          <span className="block text-sm font-medium">{a.title}</span>
                          <span className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span className="truncate">
                              {agent?.name ?? "Agent"} · {timeAgo(a.createdAt)}
                            </span>
                            <SeverityBadge severity={a.risk} />
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Panel>
          )}

          {w.health && (
            <Panel title="Global system health" href="/infrastructure">
              <ul className="-mx-2">
                {d.services.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => inspect({ kind: "service", id: s.id })}
                      className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/60"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm">{s.name}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          {s.lastCheckAt ? `Checked ${timeAgo(s.lastCheckAt)}` : "No verified check"}
                        </span>
                      </span>
                      <StatusBadge status={s.status} withTooltip={false} />
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {w.companies && companies.length > 0 && (
            <Panel title="Company status" href="/companies">
              <div className="-mx-2">
                {companies.map((c) => (
                  <CompanyRow key={c.id} company={c} stats={statsFor(c.id)} />
                ))}
              </div>
            </Panel>
          )}

          {w.agents && (
            <Panel title="Agents needing attention" href="/agents?status=attention">
              {agents.filter((a) => ["degraded", "offline"].includes(a.status)).length === 0 ? (
                <p className="text-xs text-muted-foreground">All agents in this context report working or idle.</p>
              ) : (
                <ul className="space-y-1">
                  {agents
                    .filter((a) => ["degraded", "offline"].includes(a.status))
                    .map((a) => (
                      <li key={a.id}>
                        <Link href={`/agents/${a.id}`} className="-mx-2 flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-accent/60">
                          <AgentAvatar agent={a} size="sm" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm">{a.name}</span>
                            <span className="block truncate text-[11px] text-muted-foreground">{a.title}</span>
                          </span>
                          <StatusBadge status={a.status} withTooltip={false} />
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </Panel>
          )}
        </div>
      </div>
    </>
  )
}
