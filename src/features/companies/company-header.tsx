"use client"

import Link from "next/link"
import { Bot, Globe, Lock, PanelRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime, timeAgo } from "@/lib/format"
import type { Agent, Company, HealthStatus } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { CompanyMark } from "@/components/hq/avatars"
import { PageHeader } from "@/components/hq/page-header"
import { StatusBadge } from "@/components/hq/status-badge"
import { Button } from "@/components/ui/button"

function ConnectionCard({
  icon,
  label,
  status,
  primary,
  lastCheckedAt,
}: {
  icon: React.ReactNode
  label: string
  status: HealthStatus
  primary: React.ReactNode
  lastCheckedAt?: string
}) {
  const unverified = status === "unknown" || status === "unconfigured"
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border bg-card p-3.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-surface-2 text-muted-foreground [&_svg]:size-4">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{label}</p>
          <StatusBadge status={status} />
        </div>
        <div className="mt-0.5 truncate text-sm">{primary}</div>
        <p className={cn("mt-0.5 text-[11px] text-muted-foreground")} title={formatDateTime(lastCheckedAt)}>
          {lastCheckedAt
            ? `Last checked ${timeAgo(lastCheckedAt)}`
            : unverified
              ? "Never checked — status unknown, not assumed healthy"
              : "No check time reported"}
        </p>
      </div>
    </div>
  )
}

export function CompanyHeader({ company, alfred }: { company: Company; alfred?: Agent }) {
  const { inspect } = useHQ()
  return (
    <div className="mb-5 space-y-4">
      <PageHeader
        className="pb-0"
        breadcrumbs={[{ label: "Companies", href: "/companies" }, { label: company.shortName }]}
        icon={<CompanyMark company={company} size="lg" />}
        title={company.name}
        description={`${company.tagline} · ${company.industry}`}
        actions={
          <>
            <StatusBadge status={company.health} />
            <Button variant="outline" size="sm" onClick={() => inspect({ kind: "company", id: company.id })}>
              <PanelRight /> Inspect
            </Button>
          </>
        }
      />

      <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="mt-px size-3 shrink-0" aria-hidden />
        Private HQ monitoring view. This is not {company.shortName}&apos;s employee-facing website — that keeps its own login and
        audience.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <ConnectionCard
          icon={<Globe />}
          label="Website connection"
          status={company.website.status}
          lastCheckedAt={company.website.lastCheckedAt}
          primary={
            company.website.url ? (
              <span className="font-mono text-xs">{company.website.url}</span>
            ) : (
              <span className="text-muted-foreground">No website configured</span>
            )
          }
        />
        <ConnectionCard
          icon={<Bot />}
          label="Company Alfred"
          status={company.companyAlfred.status}
          lastCheckedAt={company.companyAlfred.lastCheckedAt}
          primary={
            alfred ? (
              <Link href={`/agents/${alfred.id}`} className="hover:underline">
                {alfred.name}
              </Link>
            ) : (
              <span className="text-muted-foreground">No company Alfred registered</span>
            )
          }
        />
      </div>
    </div>
  )
}
