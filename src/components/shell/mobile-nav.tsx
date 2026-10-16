"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { isActive, mobileTabs, navItems } from "@/lib/nav"
import { useHQ } from "@/components/providers/hq-store"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

/** Slide-in navigation drawer (phones and tablets). */
export function MobileDrawer() {
  const { mobileNavOpen, setMobileNavOpen } = useHQ()
  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className="w-[85vw] max-w-xs gap-0 border-r p-0" showCloseButton={false}>
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <SheetDescription className="sr-only">Alfred HQ sections, recent sessions and projects</SheetDescription>
        <Sidebar onNavigate={() => setMobileNavOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

/** Compact bottom tab bar for iPhone-sized screens. */
export function MobileTabBar() {
  const pathname = usePathname()
  const { setMobileNavOpen } = useHQ()
  const tabs = mobileTabs.map((key) => navItems.find((n) => n.key === key)!).filter(Boolean)
  const shortLabel: Record<string, string> = { command: "Home", chat: "Chat", agents: "Agents", notifications: "Inbox" }

  return (
    <nav
      aria-label="Primary"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:hidden"
    >
      <ul className="grid grid-cols-5">
        {tabs.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 text-[10px] transition-colors",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("size-5", active && "stroke-[2.25]")} />
                {shortLabel[item.key] ?? item.label}
              </Link>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex h-14 w-full flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground"
          >
            <MoreHorizontal className="size-5" />
            More
          </button>
        </li>
      </ul>
    </nav>
  )
}
