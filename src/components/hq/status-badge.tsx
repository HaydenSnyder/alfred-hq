import { cn } from "@/lib/utils"
import {
  healthMeta,
  priorityMeta,
  severityMeta,
  taskStatusMeta,
  toneClasses,
  verificationMeta,
  type Tone,
} from "@/lib/status"
import type { HealthStatus, Priority, Severity, TaskStatus, VerificationStatus } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function StatusDot({ tone, pulse, className }: { tone: Tone; pulse?: boolean; className?: string }) {
  return (
    <span className={cn("relative inline-flex size-2 shrink-0", className)} aria-hidden>
      {pulse && (
        <span className={cn("absolute inset-0 animate-ping rounded-full opacity-50 motion-reduce:hidden", toneClasses[tone].dot)} />
      )}
      <span className={cn("relative inline-flex size-2 rounded-full", toneClasses[tone].dot)} />
    </span>
  )
}

export function ToneBadge({
  tone,
  children,
  dot = true,
  className,
}: {
  tone: Tone
  children: React.ReactNode
  dot?: boolean
  className?: string
}) {
  const t = toneClasses[tone]
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full border px-2 text-[11px] font-medium whitespace-nowrap",
        t.text,
        t.bg,
        t.border,
        className
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", t.dot)} aria-hidden />}
      {children}
    </span>
  )
}

/**
 * Health status badge. Defaults to `unknown` — a missing status is never
 * rendered as healthy.
 */
export function StatusBadge({
  status = "unknown",
  className,
  withTooltip = true,
}: {
  status?: HealthStatus
  className?: string
  withTooltip?: boolean
}) {
  const meta = healthMeta[status] ?? healthMeta.unknown
  const badge = (
    <ToneBadge tone={meta.tone} className={className}>
      {meta.label}
    </ToneBadge>
  )
  if (!withTooltip) return badge
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          {badge}
        </span>
      </TooltipTrigger>
      <TooltipContent>{meta.description}</TooltipContent>
    </Tooltip>
  )
}

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const meta = severityMeta[severity]
  return (
    <ToneBadge tone={meta.tone} className={className}>
      {meta.label}
    </ToneBadge>
  )
}

export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const meta = taskStatusMeta[status]
  return (
    <ToneBadge tone={meta.tone} className={className}>
      {meta.label}
    </ToneBadge>
  )
}

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const meta = priorityMeta[priority]
  return (
    <ToneBadge tone={meta.tone} dot={false} className={className}>
      {meta.label}
    </ToneBadge>
  )
}

export function VerificationBadge({ status, className }: { status: VerificationStatus; className?: string }) {
  const meta = verificationMeta[status]
  return (
    <ToneBadge tone={meta.tone} className={className}>
      {meta.label}
    </ToneBadge>
  )
}
