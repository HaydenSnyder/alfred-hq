import { healthMeta, toneClasses } from "@/lib/status"
import type { HealthStatus } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Panel } from "@/components/hq/panel"
import { HealthGlyph } from "./health-glyph"

const order: HealthStatus[] = ["healthy", "working", "idle", "degraded", "offline", "unknown", "unconfigured"]

const extra: Partial<Record<HealthStatus, string>> = {
  unknown: "Shown when a check is missing or stale. HQ never assumes healthy.",
  unconfigured: "The source exists in the registry but nothing is connected to it yet.",
}

export function StateLegend({ className }: { className?: string }) {
  return (
    <Panel title="State legend" description="How HQ labels every monitored system" className={className}>
      <ul className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2 xl:grid-cols-1">
        {order.map((s) => {
          const meta = healthMeta[s]
          return (
            <li key={s} className="flex items-start gap-2.5">
              <HealthGlyph status={s} className="mt-1" />
              <div className="min-w-0">
                <p className={cn("text-sm font-medium", toneClasses[meta.tone].text)}>{meta.label}</p>
                <p className="text-xs text-muted-foreground">
                  {meta.description}
                  {extra[s] && <> {extra[s]}</>}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
