"use client"

import Link from "next/link"
import { ArrowLeft, PanelRight, RotateCcw, UserX } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { formatDateTime, timeAgo } from "@/lib/format"
import { useHQ } from "@/components/providers/hq-store"
import { AgentAvatar } from "@/components/hq/avatars"
import { ScopeChip, agentRoleLabel } from "@/components/hq/agent-card"
import { EventTimeline } from "@/components/hq/event-timeline"
import { PageHeader } from "@/components/hq/page-header"
import { Panel } from "@/components/hq/panel"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { StatusBadge } from "@/components/hq/status-badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentConfigTab } from "./agent-config-tab"
import { AgentHealthTab } from "./agent-health-tab"
import { AgentOverviewTab } from "./agent-overview-tab"
import { AgentTasksTab } from "./agent-tasks-tab"
import { DemoActionButton } from "@/components/hq/demo-action"

const crumbs = [{ label: "Agents", href: "/agents" }]

export function AgentProfileView({ id }: { id: string }) {
  const { inspect } = useHQ()
  const q = useHQQuery(`agent-profile:${id}`, async (p) => {
    const [agent, agents, companies, tasks, events, incidents] = await Promise.all([
      p.getAgent(id),
      p.listAgents(),
      p.listCompanies(),
      p.listTasks({ agentId: id }),
      p.listEvents(),
      p.listIncidents(),
    ])
    return {
      agent,
      agents,
      companies,
      tasks,
      events: events.filter((e) => e.agentId === id).sort((a, b) => b.at.localeCompare(a.at)),
      incidents: incidents.filter((i) => i.agentIds.includes(id)),
    }
  })

  if (q.status === "loading")
    return (
      <>
        <PageHeader title="Agent" breadcrumbs={[...crumbs, { label: "Loading…" }]} />
        <LoadingState variant="detail" />
      </>
    )
  if (q.status === "error" || q.status === "offline")
    return (
      <>
        <PageHeader title="Agent" breadcrumbs={crumbs} />
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )

  const { agent, agents, companies, tasks, events, incidents } = q.data
  if (!agent)
    return (
      <>
        <PageHeader title="Agent not found" breadcrumbs={[...crumbs, { label: "Not found" }]} />
        <EmptyState
          icon={<UserX className="size-4" />}
          title="No agent with this id"
          description={`“${id}” isn't in the agent registry. It may have been removed, or the link is wrong.`}
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/agents">
                <ArrowLeft /> Back to agents
              </Link>
            </Button>
          }
        />
      </>
    )

  const agentById = new Map(agents.map((a) => [a.id, a]))
  const openTasks = tasks.filter((t) => t.status !== "done").length

  return (
    <>
      <PageHeader
        breadcrumbs={[...crumbs, { label: agent.name }]}
        icon={<AgentAvatar agent={agent} size="lg" />}
        title={agent.name}
        description={`${agent.title} · ${agentRoleLabel[agent.role]}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => inspect({ kind: "agent", id: agent.id })}>
              <PanelRight /> Inspect
            </Button>
            <DemoActionButton>
              <RotateCcw /> Restart agent
            </DemoActionButton>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card px-4 py-3 text-xs">
        <StatusBadge status={agent.status} />
        <span className="text-muted-foreground" title={formatDateTime(agent.lastCheckAt)}>
          {agent.lastCheckAt ? `Last check ${timeAgo(agent.lastCheckAt)}` : "No verified health check"}
        </span>
        <span className="text-muted-foreground" title={formatDateTime(agent.lastActiveAt)}>
          {agent.lastActiveAt ? `Active ${timeAgo(agent.lastActiveAt)}` : "Never active"}
        </span>
        <ScopeChip scope={agent.scope} companies={companies} />
        <span className="font-mono text-[11px] text-muted-foreground">{agent.model.name}</span>
      </div>

      <Tabs defaultValue="overview" className="gap-4">
        <div className="scrollbar-thin -mx-1 overflow-x-auto px-1 pb-1">
          <TabsList variant="line" className="w-max">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">
              Tasks <span className="text-xs text-muted-foreground tabular">{openTasks}</span>
            </TabsTrigger>
            <TabsTrigger value="activity">
              Activity <span className="text-xs text-muted-foreground tabular">{events.length}</span>
            </TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <AgentOverviewTab agent={agent} agents={agents} companies={companies} />
        </TabsContent>
        <TabsContent value="tasks">
          <AgentTasksTab tasks={tasks} />
        </TabsContent>
        <TabsContent value="activity">
          <Panel title="Activity timeline" description="Operational events attributed to this agent, newest first">
            {events.length === 0 ? (
              <EmptyState title="No recorded activity" description="No operational events reference this agent." className="py-8" />
            ) : (
              <EventTimeline events={events} agentById={agentById} />
            )}
          </Panel>
        </TabsContent>
        <TabsContent value="health">
          <AgentHealthTab agent={agent} incidents={incidents} />
        </TabsContent>
        <TabsContent value="config">
          <AgentConfigTab agent={agent} />
        </TabsContent>
      </Tabs>
    </>
  )
}
