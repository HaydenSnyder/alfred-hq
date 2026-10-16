"use client"

import { cn } from "@/lib/utils"
import type { ServiceHealth } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { Panel } from "@/components/hq/panel"
import { StatusBadge } from "@/components/hq/status-badge"
import { HealthGlyph, isVerified, lastCheckLabel, needsAttention } from "./health-glyph"

/** Canonical order of the core Alfred systems on the strip. */
export const CORE_SYSTEMS = ["hermes", "photon", "dev-gateway", "memory", "research"]

export function CoreSystemsStrip({ services }: { services: ServiceHealth[] }) {
  const { inspect, inspector } = useHQ()
  const core = CORE_SYSTEMS.map((key) => services.find((s) => s.system === key)).filter((s): s is ServiceHealth => !!s)

  return (
    <Panel title="Core systems" description="Hermes, Photon, Development Gateway, Memory and Research — select to inspect" bodyClassName="@container">
      {core.length === 0 ? (
        <p className="text-xs text-muted-foreground">No core systems are registered with the data source.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-2 @md:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-5">
          {core.map((s) => {
            const active = inspector.selection?.kind === "service" && inspector.selection.id === s.id
            return (
              <li key={s.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => inspect({ kind: "service", id: s.id })}
                  aria-pressed={active}
                  className={cn(
                    "flex h-full w-full min-w-0 flex-col gap-2 rounded-lg border bg-surface-2/60 p-3 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    needsAttention(s.status) && "border-status-warning/30",
                    s.status === "offline" && "border-status-danger/30",
                    !isVerified(s.status) && "border-dashed",
                    active && "border-foreground/25 bg-surface-2"
                  )}
                >
                  <span className="flex min-w-0 items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <HealthGlyph status={s.status} />
                      <span className="truncate text-sm font-medium">{s.name}</span>
                    </span>
                  </span>
                  <span className="flex flex-wrap items-center justify-between gap-1.5">
                    <StatusBadge status={s.status} withTooltip={false} />
                    <span className="text-[11px] text-muted-foreground tabular">
                      {s.latencyMs != null ? `${s.latencyMs.toLocaleString("en-US")} ms` : "— ms"}
                    </span>
                  </span>
                  <span className={cn("text-[11px]", s.lastCheckAt ? "text-muted-foreground" : "font-medium text-foreground/70")}>
                    {lastCheckLabel(s.lastCheckAt)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
