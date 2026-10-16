import {
  Activity,
  Bell,
  BrainCircuit,
  Building2,
  Code2,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Microscope,
  Plug,
  Server,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  key: string
  label: string
  href: string
  icon: LucideIcon
  /** Static sub-links. Dynamic children (companies, projects) are added by the sidebar. */
  children?: { label: string; href: string }[]
  group: "core" | "work" | "systems" | "admin"
}

export const navItems: NavItem[] = [
  { key: "command", label: "Command Center", href: "/", icon: LayoutDashboard, group: "core" },
  { key: "chat", label: "Alfred Chat", href: "/chat", icon: MessageSquare, group: "core" },
  { key: "companies", label: "Companies", href: "/companies", icon: Building2, group: "core" },
  { key: "agents", label: "Agent Workforce", href: "/agents", icon: Users, group: "core" },
  {
    key: "brain",
    label: "Brain & Memory",
    href: "/brain",
    icon: BrainCircuit,
    group: "work",
    children: [
      { label: "Global Brain", href: "/brain?view=global" },
      { label: "Company Brains", href: "/brain?view=company" },
      { label: "Project Graphs", href: "/brain?view=project" },
    ],
  },
  {
    key: "development",
    label: "Development",
    href: "/development",
    icon: Code2,
    group: "work",
    children: [
      { label: "Overview", href: "/development" },
      { label: "Requests", href: "/development?tab=requests" },
      { label: "Task Board", href: "/development?tab=board" },
    ],
  },
  { key: "research", label: "Research & Intelligence", href: "/research", icon: Microscope, group: "work" },
  { key: "projects", label: "Projects", href: "/projects", icon: FolderKanban, group: "work" },
  { key: "infrastructure", label: "Infrastructure & Devices", href: "/infrastructure", icon: Server, group: "systems" },
  { key: "integrations", label: "Integrations", href: "/integrations", icon: Plug, group: "systems" },
  { key: "activity", label: "Activity & History", href: "/activity", icon: Activity, group: "systems" },
  { key: "notifications", label: "Notifications & Approvals", href: "/notifications", icon: Bell, group: "systems" },
  { key: "resources", label: "Resources & Costs", href: "/resources", icon: Wallet, group: "admin" },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings, group: "admin" },
]

export const navGroups: { key: NavItem["group"]; label: string }[] = [
  { key: "core", label: "Headquarters" },
  { key: "work", label: "Work & Knowledge" },
  { key: "systems", label: "Systems" },
  { key: "admin", label: "Administration" },
]

/** Bottom tab bar on phones. */
export const mobileTabs = ["command", "chat", "agents", "notifications"] as const

export function isActive(pathname: string, href: string) {
  const base = href.split("?")[0]
  if (base === "/") return pathname === "/"
  return pathname === base || pathname.startsWith(`${base}/`)
}
