"use client"

import { User } from "lucide-react"
import { formatUsd } from "@/lib/format"
import type { Company } from "@/lib/types"
import { CompanyMark } from "@/components/hq/avatars"
import { Panel } from "@/components/hq/panel"
import { EmptyState } from "@/components/hq/states"
import { formatPct, type CompanyUsage } from "./compute"
import { ChartCaption } from "./chart-parts"

export function CompanyUsagePanel({
  data,
  companyById,
  rangeLabel,
  scoped,
}: {
  data: CompanyUsage[]
  companyById: Map<string, Company>
  rangeLabel: string
  /** True when a company context narrows the view. */
  scoped: boolean
}) {
  const max = Math.max(0, ...data.map((d) => d.cost))
  return (
    <Panel title="Usage by company" description={`All categories · share of spend in view · ${rangeLabel}`}>
      {data.length === 0 ? (
        <EmptyState title="No usage" description="Nothing recorded in this context and range." />
      ) : (
        <ul className="space-y-3">
          {data.map((d) => {
            const company = companyById.get(d.key)
            const name = company ? company.shortName : "Alfred core & personal"
            return (
              <li key={d.key} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    {company ? (
                      <CompanyMark company={company} size="sm" className="size-5 rounded text-[9px]" />
                    ) : (
                      <span className="inline-flex size-5 items-center justify-center rounded border bg-surface-2 text-muted-foreground">
                        <User className="size-3" aria-hidden />
                      </span>
                    )}
                    <span className="truncate">{name}</span>
                  </span>
                  <span className="flex shrink-0 items-baseline gap-2">
                    <span className="tabular font-medium">{formatUsd(d.cost)}</span>
                    <span className="w-12 text-right text-xs tabular text-muted-foreground">{formatPct(d.share)}</span>
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-muted"
                  role="img"
                  aria-label={`${name}: ${formatUsd(d.cost)}, ${formatPct(d.share)} of spend`}
                  title={`${name} · ${formatUsd(d.cost, 2)} · ${formatPct(d.share)}`}
                >
                  <div className="h-full rounded-full bg-chart-1" style={{ width: `${max ? (d.cost / max) * 100 : 0}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <ChartCaption>
        {scoped ? "filtered by the current workspace context" : "API & hosting are attributed to Alfred core"}
      </ChartCaption>
    </Panel>
  )
}
