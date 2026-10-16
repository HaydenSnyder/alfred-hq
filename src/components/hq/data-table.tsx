"use client"

import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "./states"

export interface DataTableColumn<T> {
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  /** Enables sorting on this column. */
  sortValue?: (row: T) => string | number | undefined
  className?: string
  headerClassName?: string
  /** Hidden below the `md` breakpoint (table layout) and omitted from fallback cards. */
  hideOnMobile?: boolean
  align?: "left" | "right"
}

type SortState = { id: string; dir: "asc" | "desc" } | undefined

/**
 * Generic typed table with sortable headers and row activation.
 *
 * `mobile="scroll"` keeps the table and scrolls horizontally inside its own
 * bordered container; `mobile="cards"` swaps to stacked cards below `md`.
 */
export function DataTable<T>({
  data,
  columns,
  getRowId,
  onRowClick,
  rowLabel,
  isRowActive,
  initialSort,
  empty,
  mobile = "cards",
  renderMobileCard,
  caption,
  className,
}: {
  data: T[]
  columns: DataTableColumn<T>[]
  getRowId: (row: T) => string
  onRowClick?: (row: T) => void
  /** Accessible name for an activatable row. */
  rowLabel?: (row: T) => string
  isRowActive?: (row: T) => boolean
  initialSort?: { id: string; dir: "asc" | "desc" }
  empty?: React.ReactNode
  mobile?: "scroll" | "cards"
  renderMobileCard?: (row: T) => React.ReactNode
  caption?: string
  className?: string
}) {
  const [sort, setSort] = useState<SortState>(initialSort)

  const rows = useMemo(() => {
    if (!sort) return data
    const col = columns.find((c) => c.id === sort.id)
    if (!col?.sortValue) return data
    const get = col.sortValue
    const factor = sort.dir === "asc" ? 1 : -1
    return [...data].sort((a, b) => {
      const va = get(a)
      const vb = get(b)
      if (va === vb) return 0
      if (va === undefined) return 1
      if (vb === undefined) return -1
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * factor
      return String(va).localeCompare(String(vb)) * factor
    })
  }, [data, columns, sort])

  const toggleSort = (id: string) =>
    setSort((s) => (s?.id !== id ? { id, dir: "asc" } : s.dir === "asc" ? { id, dir: "desc" } : undefined))

  if (data.length === 0) return <>{empty ?? <EmptyState title="No records" description="Nothing matches the current filters." />}</>

  const activate = (row: T) => onRowClick?.(row)
  const onKey = (e: React.KeyboardEvent, row: T) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      activate(row)
    }
  }

  return (
    <div className={cn("min-w-0", className)}>
      <div
        className={cn(
          "scrollbar-thin overflow-x-auto rounded-xl border bg-card",
          mobile === "cards" && "hidden md:block"
        )}
      >
        <table className="w-full caption-bottom text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b">
              {columns.map((col) => {
                const active = sort?.id === col.id
                const ariaSort = active ? (sort.dir === "asc" ? "ascending" : "descending") : col.sortValue ? "none" : undefined
                return (
                  <th
                    key={col.id}
                    scope="col"
                    aria-sort={ariaSort}
                    className={cn(
                      "h-9 px-3 text-left text-xs font-medium whitespace-nowrap text-muted-foreground",
                      col.align === "right" && "text-right",
                      col.hideOnMobile && mobile === "scroll" && "hidden md:table-cell",
                      col.headerClassName
                    )}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.id)}
                        className={cn(
                          "-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                          active && "text-foreground"
                        )}
                      >
                        {col.header}
                        {active ? (
                          sort.dir === "asc" ? (
                            <ArrowUp className="size-3" aria-hidden />
                          ) : (
                            <ArrowDown className="size-3" aria-hidden />
                          )
                        ) : (
                          <ChevronsUpDown className="size-3 opacity-50" aria-hidden />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const clickable = !!onRowClick
              const activeRow = isRowActive?.(row)
              return (
                <tr
                  key={getRowId(row)}
                  onClick={clickable ? () => activate(row) : undefined}
                  onKeyDown={clickable ? (e) => onKey(e, row) : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  aria-label={clickable ? rowLabel?.(row) : undefined}
                  className={cn(
                    "border-b transition-colors last:border-0",
                    clickable &&
                      "cursor-pointer hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset",
                    activeRow && "bg-surface-2"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        "px-3 py-2.5 align-middle",
                        col.align === "right" && "text-right",
                        col.hideOnMobile && mobile === "scroll" && "hidden md:table-cell",
                        col.className
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {mobile === "cards" && (
        <ul className="space-y-2 md:hidden">
          {rows.map((row) => {
            const body = renderMobileCard ? (
              renderMobileCard(row)
            ) : (
              <dl className="grid grid-cols-[minmax(5.5rem,auto)_1fr] gap-x-3 gap-y-1.5 text-sm">
                {columns
                  .filter((c) => !c.hideOnMobile)
                  .map((col) => (
                    <div key={col.id} className="contents">
                      <dt className="text-xs text-muted-foreground">{col.header}</dt>
                      <dd className="min-w-0 break-words">{col.cell(row)}</dd>
                    </div>
                  ))}
              </dl>
            )
            return (
              <li key={getRowId(row)}>
                {onRowClick ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => activate(row)}
                    onKeyDown={(e) => onKey(e, row)}
                    aria-label={rowLabel?.(row)}
                    className={cn(
                      "block w-full cursor-pointer rounded-xl border bg-card p-3 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      isRowActive?.(row) && "border-foreground/20 bg-surface-2"
                    )}
                  >
                    {body}
                  </div>
                ) : (
                  <div className="rounded-xl border bg-card p-3">{body}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
