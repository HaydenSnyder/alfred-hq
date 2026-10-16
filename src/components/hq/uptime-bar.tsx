import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/format"
import { healthMeta, toneClasses } from "@/lib/status"
import type { UptimeSample } from "@/lib/types"

/** 30-day status strip. Unknown buckets render as muted, never as healthy. */
export function UptimeBar({ history, className }: { history: UptimeSample[]; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex h-6 items-stretch gap-[2px]" role="img" aria-label="30-day status history">
        {history.map((s) => {
          const meta = healthMeta[s.status]
          return (
            <span
              key={s.at}
              title={`${formatDate(s.at)} · ${meta.label}`}
              className={cn(
                "flex-1 rounded-[2px]",
                s.status === "unknown" || s.status === "unconfigured" ? "bg-muted" : toneClasses[meta.tone].dot,
                (s.status === "healthy" || s.status === "working" || s.status === "idle") && "opacity-80"
              )}
            />
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}

export function UsageMeter({ value, className, label }: { value: number; className?: string; label?: string }) {
  const tone = value >= 90 ? "danger" : value >= 75 ? "warning" : "info"
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="tabular">{value}%</span>
        </div>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className={cn("h-full rounded-full transition-[width]", toneClasses[tone].dot)} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  )
}
