"use client"

import { useMemo, useState } from "react"
import { BrainCircuit, CalendarClock, Cloud, Server, Wallet } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { formatUsd } from "@/lib/format"
import { useHQ } from "@/components/providers/hq-store"
import { DemoDataIndicator } from "@/components/hq/demo-data-indicator"
import { MetricCard } from "@/components/hq/metric-card"
import { PageHeader } from "@/components/hq/page-header"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  agentBreakdown,
  budgetVisible,
  companyBreakdown,
  dailySeries,
  formatPct,
  inRange,
  inUsageContext,
  modelBreakdown,
  projectMonthEnd,
  totalsByCategory,
  type RangeKey,
} from "./compute"
import { AgentUsageTable } from "./agent-usage-table"
import { BudgetPanel } from "./budget-panel"
import { CompanyUsagePanel } from "./company-usage-panel"
import { DailySpendChart } from "./daily-spend-chart"
import { InfrastructurePanel } from "./infrastructure-panel"
import { ModelSpendChart } from "./model-spend-chart"

const RANGE_LABEL: Record<RangeKey, string> = { "7d": "last 7 days", "30d": "last 30 days" }

export function ResourcesView() {
  const { companyContext } = useHQ()
  const [range, setRange] = useState<RangeKey>("30d")

  const q = useHQQuery("resources", async (p) => {
    const [usage, budgets, companies, agents, devices] = await Promise.all([
      p.listUsage(),
      p.listBudgets(),
      p.listCompanies(),
      p.listAgents(),
      p.listDevices(),
    ])
    return { usage, budgets, companies, agents, devices }
  })

  const derived = useMemo(() => {
    if (q.status !== "success") return null
    const d = q.data
    const contextRows = d.usage.filter((r) => inUsageContext(r, companyContext))
    const rows = contextRows.filter((r) => inRange(r, range))
    const totals = totalsByCategory(rows)
    const total = totals.model + totals.api + totals.infrastructure
    return {
      rows,
      totals,
      total,
      projection: projectMonthEnd(contextRows),
      daily: dailySeries(rows, range),
      models: modelBreakdown(rows),
      agentsUsage: agentBreakdown(rows),
      companiesUsage: companyBreakdown(rows),
      budgets: d.budgets.filter((b) => budgetVisible(b, companyContext)),
      companyById: new Map(d.companies.map((c) => [c.id, c])),
      agentById: new Map(d.agents.map((a) => [a.id, a])),
    }
  }, [q.status, q.data, companyContext, range])

  const rangeLabel = RANGE_LABEL[range]
  const scoped = companyContext !== "all" && companyContext !== "personal"

  const header = (
    <PageHeader
      title="Resources & Costs"
      description="Illustrative usage and spend across AI models, external APIs and infrastructure. These are demonstration figures, not billing data."
      actions={
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={range}
          onValueChange={(v) => v && setRange(v as RangeKey)}
          aria-label="Time range"
        >
          <ToggleGroupItem value="7d" className="px-3">
            7 days
          </ToggleGroupItem>
          <ToggleGroupItem value="30d" className="px-3">
            30 days
          </ToggleGroupItem>
        </ToggleGroup>
      }
    />
  )

  if (q.status === "loading")
    return (
      <>
        {header}
        <LoadingState variant="metrics" />
        <LoadingState variant="cards" rows={4} className="mt-4" />
      </>
    )
  if (q.status === "error" || q.status === "offline")
    return (
      <>
        {header}
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )
  if (!derived || q.data.usage.length === 0)
    return (
      <>
        {header}
        <EmptyState title="No usage recorded" description="The data source returned no usage records for this period." />
      </>
    )

  const { totals, total, projection } = derived
  const share = (v: number) => (total ? `${formatPct(v / total, 0)} of spend` : "—")

  return (
    <>
      {header}

      <p className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <DemoDataIndicator variant="inline" label="Illustrative demo figures" />
        <span>
          Showing {rangeLabel}
          {companyContext === "all" ? " across all workspaces" : " for the current workspace context"}.
        </span>
      </p>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricCard
          label="Total spend"
          icon={<Wallet />}
          value={formatUsd(total)}
          hint={`${rangeLabel} · demo`}
          className="col-span-2 lg:col-span-1"
        />
        <MetricCard label="AI models" icon={<BrainCircuit />} value={formatUsd(totals.model)} hint={share(totals.model)} />
        <MetricCard label="External APIs" icon={<Cloud />} value={formatUsd(totals.api)} hint={share(totals.api)} />
        <MetricCard label="Infrastructure" icon={<Server />} value={formatUsd(totals.infrastructure)} hint={share(totals.infrastructure)} />
        <MetricCard
          label="Projected month-end"
          icon={<CalendarClock />}
          value={formatUsd(projection.projected)}
          hint={`${formatUsd(projection.monthToDate)} month-to-date · day ${projection.daysElapsed}/${projection.daysInMonth}`}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <DailySpendChart data={derived.daily} rangeLabel={rangeLabel} />
        </div>
        <ModelSpendChart data={derived.models} rangeLabel={rangeLabel} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <CompanyUsagePanel data={derived.companiesUsage} companyById={derived.companyById} rangeLabel={rangeLabel} scoped={companyContext !== "all"} />
        <BudgetPanel budgets={derived.budgets} usage={q.data.usage} companies={q.data.companies} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <AgentUsageTable data={derived.agentsUsage} agentById={derived.agentById} companyById={derived.companyById} rangeLabel={rangeLabel} />
        </div>
        <InfrastructurePanel
          daily={derived.daily}
          totalSpend={total}
          devices={q.data.devices}
          rangeLabel={rangeLabel}
          scoped={scoped}
        />
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        All figures on this page are illustrative demo data generated in the browser. No billing systems are connected.
      </p>
    </>
  )
}
