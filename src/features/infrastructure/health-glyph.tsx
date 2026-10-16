import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/format"
import { healthMeta, toneClasses } from "@/lib/status"
import type { HealthStatus } from "@/lib/types"

/**
 * Small status mark that keeps `unknown` and `unconfigured` visually distinct
 * from each other and from every verified state: unknown is a hollow dashed
 * ring, unconfigured is a slashed square. Neither ever looks healthy.
 */
export function HealthGlyph({ status, className }: { status: HealthStatus; className?: string }) {
  if (status === "unknown") {
    return <span aria-hidden className={cn("inline-flex size-2.5 shrink-0 rounded-full border border-dashed border-muted-foreground", className)} />
  }
  if (status === "unconfigured") {
    return (
      <span aria-hidden className={cn("relative inline-flex size-2.5 shrink-0 overflow-hidden rounded-[3px] border border-muted-foreground/70", className)}>
        <span className="absolute top-1/2 left-1/2 h-px w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-muted-foreground/70" />
      </span>
    )
  }
  const tone = healthMeta[status].tone
  return <span aria-hidden className={cn("inline-flex size-2.5 shrink-0 rounded-full", toneClasses[tone].dot, className)} />
}

/** "Checked 3m ago" or an explicit unverified label — never blank. */
export function lastCheckLabel(lastCheckAt?: string): string {
  return lastCheckAt ? `Checked ${timeAgo(lastCheckAt)}` : "No verified check"
}

export function isVerified(status: HealthStatus): boolean {
  return status !== "unknown" && status !== "unconfigured"
}

export function needsAttention(status: HealthStatus): boolean {
  return status === "degraded" || status === "offline"
}
