"use client"

import { cn } from "@/lib/utils"
import { inCompanyContext } from "@/lib/format"
import type { Scope } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export const PROTOTYPE_DISABLED_REASON = "Disabled in prototype — no live connection"

/**
 * A control that would act on a real system. Always rendered disabled, with
 * a tooltip explaining why. The wrapper stays focusable so keyboard and
 * screen-reader users can discover the explanation.
 */
export function DisabledAction({
  children,
  label,
  reason = PROTOTYPE_DISABLED_REASON,
  variant = "outline",
  size = "sm",
  className,
}: {
  children: React.ReactNode
  /** Accessible name for the action, e.g. "Restart Photon". */
  label: string
  reason?: string
  variant?: "outline" | "default" | "secondary" | "ghost" | "destructive"
  size?: "xs" | "sm" | "default"
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          role="button"
          aria-disabled="true"
          aria-label={`${label} — ${reason}`}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className={cn("inline-flex cursor-not-allowed rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50", className)}
        >
          <Button type="button" variant={variant} size={size} disabled tabIndex={-1} aria-hidden className="w-full">
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">{reason}</TooltipContent>
    </Tooltip>
  )
}

/**
 * Operational records scoped `global` stay visible in every company context
 * (a Photon outage matters regardless of which company is selected).
 */
export function visibleInContext(scope: Scope, ctx: string): boolean {
  return scope.kind === "global" || inCompanyContext(scope, ctx)
}
