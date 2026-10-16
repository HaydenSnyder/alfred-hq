"use client"

import { useRouter } from "next/navigation"
import { scopeLabel, timeAgo } from "@/lib/format"
import type { Agent, Company, ResearchRecord, VerificationStatus } from "@/lib/types"
import { DataTable, type DataTableColumn } from "@/components/hq/data-table"
import { EmptyState } from "@/components/hq/states"
import { ToneBadge, VerificationBadge } from "@/components/hq/status-badge"
import { ScopeChip } from "@/features/projects/shared"
import { stageMeta, stageOrder } from "./research-meta"

const verificationRank: Record<VerificationStatus, number> = { verified: 0, partially_verified: 1, unverified: 2, disputed: 3 }

function SourceCounts({ record }: { record: ResearchRecord }) {
  const verified = record.sources.filter((s) => s.verification === "verified").length
  return (
    <span className="text-xs whitespace-nowrap tabular">
      {record.sources.length}
      <span className="text-muted-foreground"> · {verified} verified</span>
    </span>
  )
}

export function ResearchTable({
  records,
  agentById,
  companies,
}: {
  records: ResearchRecord[]
  agentById: Map<string, Agent>
  companies: Company[]
}) {
  const router = useRouter()
  const columns: DataTableColumn<ResearchRecord>[] = [
    {
      id: "title",
      header: "Record",
      cell: (r) => (
        <span className="block min-w-0">
          <span className="block truncate font-medium md:max-w-[20rem]">{r.title}</span>
          <span className="block truncate text-xs text-muted-foreground md:max-w-[20rem]">{r.question}</span>
        </span>
      ),
      sortValue: (r) => r.title.toLowerCase(),
    },
    {
      id: "stage",
      header: "Stage",
      cell: (r) => <ToneBadge tone={stageMeta[r.stage].tone}>{stageMeta[r.stage].label}</ToneBadge>,
      sortValue: (r) => stageOrder.indexOf(r.stage),
    },
    {
      id: "verification",
      header: "Verification",
      cell: (r) => <VerificationBadge status={r.verification} />,
      sortValue: (r) => verificationRank[r.verification],
    },
    {
      id: "sources",
      header: "Sources",
      cell: (r) => <SourceCounts record={r} />,
      sortValue: (r) => r.sources.length,
    },
    {
      id: "agents",
      header: "Agents",
      cell: (r) => (
        <span className="block truncate text-xs text-muted-foreground md:max-w-[10rem]">
          {r.agentIds.map((id) => agentById.get(id)?.name ?? id).join(", ")}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      id: "scope",
      header: "Scope",
      cell: (r) => <ScopeChip label={scopeLabel(r.scope, companies)} />,
      sortValue: (r) => scopeLabel(r.scope, companies),
      hideOnMobile: true,
    },
    {
      id: "updated",
      header: "Updated",
      cell: (r) => <span className="text-xs whitespace-nowrap text-muted-foreground tabular">{timeAgo(r.updatedAt)}</span>,
      sortValue: (r) => r.updatedAt,
      align: "right",
      hideOnMobile: true,
    },
  ]

  return (
    <DataTable
      data={records}
      columns={columns}
      getRowId={(r) => r.id}
      onRowClick={(r) => router.push(`/research/${r.id}`)}
      rowLabel={(r) => `Open research record ${r.title}`}
      initialSort={{ id: "updated", dir: "desc" }}
      caption="Research records"
      empty={<EmptyState title="No research records" description="Nothing matches this stage or context." className="py-8" />}
      renderMobileCard={(r) => (
        <span className="block">
          <span className="block text-sm font-medium">{r.title}</span>
          <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{r.question}</span>
          <span className="mt-2 flex flex-wrap items-center gap-1.5">
            <ToneBadge tone={stageMeta[r.stage].tone}>{stageMeta[r.stage].label}</ToneBadge>
            <VerificationBadge status={r.verification} />
            <SourceCounts record={r} />
          </span>
        </span>
      )}
    />
  )
}
