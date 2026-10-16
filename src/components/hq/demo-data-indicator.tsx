import { FlaskConical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const EXPLANATION =
  "Illustrative demo records generated in the browser. Nothing here reflects real Alfred execution or monitoring results, and no live systems are connected."

/**
 * Marks mock operational data. Every surface that renders demo records must
 * show one of these variants.
 */
export function DemoDataIndicator({
  variant = "badge",
  label = "Demo data",
  className,
}: {
  variant?: "badge" | "pill" | "banner" | "inline"
  label?: string
  className?: string
}) {
  if (variant === "banner") {
    return (
      <div
        role="note"
        className={cn(
          "flex items-start gap-2.5 rounded-lg border border-status-warning/25 bg-status-warning/[0.07] px-3 py-2 text-xs text-foreground/85",
          className
        )}
      >
        <FlaskConical className="mt-0.5 size-3.5 shrink-0 text-status-warning" aria-hidden />
        <p>
          <span className="font-medium text-foreground">Prototype with demo data.</span> {EXPLANATION}
        </p>
      </div>
    )
  }

  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium text-status-warning", className)}>
        <FlaskConical className="size-3" aria-hidden />
        {label}
      </span>
    )
  }

  const content = (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-status-warning/30 bg-status-warning/10 font-medium text-status-warning",
        variant === "pill" ? "h-7 px-2.5 text-xs" : "h-5 px-2 text-[11px]",
        className
      )}
    >
      <FlaskConical className={variant === "pill" ? "size-3.5" : "size-3"} aria-hidden />
      {label}
    </span>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          {content}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-72">{EXPLANATION}</TooltipContent>
    </Tooltip>
  )
}
