"use client"

import { useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { AlertOctagon, CircleSlash, HeartPulse, Monitor, RefreshCw, Server, TriangleAlert } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import type { RecordRef } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/hq/metric-card"
import { PageHeader } from "@/components/hq/page-header"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { CoreSystemsStrip } from "./core-systems-strip"
import { ConnectorDeviceCard, DeviceSection, ServerCard } from "./device-cards"
import { visibleInContext } from "./demo-guards"
import { isVerified, needsAttention } from "./health-glyph"
import { IncidentsPanel } from "./incidents-panel"
import { ServicesTable } from "./services-table"
import { StateLegend } from "./state-legend"

/** Reads ?incident= / ?device= / ?service= and returns the record to inspect. */
function useDeepLink(): RecordRef | undefined {
  const params = useSearchParams()
  const incident = params.get("incident")
  const device = params.get("device")
  const service = params.get("service")
  if (incident) return { kind: "incident", id: incident }
  if (device) return { kind: "device", id: device }
  if (service) return { kind: "service", id: service }
  return undefined
}

export function InfrastructureView() {
  const { companyContext, inspect } = useHQ()
  const deepLink = useDeepLink()

  const q = useHQQuery("infrastructure", async (p) => {
    const [devices, services, incidents, agents, companies] = await Promise.all([
      p.listDevices(),
      p.listServices(),
      p.listIncidents(),
      p.listAgents(),
      p.listCompanies(),
    ])
    return { devices, services, incidents, agents, companies }
  })

  // Auto-inspect the deep-linked record once per distinct link.
  const handled = useRef<string | null>(null)
  const linkKey = deepLink ? `${deepLink.kind}:${deepLink.id}` : null
  useEffect(() => {
    if (!deepLink || !linkKey || handled.current === linkKey) return
    handled.current = linkKey
    inspect(deepLink)
  }, [deepLink, linkKey, inspect])

  const header = (
    <PageHeader
      title="Infrastructure & Devices"
      description="Mission-control view of Alfred's servers, Mac connectors, services and incidents. All monitoring values are demo data — no live checks are running."
      actions={
        <Button variant="outline" size="sm" onClick={q.refetch} disabled={q.status === "loading"}>
          <RefreshCw /> Reload demo data
        </Button>
      }
    />
  )

  if (q.status === "loading")
    return (
      <>
        {header}
        <LoadingState variant="metrics" />
        <LoadingState variant="cards" rows={3} className="mt-4" />
        <LoadingState variant="list" rows={5} className="mt-4" />
      </>
    )
  if (q.status === "error" || q.status === "offline")
    return (
      <>
        {header}
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )

  const { devices, services, companies } = q.data
  const incidents = q.data.incidents.filter((i) => visibleInContext(i.scope, companyContext))
  const agentById = new Map(q.data.agents.map((a) => [a.id, a]))

  if (devices.length === 0 && services.length === 0 && incidents.length === 0)
    return (
      <>
        {header}
        <EmptyState
          icon={<Server className="size-4" />}
          title="No infrastructure registered"
          description="The data source returned no devices, services or incidents. Nothing is assumed healthy."
        />
      </>
    )

  const servers = devices.filter((d) => d.kind === "linux_server" || d.kind === "vm")
  const connectors = devices.filter((d) => d.kind === "mac" || d.kind === "iphone")
  const verified = services.filter((s) => isVerified(s.status))
  const healthy = verified.filter((s) => !needsAttention(s.status))
  const attention = [...services, ...devices].filter((x) => needsAttention(x.status))
  const unverified = [...services, ...devices].filter((x) => !isVerified(x.status))
  const openIncidents = incidents.filter((i) => i.state !== "resolved")
  const critical = openIncidents.filter((i) => i.severity === "critical")
  const linkedIncident = deepLink?.kind === "incident" ? q.data.incidents.find((i) => i.id === deepLink.id) : undefined

  return (
    <>
      {header}

      {deepLink && !findRecord(q.data, deepLink) && (
        <div role="status" className="mb-4 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
          The linked {deepLink.kind} <span className="font-mono">{deepLink.id}</span> was not found in the data source.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Services verified healthy" icon={<HeartPulse />} value={`${healthy.length}/${services.length}`} hint={`${verified.length} with a verified check`} />
        <MetricCard
          label="Need attention"
          icon={<TriangleAlert />}
          value={attention.length}
          hint="Degraded or offline services & devices"
          tone={attention.length ? "warning" : undefined}
        />
        <MetricCard label="Unverified" icon={<CircleSlash />} value={unverified.length} hint="Unknown or unconfigured — not assumed healthy" />
        <MetricCard
          label="Open incidents"
          icon={<AlertOctagon />}
          value={openIncidents.length}
          hint={`${critical.length} critical`}
          tone={critical.length ? "danger" : openIncidents.length ? "warning" : undefined}
        />
      </div>

      <div className="mt-4">
        <CoreSystemsStrip services={services} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <DeviceSection title="Linux servers" description="Host metrics from the planned read-only host integration (demo values)" icon={<Server />} count={servers.length}>
          {servers.length === 0 ? (
            <EmptyState title="No servers registered" className="py-8" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {servers.map((d) => (
                <ServerCard key={d.id} device={d} services={services} />
              ))}
            </div>
          )}
        </DeviceSection>
        <DeviceSection title="Mac connectors & devices" description="Alfred Mac Connector status and version per device (demo values)" icon={<Monitor />} count={connectors.length}>
          {connectors.length === 0 ? (
            <EmptyState title="No connector devices registered" className="py-8" />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {connectors.map((d) => (
                <ConnectorDeviceCard key={d.id} device={d} services={services} />
              ))}
            </div>
          )}
        </DeviceSection>
      </div>

      <div className="mt-6">
        <ServicesTable services={services} devices={devices} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <IncidentsPanel
            incidents={incidents}
            services={services}
            devices={devices}
            agentById={agentById}
            companies={companies}
            initialTab={linkedIncident?.state === "resolved" ? "resolved" : "open"}
          />
        </div>
        <StateLegend />
      </div>
    </>
  )
}

function findRecord(
  d: { devices: { id: string }[]; services: { id: string }[]; incidents: { id: string }[] },
  ref: RecordRef
): boolean {
  if (ref.kind === "incident") return d.incidents.some((i) => i.id === ref.id)
  if (ref.kind === "device") return d.devices.some((i) => i.id === ref.id)
  if (ref.kind === "service") return d.services.some((i) => i.id === ref.id)
  return true
}
