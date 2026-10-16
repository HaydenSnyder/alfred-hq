"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { FolderKanban, ListTodo } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { inCompanyContext } from "@/lib/format"
import type { Project } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { PageHeader } from "@/components/hq/page-header"
import { MetricCard } from "@/components/hq/metric-card"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterBar, FilterSelect, projectKindLabel, projectStatusMeta } from "./shared"
import { ProjectTable } from "./project-table"
import { TaskExplorer } from "./task-explorer"

type View = "projects" | "tasks"

export function ProjectsView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { companyContext, inspect } = useHQ()

  const taskParam = searchParams.get("task")
  const view: View = searchParams.get("view") === "tasks" ? "tasks" : "projects"

  // Deep link: /projects?task=<id> opens that task in the inspector.
  useEffect(() => {
    if (taskParam) inspect({ kind: "task", id: taskParam })
  }, [taskParam, inspect])

  const setView = (next: View) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === "tasks") params.set("view", "tasks")
    else params.delete("view")
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const [scope, setScope] = useState("all")
  const [status, setStatus] = useState("all")
  const [kind, setKind] = useState("all")

  const q = useHQQuery("projects-index", async (p) => {
    const [projects, tasks, agents, companies] = await Promise.all([p.listProjects(), p.listTasks(), p.listAgents(), p.listCompanies()])
    return { projects, tasks, agents, companies }
  })

  const derived = useMemo(() => {
    if (!q.data) return undefined
    const { projects, tasks, agents, companies } = q.data
    return {
      projects: projects.filter((p) => inCompanyContext(p.scope, companyContext)),
      tasks: tasks.filter((t) => inCompanyContext(t.scope, companyContext)),
      agentById: new Map(agents.map((a) => [a.id, a])),
      projectById: new Map(projects.map((p) => [p.id, p])),
      companies,
    }
  }, [q.data, companyContext])

  const header = (
    <PageHeader
      title="Projects"
      icon={<FolderKanban className="size-5 text-muted-foreground" aria-hidden />}
      description="Personal and company work, with every task across the ecosystem in one place."
    />
  )

  if (q.status === "loading")
    return (
      <>
        {header}
        <LoadingState variant="metrics" />
        <LoadingState className="mt-4" rows={6} />
      </>
    )
  if (q.status === "error" || q.status === "offline")
    return (
      <>
        {header}
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )
  if (!derived) return header

  const { projects, tasks, agentById, projectById, companies } = derived

  // Scope options limited to what's visible in the current company context.
  const scopeOptions = [
    { value: "all", label: "All scopes" },
    ...(companyContext === "all" || companyContext === "personal" ? [{ value: "personal", label: "Personal" }] : []),
    ...companies
      .filter((c) => companyContext === "all" || companyContext === c.id)
      .map((c) => ({ value: c.id, label: c.shortName })),
  ]
  const scopeValue = scopeOptions.some((o) => o.value === scope) ? scope : "all"

  const matchesScope = (s: Project["scope"]) =>
    scopeValue === "all" ||
    (scopeValue === "personal" ? s.kind === "personal" || s.kind === "global" : s.kind === "company" && s.companyId === scopeValue)

  const filteredProjects = projects.filter(
    (p) => matchesScope(p.scope) && (status === "all" || p.status === status) && (kind === "all" || p.kind === kind)
  )
  const filtersActive = scopeValue !== "all" || status !== "all" || kind !== "all"

  const active = projects.filter((p) => p.status === "active").length
  const openTasks = tasks.filter((t) => t.status !== "done")
  const blocked = tasks.filter((t) => t.status === "blocked").length
  const avgProgress = projects.length ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0

  return (
    <>
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Projects" icon={<FolderKanban />} value={projects.length} hint={`${active} active`} />
        <MetricCard label="Open tasks" icon={<ListTodo />} value={openTasks.length} hint={`${tasks.length} total`} />
        <MetricCard label="Blocked tasks" value={blocked} tone={blocked ? "warning" : undefined} hint="Need a decision or input" />
        <MetricCard label="Average progress" value={`${avgProgress}%`} hint="Across visible projects" />
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as View)} className="mt-6 gap-4">
        <div className="border-b">
          <TabsList variant="line" className="h-9">
            <TabsTrigger value="projects">
              Projects <span className="text-xs text-muted-foreground tabular">{projects.length}</span>
            </TabsTrigger>
            <TabsTrigger value="tasks">
              All tasks <span className="text-xs text-muted-foreground tabular">{tasks.length}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="projects" className="space-y-3">
          {projects.length === 0 ? (
            <EmptyState title="No projects in this context" description="Switch the company context to see other projects." />
          ) : (
            <>
              <FilterBar>
                <FilterSelect label="Scope" value={scopeValue} onChange={setScope} options={scopeOptions} />
                <FilterSelect
                  label="Status"
                  value={status}
                  onChange={setStatus}
                  options={[
                    { value: "all", label: "All" },
                    ...(Object.keys(projectStatusMeta) as Project["status"][]).map((s) => ({ value: s, label: projectStatusMeta[s].label })),
                  ]}
                />
                <FilterSelect
                  label="Kind"
                  value={kind}
                  onChange={setKind}
                  options={[
                    { value: "all", label: "All" },
                    ...(Object.keys(projectKindLabel) as Project["kind"][]).map((k) => ({ value: k, label: projectKindLabel[k] })),
                  ]}
                />
                {filtersActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setScope("all")
                      setStatus("all")
                      setKind("all")
                    }}
                  >
                    Clear
                  </Button>
                )}
                <span className="ml-auto text-xs text-muted-foreground tabular">
                  {filteredProjects.length} of {projects.length}
                </span>
              </FilterBar>
              <ProjectTable projects={filteredProjects} tasks={tasks} agentById={agentById} companies={companies} />
            </>
          )}
        </TabsContent>

        <TabsContent value="tasks">
          {tasks.length === 0 ? (
            <EmptyState title="No tasks in this context" description="Switch the company context to see other tasks." />
          ) : (
            <TaskExplorer tasks={tasks} agentById={agentById} companies={companies} projectById={projectById} />
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}
