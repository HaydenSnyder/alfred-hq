"use client"

import Link from "next/link"
import { ArrowLeft, Check, KeyRound, Lock, Plug, ShieldCheck } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { formatDateTime, scopeLabel, timeAgo, titleCase } from "@/lib/format"
import { hrefFor } from "@/lib/routes"
import { Button } from "@/components/ui/button"
import { CompanyMark } from "@/components/hq/avatars"
import { PageHeader } from "@/components/hq/page-header"
import { Panel, PropertyList } from "@/components/hq/panel"
import { EmptyState, ErrorState, LoadingState, UnknownState } from "@/components/hq/states"
import { StatusBadge, ToneBadge } from "@/components/hq/status-badge"
import { DisabledAction } from "@/features/infrastructure/demo-guards"
import { ConnectionChecklist } from "./connection-checklist"
import { categoryMeta, modeMeta } from "./integration-meta"

const CONNECT_REASON = "Disabled in prototype — no OAuth flow and no credential storage exist yet"

export function IntegrationDetailView({ id }: { id: string }) {
  const q = useHQQuery(`integration:${id}`, async (p) => {
    const [integration, companies, services] = await Promise.all([p.getIntegration(id), p.listCompanies(), p.listServices()])
    return { integration, companies, services }
  })

  const crumbs = [{ label: "Integrations", href: "/integrations" }]

  if (q.status === "loading")
    return (
      <>
        <PageHeader title="Integration" breadcrumbs={crumbs} />
        <LoadingState variant="detail" />
      </>
    )
  if (q.status === "error" || q.status === "offline")
    return (
      <>
        <PageHeader title="Integration" breadcrumbs={crumbs} />
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )

  const { integration: i, companies, services } = q.data
  if (!i)
    return (
      <>
        <PageHeader title="Integration not found" breadcrumbs={[...crumbs, { label: id }]} />
        <EmptyState
          icon={<Plug className="size-4" />}
          title="This integration isn't in the registry"
          description={
            <>
              No integration with id <span className="font-mono">{id}</span> was returned by the data source.
            </>
          }
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/integrations">
                <ArrowLeft /> Back to integrations
              </Link>
            </Button>
          }
        />
      </>
    )

  const cat = categoryMeta[i.category]
  const CatIcon = cat.icon
  const mode = modeMeta[i.mode]
  const scope = i.scope
  const company = scope.kind === "company" ? companies.find((c) => c.id === scope.companyId) : undefined
  const relatedServices = services.filter((s) => s.system === i.key)

  return (
    <>
      <PageHeader
        title={i.provider}
        breadcrumbs={[...crumbs, { label: i.provider }]}
        icon={
          <span className="flex size-8 items-center justify-center rounded-lg border bg-surface-2 text-foreground/80">
            <CatIcon className="size-4" />
          </span>
        }
        description={i.description}
        actions={
          <DisabledAction label={`Connect ${i.provider}`} reason={CONNECT_REASON} variant="default">
            <Plug /> Connect
          </DisabledAction>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <StatusBadge status={i.status} />
        <ToneBadge tone={mode.tone} dot={false}>
          {mode.label}
        </ToneBadge>
        <ToneBadge tone="neutral" dot={false}>
          {cat.label}
        </ToneBadge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <Panel title="Overview">
            <PropertyList
              items={[
                { label: "Provider", value: i.provider },
                { label: "Key", value: <span className="font-mono text-xs">{i.key}</span> },
                { label: "Category", value: cat.label },
                {
                  label: "Scope",
                  value: company ? (
                    <Link href={hrefFor({ kind: "company", id: company.id })} className="inline-flex items-center gap-1.5 hover:underline">
                      <CompanyMark company={company} size="sm" className="size-4 rounded text-[8px]" /> {company.name}
                    </Link>
                  ) : (
                    scopeLabel(i.scope, companies)
                  ),
                },
                { label: "Status", value: <StatusBadge status={i.status} /> },
                { label: "Mode", value: `${mode.label} — ${mode.description}` },
                {
                  label: "Last check",
                  value: i.lastCheckAt ? (
                    <span title={formatDateTime(i.lastCheckAt)}>{timeAgo(i.lastCheckAt)}</span>
                  ) : (
                    <span className="font-medium text-foreground/70">Never checked</span>
                  ),
                },
                { label: "Registered", value: formatDateTime(i.createdAt) },
              ]}
            />
            {(i.status === "unconfigured" || i.status === "unknown") && (
              <UnknownState
                className="mt-4"
                title={i.status === "unconfigured" ? "Not configured" : "No verified data"}
                description="HQ has never received data from this source. Status is not assumed healthy."
              />
            )}
          </Panel>

          <Panel title="Capabilities" description="What HQ will be able to read once connected">
            <ul className="grid gap-2 sm:grid-cols-2">
              {i.capabilities.map((c) => (
                <li key={c} className="flex items-start gap-2 rounded-lg border bg-surface-2/50 px-3 py-2 text-sm">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" /> {c}
                </li>
              ))}
              {i.capabilities.length === 0 && <li className="text-xs text-muted-foreground">No capabilities declared.</li>}
            </ul>
          </Panel>

          <ConnectionChecklist integration={i} />
        </div>

        <div className="min-w-0 space-y-4">
          <Panel title="Read-only contract">
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">
                  HQ only ever <span className="text-foreground">reads</span> from {i.provider}. There are no write, restart, deploy or approve routes in
                  the data contract.
                </span>
              </li>
              <li className="flex gap-2.5">
                <KeyRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">
                  No OAuth flow and no credential storage exist in this prototype. Future credentials live server-side in the adapter, never in the browser.
                </span>
              </li>
              <li className="flex gap-2.5">
                <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">Company-scoped data stays inside its company context in HQ.</span>
              </li>
            </ul>
          </Panel>

          <Panel title="Notes">
            <p className="text-sm text-muted-foreground">{i.notes || "No notes recorded."}</p>
          </Panel>

          {relatedServices.length > 0 && (
            <Panel title="Related service health" description="From the infrastructure registry (demo)">
              <ul className="space-y-1">
                {relatedServices.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={hrefFor({ kind: "service", id: s.id })}
                      className="-mx-2 flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent/60"
                    >
                      <span className="min-w-0">
                        <span className="block truncate">{s.name}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          {s.lastCheckAt ? `Checked ${timeAgo(s.lastCheckAt)}` : "No verified check"}
                        </span>
                      </span>
                      <StatusBadge status={s.status} withTooltip={false} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="Connection">
            <p className="text-xs text-muted-foreground">{CONNECT_REASON}.</p>
            <div className="mt-3">
              <DisabledAction label={`Connect ${i.provider}`} reason={CONNECT_REASON} className="w-full">
                <Plug /> Connect {i.provider}
              </DisabledAction>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Mode: {titleCase(i.mode)}</p>
          </Panel>
        </div>
      </div>
    </>
  )
}
