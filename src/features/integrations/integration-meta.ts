import { BookOpen, Building2, Code2, MessageCircle, Server, Workflow } from "lucide-react"
import type { Integration } from "@/lib/types"
import type { Tone } from "@/lib/status"

export type IntegrationCategory = Integration["category"]

export const categoryOrder: IntegrationCategory[] = ["orchestration", "messaging", "code", "knowledge", "infrastructure", "company"]

export const categoryMeta: Record<IntegrationCategory, { label: string; description: string; icon: typeof Server }> = {
  orchestration: { label: "Orchestration", description: "Hermes and the agent runtime HQ will observe.", icon: Workflow },
  messaging: { label: "Messaging", description: "Owner communication bridges.", icon: MessageCircle },
  code: { label: "Code & development", description: "Repositories, gateways and coding environments.", icon: Code2 },
  knowledge: { label: "Knowledge", description: "Memory, research and optional note vaults.", icon: BookOpen },
  infrastructure: { label: "Infrastructure", description: "Hosts, devices and service health.", icon: Server },
  company: { label: "Company systems", description: "Independent company websites and their Alfreds.", icon: Building2 },
}

export const modeMeta: Record<Integration["mode"], { label: string; tone: Tone; description: string }> = {
  planned: { label: "Planned", tone: "muted", description: "Designed but not built. No connection exists." },
  read_only: { label: "Read-only", tone: "info", description: "HQ may read state. It can never change the source." },
  read_write: { label: "Read-write", tone: "warning", description: "Would allow HQ to act on the source. Not permitted in this phase." },
}

export interface ChecklistItem {
  id: string
  label: string
  detail: string
}

/**
 * What a future, read-only connection would need. Purely descriptive — none
 * of these steps can be performed from the prototype.
 */
export function connectionChecklist(i: Integration): ChecklistItem[] {
  const base: ChecklistItem[] = [
    {
      id: "contract",
      label: "Read-only data contract agreed",
      detail: "Endpoint list and payload shapes reviewed against the HQDataProvider interface.",
    },
    {
      id: "auth",
      label: "Scoped, server-side credential",
      detail: "A least-privilege, read-only token held by the HQ adapter — never stored in the browser.",
    },
    {
      id: "health",
      label: "Health check defined",
      detail: "A verifiable check so status can move from Unconfigured to a real value with a timestamp.",
    },
  ]
  const specific: Record<IntegrationCategory, ChecklistItem> = {
    orchestration: { id: "adapter", label: "Hermes read-only adapter deployed", detail: "Exposes agents, tasks, sessions and service health without write routes." },
    messaging: { id: "observe", label: "Delivery-state feed only", detail: "Observe delivery receipts; message routing stays inside Photon." },
    code: { id: "repo-scope", label: "Repository allow-list", detail: "Explicit list of repositories and checks HQ may read." },
    knowledge: { id: "scope", label: "Knowledge scope boundaries", detail: "Global vs company brains mapped so company data never leaks across contexts." },
    infrastructure: { id: "agent", label: "Metrics exporter on each host", detail: "Push-only metrics; no remote shell or restart capability." },
    company: { id: "company-auth", label: "Company owner consent", detail: "Company site keeps its own login; HQ reads public status only." },
  }
  const review: ChecklistItem = {
    id: "review",
    label: "Owner review & sign-off",
    detail: "Explicit approval before HQ shows live data from this source.",
  }
  const [contract, ...rest] = base
  return [contract, specific[i.category], ...rest, review]
}
