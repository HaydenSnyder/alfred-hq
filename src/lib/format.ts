import { DEMO_NOW } from "@/lib/data/mock/clock"
import type { Company, Scope } from "@/lib/types"

/**
 * Relative time against the demo clock. When a live provider is introduced,
 * pass `Date.now()`-based reference instead.
 */
export function timeAgo(iso?: string, now: Date = DEMO_NOW): string {
  if (!iso) return "never"
  const diff = now.getTime() - new Date(iso).getTime()
  const future = diff < 0
  const s = Math.abs(diff) / 1000
  let out: string
  if (s < 45) out = "just now"
  else if (s < 3600) out = `${Math.round(s / 60)}m`
  else if (s < 86400) out = `${Math.round(s / 3600)}h`
  else if (s < 86400 * 30) out = `${Math.round(s / 86400)}d`
  else out = `${Math.round(s / (86400 * 30))}mo`
  if (out === "just now") return out
  return future ? `in ${out}` : `${out} ago`
}

export function formatDateTime(iso?: string): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC"
}

export function formatDate(iso?: string): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
}

export function formatUptime(seconds?: number): string {
  if (seconds == null) return "—"
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  return d > 0 ? `${d}d ${h}h` : `${h}h`
}

export function formatUsd(value: number, digits = 0): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: digits, minimumFractionDigits: digits })
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US")
}

export function formatCompact(value: number): string {
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

export function scopeLabel(scope: Scope, companies?: Company[]): string {
  if (scope.kind === "global") return "Global"
  if (scope.kind === "personal") return "Personal"
  return companies?.find((c) => c.id === scope.companyId)?.shortName ?? "Company"
}

export function scopeCompanyId(scope: Scope): string | undefined {
  return scope.kind === "company" ? scope.companyId : undefined
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

export function titleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Whether a scoped record is visible under the selected HQ company context. */
export function inCompanyContext(scope: Scope, ctx: string): boolean {
  if (ctx === "all") return true
  if (ctx === "personal") return scope.kind === "personal" || scope.kind === "global"
  return scope.kind === "company" && scope.companyId === ctx
}

/**
 * Operational records scoped `global` stay visible in every company context
 * (a Photon outage matters whichever company is selected).
 */
export function visibleInContext(scope: Scope, ctx: string): boolean {
  return scope.kind === "global" || inCompanyContext(scope, ctx)
}
