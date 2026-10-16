"use client"

import { Filter, GitBranch } from "lucide-react"
import { titleCase } from "@/lib/format"
import type { KnowledgeNodeType, KnowledgeRelation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NODE_TYPES, RELATIONS, nodeColor, nodeTypeLabel } from "./graph-utils"

function toggle<T>(set: Set<T>, value: T) {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

export function TypeFilter({ value, onChange }: { value: Set<KnowledgeNodeType>; onChange: (v: Set<KnowledgeNodeType>) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter /> Node types
          {value.size < NODE_TYPES.length && <span className="rounded bg-muted px-1 text-[10px] tabular">{value.size}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Show node types</DropdownMenuLabel>
        {NODE_TYPES.map((t) => (
          <DropdownMenuCheckboxItem key={t} checked={value.has(t)} onCheckedChange={() => onChange(toggle(value, t))} onSelect={(e) => e.preventDefault()}>
            <span className="size-2.5 rounded-full" style={{ backgroundColor: nodeColor(t) }} aria-hidden />
            {nodeTypeLabel[t]}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onChange(new Set(NODE_TYPES))}>Show all</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function RelationFilter({ value, onChange }: { value: Set<KnowledgeRelation>; onChange: (v: Set<KnowledgeRelation>) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <GitBranch /> Relationships
          {value.size < RELATIONS.length && <span className="rounded bg-muted px-1 text-[10px] tabular">{value.size}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Show relationships</DropdownMenuLabel>
        {RELATIONS.map((r) => (
          <DropdownMenuCheckboxItem key={r} checked={value.has(r)} onCheckedChange={() => onChange(toggle(value, r))} onSelect={(e) => e.preventDefault()}>
            {titleCase(r)}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onChange(new Set(RELATIONS))}>Show all</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function GraphLegend({ types }: { types: KnowledgeNodeType[] }) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 rounded-lg border bg-background/85 px-2.5 py-1.5 text-[11px] text-muted-foreground backdrop-blur">
      {types.map((t) => (
        <li key={t} className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: nodeColor(t) }} aria-hidden />
          {nodeTypeLabel[t]}
        </li>
      ))}
    </ul>
  )
}
