"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Bell, Laptop, Menu, Moon, PanelRight, Search, Settings, Sun, Unplug } from "lucide-react"
import { cn } from "@/lib/utils"
import { isActive, navItems } from "@/lib/nav"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { useHQ } from "@/components/providers/hq-store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DemoDataIndicator } from "@/components/hq/demo-data-indicator"
import { StatusBadge } from "@/components/hq/status-badge"
import { getDataProvider } from "@/lib/data"
import { AlfredLogo } from "./sidebar"
import { CompanySwitcher } from "./company-switcher"

export function TopBar() {
  const pathname = usePathname()
  const { setMobileNavOpen, setSearchOpen, toggleInspector, inspector } = useHQ()
  const current = navItems.find((n) => isActive(pathname, n.href))

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-1.5 border-b bg-background/85 px-2 backdrop-blur supports-[backdrop-filter]:bg-background/70 md:gap-2 md:px-4">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">
        <Menu />
      </Button>
      <Link href="/" className="flex items-center gap-2 md:hidden" aria-label="Alfred HQ home">
        <AlfredLogo className="size-6" />
      </Link>

      <div className="hidden min-w-0 items-center gap-1 md:flex">
        <span className="truncate text-sm text-muted-foreground">{current?.label ?? "Alfred HQ"}</span>
        <span className="text-muted-foreground/40" aria-hidden>
          /
        </span>
      </div>
      <CompanySwitcher className="min-w-0" />

      <div className="ml-auto flex items-center gap-1 md:gap-1.5">
        <Button
          variant="outline"
          className="hidden h-8 w-56 justify-start gap-2 bg-transparent px-2.5 font-normal text-muted-foreground lg:flex dark:bg-transparent"
          onClick={() => setSearchOpen(true)}
        >
          <Search />
          <span className="text-sm">Search HQ…</span>
          <kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-[10px]">Ctrl K</kbd>
        </Button>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSearchOpen(true)} aria-label="Search">
          <Search />
        </Button>

        <ConnectionStatus />
        <NotificationsButton />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleInspector}
              aria-label={inspector.open ? "Close inspector" : "Open inspector"}
              aria-pressed={inspector.open}
              className={cn("hidden sm:inline-flex", inspector.open && "bg-accent")}
            >
              <PanelRight />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Context inspector</TooltipContent>
        </Tooltip>

        <AppearanceMenu />
      </div>
    </header>
  )
}

function ConnectionStatus() {
  const q = useHQQuery("integrations", (p) => p.listIntegrations())
  const core = (q.data ?? []).filter((i) => ["hermes", "photon", "dev-gateway", "memory", "research"].includes(i.key))
  const provider = getDataProvider()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          aria-label="Connection status: demo data, no live systems connected"
        >
          <span className="hidden sm:inline-flex">
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-status-warning/30 bg-status-warning/10 px-2.5 text-xs font-medium text-status-warning">
              <Unplug className="size-3.5" /> Demo · Not connected
            </span>
          </span>
          <span className="inline-flex size-8 items-center justify-center rounded-md text-status-warning sm:hidden">
            <Unplug className="size-4" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="space-y-2 border-b p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Connection status</p>
            <DemoDataIndicator />
          </div>
          <p className="text-xs text-muted-foreground">
            Data source: <span className="text-foreground">{provider.label}</span>. HQ is not connected to any live Alfred
            system. The first live adapter will be read-only.
          </p>
        </div>
        <ul className="divide-y">
          {core.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              <span>{i.provider}</span>
              <StatusBadge status={i.status} />
            </li>
          ))}
          {q.status === "loading" && <li className="px-3 py-2 text-xs text-muted-foreground">Checking…</li>}
          {(q.status === "error" || q.status === "offline") && (
            <li className="px-3 py-2 text-xs text-muted-foreground">Status unavailable — shown as unknown.</li>
          )}
        </ul>
        <div className="border-t p-2">
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link href="/integrations">View integrations</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationsButton() {
  const q = useHQQuery("notifications", (p) => p.listNotifications())
  const unread = (q.data ?? []).filter((n) => !n.read).length
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="ghost" size="icon" className="relative">
          <Link href="/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
            <Bell />
            {unread > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-status-danger px-1 text-[9px] font-semibold text-white tabular">
                {unread}
              </span>
            )}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Notifications & approvals</TooltipContent>
    </Tooltip>
  )
}

function AppearanceMenu() {
  const { theme, setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Appearance and settings">
          <Sun className="dark:hidden" />
          <Moon className="hidden dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Appearance</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme ?? "dark"} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="dark">
            <Moon /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="light">
            <Sun /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Laptop /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings /> Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
