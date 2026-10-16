"use client"

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Laptop, Monitor, Server, Smartphone } from "lucide-react"
import { formatUsd } from "@/lib/format"
import type { Device, DeviceKind } from "@/lib/types"
import { Panel, PropertyList } from "@/components/hq/panel"
import { StatusBadge } from "@/components/hq/status-badge"
import { UnknownState } from "@/components/hq/states"
import { CATEGORY_META, formatPct, type DailyPoint } from "./compute"
import { ChartCaption, ChartLegend, ChartTooltip, axisTick, gridStroke } from "./chart-parts"

const deviceIcon: Record<DeviceKind, typeof Server> = { linux_server: Server, mac: Monitor, iphone: Smartphone, vm: Laptop }

export function InfrastructurePanel({
  daily,
  totalSpend,
  devices,
  rangeLabel,
  scoped,
}: {
  daily: DailyPoint[]
  totalSpend: number
  devices: Device[]
  rangeLabel: string
  scoped: boolean
}) {
  const hosting = daily.reduce((a, d) => a + d.infrastructure, 0)
  const api = daily.reduce((a, d) => a + d.api, 0)
  const apiValues = daily.map((d) => d.api)
  const shared = hosting + api

  return (
    <Panel title="Infrastructure & external APIs" description={`Shared platform costs · ${rangeLabel}`}>
      {scoped ? (
        <UnknownState
          title="Not attributed to companies"
          description="Hosting and external API costs are shared and recorded under Alfred core. Switch to All or Personal to see them."
        />
      ) : (
        <div className="space-y-4">
          <PropertyList
            items={[
              { label: "Hosting", value: <span className="tabular">{formatUsd(hosting, 2)} <span className="text-muted-foreground">({formatUsd(daily.length ? hosting / daily.length : 0, 2)}/day, flat)</span></span> },
              {
                label: "External APIs",
                value: (
                  <span className="tabular">
                    {formatUsd(api, 2)}{" "}
                    <span className="text-muted-foreground">
                      (range {formatUsd(Math.min(...apiValues), 2)}–{formatUsd(Math.max(...apiValues), 2)}/day)
                    </span>
                  </span>
                ),
              },
              { label: "Share of spend", value: <span className="tabular">{formatPct(totalSpend ? shared / totalSpend : 0)}</span> },
            ]}
          />
          <div>
            <ChartLegend
              className="mb-2"
              items={[
                { label: CATEGORY_META.api.label, color: CATEGORY_META.api.color },
                { label: CATEGORY_META.infrastructure.label, color: CATEGORY_META.infrastructure.color },
              ]}
            />
            <div className="h-36 w-full" role="img" aria-label={`Line chart of daily demo hosting and external API cost over ${rangeLabel}`}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
                  <CartesianGrid vertical={false} stroke={gridStroke} strokeOpacity={0.7} />
                  <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis tick={axisTick} tickLine={false} axisLine={false} width={36} tickFormatter={(v: number) => `$${v}`} domain={[0, "auto"]} />
                  <Tooltip
                    cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
                    content={(p) => (
                      <ChartTooltip
                        active={p.active}
                        label={p.label}
                        payload={p.payload}
                        labelFor={(k) => (k === "api" ? CATEGORY_META.api.label : CATEGORY_META.infrastructure.label)}
                      />
                    )}
                  />
                  <Line type="monotone" dataKey="infrastructure" stroke={CATEGORY_META.infrastructure.color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="api" stroke={CATEGORY_META.api.color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 border-t pt-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Hosts in the footprint</p>
        {devices.length === 0 ? (
          <p className="text-xs text-muted-foreground">No devices reported.</p>
        ) : (
          <ul className="space-y-2">
            {devices.map((d) => {
              const Icon = deviceIcon[d.kind] ?? Server
              return (
                <li key={d.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="truncate">{d.name}</span>
                    {d.metrics && <span className="hidden text-xs tabular text-muted-foreground sm:inline">CPU {d.metrics.cpuPct}%</span>}
                  </span>
                  <StatusBadge status={d.status} />
                </li>
              )
            })}
          </ul>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">Per-host cost allocation isn&apos;t available in the demo dataset.</p>
      </div>
      <ChartCaption />
    </Panel>
  )
}
