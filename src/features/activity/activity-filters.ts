import { DEMO_NOW } from "@/lib/data/mock/clock"
import type { Agent, OperationalEvent, OperationalEventType, Severity } from "@/lib/types"
import { eventTypeMeta } from "@/components/hq/event-timeline"

export type DateRange = "today" | "7d" | "30d" | "all"

export const dateRangeLabel: Record<DateRange, string> = {
  today: "Today",
  "7d": "7 days",
  "30d": "30 days",
  all: "All time",
}

export interface ActivityFilters {
  text: string
  range: DateRange
  /** "all" | "global" | "personal" | company id */
  scope: string
  agentId: string
  type: OperationalEventType | "all"
  severity: Severity | "all"
}

export const defaultActivityFilters: ActivityFilters = {
  text: "",
  range: "all",
  scope: "all",
  agentId: "all",
  type: "all",
  severity: "all",
}

const DAY = 86_400_000

function dayKey(iso: string) {
  return iso.slice(0, 10)
}

function inRange(at: string, range: DateRange): boolean {
  if (range === "all") return true
  if (range === "today") return dayKey(at) === dayKey(DEMO_NOW.toISOString())
  const days = range === "7d" ? 7 : 30
  return new Date(at).getTime() >= DEMO_NOW.getTime() - days * DAY
}

function scopeMatches(e: OperationalEvent, scope: string): boolean {
  if (scope === "all") return true
  if (scope === "global" || scope === "personal") return e.scope.kind === scope
  return e.scope.kind === "company" && e.scope.companyId === scope
}

export function applyActivityFilters(events: OperationalEvent[], f: ActivityFilters, agentById: Map<string, Agent>): OperationalEvent[] {
  const text = f.text.trim().toLowerCase()
  return events.filter((e) => {
    if (!inRange(e.at, f.range)) return false
    if (!scopeMatches(e, f.scope)) return false
    if (f.agentId !== "all" && e.agentId !== f.agentId) return false
    if (f.type !== "all" && e.type !== f.type) return false
    if (f.severity !== "all" && e.severity !== f.severity) return false
    if (text) {
      const agent = e.agentId ? agentById.get(e.agentId)?.name ?? "" : ""
      const hay = `${e.title} ${e.detail ?? ""} ${agent} ${eventTypeMeta[e.type].label}`.toLowerCase()
      if (!hay.includes(text)) return false
    }
    return true
  })
}

export function activeFilterCount(f: ActivityFilters): number {
  return (
    (f.text.trim() ? 1 : 0) +
    (f.range !== "all" ? 1 : 0) +
    (f.scope !== "all" ? 1 : 0) +
    (f.agentId !== "all" ? 1 : 0) +
    (f.type !== "all" ? 1 : 0) +
    (f.severity !== "all" ? 1 : 0)
  )
}

export interface DayGroup {
  key: string
  label: string
  sublabel: string
  events: OperationalEvent[]
}

/** Groups newest-first events by UTC calendar day, relative to the demo clock. */
export function groupByDay(events: OperationalEvent[]): DayGroup[] {
  const sorted = [...events].sort((a, b) => b.at.localeCompare(a.at))
  const today = dayKey(DEMO_NOW.toISOString())
  const yesterday = dayKey(new Date(DEMO_NOW.getTime() - DAY).toISOString())
  const groups: DayGroup[] = []
  for (const e of sorted) {
    const key = dayKey(e.at)
    let g = groups[groups.length - 1]
    if (!g || g.key !== key) {
      const date = new Date(`${key}T00:00:00.000Z`)
      const full = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })
      g = {
        key,
        label: key === today ? "Today" : key === yesterday ? "Yesterday" : full,
        sublabel: key === today || key === yesterday ? full : date.toLocaleDateString("en-US", { year: "numeric", timeZone: "UTC" }),
        events: [],
      }
      groups.push(g)
    }
    g.events.push(e)
  }
  return groups
}
