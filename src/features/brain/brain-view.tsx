"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { BrainCircuit, Search, Unplug } from "lucide-react"
import { useHQ } from "@/components/providers/hq-store"
import { useHQQuery } from "@/lib/data/use-hq-query"
import type { KnowledgeNodeType, KnowledgeRelation } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { DemoDataIndicator } from "@/components/hq/demo-data-indicator"
import { KnowledgeGraph } from "@/components/hq/knowledge-graph"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { useMediaQuery } from "@/hooks/use-media-query"
import { GraphLegend, RelationFilter, TypeFilter } from "./brain-filters"
import {
  NODE_TYPES,
  RELATIONS,
  applyFilters,
  matchesQuery,
  neighborhood,
  nodeColor,
  scopeGraph,
  type BrainView as View,
} from "./graph-utils"
import { NodeDetails } from "./node-details"

const VIEWS: { value: View; label: string }[] = [
  { value: "global", label: "Global" },
  { value: "company", label: "Company" },
  { value: "project", label: "Project" },
  { value: "local", label: "Local" },
]

export function BrainView() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const { preferences } = useHQ()
  const wide = useMediaQuery("(min-width: 1024px)")

  const q = useHQQuery("brain", async (p) => {
    const [graph, companies, projects] = await Promise.all([p.getKnowledgeGraph(), p.listCompanies(), p.listProjects()])
    return { graph, companies, projects }
  })

  // URL is the source of truth so views are linkable from the sidebar and search.
  const rawView = params.get("view")
  const view: View = VIEWS.some((v) => v.value === rawView) ? (rawView as View) : "global"
  const nodeId = params.get("node") ?? undefined
  const depth = params.get("depth") === "2" ? 2 : 1
  const companyId = params.get("company") ?? q.data?.companies[0]?.id
  const projectId = params.get("project") ?? "prj-hq"

  const setParams = useCallback(
    (patch: Record<string, string | undefined>) => {
      const next = new URLSearchParams(params.toString())
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined) next.delete(k)
        else next.set(k, v)
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    },
    [params, pathname, router]
  )

  const [types, setTypes] = useState<Set<KnowledgeNodeType>>(new Set(NODE_TYPES))
  const [relations, setRelations] = useState<Set<KnowledgeRelation>>(new Set(RELATIONS))
  const [query, setQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)

  const full = q.data?.graph
  const localRoot = view === "local" ? nodeId ?? "kn-ag-alfred" : undefined

  const visible = useMemo(() => {
    if (!full) return { nodes: [], edges: [] }
    const scoped = scopeGraph(full, view, { companyId, projectId, nodeId: localRoot, depth })
    return applyFilters(scoped, types, relations, nodeId)
  }, [full, view, companyId, projectId, localRoot, depth, types, relations, nodeId])

  const selected = full?.nodes.find((n) => n.id === nodeId)
  const highlightIds = useMemo(
    () => (query.trim() ? new Set(visible.nodes.filter((n) => matchesQuery(n, query)).map((n) => n.id)) : undefined),
    [visible, query]
  )
  const focusIds = useMemo(
    () => (selected && visible.nodes.some((n) => n.id === selected.id) ? neighborhood(visible, selected.id, 1) : undefined),
    [selected, visible]
  )
  const searchResults = useMemo(() => (full && query.trim() ? full.nodes.filter((n) => matchesQuery(n, query)).slice(0, 8) : []), [full, query])

  const select = (id: string | undefined) => {
    if (!id) return setParams({ node: undefined })
    const inView = visible.nodes.some((n) => n.id === id)
    // Jumping to a node outside the current view opens its local neighbourhood.
    setParams(inView || view === "local" ? { node: id } : { node: id, view: "local" })
  }
  const explore = (id: string) => setParams({ view: "local", node: id })

  if (q.status === "loading") return <LoadingState variant="detail" className="p-6" />
  if (q.status === "error" || q.status === "offline")
    return (
      <div className="p-6">
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </div>
    )
  const { companies, projects } = q.data

  const details = selected && (
    <NodeDetails
      node={selected}
      graph={q.data.graph}
      companies={companies}
      onSelect={select}
      onExplore={explore}
      onClose={() => select(undefined)}
    />
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-3 border-b px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <BrainCircuit className="size-5 text-muted-foreground" aria-hidden />
          <h1 className="text-lg font-semibold tracking-tight">Brain & Memory</h1>
          <DemoDataIndicator />
          <Link
            href="/settings#brain"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <Unplug className="size-3" /> Obsidian: optional · not connected
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={view}
            onValueChange={(v) => v && setParams({ view: v })}
            aria-label="Brain view"
          >
            {VIEWS.map((v) => (
              <ToggleGroupItem key={v.value} value={v.value} className="px-2.5 text-xs">
                {v.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {view === "company" && (
            <Select value={companyId} onValueChange={(v) => setParams({ company: v })}>
              <SelectTrigger size="sm" className="text-xs" aria-label="Company brain">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {view === "project" && (
            <Select value={projectId} onValueChange={(v) => setParams({ project: v })}>
              <SelectTrigger size="sm" className="text-xs" aria-label="Project graph">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {view === "local" && (
            <Select value={String(depth)} onValueChange={(v) => setParams({ depth: v })}>
              <SelectTrigger size="sm" className="text-xs" aria-label="Neighbourhood depth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hop</SelectItem>
                <SelectItem value="2">2 hops</SelectItem>
              </SelectContent>
            </Select>
          )}

          <TypeFilter value={types} onChange={setTypes} />
          <RelationFilter value={relations} onChange={setRelations} />

          <Popover open={searchOpen && searchResults.length > 0} onOpenChange={setSearchOpen}>
            <PopoverAnchor asChild>
              <div className="relative w-full sm:ml-auto sm:w-64">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSearchOpen(true)
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search memory…"
                  className="h-8 pl-8 text-sm"
                  aria-label="Search memory"
                />
              </div>
            </PopoverAnchor>
            <PopoverContent align="end" className="w-[var(--radix-popover-trigger-width)] min-w-64 p-1" onOpenAutoFocus={(e) => e.preventDefault()}>
              <ul>
                {searchResults.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        select(n.id)
                        setSearchOpen(false)
                      }}
                      className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent"
                    >
                      <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ backgroundColor: nodeColor(n.type) }} aria-hidden />
                      <span className="min-w-0">
                        <span className="block truncate text-sm">{n.label}</span>
                        <span className="block truncate text-[11px] text-muted-foreground">{n.summary}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        <div className="relative min-w-0 flex-1">
          {visible.nodes.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6">
              <EmptyState
                title="No nodes in this view"
                description={
                  view === "company"
                    ? "This company has no authorised knowledge connected yet, or filters hide every node."
                    : "Adjust the node type or relationship filters."
                }
              />
            </div>
          ) : (
            <KnowledgeGraph
              nodes={visible.nodes}
              edges={visible.edges}
              selectedId={nodeId}
              highlightIds={highlightIds}
              focusIds={focusIds}
              onSelect={select}
              showLabels={preferences.graph.showLabels}
              showMinimap={preferences.graph.showMinimap}
              animateEdges={preferences.graph.animateEdges}
            />
          )}
          <div className="pointer-events-none absolute top-3 left-3 right-3 flex flex-wrap items-start justify-between gap-2">
            <div className="pointer-events-auto hidden sm:block">
              <GraphLegend types={NODE_TYPES.filter((t) => types.has(t))} />
            </div>
            <p className="pointer-events-auto rounded-lg border bg-background/85 px-2.5 py-1 text-[11px] text-muted-foreground tabular backdrop-blur">
              {visible.nodes.length} nodes · {visible.edges.length} links
              {highlightIds && ` · ${highlightIds.size} matches`}
            </p>
          </div>
        </div>

        {wide && selected && (
          <aside className="scrollbar-thin w-80 shrink-0 overflow-y-auto border-l bg-surface p-4 xl:w-96" aria-label="Node details">
            {details}
          </aside>
        )}
      </div>

      {!wide && (
        <Sheet open={!!selected} onOpenChange={(open) => !open && select(undefined)}>
          <SheetContent side="bottom" className="max-h-[75dvh] gap-0 rounded-t-2xl p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">{selected?.label ?? "Node"}</SheetTitle>
            <SheetDescription className="sr-only">Memory node details</SheetDescription>
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted" aria-hidden />
            <div className="scrollbar-thin overflow-y-auto p-4 pb-8">{details}</div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
