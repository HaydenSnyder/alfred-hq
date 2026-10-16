import { DEMO_NOW } from "@/lib/data/mock/clock"
import type { CompanyContext } from "@/components/providers/hq-store"
import type { Budget, UsageRecord } from "@/lib/types"

export type UsageCategory = UsageRecord["category"]
export type RangeKey = "7d" | "30d"

export const RANGE_DAYS: Record<RangeKey, number> = { "7d": 7, "30d": 30 }

/** Fixed category order + chart token. Color follows the category, never its rank. */
export const CATEGORY_META: Record<UsageCategory, { label: string; color: string }> = {
  model: { label: "AI models", color: "var(--chart-1)" },
  api: { label: "External APIs", color: "var(--chart-2)" },
  infrastructure: { label: "Infrastructure", color: "var(--chart-3)" },
}
export const CATEGORY_ORDER: UsageCategory[] = ["infrastructure", "api", "model"]

const DAY_MS = 86_400_000
const today = DEMO_NOW.toISOString().slice(0, 10)

export function dayKey(offsetDays: number): string {
  return new Date(DEMO_NOW.getTime() - offsetDays * DAY_MS).toISOString().slice(0, 10)
}

/** Usage rows without a company id belong to Alfred core / personal work (incl. shared API & hosting). */
export function inUsageContext(row: UsageRecord, ctx: CompanyContext): boolean {
  if (ctx === "all") return true
  if (ctx === "personal") return !row.companyId
  return row.companyId === ctx
}

export function inRange(row: UsageRecord, range: RangeKey): boolean {
  return row.date >= dayKey(RANGE_DAYS[range] - 1) && row.date <= today
}

export function sum(rows: UsageRecord[], pick: (r: UsageRecord) => number = (r) => r.costUsd): number {
  let total = 0
  for (const r of rows) total += pick(r)
  return total
}

export function totalsByCategory(rows: UsageRecord[]): Record<UsageCategory, number> {
  const out: Record<UsageCategory, number> = { model: 0, api: 0, infrastructure: 0 }
  for (const r of rows) out[r.category] += r.costUsd
  return out
}

export interface DailyPoint {
  date: string
  label: string
  model: number
  api: number
  infrastructure: number
  total: number
}

export function dailySeries(rows: UsageRecord[], range: RangeKey): DailyPoint[] {
  const days = RANGE_DAYS[range]
  const byDate = new Map<string, DailyPoint>()
  for (let i = days - 1; i >= 0; i--) {
    const date = dayKey(i)
    byDate.set(date, { date, label: shortDate(date), model: 0, api: 0, infrastructure: 0, total: 0 })
  }
  for (const r of rows) {
    const p = byDate.get(r.date)
    if (!p) continue
    p[r.category] += r.costUsd
    p.total += r.costUsd
  }
  return [...byDate.values()].map((p) => ({
    ...p,
    model: round2(p.model),
    api: round2(p.api),
    infrastructure: round2(p.infrastructure),
    total: round2(p.total),
  }))
}

export interface ModelPoint {
  model: string
  cost: number
  inputTokens: number
  outputTokens: number
  share: number
}

export function modelBreakdown(rows: UsageRecord[]): ModelPoint[] {
  const modelRows = rows.filter((r) => r.category === "model")
  const total = sum(modelRows)
  const map = new Map<string, ModelPoint>()
  for (const r of modelRows) {
    const m = map.get(r.model) ?? { model: r.model, cost: 0, inputTokens: 0, outputTokens: 0, share: 0 }
    m.cost += r.costUsd
    m.inputTokens += r.inputTokens
    m.outputTokens += r.outputTokens
    map.set(r.model, m)
  }
  return [...map.values()]
    .map((m) => ({ ...m, cost: round2(m.cost), share: total ? m.cost / total : 0 }))
    .sort((a, b) => b.cost - a.cost)
}

export interface AgentUsage {
  agentId: string
  companyId?: string
  model: string
  inputTokens: number
  outputTokens: number
  cost: number
  share: number
}

export function agentBreakdown(rows: UsageRecord[]): AgentUsage[] {
  const modelRows = rows.filter((r) => r.category === "model" && r.agentId)
  const total = sum(modelRows)
  const map = new Map<string, AgentUsage>()
  for (const r of modelRows) {
    const id = r.agentId as string
    const a = map.get(id) ?? { agentId: id, companyId: r.companyId, model: r.model, inputTokens: 0, outputTokens: 0, cost: 0, share: 0 }
    a.inputTokens += r.inputTokens
    a.outputTokens += r.outputTokens
    a.cost += r.costUsd
    map.set(id, a)
  }
  return [...map.values()].map((a) => ({ ...a, cost: round2(a.cost), share: total ? a.cost / total : 0 }))
}

export interface CompanyUsage {
  /** Company id, or "core" for Alfred core / personal. */
  key: string
  cost: number
  share: number
}

export function companyBreakdown(rows: UsageRecord[]): CompanyUsage[] {
  const total = sum(rows)
  const map = new Map<string, number>()
  for (const r of rows) {
    const key = r.companyId ?? "core"
    map.set(key, (map.get(key) ?? 0) + r.costUsd)
  }
  return [...map.entries()]
    .map(([key, cost]) => ({ key, cost: round2(cost), share: total ? cost / total : 0 }))
    .sort((a, b) => b.cost - a.cost)
}

/** Month-to-date spend plus the trailing 7-day daily average for the remaining days. */
export function projectMonthEnd(rows: UsageRecord[]): { monthToDate: number; projected: number; daysElapsed: number; daysInMonth: number } {
  const monthPrefix = today.slice(0, 7)
  const monthToDate = sum(rows.filter((r) => r.date.startsWith(monthPrefix) && r.date <= today))
  const trailing = sum(rows.filter((r) => r.date >= dayKey(6) && r.date <= today)) / 7
  const daysElapsed = DEMO_NOW.getUTCDate()
  const daysInMonth = new Date(Date.UTC(DEMO_NOW.getUTCFullYear(), DEMO_NOW.getUTCMonth() + 1, 0)).getUTCDate()
  return { monthToDate, projected: monthToDate + trailing * (daysInMonth - daysElapsed), daysElapsed, daysInMonth }
}

export function budgetRows(budget: Budget, rows: UsageRecord[]): UsageRecord[] {
  const s = budget.scope
  if (s.kind === "global") return rows
  if (s.kind === "personal") return rows.filter((r) => !r.companyId)
  return rows.filter((r) => r.companyId === s.companyId)
}

export function budgetVisible(budget: Budget, ctx: CompanyContext): boolean {
  if (ctx === "all") return true
  if (ctx === "personal") return budget.scope.kind !== "company"
  return budget.scope.kind === "company" && budget.scope.companyId === ctx
}

export function shortDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
}

export function formatPct(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}
