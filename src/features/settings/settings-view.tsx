"use client"

import { useEffect, useState } from "react"
import { Bell, Brain, Building2, Code2, LayoutDashboard, Palette, PlugZap, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/hq/page-header"
import { AccessSection } from "./sections/access-section"
import { AppearanceSection } from "./sections/appearance-section"
import { CompaniesSection } from "./sections/companies-section"
import { DeveloperSection } from "./sections/developer-section"
import { GraphSection } from "./sections/graph-section"
import { IntegrationsSection } from "./sections/integrations-section"
import { LayoutSection } from "./sections/layout-section"
import { NotificationsSection } from "./sections/notifications-section"

const sections = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "layout", label: "Sidebar & dashboard", icon: LayoutDashboard },
  { id: "access", label: "Private access", icon: ShieldCheck },
  { id: "companies", label: "Company directory", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: PlugZap },
  { id: "graph", label: "Brain Graph", icon: Brain },
  { id: "developer", label: "Data source preview", icon: Code2 },
] as const

type SectionId = (typeof sections)[number]["id"]

/** Highlights the section nearest the top of the viewport. */
function useActiveSection(): [SectionId, (id: SectionId) => void] {
  const [active, setActive] = useState<SectionId>("appearance")

  useEffect(() => {
    const visible = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top)
          else visible.delete(e.target.id)
        }
        const first = sections.find((s) => visible.has(s.id))
        if (first) setActive(first.id)
      },
      { rootMargin: "-72px 0px -55% 0px", threshold: 0 }
    )
    for (const s of sections) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return [active, setActive]
}

export function SettingsView() {
  const [active, setActive] = useActiveSection()

  const go = (id: SectionId) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(id)
    if (!el) return
    e.preventDefault()
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
    window.history.replaceState(null, "", `#${id}`)
    setActive(id)
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Frontend preferences for this browser. Nothing here changes Alfred, Hermes, or any company system."
        demo={false}
      />

      <div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label="Settings sections" className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          {/* Mobile: compact scrollable chips. Desktop: vertical list. */}
          <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {sections.map((s) => {
              const isActive = active === s.id
              return (
                <li key={s.id} className="shrink-0">
                  <a
                    href={`#${s.id}`}
                    onClick={go(s.id)}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 lg:border-transparent",
                      isActive
                        ? "border-foreground/15 bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    )}
                  >
                    <s.icon className="size-3.5 shrink-0" aria-hidden />
                    {s.label}
                  </a>
                </li>
              )
            })}
          </ul>
          <p className="mt-4 hidden text-xs text-muted-foreground lg:block">
            Preferences are stored locally in this browser and persist across reloads.
          </p>
        </nav>

        <div className="min-w-0 space-y-4">
          <AppearanceSection />
          <LayoutSection />
          <AccessSection />
          <CompaniesSection />
          <NotificationsSection />
          <IntegrationsSection />
          <GraphSection />
          <DeveloperSection />
        </div>
      </div>
    </>
  )
}
