import type { HQDataProvider } from "@/lib/data/provider"
import type { RecordRef } from "@/lib/types"

export type RecordKind = RecordRef["kind"]

export const recordKindLabel: Record<RecordKind, string> = {
  company: "Company",
  agent: "Agent",
  project: "Project",
  task: "Task",
  session: "Session",
  incident: "Incident",
  approval: "Approval",
  research: "Research",
  device: "Device",
  service: "Service",
  integration: "Integration",
  node: "Memory node",
}

/** id → display name, per record kind. */
export type RecordIndex = Partial<Record<RecordKind, Map<string, string>>>

/** Loads the names needed to label linked records in notifications and approvals. */
export async function loadRecordIndex(p: HQDataProvider): Promise<RecordIndex> {
  const [companies, agents, projects, tasks, sessions, incidents, approvals, research, devices, services, integrations] =
    await Promise.all([
      p.listCompanies(),
      p.listAgents(),
      p.listProjects(),
      p.listTasks(),
      p.listSessions(),
      p.listIncidents(),
      p.listApprovals(),
      p.listResearch(),
      p.listDevices(),
      p.listServices(),
      p.listIntegrations(),
    ])
  const m = <T extends { id: string }>(list: T[], name: (x: T) => string) => new Map(list.map((x) => [x.id, name(x)]))
  return {
    company: m(companies, (c) => c.name),
    agent: m(agents, (a) => a.name),
    project: m(projects, (x) => x.name),
    task: m(tasks, (t) => `${t.key} ${t.title}`),
    session: m(sessions, (s) => s.title),
    incident: m(incidents, (i) => i.title),
    approval: m(approvals, (a) => a.title),
    research: m(research, (r) => r.title),
    device: m(devices, (d) => d.name),
    service: m(services, (s) => s.name),
    integration: m(integrations, (i) => i.provider),
  }
}

export function recordName(index: RecordIndex, ref: RecordRef): string | undefined {
  return index[ref.kind]?.get(ref.id)
}
