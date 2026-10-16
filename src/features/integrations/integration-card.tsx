import Link from "next/link"
import { ArrowUpRight, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime, scopeLabel, timeAgo } from "@/lib/format"
import type { Company, Integration } from "@/lib/types"
import { CompanyMark } from "@/components/hq/avatars"
import { StatusBadge, ToneBadge } from "@/components/hq/status-badge"
import { categoryMeta, modeMeta } from "./integration-meta"

export function IntegrationCard({ integration: i, company, companies }: { integration: Integration; company?: Company; companies: Company[] }) {
  const Icon = categoryMeta[i.category].icon
  const mode = modeMeta[i.mode]
  const unverified = i.status === "unknown" || i.status === "unconfigured"
  return (
    <Link
      href={`/integrations/${i.id}`}
      className={cn(
        "group flex h-full min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-foreground/15 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        unverified && "border-dashed"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-surface-2 text-foreground/80">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-sm font-medium">
            <span className="truncate">{i.provider}</span>
            <ArrowUpRight className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </p>
          <p className="truncate font-mono text-[11px] text-muted-foreground">{i.key}</p>
        </div>
        <StatusBadge status={i.status} withTooltip={false} />
      </div>

      <p className="line-clamp-2 text-xs text-muted-foreground">{i.description}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        <ToneBadge tone={mode.tone} dot={false}>
          {mode.label}
        </ToneBadge>
        <span className="inline-flex h-5 items-center gap-1.5 rounded-full border px-2 text-[11px] text-muted-foreground">
          {company && <CompanyMark company={company} size="sm" className="size-3.5 rounded-[3px] text-[7px]" />}
          {company ? company.shortName : scopeLabel(i.scope, companies)}
        </span>
      </div>

      <p className="text-xs text-foreground/80">
        <span className="text-muted-foreground">Capabilities: </span>
        {i.capabilities.slice(0, 3).join(" · ")}
        {i.capabilities.length > 3 && <span className="text-muted-foreground"> +{i.capabilities.length - 3}</span>}
      </p>

      <p
        className={cn("mt-auto flex items-center gap-1.5 border-t pt-3 text-[11px]", i.lastCheckAt ? "text-muted-foreground" : "font-medium text-foreground/70")}
        title={i.lastCheckAt ? formatDateTime(i.lastCheckAt) : undefined}
      >
        <Clock className="size-3" />
        {i.lastCheckAt ? `Last check ${timeAgo(i.lastCheckAt)}` : "Never checked"}
      </p>
    </Link>
  )
}
