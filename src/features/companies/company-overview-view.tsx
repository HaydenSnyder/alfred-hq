"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Bot, Building2 } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { useHQ } from "@/components/providers/hq-store"
import { AgentHierarchy } from "@/components/hq/agent-hierarchy"
import { EventTimeline } from "@/components/hq/event-timeline"
import { PageHeader } from "@/components/hq/page-header"
import { Panel } from "@/components/hq/panel"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompanyDepartmentsTab } from "./company-departments-tab"
import { CompanyHeader } from "./company-header"
import { CompanyKnowledgeTab } from "./company-knowledge-tab"
import { CompanyOverviewTab } from "./company-overview-tab"
import { CompanySessionsTab } from "./company-sessions-tab"
import { companyIncidents, isCompanyScoped } from "./company-utils"

type TabKey = "overview" | "departments" | "agents" | "activity" | "sessions" | "knowledge"

const crumbs = [{ label: "Companies", href: "/companies" }]

export function CompanyOverviewView({ id }: { id: string }) {
  const { localSessions } = useHQ()
  const [tab, setTab] = useState<TabKey>("overview")
  const [departmentId, setDepartmentId] = useState<string | undefined>()

  const q = useHQQuery(`company:${id}`, async (p) => {
    const [company, allAgents, tasks, incidents, events, sessions, graph] = await Promise.all([
      p.getCompany(id),
      p.listAgents(),
      p.listTasks(),
      p.listIncidents(),
      p.listEvents(),
      p.listSessions(),
      p.getKnowledgeGraph(),
    ])
    const scoped = <T extends { scope: { kind: string; companyId?: string } }>(items: T[]) =>
      items.filter((i) => isCompanyScoped(i.scope, id))
    return {
      company,
      allAgents,
      agents: scoped(allAgents),
      tasks: scoped(tasks),
      incidents: company ? companyIncidents(company, incidents) : [],
      events: scoped(events).sort((a, b) => b.at.localeCompare(a.at)),
      sessions: scoped(sessions),
      nodes: scoped(graph.nodes),
    }
  })

  if (q.status === "loading")
    return (
      <>
        <PageHeader title="Company" breadcrumbs={[...crumbs, { label: "Loading…" }]} />
        <LoadingState variant="detail" />
      </>
    )
  if (q.status === "error" || q.status === "offline")
    return (
      <>
        <PageHeader title="Company" breadcrumbs={crumbs} />
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )

  const d = q.data
  const company = d.company
  if (!company)
    return (
      <>
        <PageHeader title="Company not found" breadcrumbs={[...crumbs, { label: "Not found" }]} />
        <EmptyState
          icon={<Building2 className="size-4" />}
          title="No company with this id"
          description={`“${id}” doesn't match any company Alfred operates for.`}
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/companies">
                <ArrowLeft /> Back to companies
              </Link>
            </Button>
          }
        />
      </>
    )

  const agentById = new Map(d.allAgents.map((a) => [a.id, a]))
  const alfred = company.companyAlfred.agentId ? agentById.get(company.companyAlfred.agentId) : undefined
  const sessions = [...localSessions.filter((s) => isCompanyScoped(s.scope, company.id)), ...d.sessions].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  )

  const openDepartment = (deptId: string) => {
    setDepartmentId(deptId)
    setTab("departments")
  }

  return (
    <>
      <CompanyHeader company={company} alfred={alfred} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)} className="gap-4">
        <div className="scrollbar-thin -mx-1 overflow-x-auto px-1 pb-1">
          <TabsList variant="line" className="w-max">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="agents">
              Agents <span className="text-xs text-muted-foreground tabular">{d.agents.length}</span>
            </TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="sessions">
              Sessions <span className="text-xs text-muted-foreground tabular">{sessions.length}</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <CompanyOverviewTab
            company={company}
            agents={d.agents}
            tasks={d.tasks}
            incidents={d.incidents}
            sessionCount={sessions.length}
            agentById={agentById}
            onOpenDepartment={openDepartment}
            onOpenKnowledge={() => setTab("knowledge")}
          />
        </TabsContent>

        <TabsContent value="departments">
          <CompanyDepartmentsTab
            company={company}
            agentById={agentById}
            selectedId={departmentId ?? company.departments[0]?.id}
            onSelect={setDepartmentId}
          />
        </TabsContent>

        <TabsContent value="agents">
          <Panel
            title="Agent hierarchy"
            description={`Reporting lines inside ${company.shortName}. Company Alfred reports to Alfred.`}
            href={`/agents?scope=${company.id}`}
            hrefLabel="Open in directory"
          >
            {d.agents.length === 0 ? (
              <EmptyState icon={<Bot className="size-4" />} title="No agents" description="No agents are registered for this company yet." className="py-8" />
            ) : (
              <AgentHierarchy agents={d.agents} defaultDepth={3} showScope={false} />
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="activity">
          <Panel title="Company activity" description="Operational events scoped to this company, newest first" href="/activity" hrefLabel="All activity">
            {d.events.length === 0 ? (
              <EmptyState title="No recorded activity" description={`No operational events are scoped to ${company.shortName}.`} className="py-8" />
            ) : (
              <EventTimeline events={d.events} agentById={agentById} />
            )}
          </Panel>
        </TabsContent>

        <TabsContent value="sessions">
          <CompanySessionsTab company={company} sessions={sessions} agentById={agentById} />
        </TabsContent>

        <TabsContent value="knowledge">
          <CompanyKnowledgeTab company={company} nodes={d.nodes} />
        </TabsContent>
      </Tabs>
    </>
  )
}
