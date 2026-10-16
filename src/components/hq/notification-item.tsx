"use client"

import { AlertOctagon, BadgeCheck, Code2, ListTodo, Microscope, Server } from "lucide-react"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/format"
import { severityMeta, toneClasses } from "@/lib/status"
import type { Notification } from "@/lib/types"
import { SeverityBadge } from "./status-badge"

const categoryIcon: Record<Notification["category"], typeof Server> = {
  incident: AlertOctagon,
  approval: BadgeCheck,
  task: ListTodo,
  research: Microscope,
  development: Code2,
  system: Server,
}

export function NotificationItem({
  notification,
  selected,
  read,
  onSelect,
  scopeLabel,
  className,
}: {
  notification: Notification
  selected?: boolean
  /** Local read state overrides the record's value. */
  read?: boolean
  onSelect?: () => void
  scopeLabel?: string
  className?: string
}) {
  const Icon = categoryIcon[notification.category]
  const tone = severityMeta[notification.severity].tone
  const isRead = read ?? notification.read
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full min-w-0 gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        selected && "bg-accent",
        className
      )}
    >
      <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md", toneClasses[tone].bg, toneClasses[tone].text)}>
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className={cn("line-clamp-1 text-sm", isRead ? "text-foreground/80" : "font-medium")}>{notification.title}</span>
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground tabular">
            {timeAgo(notification.createdAt)}
            {!isRead && <span className="size-1.5 rounded-full bg-brand" aria-label="Unread" />}
          </span>
        </span>
        <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">{notification.body}</span>
        <span className="mt-1.5 flex items-center gap-1.5">
          <SeverityBadge severity={notification.severity} />
          {scopeLabel && <span className="text-[11px] text-muted-foreground">{scopeLabel}</span>}
        </span>
      </span>
    </button>
  )
}
