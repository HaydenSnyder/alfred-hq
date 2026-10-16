"use client"

import { RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime, timeAgo } from "@/lib/format"
import type { Device, ServiceHealth } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { Panel } from "@/components/hq/panel"
import { StatusBadge } from "@/components/hq/status-badge"
import { UptimeBar } from "@/components/hq/uptime-bar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DisabledAction } from "./demo-guards"
import { isVerified } from "./health-glyph"

function Latency({ ms }: { ms?: number }) {
  if (ms == null) return <span className="text-muted-foreground">—</span>
  return <span className={cn("tabular", ms >= 1000 ? "text-status-warning" : ms >= 500 ? "text-foreground" : "text-foreground/80")}>{ms.toLocaleString("en-US")} ms</span>
}

function Uptime({ value }: { value?: number }) {
  if (value == null) return <span className="text-muted-foreground">—</span>
  return <span className={cn("tabular", value < 99 ? "text-status-warning" : undefined)}>{value.toFixed(2)}%</span>
}

function LastCheck({ at }: { at?: string }) {
  if (!at) return <span className="text-xs font-medium text-foreground/70">No verified check</span>
  return (
    <time dateTime={at} title={formatDateTime(at)} className="text-xs text-muted-foreground tabular">
      {timeAgo(at)}
    </time>
  )
}

function RestartControl({ service }: { service: ServiceHealth }) {
  return (
    <DisabledAction label={`Restart ${service.name}`} variant="ghost" size="xs">
      <RotateCcw /> Restart
    </DisabledAction>
  )
}

export function ServicesTable({ services, devices }: { services: ServiceHealth[]; devices: Device[] }) {
  const { inspect, inspector } = useHQ()
  const deviceName = (id?: string) => (id ? devices.find((d) => d.id === id)?.name ?? "Unregistered host" : "—")
  const isActive = (s: ServiceHealth) => inspector.selection?.kind === "service" && inspector.selection.id === s.id

  return (
    <Panel
      title="Registered services"
      description="Status, latency and 30-day history (demo). Restart controls are disabled in this prototype."
      bodyClassName="px-0 pb-2"
    >
      {/* Desktop / tablet table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Latency</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="text-right">Uptime 30d</TableHead>
              <TableHead className="w-[200px] min-w-[160px]">30-day history</TableHead>
              <TableHead>Last check</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow
                key={s.id}
                tabIndex={0}
                aria-selected={isActive(s)}
                onClick={() => inspect({ kind: "service", id: s.id })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    inspect({ kind: "service", id: s.id })
                  }
                }}
                className={cn("cursor-pointer outline-none focus-visible:bg-muted/60", isActive(s) && "bg-muted/60")}
              >
                <TableCell className="pl-4">
                  <span className="block text-sm font-medium">{s.name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    <span className="font-mono">{s.system}</span> · {deviceName(s.deviceId)}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={s.status} withTooltip={false} />
                </TableCell>
                <TableCell className="text-right text-sm">
                  <Latency ms={s.latencyMs} />
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{s.version ? `v${s.version}` : "unknown"}</TableCell>
                <TableCell className="text-right text-sm">
                  <Uptime value={s.uptime30d} />
                </TableCell>
                <TableCell>
                  <UptimeBar history={s.history} className="[&>div:last-child]:hidden" />
                </TableCell>
                <TableCell>
                  <LastCheck at={s.lastCheckAt} />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <RestartControl service={s} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="px-4 pt-2 text-[11px] text-muted-foreground">
          History bars run oldest → today. Grey buckets are unknown or unconfigured, never counted as healthy.
        </p>
      </div>

      {/* Mobile list */}
      <ul className="divide-y md:hidden">
        {services.map((s) => (
          <li key={s.id} className={cn("relative px-4 py-3", isActive(s) && "bg-muted/60")}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => inspect({ kind: "service", id: s.id })}
                  className="text-left text-sm font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-ring/50"
                >
                  {s.name}
                </button>
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-mono">{s.system}</span> · {s.version ? `v${s.version}` : "version unknown"}
                </p>
              </div>
              <StatusBadge status={s.status} withTooltip={false} />
            </div>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <dt className="text-[11px] text-muted-foreground">Latency</dt>
                <dd>
                  <Latency ms={s.latencyMs} />
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground">Uptime 30d</dt>
                <dd>
                  <Uptime value={s.uptime30d} />
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-muted-foreground">Last check</dt>
                <dd>
                  <LastCheck at={s.lastCheckAt} />
                </dd>
              </div>
            </dl>
            <UptimeBar history={s.history} className={cn("mt-3", !isVerified(s.status) && "opacity-90")} />
            <div className="relative z-10 mt-2 flex justify-end">
              <RestartControl service={s} />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
