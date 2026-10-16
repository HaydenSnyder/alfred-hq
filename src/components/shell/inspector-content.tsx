"use client"

import Link from "next/link"
import { ArrowUpRight, MousePointerClick } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { useDirectory } from "@/lib/data/use-directory"
import { formatDateTime, formatUptime, scopeLabel, timeAgo, titleCase } from "@/lib/format"
import { hrefFor } from "@/lib/routes"
import type { RecordRef } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AgentAvatar, CompanyMark } from "@/components/hq/avatars"
import { Markdown } from "@/components/hq/markdown"
import { PropertyList } from "@/components/hq/panel"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import {
  PriorityBadge,
  SeverityBadge,
  StatusBadge,
  TaskStatusBadge,
  ToneBadge,
  VerificationBadge,
} from "@/components/hq/status-badge"
import { Timeline } from "@/components/hq/event-timeline"
import { DemoDataIndicator } from "@/components/hq/demo-data-indicator"
import { UptimeBar, UsageMeter } from "@/components/hq/uptime-bar"

function Header({ icon, title, subtitle, badges }: { icon?: React.ReactNode; title: string; subtitle?: string; badges?: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {icon}
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-tight">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {badges && <div className="flex flex-wrap items-center gap-1.5">{badges}</div>}
    </div>
  )
}

function OpenLink({ href, label = "Open full view" }: { href: string; label?: string }) {
  return (
    <Button asChild variant="outline" size="sm" className="w-full">
      <Link href={href}>
        {label} <ArrowUpRight />
      </Link>
    </Button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      {children}
    </div>
  )
}

export function InspectorContent({ selection }: { selection?: RecordRef }) {
  if (!selection)
    return (
      <EmptyState
        icon={<MousePointerClick className="size-4" />}
        title="Nothing selected"
        description="Select an agent, company, task, session, incident or memory node to inspect it here."
        className="border-none"
      />
    )
  return <InspectorRecord key={`${selection.kind}:${selection.id}`} selection={selection} />
}

