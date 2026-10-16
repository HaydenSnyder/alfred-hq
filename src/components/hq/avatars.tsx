import { Bot, Crown, Cpu, FlaskConical, Radar, ShieldCheck, Sparkles, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/format"
import { healthMeta, toneClasses } from "@/lib/status"
import type { Agent, AgentRole, Company } from "@/lib/types"

const roleIcon: Record<AgentRole, typeof Bot> = {
  orchestrator: Crown,
  executive: Sparkles,
  cto: Cpu,
  lead: ShieldCheck,
  specialist: Wrench,
  researcher: FlaskConical,
  operator: Radar,
}

export function CompanyMark({
  company,
  size = "md",
  className,
}: {
  company: Pick<Company, "name" | "brandColor">
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const sizes = { sm: "size-6 text-[10px] rounded-md", md: "size-8 text-xs rounded-lg", lg: "size-12 text-base rounded-xl" }
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center font-semibold text-white", sizes[size], className)}
      style={{ backgroundColor: company.brandColor }}
      aria-hidden
    >
      {initials(company.name)}
    </span>
  )
}

export function AgentAvatar({
  agent,
  size = "md",
  showStatus = true,
  className,
}: {
  agent: Pick<Agent, "name" | "role" | "status">
  size?: "sm" | "md" | "lg"
  showStatus?: boolean
  className?: string
}) {
  const Icon = roleIcon[agent.role] ?? Bot
  const sizes = {
    sm: { box: "size-6 rounded-md", icon: "size-3.5", dot: "size-2 -right-0.5 -bottom-0.5" },
    md: { box: "size-8 rounded-lg", icon: "size-4", dot: "size-2.5 -right-0.5 -bottom-0.5" },
    lg: { box: "size-12 rounded-xl", icon: "size-6", dot: "size-3 right-0 bottom-0" },
  }[size]
  const tone = healthMeta[agent.status]?.tone ?? "muted"
  return (
    <span className={cn("relative inline-flex shrink-0", className)} aria-hidden>
      <span className={cn("inline-flex items-center justify-center border bg-surface-2 text-foreground/80", sizes.box)}>
        <Icon className={sizes.icon} />
      </span>
      {showStatus && (
        <span className={cn("absolute rounded-full ring-2 ring-card", sizes.dot, toneClasses[tone].dot)} />
      )}
    </span>
  )
}
