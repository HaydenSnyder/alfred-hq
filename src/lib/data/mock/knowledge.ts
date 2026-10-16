import type { KnowledgeEdge, KnowledgeNode, KnowledgeRelation } from "@/lib/types"
import { daysAgo, demo, hoursAgo } from "./clock"

type NodeSeed = Omit<KnowledgeNode, "origin" | "createdAt" | "updatedAt" | "sources" | "tags"> &
  Partial<Pick<KnowledgeNode, "sources" | "tags" | "updatedAt">>

function node(seed: NodeSeed): KnowledgeNode {
  return { ...demo, sources: [], tags: [], createdAt: daysAgo(30), updatedAt: daysAgo(2), ...seed }
}

const G = { kind: "global" } as const
const P = { kind: "personal" } as const
const NW = { kind: "company", companyId: "co-northwind" } as const
const MD = { kind: "company", companyId: "co-meridian" } as const
const HF = { kind: "company", companyId: "co-halcyon" } as const

export const knowledgeNodes: KnowledgeNode[] = [
  // Companies
  node({ id: "kn-co-nw", type: "company", label: "Northwind Atelier", summary: "Residential interior design studio.", scope: NW, sources: [{ label: "Company record", ref: { kind: "company", id: "co-northwind" } }] }),
  node({ id: "kn-co-md", type: "company", label: "Meridian Health Labs", summary: "Preventive wellness clinics.", scope: MD, sources: [{ label: "Company record", ref: { kind: "company", id: "co-meridian" } }] }),
  node({ id: "kn-co-hf", type: "company", label: "Halcyon Freight", summary: "Regional logistics and fulfilment.", scope: HF, sources: [{ label: "Company record", ref: { kind: "company", id: "co-halcyon" } }] }),

  // Agents
  node({ id: "kn-ag-alfred", type: "agent", label: "Alfred", summary: "Chief of Staff, orchestrated by Hermes.", scope: G, sources: [{ label: "Agent profile", ref: { kind: "agent", id: "ag-alfred" } }] }),
  node({ id: "kn-ag-atlas", type: "agent", label: "Atlas", summary: "Development CTO.", scope: G, sources: [{ label: "Agent profile", ref: { kind: "agent", id: "ag-atlas" } }] }),
  node({ id: "kn-ag-sage", type: "agent", label: "Sage", summary: "Head of Research & Intelligence.", scope: G, sources: [{ label: "Agent profile", ref: { kind: "agent", id: "ag-sage" } }] }),
  node({ id: "kn-ag-cadence", type: "agent", label: "Cadence", summary: "Meridian scheduling agent.", scope: MD, sources: [{ label: "Agent profile", ref: { kind: "agent", id: "ag-md-scheduler" } }] }),

  // Projects
  node({ id: "kn-prj-hq", type: "project", label: "Alfred HQ Interface", summary: "Owner-only headquarters frontend.", scope: P, projectId: "prj-hq", sources: [{ label: "Project", ref: { kind: "project", id: "prj-hq" } }] }),
  node({ id: "kn-prj-portal", type: "project", label: "Northwind Client Portal", summary: "Client-facing portal refresh.", scope: NW, projectId: "prj-nw-portal", sources: [{ label: "Project", ref: { kind: "project", id: "prj-nw-portal" } }] }),
  node({ id: "kn-prj-booking", type: "project", label: "Booking Resilience", summary: "Outage-tolerant booking for Meridian.", scope: MD, projectId: "prj-md-booking", sources: [{ label: "Project", ref: { kind: "project", id: "prj-md-booking" } }] }),
  node({ id: "kn-prj-eval", type: "project", label: "Agent Model Evaluation", summary: "Model tier comparison.", scope: P, projectId: "prj-model-eval", sources: [{ label: "Project", ref: { kind: "project", id: "prj-model-eval" } }] }),
  node({ id: "kn-prj-rates", type: "project", label: "Q4 Freight-Rate Study", summary: "Quarterly carrier rate benchmark.", scope: HF, projectId: "prj-hf-rates", sources: [{ label: "Project", ref: { kind: "project", id: "prj-hf-rates" } }] }),

  // Sessions
  node({ id: "kn-ses-plan", type: "session", label: "HQ frontend plan", summary: "Planning conversation with Atlas.", scope: P, projectId: "prj-hq", sources: [{ label: "Session", ref: { kind: "session", id: "ses-hq-plan" } }] }),
  node({ id: "kn-ses-incident", type: "session", label: "Meridian booking outage", summary: "Incident coordination session.", scope: MD, projectId: "prj-md-booking", sources: [{ label: "Session", ref: { kind: "session", id: "ses-md-incident" } }] }),
  node({ id: "kn-ses-eval", type: "session", label: "Model tiers discussion", summary: "Session with Sage on model defaults.", scope: P, projectId: "prj-model-eval", sources: [{ label: "Session", ref: { kind: "session", id: "ses-eval" } }] }),

  // Decisions
  node({
    id: "kn-dec-owner",
    type: "decision",
    label: "HQ is owner-only",
    summary: "No employee or multi-tenant authentication inside HQ.",
    scope: P,
    projectId: "prj-hq",
    tags: ["architecture", "access"],
    body: "## Decision\n\nAlfred HQ is private and accessible only by its owner.\n\n## Consequences\n\n- Each company keeps its own website and login.\n- HQ observes company applications; it is not where employees work.",
    sources: [{ label: "HQ frontend plan", ref: { kind: "session", id: "ses-hq-plan" } }],
  }),
  node({
    id: "kn-dec-readonly",
    type: "decision",
    label: "Read-only first adapter",
    summary: "The initial HQ integration adapter exposes read endpoints only.",
    scope: P,
    projectId: "prj-hq",
    tags: ["architecture", "integration"],
    body: "## Decision\n\nThe first Hermes adapter for HQ is **read-only**.\n\nWrite paths (approvals, restarts, deployments) require separate authorisation.",
    sources: [{ label: "HQ frontend plan", ref: { kind: "session", id: "ses-hq-plan" } }],
  }),
  node({
    id: "kn-dec-waitlist",
    type: "decision",
    label: "Read-only booking mode",
    summary: "Accept waitlist requests during provider outages.",
    scope: MD,
    projectId: "prj-md-booking",
    tags: ["incident"],
    updatedAt: hoursAgo(1),
    sources: [{ label: "Meridian booking outage", ref: { kind: "session", id: "ses-md-incident" } }],
  }),
  node({ id: "kn-dec-auth", type: "decision", label: "Separate company login", summary: "Portal keeps its own auth, independent of HQ.", scope: NW, projectId: "prj-nw-portal", tags: ["access"] }),

  // Research
  node({ id: "kn-rr-models", type: "research", label: "Model tiers report", summary: "Cost/quality balance per agent role (partially verified).", scope: P, projectId: "prj-model-eval", sources: [{ label: "Research record", ref: { kind: "research", id: "rr-models" } }] }),
  node({ id: "kn-rr-freight", type: "research", label: "Freight-rate benchmark", summary: "Q4 carrier rate study (in analysis).", scope: HF, projectId: "prj-hf-rates", sources: [{ label: "Research record", ref: { kind: "research", id: "rr-freight" } }] }),
  node({ id: "kn-rr-dash", type: "research", label: "Dashboard patterns", summary: "Monitoring interface patterns (verified).", scope: P, projectId: "prj-hq", sources: [{ label: "Research record", ref: { kind: "research", id: "rr-dashboards" } }] }),

  // Memories
  node({
    id: "kn-mem-tiers",
    type: "memory",
    label: "Prefers mid-tier models for leads",
    summary: "Owner preference: default company leads to the mid tier, escalate for planning.",
    scope: G,
    tags: ["preference", "models"],
    body: "Owner prefers company lead agents to default to the mid model tier and escalate to the top tier only for multi-step planning.\n\n*Example memory — demo content.*",
    sources: [{ label: "Model tiers discussion", ref: { kind: "session", id: "ses-eval" } }],
  }),
  node({ id: "kn-mem-brief", type: "memory", label: "Short weekly digests", summary: "Owner wants executive digests kept brief.", scope: G, tags: ["preference"], sources: [{ label: "Weekly executive digest", ref: { kind: "session", id: "ses-digest" } }] }),
  node({ id: "kn-mem-nw-palette", type: "memory", label: "Northwind favours warm neutrals", summary: "Design language: oak, linen, brushed brass.", scope: NW, tags: ["brand"] }),
  node({ id: "kn-mem-md-tone", type: "memory", label: "Meridian patient tone", summary: "Calm, plain language; no clinical jargon in patient copy.", scope: MD, tags: ["brand", "compliance"] }),
  node({ id: "kn-mem-hf-carriers", type: "memory", label: "Preferred carriers", summary: "Halcyon prioritises three regional carriers for same-day.", scope: HF, tags: ["operations"] }),

  // Documents
  node({
    id: "kn-doc-arch",
    type: "document",
    label: "HQ architecture notes",
    summary: "HQ-001 through HQ-033 reference.",
    scope: P,
    projectId: "prj-hq",
    tags: ["architecture"],
    body: "## Alfred HQ architecture (excerpt)\n\n*Example document — demo content.*\n\n- Hermes remains the orchestrator; HQ is the visual command interface.\n- HQ is owner-only.\n- The first integration adapter is read-only.\n- Obsidian is optional; the HQ Brain works without it.",
  }),
  node({ id: "kn-doc-dash", type: "document", label: "Monitoring UI guidelines", summary: "Derived from the dashboard patterns research.", scope: P, projectId: "prj-hq", tags: ["design"] }),
  node({ id: "kn-doc-nw-brand", type: "document", label: "Northwind brand guide", summary: "Typography, palette and photography rules.", scope: NW, tags: ["brand"] }),
  node({ id: "kn-doc-md-sop", type: "document", label: "Clinic booking SOP", summary: "Standard procedure for appointment booking.", scope: MD, projectId: "prj-md-booking", tags: ["operations"] }),
  node({ id: "kn-doc-hf-contracts", type: "document", label: "Carrier contracts summary", summary: "Key terms across carrier agreements.", scope: HF, tags: ["finance"] }),
]

