"use client"

import { CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { severityMeta, toneClasses } from "@/lib/status"
import type { Notification, Severity } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export const severityOrder: Severity[] = ["critical", "high", "medium", "low", "info"]
export const categoryOrder: Notification["category"][] = ["incident", "approval", "task", "research", "development", "system"]
export const categoryLabel: Record<Notification["category"], string> = {
  incident: "Incidents",
  approval: "Approvals",
  task: "Tasks",
  research: "Research",
  development: "Development",
  system: "System",
}

export interface InboxFilterState {
  severities: Severity[]
  category: Notification["category"] | "all"
  unreadOnly: boolean
}

export const defaultInboxFilters: InboxFilterState = { severities: [], category: "all", unreadOnly: false }

export function InboxFilters({
  value,
  onChange,
  counts,
  unreadCount,
  onMarkAllRead,
}: {
  value: InboxFilterState
  onChange: (next: InboxFilterState) => void
  counts: Record<Severity, number>
  unreadCount: number
  onMarkAllRead: () => void
}) {
  const toggleSeverity = (s: Severity) =>
    onChange({
      ...value,
      severities: value.severities.includes(s) ? value.severities.filter((x) => x !== s) : [...value.severities, s],
    })

  return (
    <div className="space-y-3">
      <div role="group" aria-label="Filter by severity" className="flex flex-wrap gap-1.5">
        <button
          type="button"
          aria-pressed={value.severities.length === 0}
          onClick={() => onChange({ ...value, severities: [] })}
          className={cn(
            "inline-flex h-7 items-center rounded-full border px-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            value.severities.length === 0 ? "border-foreground/20 bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60"
          )}
        >
          All severities
        </button>
        {severityOrder.map((s) => {
          const on = value.severities.includes(s)
          const tone = toneClasses[severityMeta[s].tone]
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => toggleSeverity(s)}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                on ? cn(tone.bg, tone.border, tone.text) : "text-muted-foreground hover:bg-accent/60"
              )}
            >
              <span className={cn("size-1.5 rounded-full", tone.dot)} aria-hidden />
              {severityMeta[s].label}
              <span className="tabular opacity-70">{counts[s]}</span>
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Select value={value.category} onValueChange={(v) => onChange({ ...value, category: v as InboxFilterState["category"] })}>
          <SelectTrigger size="sm" className="w-40" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoryOrder.map((c) => (
              <SelectItem key={c} value={c}>
                {categoryLabel[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch id="inbox-unread-only" size="sm" checked={value.unreadOnly} onCheckedChange={(v) => onChange({ ...value, unreadOnly: v })} />
          <Label htmlFor="inbox-unread-only" className="text-xs font-normal">
            Unread only
          </Label>
        </div>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={onMarkAllRead} disabled={unreadCount === 0}>
          <CheckCheck /> Mark all read <span className="text-[11px] text-muted-foreground">(local)</span>
        </Button>
      </div>
    </div>
  )
}
