"use client"

import { AlertTriangle, CircleSlash, Inbox, RefreshCw, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { QueryState } from "@/lib/data/use-hq-query"

export function EmptyState({
  title = "Nothing here yet",
  description,
  icon,
  action,
  className,
}: {
  title?: string
  description?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center", className)}>
      <div className="mb-1 flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="size-4" />}
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="max-w-sm text-xs text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function ErrorState({
  error,
  offline,
  onRetry,
  className,
}: {
  error?: Error
  offline?: boolean
  onRetry?: () => void
  className?: string
}) {
  const Icon = offline ? WifiOff : AlertTriangle
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border px-6 py-10 text-center",
        offline ? "border-border bg-muted/30" : "border-status-danger/25 bg-status-danger/[0.05]",
        className
      )}
    >
      <div
        className={cn(
          "mb-1 flex size-9 items-center justify-center rounded-full",
          offline ? "bg-muted text-muted-foreground" : "bg-status-danger/10 text-status-danger"
        )}
      >
        <Icon className="size-4" />
      </div>
      <p className="text-sm font-medium">{offline ? "Data source offline" : "Couldn't load this data"}</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        {error?.message ?? "An unexpected error occurred."} Status values are shown as unknown until the source responds.
      </p>
      {onRetry && (
        <Button size="sm" variant="outline" className="mt-2" onClick={onRetry}>
          <RefreshCw /> Retry
        </Button>
      )}
    </div>
  )
}

export function UnknownState({ title = "No verified data", description, className }: { title?: string; description?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground", className)}>
      <CircleSlash className="size-3.5 shrink-0" />
      <span>
        <span className="font-medium text-foreground/80">{title}.</span> {description ?? "Status is unknown, not assumed healthy."}
      </span>
    </div>
  )
}

export function LoadingState({
  variant = "list",
  rows = 4,
  className,
}: {
  variant?: "list" | "cards" | "detail" | "metrics"
  rows?: number
  className?: string
}) {
  if (variant === "metrics") {
    return (
      <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)} aria-busy aria-label="Loading">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }
  if (variant === "cards") {
    return (
      <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3", className)} aria-busy aria-label="Loading">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    )
  }
  if (variant === "detail") {
    return (
      <div className={cn("space-y-4", className)} aria-busy aria-label="Loading">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <div className="grid gap-3 md:grid-cols-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }
  return (
    <div className={cn("space-y-2", className)} aria-busy aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-12 rounded-lg" />
      ))}
    </div>
  )
}

/**
 * Renders the right state for a query: loading skeleton, error/offline,
 * empty, or the content. Keeps every screen's state handling consistent.
 */
export function QueryView<T>({
  query,
  loading,
  empty,
  isEmpty,
  children,
}: {
  query: QueryState<T> & { refetch?: () => void }
  loading?: React.ReactNode
  empty?: React.ReactNode
  isEmpty?: (data: T) => boolean
  children: (data: T) => React.ReactNode
}) {
  if (query.status === "loading") return <>{loading ?? <LoadingState />}</>
  if (query.status === "error" || query.status === "offline")
    return <ErrorState error={query.error} offline={query.status === "offline"} onRetry={query.refetch} />
  const data = query.data
  const emptyCheck = isEmpty ?? ((d: T) => Array.isArray(d) && d.length === 0)
  if (data === undefined || emptyCheck(data))
    return <>{empty ?? <EmptyState title="No records" description="The data source returned no records." />}</>
  return <>{children(data)}</>
}
