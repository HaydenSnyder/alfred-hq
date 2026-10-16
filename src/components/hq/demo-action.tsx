"use client"

import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export const DEMO_DISABLED_REASON = "Disabled in prototype — no live connection"

/**
 * A control that would act on a real system (approve, restart, deploy…).
 * Always rendered disabled in this phase, with a tooltip explaining why. The
 * wrapper stays focusable so keyboard and screen-reader users can discover the
 * explanation.
 */
export function DemoActionButton({
  children,
  label,
  reason = DEMO_DISABLED_REASON,
  variant = "outline",
  size = "sm",
  className,
}: {
  children: React.ReactNode
  /** Accessible name, e.g. "Restart Photon". Defaults to string children. */
  label?: string
  reason?: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
}) {
  const name = label ?? (typeof children === "string" ? children : "Action")
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          role="button"
          aria-disabled="true"
          aria-label={`${name} — ${reason}`}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className="inline-flex cursor-not-allowed rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Button type="button" variant={variant} size={size} disabled tabIndex={-1} aria-hidden className={cn(className)}>
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">{reason}</TooltipContent>
    </Tooltip>
  )
}

export function demoActionToast() {
  toast("Demo action — nothing was executed")
}
