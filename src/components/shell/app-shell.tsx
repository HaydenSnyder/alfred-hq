"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHQ } from "@/components/providers/hq-store"
import { Button } from "@/components/ui/button"
import { DemoDataIndicator } from "@/components/hq/demo-data-indicator"
import { CommandSearch } from "./command-search"
import { ContextInspector } from "./context-inspector"
import { MobileDrawer, MobileTabBar } from "./mobile-nav"
import { Sidebar } from "./sidebar"
import { TopBar } from "./top-bar"

/**
 * Three-part HQ layout: navigation sidebar · central workspace · context
 * inspector, plus the top bar. Breakpoints:
 *  - < 768px   drawer navigation + bottom tab bar, inspector as overlay
 *  - 768–1023  icon rail, inspector as overlay
 *  - ≥ 1024    full sidebar (collapsible to rail)
 *  - ≥ 1280    inspector docks to the right
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, preferences, simulation } = useHQ()
  const pathname = usePathname()
  // Full-bleed screens manage their own padding/scrolling.
  const fullBleed = pathname.startsWith("/chat") || pathname.startsWith("/brain")

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm">
        Skip to content
      </a>

      {/* Tablet rail */}
      <aside className="hidden w-14 shrink-0 border-r border-sidebar-border md:block lg:hidden">
        <Sidebar mode="rail" />
      </aside>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border transition-[width] duration-200 lg:block",
          sidebarCollapsed ? "w-14" : "w-64"
        )}
      >
        <Sidebar mode={sidebarCollapsed ? "rail" : "full"} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        {preferences.showDemoBanner && <DemoBanner />}
        {simulation !== "normal" && (
          <div className="border-b bg-status-info/10 px-4 py-1.5 text-center text-xs text-status-info">
            Previewing data-source state: <strong className="font-medium">{simulation}</strong> — change it in Settings → Data source.
          </div>
        )}
        <div className="flex min-h-0 flex-1">
          <main
            id="main"
            className={cn(
              "min-w-0 flex-1",
              fullBleed
                ? cn("flex flex-col overflow-hidden md:pb-0", !pathname.startsWith("/chat/") && "pb-14")
                : "scrollbar-thin overflow-y-auto px-4 pt-5 pb-24 md:px-6 md:pt-6 md:pb-10 xl:px-8",
              preferences.density === "compact" && "text-[13px]"
            )}
          >
            {fullBleed ? children : <div className="mx-auto w-full max-w-[1400px]">{children}</div>}
          </main>
          <ContextInspector />
        </div>
      </div>

      <MobileDrawer />
      <MobileTabBar />
      <CommandSearch />
    </div>
  )
}

function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div className="flex items-center gap-2 border-b bg-status-warning/[0.06] px-3 py-1.5 md:px-4">
      <DemoDataIndicator label="Prototype" />
      <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
        Frontend prototype — every record is demo data. No live Alfred systems are connected, and no actions are executed.
      </p>
      <Button variant="ghost" size="icon-xs" onClick={() => setDismissed(true)} aria-label="Hide for this visit">
        <X />
      </Button>
    </div>
  )
}
