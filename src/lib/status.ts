import type { HealthStatus, Priority, Severity, TaskStatus, VerificationStatus } from "@/lib/types"

/** Tone keys map to `--status-*` CSS tokens defined in globals.css. */
export type Tone = "success" | "info" | "neutral" | "warning" | "danger" | "muted"

export const healthMeta: Record<HealthStatus, { label: string; tone: Tone; description: string }> = {
  healthy: { label: "Healthy", tone: "success", description: "Verified healthy at the last check." },
  working: { label: "Working", tone: "info", description: "Actively processing work." },
  idle: { label: "Idle", tone: "neutral", description: "Available, no active work." },
  degraded: { label: "Degraded", tone: "warning", description: "Running with reduced performance or errors." },
  offline: { label: "Offline", tone: "danger", description: "Not responding to health checks." },
  unknown: { label: "Unknown", tone: "muted", description: "No verified data. Not assumed healthy." },
  unconfigured: { label: "Unconfigured", tone: "muted", description: "Not set up or not connected yet." },
}

export const severityMeta: Record<Severity, { label: string; tone: Tone; rank: number }> = {
  critical: { label: "Critical", tone: "danger", rank: 0 },
  high: { label: "High", tone: "warning", rank: 1 },
  medium: { label: "Medium", tone: "info", rank: 2 },
  low: { label: "Low", tone: "neutral", rank: 3 },
  info: { label: "Info", tone: "muted", rank: 4 },
}

export const taskStatusMeta: Record<TaskStatus, { label: string; tone: Tone }> = {
  backlog: { label: "Backlog", tone: "muted" },
  todo: { label: "To do", tone: "neutral" },
  in_progress: { label: "In progress", tone: "info" },
  in_review: { label: "In review", tone: "info" },
  blocked: { label: "Blocked", tone: "warning" },
  done: { label: "Done", tone: "success" },
}

export const taskStatusOrder: TaskStatus[] = ["backlog", "todo", "in_progress", "in_review", "blocked", "done"]

export const priorityMeta: Record<Priority, { label: string; tone: Tone }> = {
  urgent: { label: "Urgent", tone: "danger" },
  high: { label: "High", tone: "warning" },
  medium: { label: "Medium", tone: "neutral" },
  low: { label: "Low", tone: "muted" },
}

export const verificationMeta: Record<VerificationStatus, { label: string; tone: Tone }> = {
  verified: { label: "Verified", tone: "success" },
  partially_verified: { label: "Partially verified", tone: "info" },
  unverified: { label: "Unverified", tone: "muted" },
  disputed: { label: "Disputed", tone: "danger" },
}

/** Tailwind classes per tone (foreground, subtle background, border, dot). */
export const toneClasses: Record<Tone, { text: string; bg: string; border: string; dot: string }> = {
  success: { text: "text-status-success", bg: "bg-status-success/10", border: "border-status-success/25", dot: "bg-status-success" },
  info: { text: "text-status-info", bg: "bg-status-info/10", border: "border-status-info/25", dot: "bg-status-info" },
  neutral: { text: "text-foreground/80", bg: "bg-foreground/[0.06]", border: "border-foreground/15", dot: "bg-foreground/50" },
  warning: { text: "text-status-warning", bg: "bg-status-warning/10", border: "border-status-warning/25", dot: "bg-status-warning" },
  danger: { text: "text-status-danger", bg: "bg-status-danger/10", border: "border-status-danger/25", dot: "bg-status-danger" },
  muted: { text: "text-muted-foreground", bg: "bg-muted/60", border: "border-border", dot: "bg-muted-foreground/50" },
}
