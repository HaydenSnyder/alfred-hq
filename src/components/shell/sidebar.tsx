"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown, Lock, PanelLeftClose, PanelLeftOpen, Plus, Pin } from "lucide-react"
import { cn } from "@/lib/utils"
import { isActive, navGroups, navItems, type NavItem } from "@/lib/nav"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { useDirectory } from "@/lib/data/use-directory"
import { inCompanyContext } from "@/lib/format"
import { useHQ } from "@/components/providers/hq-store"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CompanyMark } from "@/components/hq/avatars"
import { StatusDot } from "@/components/hq/status-badge"
import { healthMeta } from "@/lib/status"

export function AlfredLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background",
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19 12 5l7 14" />
        <path d="M8.5 13h7" />
      </svg>
    </span>
  )
}

/**
 * Primary navigation. `mode="rail"` renders the icon-only rail used when the
 * sidebar is collapsed on desktop or by default on tablets.
 */
export function Sidebar({ mode = "full", onNavigate }: { mode?: "full" | "rail"; onNavigate?: () => void }) {
  const pathname = usePathname()
  const { sidebarCollapsed, setSidebarCollapsed } = useHQ()
  const rail = mode === "rail"

  return (
    <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn("flex h-14 shrink-0 items-center gap-2.5 px-3", rail && "justify-center px-0")}>
        <Link href="/" onClick={onNavigate} className="flex min-w-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
          <AlfredLogo />
          {!rail && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">Alfred HQ</span>
              <span className="block truncate text-[11px] text-muted-foreground">Private headquarters</span>
            </span>
          )}
        </Link>
        {!rail && !onNavigate && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto hidden text-muted-foreground lg:inline-flex"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose />
          </Button>
        )}
      </div>

      {rail ? (
        <RailNav pathname={pathname} />
      ) : (
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-2 pb-3">
          <Button asChild variant="outline" className="mb-3 w-full justify-start bg-transparent dark:bg-transparent">
            <Link href="/chat?new=1" onClick={onNavigate}>
              <Plus /> New chat
            </Link>
          </Button>
          {navGroups.map((group) => (
            <div key={group.key} className="mb-3">
              <p className="px-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground/80 uppercase">{group.label}</p>
              <ul className="space-y-px">
                {navItems
                  .filter((n) => n.group === group.key)
                  .map((item) => (
                    <NavRow key={item.key} item={item} pathname={pathname} onNavigate={onNavigate} />
                  ))}
              </ul>
            </div>
          ))}
          <RecentSessions pathname={pathname} onNavigate={onNavigate} />
          <ProjectShortcuts pathname={pathname} onNavigate={onNavigate} />
        </div>
      )}

      <div className={cn("shrink-0 border-t border-sidebar-border p-2", rail && "flex flex-col items-center gap-1")}>
        {rail ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => setSidebarCollapsed(false)} aria-label="Expand sidebar" className="hidden lg:inline-flex">
                <PanelLeftOpen />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">O</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-foreground">Owner</span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Lock className="size-3" /> Owner-only access
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function NavRow({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const active = isActive(pathname, item.href)
  const { companies } = useDirectory()
  const children =
    item.key === "companies"
      ? companies.map((c) => ({ label: c.shortName, href: `/companies/${c.id}`, company: c }))
      : item.children?.map((c) => ({ ...c, company: undefined }))
  const [open, setOpen] = useState(active)
  const Icon = item.icon

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-8 min-w-0 flex-1 items-center gap-2.5 rounded-md px-2 text-[13px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className={cn("size-4 shrink-0", active ? "text-foreground" : "text-muted-foreground")} />
      <span className="truncate">{item.label}</span>
    </Link>
  )

  if (!children?.length) return <li>{link}</li>

  return (
    <li>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center">
          {link}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon-xs" className="ml-0.5 text-muted-foreground" aria-label={`${open ? "Collapse" : "Expand"} ${item.label}`}>
              <ChevronDown className={cn("transition-transform", !open && "-rotate-90")} />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <ul className="mt-px ml-[17px] space-y-px border-l border-sidebar-border pl-2">
            {children.map((child) => {
              const childActive = pathname === child.href.split("?")[0] && child.href.includes("/companies/")
              return (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex h-7 items-center gap-2 rounded-md px-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-sidebar-accent/70 hover:text-foreground",
                      childActive && "bg-sidebar-accent text-foreground"
                    )}
                  >
                    {child.company && <CompanyMark company={child.company} size="sm" className="size-4 rounded text-[8px]" />}
                    <span className="truncate">{child.label}</span>
                    {child.company && (
                      <StatusDot tone={healthMeta[child.company.health].tone} className="ml-auto size-1.5 [&>span]:size-1.5" />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

function SidebarSection({
  title,
  open,
  onOpenChange,
  children,
}: {
  title: string
  open: boolean
  onOpenChange: (v: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="mb-3">
      <CollapsibleTrigger className="flex w-full items-center gap-1 rounded-md px-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground/80 uppercase hover:text-foreground">
        <ChevronDown className={cn("size-3 transition-transform", !open && "-rotate-90")} />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}

function RecentSessions({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { localSessions, companyContext, preferences, updatePreferences } = useHQ()
  const q = useHQQuery("sessions", (p) => p.listSessions())
  const sessions = [...localSessions, ...(q.data ?? [])]
    .filter((s) => inCompanyContext(s.scope, companyContext))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6)

  return (
    <SidebarSection
      title="Recent sessions"
      open={preferences.sidebarSections.sessions}
      onOpenChange={(v) => updatePreferences({ sidebarSections: { ...preferences.sidebarSections, sessions: v } })}
    >
      <ul className="space-y-px">
        {q.status === "loading" && <li className="px-2 py-1 text-xs text-muted-foreground">Loading…</li>}
        {sessions.map((s) => {
          const active = pathname === `/chat/${s.id}`
          return (
            <li key={s.id}>
              <Link
                href={`/chat/${s.id}`}
                onClick={onNavigate}
                className={cn(
                  "flex h-7 items-center gap-2 rounded-md px-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-sidebar-accent/70 hover:text-foreground",
                  active && "bg-sidebar-accent text-foreground"
                )}
              >
                <span className="truncate">{s.title}</span>
                {s.pinned && <Pin className="ml-auto size-3 shrink-0" aria-label="Pinned" />}
                {s.local && <span className="ml-auto shrink-0 text-[10px] text-status-warning">local</span>}
              </Link>
            </li>
          )
        })}
        {q.status === "success" && sessions.length === 0 && (
          <li className="px-2 py-1 text-xs text-muted-foreground">No sessions in this context.</li>
        )}
      </ul>
    </SidebarSection>
  )
}

function ProjectShortcuts({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const { companyContext, preferences, updatePreferences } = useHQ()
  const q = useHQQuery("projects", (p) => p.listProjects())
  const projects = (q.data ?? []).filter((p) => p.status !== "completed" && inCompanyContext(p.scope, companyContext)).slice(0, 6)
  return (
    <SidebarSection
      title="Projects"
      open={preferences.sidebarSections.projects}
      onOpenChange={(v) => updatePreferences({ sidebarSections: { ...preferences.sidebarSections, projects: v } })}
    >
      <ul className="space-y-px">
        {projects.map((p) => {
          const active = pathname === `/projects/${p.id}`
          return (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                onClick={onNavigate}
                className={cn(
                  "flex h-7 items-center gap-2 rounded-md px-2 text-[12.5px] text-muted-foreground transition-colors hover:bg-sidebar-accent/70 hover:text-foreground",
                  active && "bg-sidebar-accent text-foreground"
                )}
              >
                <span className="w-9 shrink-0 font-mono text-[10px] text-muted-foreground/80">{p.key}</span>
                <span className="truncate">{p.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </SidebarSection>
  )
}

function RailNav({ pathname }: { pathname: string }) {
  return (
    <nav className="scrollbar-thin flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto py-2" aria-label="Primary">
      {navGroups.map((group, gi) => (
        <div key={group.key} className="flex flex-col items-center gap-1">
          {gi > 0 && <span className="my-1 h-px w-6 bg-sidebar-border" aria-hidden />}
          {navItems
            .filter((n) => n.group === group.key)
            .map((item) => {
              const active = isActive(pathname, item.href)
              const Icon = item.icon
              return (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        active ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            })}
        </div>
      ))}
    </nav>
  )
}
