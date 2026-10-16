"use client"

import { useMemo, useState } from "react"
import { Inbox, MousePointerClick } from "lucide-react"
import { scopeLabel } from "@/lib/format"
import type { Company, Notification, Severity } from "@/lib/types"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { NotificationItem } from "@/components/hq/notification-item"
import { EmptyState } from "@/components/hq/states"
import { defaultInboxFilters, InboxFilters, severityOrder, type InboxFilterState } from "./inbox-filters"
import { NotificationDetail } from "./notification-detail"
import type { RecordIndex } from "./record-index"

export function InboxTab({
  notifications,
  companies,
  index,
  isRead,
  setRead,
  markAllRead,
}: {
  notifications: Notification[]
  companies: Company[]
  index: RecordIndex
  isRead: (n: Notification) => boolean
  setRead: (id: string, read: boolean) => void
  markAllRead: (ids: string[]) => void
}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [filters, setFilters] = useState<InboxFilterState>(defaultInboxFilters)
  const [selectedId, setSelectedId] = useState<string | undefined>()

  const sorted = useMemo(() => [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [notifications])

  const counts = useMemo(() => {
    const c = Object.fromEntries(severityOrder.map((s) => [s, 0])) as Record<Severity, number>
    for (const n of sorted) c[n.severity]++
    return c
  }, [sorted])

  const filtered = sorted.filter(
    (n) =>
      (filters.severities.length === 0 || filters.severities.includes(n.severity)) &&
      (filters.category === "all" || n.category === filters.category) &&
      (!filters.unreadOnly || !isRead(n))
  )
  const unread = sorted.filter((n) => !isRead(n))
  const selected = sorted.find((n) => n.id === selectedId)

  const select = (n: Notification) => {
    setSelectedId(n.id)
    if (!isRead(n)) setRead(n.id, true)
  }

  const filtersActive = filters.severities.length > 0 || filters.category !== "all" || filters.unreadOnly

  const detail = selected ? (
    <NotificationDetail
      notification={selected}
      read={isRead(selected)}
      onToggleRead={() => setRead(selected.id, !isRead(selected))}
      index={index}
      companies={companies}
    />
  ) : null

  return (
    <div className="space-y-4">
      <InboxFilters
        value={filters}
        onChange={setFilters}
        counts={counts}
        unreadCount={unread.length}
        onMarkAllRead={() => markAllRead(unread.map((n) => n.id))}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <section aria-label="Notifications" className="min-w-0 rounded-xl border bg-card">
          <div className="flex items-center justify-between gap-2 border-b px-3 py-2 text-xs text-muted-foreground">
            <span className="tabular">
              {filtered.length} of {sorted.length} shown
            </span>
            <span className="tabular">{unread.length} unread</span>
          </div>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Inbox className="size-4" />}
              title={sorted.length === 0 ? "Inbox is empty" : "No notifications match"}
              description={sorted.length === 0 ? "Nothing has been recorded in this company context." : "Try clearing a filter."}
              action={
                filtersActive ? (
                  <Button variant="outline" size="sm" onClick={() => setFilters(defaultInboxFilters)}>
                    Clear filters
                  </Button>
                ) : undefined
              }
              className="m-3 border-none"
            />
          ) : (
            <ul className="space-y-0.5 p-1.5">
              {filtered.map((n) => (
                <li key={n.id}>
                  <NotificationItem
                    notification={n}
                    read={isRead(n)}
                    selected={n.id === selectedId}
                    onSelect={() => select(n)}
                    scopeLabel={scopeLabel(n.scope, companies)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {isDesktop && (
          <section aria-label="Notification detail" className="min-w-0 self-start rounded-xl border bg-card p-5 lg:sticky lg:top-0">
            {detail ?? (
              <EmptyState
                icon={<MousePointerClick className="size-4" />}
                title="Select a notification"
                description="Its full message, linked records and delivery channels appear here."
                className="border-none"
              />
            )}
          </section>
        )}
      </div>

      {!isDesktop && (
        <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(undefined)}>
          <SheetContent side="right" className="gap-0 overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
            <SheetHeader className="border-b pr-12">
              <SheetTitle>Notification</SheetTitle>
              <SheetDescription className="text-xs">Demo record · read state is local</SheetDescription>
            </SheetHeader>
            <div className="p-4 pb-safe">{detail}</div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
