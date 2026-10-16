"use client"

import { AlertTriangle, CheckCircle2, OctagonAlert } from "lucide-react"
import { formatUsd, scopeLabel } from "@/lib/format"
import type { Budget, Company, UsageRecord } from "@/lib/types"
import type { Tone } from "@/lib/status"
import { Panel } from "@/components/hq/panel"
import { EmptyState } from "@/components/hq/states"
import { ToneBadge } from "@/components/hq/status-badge"
import { UsageMeter } from "@/components/hq/uptime-bar"
import { budgetRows, projectMonthEnd } from "./compute"
import { ChartCaption } from "./chart-parts"

function budgetTone(pct: number): { tone: Tone; label: string; Icon: typeof CheckCircle2 } {
  if (pct >= 90) return { tone: "danger", label: "Over 90%", Icon: OctagonAlert }
  if (pct >= 75) return { tone: "warning", label: "Over 75%", Icon: AlertTriangle }
  return { tone: "success", label: "On track", Icon: CheckCircle2 }
}

export function BudgetPanel({ budgets, usage, companies }: { budgets: Budget[]; usage: UsageRecord[]; companies: Company[] }) {
  return (
    <Panel title="Budgets" description="Month-to-date spend against each monthly limit · warns at 75%, alerts at 90%">
      {budgets.length === 0 ? (
        <EmptyState title="No budgets in this context" description="Switch the workspace context to see other budgets." />
      ) : (
        <ul className="divide-y">
          {budgets.map((b) => {
            const { monthToDate, projected, daysElapsed, daysInMonth } = projectMonthEnd(budgetRows(b, usage))
            const pct = Math.round((monthToDate / b.monthlyLimitUsd) * 100)
            const projectedPct = Math.round((projected / b.monthlyLimitUsd) * 100)
            const now = budgetTone(pct)
            const forecast = budgetTone(projectedPct)
            // Status reflects the worse of actual and projected.
            const status = projectedPct >= pct && forecast.tone !== "success" ? { ...forecast, label: `Projected ${forecast.label.toLowerCase()}` } : now
            return (
              <li key={b.id} className="space-y-2 py-3 first:pt-1 last:pb-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{b.label}</p>
                    <p className="text-xs text-muted-foreground">{scopeLabel(b.scope, companies)} scope</p>
                  </div>
                  <ToneBadge tone={status.tone} dot={false}>
                    <status.Icon className="size-3" aria-hidden />
                    {status.label}
                  </ToneBadge>
                </div>
                <UsageMeter value={pct} label={`${formatUsd(monthToDate)} of ${formatUsd(b.monthlyLimitUsd)} spent`} />
                <p className="text-xs text-muted-foreground">
                  Projected month-end <span className="tabular text-foreground">{formatUsd(projected)}</span>{" "}
                  (<span className="tabular">{projectedPct}%</span> of limit) · day {daysElapsed} of {daysInMonth}
                </p>
              </li>
            )
          })}
        </ul>
      )}
      <ChartCaption>projection = month-to-date + trailing 7-day average</ChartCaption>
    </Panel>
  )
}