let edgeCount = 0
function e(source: string, target: string, relation: KnowledgeRelation, weight = 1): KnowledgeEdge {
  edgeCount += 1
  return { id: `ke-${edgeCount}`, source, target, relation, weight }
}

export const knowledgeEdges: KnowledgeEdge[] = [
  e("kn-ag-alfred", "kn-co-nw", "relates_to"),
  e("kn-ag-alfred", "kn-co-md", "relates_to"),
  e("kn-ag-alfred", "kn-co-hf", "relates_to"),
  e("kn-ag-alfred", "kn-ag-atlas", "relates_to"),
  e("kn-ag-alfred", "kn-ag-sage", "relates_to"),
  e("kn-ag-cadence", "kn-co-md", "owned_by"),

  e("kn-prj-hq", "kn-ag-atlas", "owned_by", 2),
  e("kn-prj-portal", "kn-co-nw", "owned_by", 2),
  e("kn-prj-portal", "kn-ag-atlas", "relates_to"),
  e("kn-prj-booking", "kn-co-md", "owned_by", 2),
  e("kn-prj-eval", "kn-ag-sage", "owned_by"),
  e("kn-prj-rates", "kn-co-hf", "owned_by", 2),
  e("kn-prj-rates", "kn-ag-sage", "relates_to"),

  e("kn-ses-plan", "kn-prj-hq", "part_of"),
  e("kn-ses-plan", "kn-ag-atlas", "authored_by"),
  e("kn-ses-incident", "kn-prj-booking", "part_of"),
  e("kn-ses-incident", "kn-ag-cadence", "relates_to"),
  e("kn-ses-eval", "kn-prj-eval", "part_of"),

  e("kn-dec-owner", "kn-ses-plan", "decided_in", 2),
  e("kn-dec-readonly", "kn-ses-plan", "decided_in", 2),
  e("kn-dec-owner", "kn-prj-hq", "part_of"),
  e("kn-dec-readonly", "kn-prj-hq", "part_of"),
  e("kn-dec-waitlist", "kn-ses-incident", "decided_in"),
  e("kn-dec-auth", "kn-prj-portal", "part_of"),
  e("kn-dec-auth", "kn-dec-owner", "references"),

  e("kn-rr-models", "kn-prj-eval", "part_of"),
  e("kn-rr-models", "kn-ag-sage", "authored_by"),
  e("kn-rr-freight", "kn-prj-rates", "part_of"),
  e("kn-rr-dash", "kn-prj-hq", "part_of"),
  e("kn-rr-dash", "kn-ag-sage", "authored_by"),

  e("kn-mem-tiers", "kn-rr-models", "derived_from", 2),
  e("kn-mem-tiers", "kn-ses-eval", "derived_from"),
  e("kn-mem-brief", "kn-ag-alfred", "relates_to"),
  e("kn-mem-nw-palette", "kn-co-nw", "owned_by"),
  e("kn-mem-nw-palette", "kn-doc-nw-brand", "derived_from"),
  e("kn-mem-md-tone", "kn-co-md", "owned_by"),
  e("kn-mem-md-tone", "kn-dec-waitlist", "relates_to"),
  e("kn-mem-hf-carriers", "kn-co-hf", "owned_by"),
  e("kn-mem-hf-carriers", "kn-doc-hf-contracts", "references"),

  e("kn-doc-arch", "kn-prj-hq", "part_of", 2),
  e("kn-doc-arch", "kn-dec-owner", "references"),
  e("kn-doc-arch", "kn-dec-readonly", "references"),
  e("kn-doc-dash", "kn-rr-dash", "derived_from", 2),
  e("kn-doc-dash", "kn-prj-hq", "part_of"),
  e("kn-doc-nw-brand", "kn-co-nw", "owned_by"),
  e("kn-doc-nw-brand", "kn-prj-portal", "references"),
  e("kn-doc-md-sop", "kn-prj-booking", "part_of"),
  e("kn-doc-md-sop", "kn-co-md", "owned_by"),
  e("kn-doc-hf-contracts", "kn-co-hf", "owned_by"),
  e("kn-doc-hf-contracts", "kn-rr-freight", "references"),
]
