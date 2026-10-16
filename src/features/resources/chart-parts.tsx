"use client"

import { cn } from "@/lib/utils"
import { formatUsd } from "@/lib/format"

/** Shared axis / grid styling so every chart reads as one system in both themes. */
export const axisTick = { fill: "var(--muted-foreground)", fontSize: 11 }
export const gridStroke = "var(--border)"

export interface TooltipRow {
  name?: unknown
  value?: unknown
  color?: string
  dataKey?: unknown
}

/** Tooltip body. Text stays in ink tokens; the swatch carries series identity. */
export function ChartTooltip({
  active,
  label,
  payload,
  labelFor,
  format = (v) => formatUsd(v, 2),
  showTotal,
}: {
  active?: boolean
  label?: unknown
  payload?: readonly TooltipRow[]
  labelFor?: (dataKey: string) => string
  format?: (v: number) => string
  showTotal?: boolean
}) {
  if (!active || !payload?.length) return null
  const rows = [...payload].reverse()
  const total = rows.reduce((acc, r) => acc + (typeof r.value === "number" ? r.value : 0), 0)
  return (
    <div className="min-w-40 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      {label != null && label !== "" && <p className="mb-1.5 font-medium">{String(label)}</p>}
      <ul className="space-y-1">
        {rows.map((r) => {
          const key = String(r.dataKey ?? r.name ?? "")
          return (
            <li key={key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-[2px]" style={{ backgroundColor: r.color }} aria-hidden />
                {labelFor ? labelFor(key) : String(r.name ?? key)}
              </span>
              <span className="tabular text-foreground">{typeof r.value === "number" ? format(r.value) : String(r.value ?? "—")}</span>
            </li>
          )
        })}
      </ul>
      {showTotal && rows.length > 1 && (
        <div className="mt-1.5 flex justify-between gap-4 border-t pt-1.5">
          <span className="text-muted-foreground">Total</span>
          <span className="tabular font-medium">{format(total)}</span>
        </div>
      )}
    </div>
  )
}

export function ChartLegend({ items, className }: { items: { label: string; color: string }[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground", className)} aria-label="Legend">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: i.color }} aria-hidden />
          {i.label}
        </li>
      ))}
    </ul>
  )
}

export function ChartCaption({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <p className={cn("mt-2 text-[11px] text-muted-foreground", className)}>
      Illustrative demo figures{children ? <> · {children}</> : null}
    </p>
  )
}
