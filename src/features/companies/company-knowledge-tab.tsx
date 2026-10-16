import Link from "next/link"
import { BookLock, ChevronRight, Network } from "lucide-react"
import { titleCase } from "@/lib/format"
import type { Company, KnowledgeNode, KnowledgeNodeType } from "@/lib/types"
import { Panel } from "@/components/hq/panel"
import { EmptyState } from "@/components/hq/states"
import { ToneBadge } from "@/components/hq/status-badge"

const typeOrder: KnowledgeNodeType[] = ["company", "document", "memory", "decision", "research", "project", "session", "agent"]

export function CompanyKnowledgeTab({ company, nodes }: { company: Company; nodes: KnowledgeNode[] }) {
  const sorted = [...nodes].sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type) || a.label.localeCompare(b.label))

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="Authorised knowledge summary" className="lg:col-span-1">
        <p className="text-sm text-foreground/90">{company.knowledgeSummary}</p>
        <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
          <BookLock className="mt-px size-3 shrink-0" aria-hidden />
          Only knowledge authorised for {company.shortName} is listed. Company agents cannot read other companies&apos; brains.
        </p>
      </Panel>

      <Panel
        title="Brain nodes"
        description={`${nodes.length} ${nodes.length === 1 ? "node" : "nodes"} scoped to ${company.shortName}`}
        href="/brain"
        hrefLabel="Open Brain"
        className="lg:col-span-2"
      >
        {sorted.length === 0 ? (
          <EmptyState
            icon={<Network className="size-4" />}
            title="No knowledge connected"
            description={`No Brain nodes are scoped to ${company.shortName} yet.`}
            className="py-8"
          />
        ) : (
          <ul className="-mx-2 divide-y">
            {sorted.map((n) => (
              <li key={n.id}>
                <Link href={`/brain?node=${n.id}`} className="flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-accent/60">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm">{n.label}</span>
                      <ToneBadge tone="neutral" dot={false}>
                        {titleCase(n.type)}
                      </ToneBadge>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{n.summary}</span>
                    {n.tags.length > 0 && (
                      <span className="mt-1 flex flex-wrap gap-1">
                        {n.tags.map((t) => (
                          <span key={t} className="text-[11px] text-muted-foreground">
                            #{t}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
