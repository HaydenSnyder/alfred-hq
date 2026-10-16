"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { formatDateTime, timeAgo } from "@/lib/format"
import type { ResearchSource } from "@/lib/types"
import { VerificationBadge } from "@/components/hq/status-badge"
import { sourceTypeMeta } from "./research-meta"

export function SourceTypeIcon({ type, className }: { type: ResearchSource["type"]; className?: string }) {
  const meta = sourceTypeMeta[type]
  const Icon = meta.icon
  return (
    <span
      className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border bg-surface-2 text-muted-foreground", className)}
      title={meta.label}
    >
      <Icon className="size-4" aria-hidden />
      <span className="sr-only">{meta.label}</span>
    </span>
  )
}

/**
 * A collected source. URLs are shown as plain text references; the prototype
 * never links out to sources.
 */
export function SourceCard({
  source,
  record,
  className,
}: {
  source: ResearchSource
  /** Parent record, shown as a link when rendering sources across records. */
  record?: { id: string; title: string }
  className?: string
}) {
  return (
    <div className={cn("flex h-full min-w-0 gap-3 rounded-lg border bg-card p-3", className)}>
      <SourceTypeIcon type={source.type} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm leading-snug">{source.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {sourceTypeMeta[source.type].label} · {source.publisher}
        </p>
        {source.url && <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground/80">{source.url.replace(/^https?:\/\//, "")}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <VerificationBadge status={source.verification} />
          <span className="text-[11px] text-muted-foreground" title={formatDateTime(source.collectedAt)}>
            Collected {timeAgo(source.collectedAt)}
          </span>
        </div>
        {record && (
          <Link href={`/research/${record.id}`} className="mt-1.5 block truncate text-[11px] text-muted-foreground hover:text-foreground hover:underline">
            {record.title}
          </Link>
        )}
      </div>
    </div>
  )
}