function InspectorRecord({ selection }: { selection: RecordRef }) {
  const dir = useDirectory()
  const q = useHQQuery(`inspect:${selection.kind}:${selection.id}`, async (p) => {
    switch (selection.kind) {
      case "agent":
        return { kind: "agent" as const, value: await p.getAgent(selection.id), tasks: await p.listTasks({ agentId: selection.id }) }
      case "company":
        return { kind: "company" as const, value: await p.getCompany(selection.id), agents: await p.listAgents({ companyId: selection.id }) }
      case "project":
        return { kind: "project" as const, value: await p.getProject(selection.id) }
      case "task":
        return { kind: "task" as const, value: await p.getTask(selection.id) }
      case "session":
        return { kind: "session" as const, value: await p.getSession(selection.id) }
      case "incident":
        return { kind: "incident" as const, value: await p.getIncident(selection.id) }
      case "approval":
        return { kind: "approval" as const, value: await p.getApproval(selection.id) }
      case "research":
        return { kind: "research" as const, value: await p.getResearch(selection.id) }
      case "device":
        return { kind: "device" as const, value: await p.getDevice(selection.id), services: await p.listServices() }
      case "service":
        return { kind: "service" as const, value: (await p.listServices()).find((s) => s.id === selection.id) }
      case "integration":
        return { kind: "integration" as const, value: await p.getIntegration(selection.id) }
      case "node": {
        const g = await p.getKnowledgeGraph()
        return { kind: "node" as const, value: g.nodes.find((n) => n.id === selection.id), graph: g }
      }
    }
  })

  if (q.status === "loading") return <LoadingState variant="list" rows={5} />
  if (q.status === "error" || q.status === "offline")
    return <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
  const r = q.data
  if (!r?.value) return <EmptyState title="Record not found" description="It may have been removed, or the source returned no data." />

  const companies = dir.companies
  const footer = (
    <>
      <Separator />
      <div className="space-y-2">
        <OpenLink href={hrefFor(selection)} />
        <div className="flex justify-center">
          <DemoDataIndicator variant="inline" label="Demo record" />
        </div>
      </div>
    </>
  )

  switch (r.kind) {
    case "agent": {
      const a = r.value
      const parent = a.parentAgentId ? dir.agentById.get(a.parentAgentId) : undefined
      return (
        <div className="space-y-5">
          <Header icon={<AgentAvatar agent={a} size="lg" />} title={a.name} subtitle={a.title} badges={<StatusBadge status={a.status} />} />
          <p className="text-sm text-muted-foreground">{a.description}</p>
          <PropertyList
            items={[
              { label: "Scope", value: scopeLabel(a.scope, companies) },
              { label: "Reports to", value: parent ? parent.name : "—" },
              { label: "Model", value: <span className="font-mono text-xs">{a.model.name}</span> },
              { label: "Last check", value: a.lastCheckAt ? timeAgo(a.lastCheckAt) : "Never" },
              { label: "Tasks (7d)", value: a.stats.tasksCompleted7d },
            ]}
          />
          <Section title={`Assigned tasks (${r.tasks.length})`}>
            {r.tasks.length === 0 ? (
              <p className="text-xs text-muted-foreground">No assigned tasks.</p>
            ) : (
              <ul className="space-y-1.5">
                {r.tasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">
                      <span className="mr-1.5 font-mono text-[11px] text-muted-foreground">{t.key}</span>
                      {t.title}
                    </span>
                    <TaskStatusBadge status={t.status} />
                  </li>
                ))}
              </ul>
            )}
          </Section>
          {footer}
        </div>
      )
    }
    case "company": {
      const c = r.value
      return (
        <div className="space-y-5">
          <Header icon={<CompanyMark company={c} size="lg" />} title={c.name} subtitle={c.tagline} badges={<StatusBadge status={c.health} />} />
          <PropertyList
            items={[
              { label: "Website", value: <StatusBadge status={c.website.status} /> },
              { label: "Company Alfred", value: <StatusBadge status={c.companyAlfred.status} /> },
              { label: "Departments", value: c.departments.length },
              { label: "Agents", value: r.agents.length },
              { label: "Open incidents", value: c.openIncidentIds.length },
            ]}
          />
          <Section title="Authorised knowledge">
            <p className="text-sm text-muted-foreground">{c.knowledgeSummary}</p>
          </Section>
          {footer}
        </div>
      )
    }
    case "project": {
      const p = r.value
      return (
        <div className="space-y-5">
          <Header title={p.name} subtitle={`${p.key} · ${scopeLabel(p.scope, companies)}`} badges={<ToneBadge tone={p.status === "active" ? "info" : "muted"}>{titleCase(p.status)}</ToneBadge>} />
          <p className="text-sm text-muted-foreground">{p.summary}</p>
          <UsageMeter value={p.progress} label="Progress" />
          <PropertyList
            items={[
              { label: "Lead", value: p.leadAgentId ? dir.agentById.get(p.leadAgentId)?.name ?? "—" : "—" },
              { label: "Agents", value: p.agentIds.length },
              { label: "Sessions", value: p.sessionIds.length },
              { label: "Decisions", value: p.decisions.length },
            ]}
          />
          {footer}
        </div>
      )
    }
    case "task": {
      const t = r.value
      return (
        <div className="space-y-5">
          <Header title={t.title} subtitle={`${t.key} · ${scopeLabel(t.scope, companies)}`} badges={<><TaskStatusBadge status={t.status} /><PriorityBadge priority={t.priority} /></>} />
          <p className="text-sm text-muted-foreground">{t.description}</p>
          <PropertyList
            items={[
              { label: "Assignee", value: t.assigneeAgentId ? dir.agentById.get(t.assigneeAgentId)?.name ?? "—" : "Unassigned" },
              { label: "Due", value: t.dueAt ? formatDateTime(t.dueAt) : "—" },
              { label: "Updated", value: timeAgo(t.updatedAt) },
              { label: "Labels", value: t.labels.length ? t.labels.join(", ") : "—" },
            ]}
          />
          {t.sessionIds.length > 0 && (
            <Section title="Linked sessions">
              <ul className="space-y-1">
                {t.sessionIds.map((id) => (
                  <li key={id}>
                    <Link href={`/chat/${id}`} className="text-sm text-brand hover:underline">
                      Open session
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {footer}
        </div>
      )
    }
    case "session": {
      const s = r.value
      return (
        <div className="space-y-5">
          <Header title={s.title} subtitle={scopeLabel(s.scope, companies)} />
          <PropertyList
            items={[
              { label: "Agents", value: s.agentIds.map((id) => dir.agentById.get(id)?.name ?? id).join(", ") || "—" },
              { label: "Linked tasks", value: s.taskIds.length },
              { label: "Updated", value: timeAgo(s.updatedAt) },
            ]}
          />
          {footer}
        </div>
      )
    }
    case "incident": {
      const i = r.value
      return (
        <div className="space-y-5">
          <Header title={i.title} subtitle={`Detected ${timeAgo(i.detectedAt)} · ${scopeLabel(i.scope, companies)}`} badges={<><SeverityBadge severity={i.severity} /><ToneBadge tone={i.state === "resolved" ? "success" : "warning"} dot={false}>{titleCase(i.state)}</ToneBadge></>} />
          <p className="text-sm text-muted-foreground">{i.summary}</p>
          <Section title="Recovery history">
            <Timeline
              compact
              items={i.recovery.map((rec, idx) => ({
                id: `${i.id}-${idx}`,
                at: rec.at,
                title: rec.action,
                tone: rec.outcome === "succeeded" ? "success" : rec.outcome === "failed" ? "danger" : "warning",
                meta: titleCase(rec.outcome),
              }))}
            />
          </Section>
          <Section title="Involved agents">
            <p className="text-sm">{i.agentIds.map((id) => dir.agentById.get(id)?.name ?? id).join(", ")}</p>
          </Section>
          {footer}
        </div>
      )
    }
    case "approval": {
      const a = r.value
      return (
        <div className="space-y-5">
          <Header title={a.title} subtitle={`Requested by ${dir.agentById.get(a.requestedByAgentId)?.name ?? "agent"} · ${timeAgo(a.createdAt)}`} badges={<><ToneBadge tone={a.state === "pending" ? "warning" : a.state === "approved" ? "success" : "danger"}>{titleCase(a.state)}</ToneBadge><SeverityBadge severity={a.risk} /></>} />
          <p className="text-sm text-muted-foreground">{a.description}</p>
          <p className="rounded-lg border border-dashed p-2.5 text-xs text-muted-foreground">
            Approvals cannot be executed from HQ in this phase. Decisions continue to be made through existing Alfred channels.
          </p>
          {footer}
        </div>
      )
    }
    case "research": {
      const rr = r.value
      return (
        <div className="space-y-5">
          <Header title={rr.title} subtitle={titleCase(rr.stage)} badges={<VerificationBadge status={rr.verification} />} />
          <p className="text-sm text-muted-foreground">{rr.question}</p>
          <PropertyList items={[{ label: "Sources", value: rr.sources.length }, { label: "Agents", value: rr.agentIds.length }, { label: "Updated", value: timeAgo(rr.updatedAt) }]} />
          {footer}
        </div>
      )
    }
    case "device": {
      const d = r.value
      const svc = r.services.filter((s) => d.serviceIds.includes(s.id))
      return (
        <div className="space-y-5">
          <Header title={d.name} subtitle={`${d.hostname} · ${d.os}`} badges={<StatusBadge status={d.status} />} />
          <PropertyList
            items={[
              { label: "Last check", value: d.lastCheckAt ? timeAgo(d.lastCheckAt) : "No check recorded" },
              { label: "Uptime", value: formatUptime(d.uptimeSeconds) },
              { label: "Location", value: d.location },
              ...(d.connector ? [{ label: "Connector", value: `${d.connector.name} ${d.connector.version}` }] : []),
            ]}
          />
          {d.metrics ? (
            <div className="space-y-2.5">
              <UsageMeter value={d.metrics.cpuPct} label="CPU" />
              <UsageMeter value={d.metrics.memPct} label="Memory" />
              <UsageMeter value={d.metrics.diskPct} label="Disk" />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No verified metrics.</p>
          )}
          <Section title="Services">
            <ul className="space-y-1.5">
              {svc.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  {s.name} <StatusBadge status={s.status} />
                </li>
              ))}
              {svc.length === 0 && <li className="text-xs text-muted-foreground">No registered services.</li>}
            </ul>
          </Section>
          {footer}
        </div>
      )
    }
    case "service": {
      const s = r.value
      return (
        <div className="space-y-5">
          <Header title={s.name} subtitle={s.version ? `v${s.version}` : "Version unknown"} badges={<StatusBadge status={s.status} />} />
          <p className="text-sm text-muted-foreground">{s.description}</p>
          <PropertyList
            items={[
              { label: "Last check", value: s.lastCheckAt ? timeAgo(s.lastCheckAt) : "No check recorded" },
              { label: "Latency", value: s.latencyMs != null ? `${s.latencyMs} ms` : "—" },
              { label: "Uptime (30d)", value: s.uptime30d != null ? `${s.uptime30d}%` : "—" },
            ]}
          />
          <UptimeBar history={s.history} />
          {footer}
        </div>
      )
    }
    case "integration": {
      const i = r.value
      return (
        <div className="space-y-5">
          <Header title={i.provider} subtitle={titleCase(i.category)} badges={<><StatusBadge status={i.status} /><ToneBadge tone="muted" dot={false}>{titleCase(i.mode)}</ToneBadge></>} />
          <p className="text-sm text-muted-foreground">{i.description}</p>
          <Section title="Capabilities">
            <ul className="list-disc space-y-0.5 pl-4 text-sm">
              {i.capabilities.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Section>
          {footer}
        </div>
      )
    }
    case "node": {
      const n = r.value
      const neighbours = r.graph.edges
        .filter((e) => e.source === n.id || e.target === n.id)
        .map((e) => ({ edge: e, other: r.graph.nodes.find((x) => x.id === (e.source === n.id ? e.target : e.source)) }))
      return (
        <div className="space-y-5">
          <Header title={n.label} subtitle={`${titleCase(n.type)} · ${scopeLabel(n.scope, companies)}`} />
          <p className="text-sm text-muted-foreground">{n.summary}</p>
          {n.body && <Markdown content={n.body} className="rounded-lg border bg-surface-2 p-3" />}
          <Section title={`Relationships (${neighbours.length})`}>
            <ul className="space-y-1">
              {neighbours.map(({ edge, other }) => (
                <li key={edge.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{other?.label}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{titleCase(edge.relation)}</span>
                </li>
              ))}
            </ul>
          </Section>
          {footer}
        </div>
      )
    }
  }
}
