"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useHQ } from "@/components/providers/hq-store"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { navItems } from "@/lib/nav"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { DemoDataIndicator } from "@/components/hq/demo-data-indicator"

const GROUP_LABEL: Record<string, string> = {
  company: "Companies",
  agent: "Agents",
  project: "Projects",
  task: "Tasks",
  session: "Sessions",
  incident: "Incidents",
  research: "Research",
  node: "Brain",
  integration: "Integrations",
  device: "Devices",
  service: "Services",
}

/** Universal search across demo records (Ctrl/⌘ K). */
export function CommandSearch() {
  const { searchOpen, setSearchOpen } = useHQ()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [setSearchOpen])

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 120)
    return () => clearTimeout(t)
  }, [query])

  const q = useHQQuery(`search:${debounced}`, (p) => p.search(debounced))
  const results = q.data ?? []
  const groups = Object.entries(
    results.reduce<Record<string, typeof results>>((acc, r) => {
      ;(acc[r.ref.kind] ??= []).push(r)
      return acc
    }, {})
  )

  const go = (href: string) => {
    setSearchOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <CommandDialog
      open={searchOpen}
      onOpenChange={setSearchOpen}
      title="Search Alfred HQ"
      description="Search demo records across companies, agents, projects and more"
      className="sm:max-w-xl"
    >
      {/* Results come from the provider, so cmdk's own filtering is disabled. */}
      <Command shouldFilter={false}>
        <CommandInput placeholder="Search companies, agents, projects, incidents…" value={query} onValueChange={setQuery} />
        <CommandList className="max-h-[60vh]">
          {debounced && q.status === "success" && <CommandEmpty>No demo records match “{debounced}”.</CommandEmpty>}
          {!debounced && (
            <CommandGroup heading="Jump to">
              {navItems.map((n) => (
                <CommandItem key={n.key} value={n.label} onSelect={() => go(n.href)}>
                  <n.icon /> {n.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {groups.map(([kind, items]) => (
            <CommandGroup key={kind} heading={GROUP_LABEL[kind] ?? kind}>
              {items.map((r) => (
                <CommandItem key={`${r.ref.kind}:${r.ref.id}`} value={`${r.title} ${r.ref.id}`} onSelect={() => go(r.href)}>
                  <span className="truncate">{r.title}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">{r.subtitle}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
        <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground">
          <span>Searching demo records only</span>
          <DemoDataIndicator variant="inline" />
        </div>
      </Command>
    </CommandDialog>
  )
}
