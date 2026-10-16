import Link from "next/link"
import { cn } from "@/lib/utils"
import { toneClasses, type Tone } from "@/lib/status"

export function MetricCard({
  label,
  value,
  hint,
  icon,
  tone,
  href,
  footer,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: React.ReactNode
  /** Accent the value when the metric needs attention. */
  tone?: Tone
  href?: string
  footer?: React.ReactNode
  className?: string
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="truncate">{label}</span>
        {icon && <span className="[&_svg]:size-3.5">{icon}</span>}
      </div>
      <div className={cn("mt-2 text-2xl font-semibold tracking-tight tabular", tone && toneClasses[tone].text)}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
      {footer && <div className="mt-3">{footer}</div>}
    </>
  )
  const classes = cn(
    "block min-w-0 rounded-xl border bg-card p-4 transition-colors",
    href && "hover:border-foreground/15 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
    className
  )
  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  )
}
