"use client"

import { useState } from "react"
import { CircleSlash, Eye, Plug, Search, Workflow } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { inCompanyContext } from "@/lib/format"
import type { Integration } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { MetricCard } from "@/components/hq/metric-card"
import { PageHeader } from "@/components/hq/page-header"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { IntegrationCard } from "./integration-card"
import { categoryMeta, categoryOrder } from "./integration-meta"

function matches(i: Integration, q: string) {
  if (!q) return true
  const hay = [i.provider, i.key, i.description, i.category, ...i.capabilities].join(" ").toLowerCase()
  return hay.includes(q.toLowerCase())
}

export function IntegrationsView() {
  const { companyContext } = useHQ()
  const [query, setQuery] = useState("")
  const q = useHQQuery("integrations", async (p) => {
    const [integrations, companies] = await Promise.all([p.listIntegrations(), p.listCompanies()])
    return { integrations, companies }
  })

  const header = (
    <PageHeader
      title="Integrations"
      description="Registry of the systems HQ will observe. Nothing is connected in this prototype — no OAuth, no stored credentials, no live calls."
    />
  )

  if (q.status === "loading")
    return (
      <>
        {header}
        <LoadingState variant="metrics" />
        <LoadingState variant="cards" rows={6} className="mt-4" />
      </>
    )
  if (q.status === "error" || q.status === "offline")
    return (
      <>
        {header}
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )

  const { companies } = q.data
  const companyById = new Map(companies.map((c) => [c.id, c]))
  // Global and personal integrations are always listed; company ones follow the context.
  const inContext = q.data.integrations.filter((i) => i.scope.kind !== "company" || inCompanyContext(i.scope, companyContext))
  const shown = inContext.filter((i) => matches(i, query.trim()))
  const connected = inContext.filter((i) => i.status !== "unconfigured" && i.status !== "unknown").length
  const readOnly = inContext.filter((i) => i.mode === "read_only").length
  const planned = inContext.filter((i) => i.mode === "planned").length

  return (
    <>
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Registered" icon={<Plug />} value={inContext.length} hint="In this company context" />
        <MetricCard label="Verified connections" icon={<CircleSlash />} value={connected} hint="No live connections in the prototype" />
        <MetricCard label="Planned" icon={<Workflow />} value={planned} hint="Designed, not built" />
        <MetricCard label="Read-only" icon={<Eye />} value={readOnly} hint="Read-write is not permitted" />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="sm:max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter integrations…" aria-label="Filter integrations" />
        </InputGroup>
        <p className="text-xs text-muted-foreground tabular">
          {shown.length} of {inContext.length} integrations
        </p>
      </div>

      {inContext.length === 0 ? (
        <EmptyState className="mt-4" icon={<Plug className="size-4" />} title="No integrations registered" description="The data source returned no integrations for this context." />
      ) : shown.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={<Search className="size-4" />}
          title="No integrations match"
          description={`Nothing matches “${query}”.`}
          action={
            <Button variant="outline" size="sm" onClick={() => setQuery("")}>
              Clear filter
            </Button>
          }
        />
      ) : (
        <div className="mt-4 space-y-8">
          {categoryOrder.map((cat) => {
            const list = shown.filter((i) => i.category === cat)
            if (list.length === 0) return null
            const meta = categoryMeta[cat]
            const Icon = meta.icon
            return (
              <section key={cat} aria-labelledby={`cat-${cat}`} className="space-y-3">
                <div>
                  <h2 id={`cat-${cat}`} className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="size-4 text-muted-foreground" /> {meta.label}
                    <span className="text-xs font-normal text-muted-foreground tabular">{list.length}</span>
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{meta.description}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {list.map((i) => (
                    <IntegrationCard
                      key={i.id}
                      integration={i}
                      companies={companies}
                      company={i.scope.kind === "company" ? companyById.get(i.scope.companyId) : undefined}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}
