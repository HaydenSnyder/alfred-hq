import type { Company, Project, Session } from "@/lib/types"

/**
 * Builds the prototype's canned reply. It is explicitly labelled as a demo
 * and never claims the message reached Hermes or any agent.
 */
export function buildDemoReply(prompt: string, session: Session, ctx: { company?: Company; project?: Project }): string {
  const target = ctx.company ? `${ctx.company.shortName} Alfred` : "Alfred (via Hermes)"
  const quoted = prompt.length > 140 ? `${prompt.slice(0, 140)}…` : prompt
  const lower = prompt.toLowerCase()

  const hints: string[] = []
  if (/(incident|outage|down|status|health)/.test(lower))
    hints.push("Open incidents and service health are visible under **Infrastructure & Devices** (demo records).")
  if (/(approv|deploy|restart)/.test(lower))
    hints.push("Approvals and restarts cannot be executed from HQ in this phase — they appear for review only under **Notifications & Approvals**.")
  if (/(research|report|source)/.test(lower)) hints.push("Example research records live under **Research & Intelligence**.")
  if (/(code|pr|pull request|repo|deploy|bug)/.test(lower))
    hints.push("Development projects, plans and PR references are under **Development**.")
  if (hints.length === 0) hints.push("Use the context controls above to associate this session with a company or project.")

  return [
    "**Demo response — this message was not sent to Hermes.**",
    "",
    `In the connected system, your request would be routed to **${target}**${ctx.project ? ` with project context **${ctx.project.name}**` : ""}. Nothing has been executed, and no agent has received it.`,
    "",
    `You asked: *“${quoted}”*`,
    "",
    ...hints.map((h) => `- ${h}`),
    "",
    `*Session ${session.id} is stored only in this browser.*`,
  ].join("\n")
}
