/**
 * Alfred HQ domain model.
 *
 * These interfaces are the contract between the HQ interface and any data
 * provider (mock today, read-only Hermes adapter later). Every record carries a
 * stable id, timestamps, a scope, and references to related records by id.
 */

export type ISODateString = string

/** Where a record came from. HQ must never present `demo` data as real. */
export type DataOrigin = "demo" | "live"

/** Ownership scope. HQ is owner-only; `personal` means the owner's own work. */
export type Scope =
  | { kind: "global" }
  | { kind: "personal" }
  | { kind: "company"; companyId: string }

export interface BaseRecord {
  id: string
  origin: DataOrigin
  createdAt: ISODateString
  updatedAt: ISODateString
}

/**
 * Operational health. `unknown` and `unconfigured` are first-class: when a
 * source has no verified data we never fall back to `healthy`.
 */
export type HealthStatus =
  | "healthy"
  | "working"
  | "idle"
  | "degraded"
  | "offline"
  | "unknown"
  | "unconfigured"

export type Severity = "critical" | "high" | "medium" | "low" | "info"

export type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "blocked" | "done"
export type Priority = "urgent" | "high" | "medium" | "low"

// ---------------------------------------------------------------------------
// Companies & agents
// ---------------------------------------------------------------------------

export interface Department {
  id: string
  name: string
  leadAgentId?: string
  agentIds: string[]
}

export interface Company extends BaseRecord {
  name: string
  shortName: string
  tagline: string
  /** Brand accent used only for the company's identity mark inside HQ. */
  brandColor: string
  industry: string
  website: {
    url?: string
    status: HealthStatus
    lastCheckedAt?: ISODateString
  }
  companyAlfred: {
    agentId?: string
    status: HealthStatus
    lastCheckedAt?: ISODateString
  }
  departments: Department[]
  health: HealthStatus
  openIncidentIds: string[]
  knowledgeSummary: string
}

export type AgentRole = "orchestrator" | "executive" | "cto" | "lead" | "specialist" | "researcher" | "operator"

export interface AgentTool {
  name: string
  kind: "read" | "write" | "external"
  description: string
}

export interface Agent extends BaseRecord {
  name: string
  title: string
  role: AgentRole
  scope: Scope
  departmentId?: string
  parentAgentId?: string
  status: HealthStatus
  lastCheckAt?: ISODateString
  lastActiveAt?: ISODateString
  model: { provider: string; name: string; contextWindow: number }
  tools: AgentTool[]
  description: string
  config: {
    temperature: number
    maxConcurrentTasks: number
    approvalRequiredFor: string[]
    memoryAccess: "global" | "company" | "project" | "none"
  }
  assignedTaskIds: string[]
  stats: { tasksCompleted7d: number; avgLatencyMs: number; errorRate7d: number }
}

// ---------------------------------------------------------------------------
// Infrastructure
// ---------------------------------------------------------------------------

export type DeviceKind = "linux_server" | "mac" | "iphone" | "vm"

export interface Device extends BaseRecord {
  name: string
  kind: DeviceKind
  hostname: string
  os: string
  location: string
  status: HealthStatus
  lastCheckAt?: ISODateString
  uptimeSeconds?: number
  metrics?: { cpuPct: number; memPct: number; diskPct: number; loadAvg: number }
  serviceIds: string[]
  connector?: { name: string; version: string; status: HealthStatus }
}

export interface UptimeSample {
  /** Start of the bucket. */
  at: ISODateString
  status: HealthStatus
}

export interface ServiceHealth extends BaseRecord {
  name: string
  /** Canonical system key, e.g. `hermes`, `photon`, `dev-gateway`. */
  system: string
  description: string
  deviceId?: string
  status: HealthStatus
  lastCheckAt?: ISODateString
  version?: string
  latencyMs?: number
  uptime30d?: number
  history: UptimeSample[]
}

export interface Incident extends BaseRecord {
  title: string
  summary: string
  severity: Severity
  state: "open" | "investigating" | "mitigated" | "resolved"
  scope: Scope
  detectedAt: ISODateString
  resolvedAt?: ISODateString
  serviceId?: string
  deviceId?: string
  agentIds: string[]
  recovery: { at: ISODateString; action: string; outcome: "succeeded" | "failed" | "pending" }[]
}

// ---------------------------------------------------------------------------
// Notifications & approvals
// ---------------------------------------------------------------------------

export type NotificationChannel = "hq" | "imessage" | "push"

export type RecordRef =
  | { kind: "company"; id: string }
  | { kind: "agent"; id: string }
  | { kind: "project"; id: string }
  | { kind: "task"; id: string }
  | { kind: "session"; id: string }
  | { kind: "incident"; id: string }
  | { kind: "approval"; id: string }
  | { kind: "research"; id: string }
  | { kind: "device"; id: string }
  | { kind: "service"; id: string }
  | { kind: "integration"; id: string }
  | { kind: "node"; id: string }

export interface Notification extends BaseRecord {
  title: string
  body: string
  severity: Severity
  category: "incident" | "approval" | "task" | "research" | "development" | "system"
  read: boolean
  scope: Scope
  refs: RecordRef[]
  channels: NotificationChannel[]
}

export interface Approval extends BaseRecord {
  title: string
  description: string
  kind: "deployment" | "plan" | "purchase" | "config_change" | "agent_change" | "research_publish"
  state: "pending" | "approved" | "rejected" | "expired"
  requestedByAgentId: string
  scope: Scope
  risk: Severity
  decidedAt?: ISODateString
  expiresAt?: ISODateString
  refs: RecordRef[]
}

