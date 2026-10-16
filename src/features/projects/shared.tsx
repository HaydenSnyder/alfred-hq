"use client"

import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { toneClasses, type Tone } from "@/lib/status"
import type { Project, Scope } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ToneBadge } from "@/components/hq/status-badge"

export const DEMO_DISABLED_REASON = "Disabled in prototype — no live connection"

export const projectStatusMeta: Record<Project["status"], { label: string; tone: Tone }> = {
  planning: { label: "Planning", tone: "neutral" },
  active: { label: "Active", tone: "info" },
  paused: { label: "Paused", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
}

export const projectKindLabel: Record<Project["kind"], string> = {
  general: "General",
  development: "Development",
  research: "Research",
}

export function ProjectStatusBadge({ status, className }: { status: Project["status"]; className?: string }) {
  const meta = projectStatusMeta[status]
  return (
    <ToneBadge tone={meta.tone} className={className}>
      {meta.label}
    </ToneBadge>
  )
}

/** Compact progress bar with a percentage label. */
export function ProgressBar({ value, className, showLabel = true }: { value: number; className?: string; showLabel?: boolean }) {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="h-1.5 min-w-12 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress"
      >
        <div className={cn("h-full rounded-full", v >= 100 ? toneClasses.success.dot : "bg-brand")} style={{ width: `${v}%` }} />
      </div>
      {showLabel && <span className="w-9 shrink-0 text-right text-xs text-muted-foreground tabular">{v}%</span>}
    </div>
  )
}

/**
 * A control that would perform a real action. Always disabled in the
 * prototype, with an explanatory tooltip.
 */
export function DemoOnlyButton({
  children,
  variant = "outline",
  size = "sm",
  reason = DEMO_DISABLED_REASON,
  className,
}: {
  children: React.ReactNode
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "sm" | "default" | "xs"
  reason?: string
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Wrapper keeps the tooltip reachable while the button is disabled. */}
        <span tabIndex={0} className="inline-flex rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          <Button variant={variant} size={size} disabled aria-disabled className={className}>
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{reason}</TooltipContent>
    </Tooltip>
  )
}

export function demoActionToast() {
  toast("Demo action — nothing was executed")
}

/** Small scope chip (Personal / company short name / Global). */
export function ScopeChip({ label, className }: { label: string; scope?: Scope; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 items-center rounded-md border px-1.5 text-[11px] text-muted-foreground whitespace-nowrap", className)}>
      {label}
    </span>
  )
}

/** Shared compact filter row wrapper. */
export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-2", className)}>{children}</div>
}

export interface FilterOption {
  value: string
  label: string
}

/** Labelled select used by list filters. "all" is the conventional reset value. */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: FilterOption[]
  className?: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" aria-label={label} className={cn("min-w-0 max-w-full", className)}>
        <span className="text-muted-foreground">{label}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Segmented list/board switch. */
export function LayoutToggle({
  value,
  onChange,
  options,
  label = "Layout",
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; icon?: React.ReactNode }[]
  label?: string
}) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      spacing={0}
      value={value}
      onValueChange={(v) => v && onChange(v)}
      aria-label={label}
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
          {o.icon}
          <span className={cn(o.icon && "hidden sm:inline")}>{o.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
