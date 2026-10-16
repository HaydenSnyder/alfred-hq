import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { DemoDataIndicator } from "./demo-data-indicator"

export interface Crumb {
  label: string
  href?: string
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  icon,
  demo = true,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  breadcrumbs?: Crumb[]
  actions?: React.ReactNode
  icon?: React.ReactNode
  /** Show the demo-data badge next to the title. */
  demo?: boolean
  className?: string
}) {
  return (
    <header className={cn("flex flex-col gap-3 pb-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0 space-y-1.5">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {breadcrumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex items-center gap-1">
                {c.href ? (
                  <Link href={c.href} className="hover:text-foreground">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-foreground/80">{c.label}</span>
                )}
                {i < breadcrumbs.length - 1 && <ChevronRight className="size-3" aria-hidden />}
              </span>
            ))}
          </nav>
        )}
        <div className="flex flex-wrap items-center gap-2.5">
          {icon}
          <h1 className="text-xl font-semibold tracking-tight text-balance md:text-2xl">{title}</h1>
          {demo && <DemoDataIndicator />}
        </div>
        {description && <p className="max-w-2xl text-sm text-muted-foreground text-pretty">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
