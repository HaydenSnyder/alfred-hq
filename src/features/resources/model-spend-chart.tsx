"use client"

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatCompact, formatUsd } from "@/lib/format"
import { Panel } from "@/components/hq/panel"
import { EmptyState } from "@/components/hq/states"
import { formatPct, type ModelPoint } from "./compute"
import { ChartCaption, axisTick, gridStroke } from "./chart-parts"

export function ModelSpendChart({ data, rangeLabel }: { data: ModelPoint[]; rangeLabel: string }) {
  return (
    <Panel title="Spend by AI model" description={`Model inference cost · ${rangeLabel}`}>
      {data.length === 0 ? (
        <EmptyState title="No model usage" description="No model usage recorded in this context and range." />
      ) : (
        <>
          <div
            className="w-full"
            style={{ height: Math.max(140, data.length * 52 + 24) }}
            role="img"
            aria-label={`Bar chart of demo spend per AI model: ${data.map((d) => `${d.model} ${formatUsd(d.cost)}`).join(", ")}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 0 }} barCategoryGap="28%">
                <CartesianGrid horizontal={false} stroke={gridStroke} strokeOpacity={0.7} />
                <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatUsd(v)} />
                <YAxis type="category" dataKey="model" tick={axisTick} tickLine={false} axisLine={false} width={116} />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  content={(p) => {
                    const row = p.payload?.[0]?.payload as ModelPoint | undefined
                    if (!p.active || !row) return null
                    return (
                      <div className="min-w-44 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
                        <p className="mb-1.5 font-medium">{row.model}</p>
                        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
                          <dt className="text-muted-foreground">Cost</dt>
                          <dd className="tabular text-right">{formatUsd(row.cost, 2)}</dd>
                          <dt className="text-muted-foreground">Share of model spend</dt>
                          <dd className="tabular text-right">{formatPct(row.share)}</dd>
                          <dt className="text-muted-foreground">Tokens in / out</dt>
                          <dd className="tabular text-right">
                            {formatCompact(row.inputTokens)} / {formatCompact(row.outputTokens)}
                          </dd>
                        </dl>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="cost" fill="var(--chart-1)" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  <LabelList
                    dataKey="cost"
                    position="right"
                    formatter={(v: unknown) => (typeof v === "number" ? formatUsd(v) : "")}
                    style={{ fill: "var(--foreground)", fontSize: 11 }}
                    className="tabular"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ChartCaption>token counts are derived from cost in the generator</ChartCaption>
        </>
      )}
    </Panel>
  )
}
