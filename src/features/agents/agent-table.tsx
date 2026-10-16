"use client"

import Link from "next/link"
import { PanelRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime, timeAgo } from "@/lib/format"
import type { Agent, Company } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { AgentAvatar } from "@/components/hq/avatars"
import {
  ScopeChip,
  agentHasStats,
  agentRoleLabel,
  errorRateTone,
  formatErrorRate,
  formatLatency,
} from "@/components/hq/agent-card"
import { StatusBadge } from "@/components/hq/status-badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { departmentName } from "./agent-utils"

function InspectButton({ agent }: { agent: Agent }) {
  const { inspect } = useHQ()
  return (
    <Button variant="ghost" size="icon-sm" onClick={() => inspect({ kind: "agent", id: agent.id })} aria-label={`Inspect ${agent.name}`}>
      <PanelRight />
    </Button>
  )
}

/** Dense agent list: a table from md up, stacked rows on small screens. */
export function AgentTable({ agents, companies }: { agents: Agent[]; companies: Company[] }) {
  return (
    <div className="rounded-xl border bg-card">
      {/* Mobile rows */}
      <ul className="divide-y md:hidden">
        {agents.map((a) => (
          <li key={a.id} className="flex items-center gap-2 px-3 py-2.5">
            <Link href={`/agents/${a.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <AgentAvatar agent={a} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{a.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {a.title} · {a.lastCheckAt ? `checked ${timeAgo(a.lastCheckAt)}` : "no verified check"}
                </span>
              </span>
              <StatusBadge status={a.status} withTooltip={false} />
            </Link>
            <InspectButton agent={a} />
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead className="hidden lg:table-cell">Role</TableHead>
              <TableHead className="hidden xl:table-cell">Model</TableHead>
              <TableHead className="text-right">Tasks 7d</TableHead>
              <TableHead className="hidden text-right lg:table-cell">Latency</TableHead>
              <TableHead className="text-right">Errors</TableHead>
              <TableHead>Last check</TableHead>
              <TableHead className="w-10 pr-4">
                <span className="sr-only">Inspect</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((a) => {
              const hasStats = agentHasStats(a)
              const dept = departmentName(a, companies)
              return (
                <TableRow key={a.id}>
                  <TableCell className="pl-4">
                    <Link href={`/agents/${a.id}`} className="flex min-w-0 items-center gap-2.5 hover:underline-offset-2">
                      <AgentAvatar agent={a} size="sm" />
                      <span className="min-w-0">
                        <span className="block max-w-56 truncate text-sm font-medium">{a.name}</span>
                        <span className="block max-w-56 truncate text-[11px] text-muted-foreground">{a.title}</span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell>
                    <ScopeChip scope={a.scope} companies={companies} />
                    {dept && <span className="block text-[11px] text-muted-foreground">{dept}</span>}
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">{agentRoleLabel[a.role]}</TableCell>
                  <TableCell className="hidden font-mono text-[11px] text-muted-foreground xl:table-cell">{a.model.name}</TableCell>
                  <TableCell className="text-right tabular">{hasStats ? a.stats.tasksCompleted7d : "—"}</TableCell>
                  <TableCell className="hidden text-right tabular lg:table-cell">{hasStats ? formatLatency(a.stats.avgLatencyMs) : "—"}</TableCell>
                  <TableCell className={cn("text-right tabular", hasStats && errorRateTone(a.stats.errorRate7d))}>
                    {formatErrorRate(a.stats.errorRate7d, hasStats)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <span title={formatDateTime(a.lastCheckAt)}>{a.lastCheckAt ? timeAgo(a.lastCheckAt) : "Never"}</span>
                  </TableCell>
                  <TableCell className="pr-4">
                    <InspectButton agent={a} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
