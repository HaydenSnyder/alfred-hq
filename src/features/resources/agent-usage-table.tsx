"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCompact, formatUsd } from "@/lib/format"
import type { Agent, Company } from "@/lib/types"
import { AgentAvatar } from "@/components/hq/avatars"
import { Panel } from "@/components/hq/panel"
import { EmptyState } from "@/components/hq/states"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPct, type AgentUsage } from "./compute"
import { ChartCaption } from "./chart-parts"

type SortKey = "agent" | "model" | "inputTokens" | "outputTokens" | "cost" | "share"

const columns: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "agent", label: "Agent" },
  { key: "model", label: "Model" },
  { key: "inputTokens", label: "Tokens in", numeric: true },
  { key: "outputTokens", label: "Tokens out", numeric: true },
  { key: "cost", label: "Cost", numeric: true },
  { key: "share", label: "Share", numeric: true },
]

export function AgentUsageTable({
  data,
  agentById,
  companyById,
  rangeLabel,
}: {
  data: AgentUsage[]
  agentById: Map<string, Agent>
  companyById: Map<string, Company>
  rangeLabel: string
}) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "cost", dir: "desc" })

  const rows = useMemo(() => {
    const nameOf = (id: string) => agentById.get(id)?.name ?? id
    const sorted = [...data].sort((a, b) => {
      let cmp: number
      if (sort.key === "agent") cmp = nameOf(a.agentId).localeCompare(nameOf(b.agentId))
      else if (sort.key === "model") cmp = a.model.localeCompare(b.model)
      else cmp = a[sort.key] - b[sort.key]
      return sort.dir === "asc" ? cmp : -cmp
    })
    return sorted
  }, [data, sort, agentById])

  const toggle = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "agent" || key === "model" ? "asc" : "desc" }))

  const maxShare = Math.max(0, ...data.map((d) => d.share))

  return (
    <Panel title="Agent-level consumption" description={`Model usage per agent · ${rangeLabel}`} bodyClassName="px-0 pb-3">
      {data.length === 0 ? (
        <div className="px-4">
          <EmptyState title="No agent usage" description="No agents consumed model tokens in this context and range." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                {columns.map((c) => {
                  const active = sort.key === c.key
                  const Icon = active ? (sort.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown
                  return (
                    <TableHead
                      key={c.key}
                      className={cn(c.numeric && "text-right", c.key === "agent" && "pl-4")}
                      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(c.key)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-sm text-xs font-medium outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                          active ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {c.label}
                        <Icon className={cn("size-3", !active && "opacity-50")} aria-hidden />
                      </button>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const agent = agentById.get(r.agentId)
                const company = r.companyId ? companyById.get(r.companyId) : undefined
                return (
                  <TableRow key={r.agentId}>
                    <TableCell className="pl-4">
                      <Link href={`/agents/${r.agentId}`} className="flex min-w-0 items-center gap-2 hover:underline">
                        {agent && <AgentAvatar agent={agent} size="sm" showStatus={false} />}
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{agent?.name ?? r.agentId}</span>
                          <span className="block truncate text-xs text-muted-foreground">{company?.shortName ?? "Alfred core"}</span>
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{r.model}</TableCell>
                    <TableCell className="text-right tabular">{formatCompact(r.inputTokens)}</TableCell>
                    <TableCell className="text-right tabular">{formatCompact(r.outputTokens)}</TableCell>
                    <TableCell className="text-right tabular font-medium">{formatUsd(r.cost, 2)}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center justify-end gap-2">
                        <span className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-muted sm:inline-block" aria-hidden>
                          <span className="block h-full rounded-full bg-chart-1" style={{ width: `${maxShare ? (r.share / maxShare) * 100 : 0}%` }} />
                        </span>
                        <span className="w-12 tabular">{formatPct(r.share)}</span>
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
      <ChartCaption className="px-4">share is of total model spend in view</ChartCaption>
    </Panel>
  )
}
