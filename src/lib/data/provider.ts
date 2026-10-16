import type {
  Agent,
  Approval,
  Budget,
  Company,
  Device,
  Incident,
  Integration,
  KnowledgeEdge,
  KnowledgeNode,
  Message,
  Notification,
  OperationalEvent,
  Project,
  ResearchRecord,
  SearchResult,
  ServiceHealth,
  Session,
  Task,
  UsageRecord,
} from "@/lib/types"

/**
 * Read-only data contract for Alfred HQ.
 *
 * The prototype ships `MockDataProvider`. A future `HermesReadOnlyProvider`
 * implements this same interface against the HQ integration adapter; no view
 * code needs to change. There are intentionally no mutation methods for
 * operational systems (restarts, approvals, deployments) in this phase.
 */
export interface HQDataProvider {
  /** Identifies the provider in the UI (e.g. "Demo data", "Hermes (read-only)"). */
  readonly label: string
  readonly origin: "demo" | "live"

  listCompanies(): Promise<Company[]>
  getCompany(id: string): Promise<Company | undefined>

  listAgents(filter?: { companyId?: string }): Promise<Agent[]>
  getAgent(id: string): Promise<Agent | undefined>

  listDevices(): Promise<Device[]>
  getDevice(id: string): Promise<Device | undefined>
  listServices(): Promise<ServiceHealth[]>
  listIncidents(): Promise<Incident[]>
  getIncident(id: string): Promise<Incident | undefined>

  listNotifications(): Promise<Notification[]>
  listApprovals(): Promise<Approval[]>
  getApproval(id: string): Promise<Approval | undefined>

  listProjects(): Promise<Project[]>
  getProject(id: string): Promise<Project | undefined>
  listTasks(filter?: { projectId?: string; agentId?: string }): Promise<Task[]>
  getTask(id: string): Promise<Task | undefined>

  listSessions(): Promise<Session[]>
  getSession(id: string): Promise<Session | undefined>
  listMessages(sessionId: string): Promise<Message[]>

  listResearch(): Promise<ResearchRecord[]>
  getResearch(id: string): Promise<ResearchRecord | undefined>

  getKnowledgeGraph(): Promise<{ nodes: KnowledgeNode[]; edges: KnowledgeEdge[] }>

  listIntegrations(): Promise<Integration[]>
  getIntegration(id: string): Promise<Integration | undefined>

  listEvents(): Promise<OperationalEvent[]>

  listUsage(): Promise<UsageRecord[]>
  listBudgets(): Promise<Budget[]>

  search(query: string): Promise<SearchResult[]>
}

/** Simulated source conditions, selectable in Settings to preview UI states. */
export type SourceSimulation = "normal" | "slow" | "error" | "offline" | "empty"

export class DataSourceError extends Error {
  constructor(
    message: string,
    public readonly kind: "error" | "offline"
  ) {
    super(message)
    this.name = "DataSourceError"
  }
}
