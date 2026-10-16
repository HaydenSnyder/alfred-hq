"use client"

import Link from "next/link"
import { ArrowUpRight, ExternalLink, Network, X } from "lucide-react"
import { formatDate, scopeLabel, titleCase } from "@/lib/format"
import { hrefFor } from "@/lib/routes"
import type { Company, KnowledgeNode, KnowledgeRelation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DemoDataIndicator } from "@/components/hq/demo-data-indicator"
import { Markdown } from "@/components/hq/markdown"
import { type Graph, nodeColor } from "./graph-utils"

export function NodeDetails({
  node,
  graph,
  companies,
  onSelect,
  onExplore,
  onClose,
}: {
  node: KnowledgeNode
  /** Full graph, so relationships outside the current view are listed too. */
  graph: Graph
  companies: Company[]
  onSelect: (id: string) => void
  onExplore: (id: string) => void
  onClose?: () => void
}) {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]))
  const relations = graph.edges
    .filter((e) => e.source === node.id || e.target === node.id)
    .reduce<Partial<Record<KnowledgeRelation, { id: string; outgoing: boolean }[]>>>((acc, e) => {
      const outgoing = e.source === node.id
      ;(acc[e.relation] ??= []).push({ id: outgoing ? e.target : e.source, outgoing })
      return acc
    }, {})

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="mt-1 size-3 shrink-0 rounded-full" style={{ backgroundColor: nodeColor(node.type) }} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{node.type}</p>
          <h2 className="text-base leading-snug font-semibold">{node.label}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {scopeLabel(node.scope, companies)} · updated {formatDate(node.updatedAt)}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close node details">
            <X />
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">{node.summary}</p>

      {node.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {node.tags.map((t) => (
            <span key={t} className="rounded-md border px-1.5 py-0.5 text-[11px] text-muted-foreground">
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => onExplore(node.id)}>
          <Network /> Explore neighbourhood
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button size="sm" variant="ghost" disabled>
                <ExternalLink /> Open in Obsidian
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Obsidian is optional and not connected</TooltipContent>
        </Tooltip>
      </div>

      <section className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground">Document</h3>
        {node.body ? (
          <div className="rounded-lg border bg-surface-2 p-3">
            <Markdown content={node.body} />
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">No document body for this node — summary only.</p>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground">Source references</h3>
        {node.sources.length === 0 ? (
          <p className="text-xs text-muted-foreground">No sources recorded.</p>
        ) : (
          <ul className="space-y-1">
            {node.sources.map((s, i) => (
              <li key={`${s.label}-${i}`}>
                {s.ref ? (
                  <Link href={hrefFor(s.ref)} className="inline-flex items-center gap-1 text-sm text-brand hover:underline">
                    {s.label} <ArrowUpRight className="size-3" />
                  </Link>
                ) : (
                  <span className="text-sm">{s.label}</span>
                )}
                {s.ref && <span className="ml-1.5 text-[11px] text-muted-foreground">{titleCase(s.ref.kind)}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground">Relationships</h3>
        {Object.keys(relations).length === 0 && <p className="text-xs text-muted-foreground">No relationships.</p>}
        <div className="space-y-3">
          {(Object.entries(relations) as [KnowledgeRelation, { id: string; outgoing: boolean }[]][]).map(([rel, items]) => (
            <div key={rel}>
              <p className="mb-1 text-[11px] text-muted-foreground">{titleCase(rel)}</p>
              <ul className="space-y-0.5">
                {items.map(({ id, outgoing }) => {
                  const other = byId.get(id)
                  if (!other) return null
                  return (
                    <li key={`${rel}-${id}`}>
                      <button
                        type="button"
                        onClick={() => onSelect(id)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-accent/60"
                      >
                        <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: nodeColor(other.type) }} aria-hidden />
                        <span className="min-w-0 flex-1 truncate">{other.label}</span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{outgoing ? "→" : "←"}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <DemoDataIndicator variant="inline" label="Example memory record — demo data" />
    </div>
  )
}
