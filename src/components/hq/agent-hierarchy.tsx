"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, ChevronRight, ChevronsDownUp, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { scopeLabel } from "@/lib/format"
import type { Agent, AgentRole, Company } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { Button } from "@/components/ui/button"
import { AgentAvatar } from "./avatars"
import { StatusBadge } from "./status-badge"

const roleOrder: Record<AgentRole, number> = {
  orchestrator: 0,
  executive: 1,
  cto: 2,
  researcher: 3,
  operator: 4,
  lead: 5,
  specialist: 6,
}

function sortAgents(a: Agent, b: Agent) {
  return roleOrder[a.role] - roleOrder[b.role] || a.name.localeCompare(b.name)
}

interface Tree {
  roots: Agent[]
  children: Map<string, Agent[]>
}

function buildTree(agents: Agent[]): Tree {
  const ids = new Set(agents.map((a) => a.id))
  const children = new Map<string, Agent[]>()
  const roots: Agent[] = []
  for (const a of agents) {
    if (a.parentAgentId && ids.has(a.parentAgentId)) {
      const list = children.get(a.parentAgentId) ?? []
      list.push(a)
      children.set(a.parentAgentId, list)
    } else {
      roots.push(a)
    }
  }
  roots.sort(sortAgents)
  children.forEach((list) => list.sort(sortAgents))
  return { roots, children }
}

function collapsedBeyond(tree: Tree, depth: number): Set<string> {
  const out = new Set<string>()
  const walk = (list: Agent[], d: number) => {
    for (const a of list) {
      const kids = tree.children.get(a.id)
      if (!kids?.length) continue
      if (d >= depth) out.add(a.id)
      walk(kids, d + 1)
    }
  }
  walk(tree.roots, 0)
  return out
}

/**
 * Collapsible org tree built from `parentAgentId`. Agents whose parent is not
 * in the list become roots. Selecting a node opens it in the inspector unless
 * `onSelect` is provided; the arrow link always navigates to the profile.
 */
export function AgentHierarchy({
  agents,
  companies,
  matchIds,
  onSelect,
  defaultDepth = 2,
  showScope = true,
  className,
}: {
  agents: Agent[]
  companies?: Company[]
  /** When provided, agents outside the set render dimmed (shown only as context). */
  matchIds?: Set<string>
  onSelect?: (agent: Agent) => void
  /** Levels expanded on first render. */
  defaultDepth?: number
  showScope?: boolean
  className?: string
}) {
  const { inspect, inspector } = useHQ()
  const tree = useMemo(() => buildTree(agents), [agents])
  const [collapsed, setCollapsed] = useState<Set<string>>(() => collapsedBeyond(tree, defaultDepth))

  const parentsWithChildren = useMemo(() => Array.from(tree.children.keys()), [tree])
  const selectedId = inspector.selection?.kind === "agent" ? inspector.selection.id : undefined

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const select = (agent: Agent) => (onSelect ? onSelect(agent) : inspect({ kind: "agent", id: agent.id }))

  const renderNode = (agent: Agent, depth: number): React.ReactNode => {
    const kids = tree.children.get(agent.id) ?? []
    const isOpen = !collapsed.has(agent.id)
    const dimmed = matchIds ? !matchIds.has(agent.id) : false
    const selected = selectedId === agent.id
    const scopeText =
      showScope && agent.scope.kind === "company" && agent.role === "executive" ? scopeLabel(agent.scope, companies) : undefined

    return (
      <li key={agent.id}>
        <div
          className={cn(
            "group/node flex min-w-0 items-center gap-1 rounded-lg pr-1 transition-colors hover:bg-accent/60",
            selected && "bg-accent"
          )}
        >
          {kids.length > 0 ? (
            <button
              type="button"
              onClick={() => toggle(agent.id)}
              aria-expanded={isOpen}
              aria-label={`${isOpen ? "Collapse" : "Expand"} ${agent.name}'s reports`}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <ChevronRight className={cn("size-3.5 transition-transform", isOpen && "rotate-90")} />
            </button>
          ) : (
            <span className="size-6 shrink-0" aria-hidden />
          )}
          <button
            type="button"
            onClick={() => select(agent)}
            aria-pressed={selected}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2.5 rounded-md py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              dimmed && "opacity-50"
            )}
          >
            <AgentAvatar agent={agent} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{agent.name}</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {agent.title}
                {scopeText && ` · ${scopeText}`}
              </span>
            </span>
            {kids.length > 0 && (
              <span className="hidden shrink-0 text-[11px] text-muted-foreground tabular sm:inline">
                {kids.length} {kids.length === 1 ? "report" : "reports"}
              </span>
            )}
            <StatusBadge status={agent.status} withTooltip={false} />
          </button>
          <Link
            href={`/agents/${agent.id}`}
            aria-label={`Open ${agent.name} profile`}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
        {kids.length > 0 && isOpen && (
          <ul className="ml-3 border-l pl-2 sm:ml-[11px] sm:pl-3">{kids.map((k) => renderNode(k, depth + 1))}</ul>
        )}
      </li>
    )
  }

  if (agents.length === 0) return null

  return (
    <div className={cn("min-w-0", className)}>
      {parentsWithChildren.length > 0 && (
        <div className="mb-2 flex items-center justify-end gap-1">
          <Button variant="ghost" size="xs" onClick={() => setCollapsed(new Set())}>
            <ChevronsUpDown /> Expand all
          </Button>
          <Button variant="ghost" size="xs" onClick={() => setCollapsed(new Set(parentsWithChildren))}>
            <ChevronsDownUp /> Collapse all
          </Button>
        </div>
      )}
      <ul className="space-y-0.5">{tree.roots.map((r) => renderNode(r, 0))}</ul>
    </div>
  )
}
