"use client"

import { HardDrive, Laptop, Monitor, Plug, Server, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime, formatUptime, timeAgo } from "@/lib/format"
import type { Device, DeviceKind, ServiceHealth } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { StatusBadge } from "@/components/hq/status-badge"
import { UnknownState } from "@/components/hq/states"
import { UsageMeter } from "@/components/hq/uptime-bar"
import { HealthGlyph, isVerified, lastCheckLabel } from "./health-glyph"

export const deviceKindMeta: Record<DeviceKind, { label: string; icon: typeof Server }> = {
  linux_server: { label: "Linux server", icon: Server },
  vm: { label: "Virtual machine", icon: HardDrive },
  mac: { label: "Mac", icon: Monitor },
  iphone: { label: "iPhone", icon: Smartphone },
}

/** Card shell with a stretched inspect button so the whole surface is clickable. */
function DeviceCardShell({ device, children }: { device: Device; children: React.ReactNode }) {
  const { inspect, inspector } = useHQ()
  const active = inspector.selection?.kind === "device" && inspector.selection.id === device.id
  const meta = deviceKindMeta[device.kind]
  const Icon = device.kind === "mac" && device.name.toLowerCase().includes("book") ? Laptop : meta.icon
  return (
    <article
      className={cn(
        "relative flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-surface-2",
        !isVerified(device.status) && "border-dashed",
        active && "border-foreground/25 bg-surface-2"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-surface-2 text-foreground/80">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">
            <button
              type="button"
              onClick={() => inspect({ kind: "device", id: device.id })}
              aria-pressed={active}
              className="text-left outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring/50"
            >
              {device.name}
            </button>
          </h3>
          <p className="truncate font-mono text-[11px] text-muted-foreground">{device.hostname}</p>
          <p className="truncate text-xs text-muted-foreground">
            {meta.label} · {device.os} · {device.location}
          </p>
        </div>
        <StatusBadge status={device.status} withTooltip={false} />
      </div>
      {children}
    </article>
  )
}

function Stat({ label, value, muted }: { label: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className={cn("truncate text-sm tabular", muted && "text-muted-foreground")}>{value}</dd>
    </div>
  )
}

function Metrics({ device }: { device: Device }) {
  if (!device.metrics) return <UnknownState title="No verified metrics" description="Host has not reported CPU, memory or disk usage." />
  return (
    <div className="space-y-2.5">
      <UsageMeter value={device.metrics.cpuPct} label="CPU" />
      <UsageMeter value={device.metrics.memPct} label="Memory" />
      <UsageMeter value={device.metrics.diskPct} label="Disk" />
    </div>
  )
}

function CheckLine({ device, services }: { device: Device; services: ServiceHealth[] }) {
  const hosted = services.filter((s) => device.serviceIds.includes(s.id))
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs">
      <span className={cn(device.lastCheckAt ? "text-muted-foreground" : "font-medium text-foreground/70")} title={formatDateTime(device.lastCheckAt)}>
        {device.lastCheckAt ? `Last health check ${timeAgo(device.lastCheckAt)}` : lastCheckLabel(undefined)}
      </span>
      {hosted.length > 0 ? (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {hosted.map((s) => (
            <span key={s.id} title={`${s.name}: ${s.status}`} className="inline-flex">
              <HealthGlyph status={s.status} className="size-2" />
            </span>
          ))}
          <span>
            {hosted.length} service{hosted.length === 1 ? "" : "s"}
          </span>
        </span>
      ) : (
        <span className="text-muted-foreground">No registered services</span>
      )}
    </div>
  )
}

export function ServerCard({ device, services }: { device: Device; services: ServiceHealth[] }) {
  return (
    <DeviceCardShell device={device}>
      <Metrics device={device} />
      <dl className="grid grid-cols-2 gap-3">
        <Stat label="Load average" value={device.metrics ? device.metrics.loadAvg.toFixed(2) : "—"} muted={!device.metrics} />
        <Stat label="Uptime" value={formatUptime(device.uptimeSeconds)} muted={device.uptimeSeconds == null} />
      </dl>
      <CheckLine device={device} services={services} />
    </DeviceCardShell>
  )
}

export function ConnectorDeviceCard({ device, services }: { device: Device; services: ServiceHealth[] }) {
  const c = device.connector
  return (
    <DeviceCardShell device={device}>
      <div className="rounded-lg border bg-surface-2/60 p-3">
        {c ? (
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2.5">
              <Plug className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="truncate text-sm">{c.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">v{c.version}</p>
              </div>
            </div>
            <StatusBadge status={c.status} withTooltip={false} />
          </div>
        ) : (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Plug className="size-3.5" /> No connector installed — status cannot be verified.
          </p>
        )}
      </div>
      {device.metrics ? (
        <Metrics device={device} />
      ) : (
        <UnknownState title="No verified metrics" description={device.status === "offline" ? "Device is offline; last known values are not shown." : undefined} />
      )}
      <dl className="grid grid-cols-2 gap-3">
        <Stat label="Uptime" value={formatUptime(device.uptimeSeconds)} muted={device.uptimeSeconds == null} />
        <Stat label="Load average" value={device.metrics ? device.metrics.loadAvg.toFixed(2) : "—"} muted={!device.metrics} />
      </dl>
      <CheckLine device={device} services={services} />
    </DeviceCardShell>
  )
}

export function DeviceSection({
  title,
  description,
  icon,
  children,
  count,
}: {
  title: string
  description: string
  icon: React.ReactNode
  count: number
  children: React.ReactNode
}) {
  return (
    <section className="min-w-0 space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-medium [&_svg]:size-4 [&_svg]:text-muted-foreground">
            {icon} {title} <span className="text-xs font-normal text-muted-foreground tabular">{count}</span>
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}
