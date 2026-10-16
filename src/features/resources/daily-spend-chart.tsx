"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { BarChart3, Table2 } from "lucide-react"
import { formatUsd } from "@/lib/format"
import { Panel } from "@/components/hq/panel"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CATEGORY_META, CATEGORY_ORDER, type DailyPoint, type UsageCategory } from "./compute"
import { ChartCaption, ChartLegend, ChartTooltip, axisTick, gridStroke } from "./chart-parts"

export function DailySpendChart({ data, rangeLabel }: { data: DailyPoint[]; rangeLabel: string }) {
  const [view, setView] = useState<"chart" | "table">("chart")
  const present = CATEGORY_ORDER.filter((c) => data.some((d) => d[c] > 0))
  const top = present[present.length - 1]
  const legend = [...present].reverse().map((c) => ({ label: CATEGORY_META[c].label, color: CATEGORY_META[c].color }))

  return (
    <Panel
      title="Daily spend by category"
      description={`Stacked: AI models, external APIs, infrastructure · ${rangeLabel}`}
      actions={
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={view}
          onValueChange={(v) => v && setView(v as "chart" | "table")}
          aria-label="Display as"
        >
          <ToggleGroupItem value="chart" aria-label="Chart view">
            <BarChart3 />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <Table2 />
          </ToggleGroupItem>
        </ToggleGroup>
      }
    >
      {view === "chart" ? (
        <>
          <ChartLegend items={legend} className="mb-3" />
          <div className="h-64 w-full" role="img" aria-label={`Stacked bar chart of daily demo spend by category over ${rangeLabel}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="18%">
                <CartesianGrid vertical={false} stroke={gridStroke} strokeDasharray="0" strokeOpacity={0.7} />
                <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={16} />
                <YAxis
                  tick={axisTick}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={(v: number) => formatUsd(v)}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  content={(p) => (
                    <ChartTooltip
                      active={p.active}
                      label={p.label}
                      payload={p.payload}
                      labelFor={(k) => CATEGORY_META[k as UsageCategory]?.label ?? k}
                      showTotal
                    />
                  )}
                />
                {present.map((c) => (
                  <Bar
                    key={c}
                    dataKey={c}
                    stackId="spend"
                    fill={CATEGORY_META[c].color}
                    stroke="var(--card)"
                    strokeWidth={1}
                    radius={c === top ? [4, 4, 0, 0] : 0}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="max-h-72 overflow-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                {CATEGORY_ORDER.slice()
                  .reverse()
                  .map((c) => (
                    <TableHead key={c} className="text-right">
                      {CATEGORY_META[c].label}
                    </TableHead>
                  ))}
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...data].reverse().map((d) => (
                <TableRow key={d.date}>
                  <TableCell>{d.label}</TableCell>
                  <TableCell className="text-right tabular">{formatUsd(d.model, 2)}</TableCell>
                  <TableCell className="text-right tabular">{formatUsd(d.api, 2)}</TableCell>
                  <TableCell className="text-right tabular">{formatUsd(d.infrastructure, 2)}</TableCell>
                  <TableCell className="text-right tabular font-medium">{formatUsd(d.total, 2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <ChartCaption>weekends run lighter in the generated series</ChartCaption>
    </Panel>
  )
}
