"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const DEFAULT_REASON = "Disabled in prototype — no live connection"

/**
 * A control that would perform a real backend action. Always rendered
 * disabled, with an explanation on hover / focus.
 */
export function DemoActionButton({
  children,
  variant = "outline",
  size = "sm",
  reason = DEFAULT_REASON,
  className,
}: {
  children: React.ReactNode
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  reason?: string
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          aria-label={`${typeof children === "string" ? children : "Action"} — ${reason}`}
          className="inline-flex cursor-not-allowed rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Button variant={variant} size={size} disabled aria-disabled className={className} tabIndex={-1}>
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  )
}