// ---------------------------------------------------------------------------
// Work: projects, tasks, sessions
// ---------------------------------------------------------------------------

export interface Project extends BaseRecord {
  name: string
  key: string
  summary: string
  scope: Scope
  status: "planning" | "active" | "paused" | "completed"
  kind: "general" | "development" | "research"
  leadAgentId?: string
  agentIds: string[]
  sessionIds: string[]
  researchIds: string[]
  decisions: { id: string; at: ISODateString; title: string; outcome: string }[]
  outputs: { id: string; title: string; kind: "document" | "release" | "report" | "dataset" }[]
  progress: number
  dev?: DevelopmentInfo
}

export interface DevelopmentInfo {
  repo: { owner: string; name: string; defaultBranch: string }
  t3ThreadRef?: string
  ctoAgentId?: string
  pullRequests: {
    number: number
    title: string
    state: "open" | "merged" | "closed" | "draft"
    author: string
    updatedAt: ISODateString
  }[]
  tests: { status: "passing" | "failing" | "running" | "unknown"; passed: number; failed: number; at?: ISODateString }
  deployment: { environment: string; status: HealthStatus | "pending"; version?: string; at?: ISODateString }
  plan?: {
    title: string
    steps: { id: string; title: string; detail: string }[]
    approvalId?: string
  }
}

export interface Task extends BaseRecord {
  key: string
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  scope: Scope
  projectId?: string
  assigneeAgentId?: string
  sessionIds: string[]
  dueAt?: ISODateString
  labels: string[]
}

export interface Session extends BaseRecord {
  title: string
  scope: Scope
  projectId?: string
  agentIds: string[]
  taskIds: string[]
  pinned?: boolean
  /** Sessions created in this browser for the prototype. */
  local?: boolean
}

export interface Message extends BaseRecord {
  sessionId: string
  author: { kind: "user" } | { kind: "agent"; agentId: string } | { kind: "system" }
  /** Lightweight markdown: paragraphs, lists, headings, code fences, inline code, bold. */
  content: string
  attachments?: { name: string; sizeBytes: number }[]
  /** True for responses generated by the prototype; never delivered to Hermes. */
  simulated?: boolean
}

// ---------------------------------------------------------------------------
// Research & knowledge
// ---------------------------------------------------------------------------

export type SourceType = "web" | "pdf" | "video" | "podcast" | "dataset" | "repository" | "internal"
export type VerificationStatus = "verified" | "partially_verified" | "unverified" | "disputed"

export interface ResearchSource {
  id: string
  title: string
  type: SourceType
  publisher: string
  url?: string
  collectedAt: ISODateString
  verification: VerificationStatus
}

export interface ResearchRecord extends BaseRecord {
  title: string
  question: string
  scope: Scope
  projectId?: string
  stage: "collecting" | "analyzing" | "verifying" | "drafting" | "published"
  agentIds: string[]
  sources: ResearchSource[]
  verification: VerificationStatus
  /** Markdown report body. */
  report: string
  knowledgeDestinations: { kind: "global_brain" | "company_brain" | "project"; label: string; nodeId?: string }[]
}

export type KnowledgeNodeType =
  | "memory"
  | "research"
  | "agent"
  | "project"
  | "session"
  | "decision"
  | "company"
  | "document"

export interface KnowledgeNode extends BaseRecord {
  type: KnowledgeNodeType
  label: string
  summary: string
  scope: Scope
  projectId?: string
  /** Markdown body for the document viewer. */
  body?: string
  sources: { label: string; ref?: RecordRef }[]
  tags: string[]
}

export type KnowledgeRelation =
  | "references"
  | "derived_from"
  | "owned_by"
  | "decided_in"
  | "relates_to"
  | "authored_by"
  | "part_of"

export interface KnowledgeEdge {
  id: string
  source: string
  target: string
  relation: KnowledgeRelation
  weight: number
}

// ---------------------------------------------------------------------------
// Integrations, history, usage
// ---------------------------------------------------------------------------

export interface Integration extends BaseRecord {
  provider: string
  key: string
  category: "orchestration" | "messaging" | "code" | "knowledge" | "infrastructure" | "company"
  description: string
  scope: Scope
  status: HealthStatus
  mode: "planned" | "read_only" | "read_write"
  lastCheckAt?: ISODateString
  capabilities: string[]
  notes: string
}

export type OperationalEventType =
  | "agent_execution"
  | "task_created"
  | "task_completed"
  | "incident_detected"
  | "recovery_attempt"
  | "approval"
  | "research_completed"
  | "development_update"
  | "config_change"

export interface OperationalEvent extends BaseRecord {
  type: OperationalEventType
  title: string
  detail?: string
  severity: Severity
  scope: Scope
  agentId?: string
  at: ISODateString
  refs: RecordRef[]
}

export interface UsageRecord {
  id: string
  origin: DataOrigin
  /** Day bucket. */
  date: ISODateString
  companyId?: string
  agentId?: string
  model: string
  category: "model" | "api" | "infrastructure"
  inputTokens: number
  outputTokens: number
  costUsd: number
}

export interface Budget {
  id: string
  scope: Scope
  label: string
  monthlyLimitUsd: number
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchResult {
  ref: RecordRef
  title: string
  subtitle: string
  href: string
}
