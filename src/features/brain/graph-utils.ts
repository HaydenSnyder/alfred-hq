import type { KnowledgeEdge, KnowledgeNode, KnowledgeNodeType, KnowledgeRelation } from "@/lib/types"

export type BrainView = "global" | "company" | "project" | "local"

export const NODE_TYPES: KnowledgeNodeType[] = ["company", "agent", "project", "session", "decision", "research", "memory", "document"]

export const RELATIONS: KnowledgeRelation[] = ["references", "derived_from", "owned_by", "decided_in", "relates_to", "authored_by", "part_of"]

export const nodeTypeLabel: Record<KnowledgeNodeType, string> = {
  company: "Companies",
  agent: "Agents",
  project: "Projects",
  session: "Sessions",
  decision: "Decisions",
  research: "Research",
  memory: "Memories",
  document: "Documents",
}

export function nodeColor(type: KnowledgeNodeType) {
  return `var(--node-${type})`
}

export interface Graph {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}

function induced(graph: Graph, ids: Set<string>): Graph {
  return {
    nodes: graph.nodes.filter((n) => ids.has(n.id)),
    edges: graph.edges.filter((e) => ids.has(e.source) && ids.has(e.target)),
  }
}

/** Node ids within `depth` hops of `rootId`. */
export function neighborhood(graph: Graph, rootId: string, depth: number): Set<string> {
  const seen = new Set([rootId])
  let frontier = [rootId]
  for (let d = 0; d < depth; d++) {
    const next: string[] = []
    for (const id of frontier) {
      for (const e of graph.edges) {
        const other = e.source === id ? e.target : e.target === id ? e.source : undefined
        if (other && !seen.has(other)) {
          seen.add(other)
          next.push(other)
        }
      }
    }
    frontier = next
  }
  return seen
}

/** The subgraph for a Brain view (before type/relation filters). */
export function scopeGraph(graph: Graph, view: BrainView, opts: { companyId?: string; projectId?: string; nodeId?: string; depth: number }): Graph {
  switch (view) {
    case "global":
      return graph
    case "company": {
      if (!opts.companyId) return { nodes: [], edges: [] }
      const ids = new Set(
        graph.nodes.filter((n) => n.scope.kind === "company" && n.scope.companyId === opts.companyId).map((n) => n.id)
      )
      return induced(graph, ids)
    }
    case "project": {
      if (!opts.projectId) return { nodes: [], edges: [] }
      const core = graph.nodes.filter((n) => n.projectId === opts.projectId).map((n) => n.id)
      const ids = new Set(core)
      // Include direct neighbours (owning company, agents) for context.
      core.forEach((id) => neighborhood(graph, id, 1).forEach((x) => ids.add(x)))
      return induced(graph, ids)
    }
    case "local":
      if (!opts.nodeId) return { nodes: [], edges: [] }
      return induced(graph, neighborhood(graph, opts.nodeId, opts.depth))
  }
}

export function applyFilters(graph: Graph, types: Set<KnowledgeNodeType>, relations: Set<KnowledgeRelation>, keepId?: string): Graph {
  const nodes = graph.nodes.filter((n) => types.has(n.type) || n.id === keepId)
  const ids = new Set(nodes.map((n) => n.id))
  return {
    nodes,
    edges: graph.edges.filter((e) => relations.has(e.relation) && ids.has(e.source) && ids.has(e.target)),
  }
}

export function matchesQuery(node: KnowledgeNode, q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return false
  return [node.label, node.summary, ...node.tags].some((f) => f.toLowerCase().includes(s))
}

/**
 * Deterministic Fruchterman–Reingold layout. Small graphs (< 100 nodes) settle
 * in a few hundred iterations; identical input always yields identical output.
 */
export function layoutGraph(graph: Graph): Map<string, { x: number; y: number }> {
  const n = graph.nodes.length
  // Canvas grows with node count so small neighbourhoods stay compact.
  const size = 220 + n * 14
  const pos = new Map<string, { x: number; y: number }>()
  if (n === 0) return pos

  // Seed positions on a circle, grouped by type so clusters form naturally.
  const ordered = [...graph.nodes].sort(
    (a, b) => NODE_TYPES.indexOf(a.type) - NODE_TYPES.indexOf(b.type) || a.id.localeCompare(b.id)
  )
  ordered.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / n
    pos.set(node.id, { x: Math.cos(angle) * size * 0.35, y: Math.sin(angle) * size * 0.35 })
  })
  if (n === 1) return new Map([[ordered[0].id, { x: 0, y: 0 }]])

  const area = size * size
  const k = Math.sqrt(area / n) * 0.62
  let temperature = size / 8
  const iterations = 320

  for (let it = 0; it < iterations; it++) {
    const disp = new Map<string, { x: number; y: number }>()
    for (const v of ordered) disp.set(v.id, { x: 0, y: 0 })

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = pos.get(ordered[i].id)!
        const b = pos.get(ordered[j].id)!
        let dx = a.x - b.x
        let dy = a.y - b.y
        let dist = Math.hypot(dx, dy)
        if (dist < 0.01) {
          dx = 0.01 * (i - j)
          dy = 0.01
          dist = Math.hypot(dx, dy)
        }
        const force = (k * k) / dist
        const da = disp.get(ordered[i].id)!
        const db = disp.get(ordered[j].id)!
        da.x += (dx / dist) * force
        da.y += (dy / dist) * force
        db.x -= (dx / dist) * force
        db.y -= (dy / dist) * force
      }
    }

    for (const e of graph.edges) {
      const a = pos.get(e.source)
      const b = pos.get(e.target)
      if (!a || !b) continue
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.max(Math.hypot(dx, dy), 0.01)
      const force = ((dist * dist) / k) * (0.6 + e.weight * 0.2)
      const da = disp.get(e.source)!
      const db = disp.get(e.target)!
      da.x -= (dx / dist) * force
      da.y -= (dy / dist) * force
      db.x += (dx / dist) * force
      db.y += (dy / dist) * force
    }

    for (const v of ordered) {
      const p = pos.get(v.id)!
      const d = disp.get(v.id)!
      // Gentle gravity keeps disconnected nodes from drifting away.
      d.x -= p.x * 0.004 * k
      d.y -= p.y * 0.004 * k
      const len = Math.max(Math.hypot(d.x, d.y), 0.01)
      p.x += (d.x / len) * Math.min(len, temperature)
      p.y += (d.y / len) * Math.min(len, temperature)
    }
    temperature *= 0.985
  }
  return pos
}

export function degreeMap(graph: Graph) {
  const deg = new Map<string, number>()
  for (const e of graph.edges) {
    deg.set(e.source, (deg.get(e.source) ?? 0) + 1)
    deg.set(e.target, (deg.get(e.target) ?? 0) + 1)
  }
  return deg
}
