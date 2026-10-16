import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

/** Standard bordered surface used for dashboard widgets and detail sections. */
export function Panel({
  title,
  description,
  href,
  hrefLabel = "View all",
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  href?: string
  hrefLabel?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}) {
  const hasHeader = title || actions || href
  return (
    <section className={cn("flex min-w-0 flex-col rounded-xl border bg-card", className)}>
      {hasHeader && (
        <div className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-2">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-medium">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {actions}
            {href && (
              <Link
                href={href}
                className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {hrefLabel}
                <ArrowUpRight className="size-3" />
              </Link>
            )}
          </div>
        </div>
      )}
      <div className={cn("min-w-0 flex-1 px-4 pb-4", !hasHeader && "pt-4", bodyClassName)}>{children}</div>
    </section>
  )
}

/** Label / value pair grid used in inspectors and detail pages. */
export function PropertyList({ items, className }: { items: { label: string; value: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-4 gap-y-2 text-sm", className)}>
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
