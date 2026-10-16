"use client"

import { Check, ChevronsUpDown, Globe2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDirectory } from "@/lib/data/use-directory"
import { useHQ } from "@/components/providers/hq-store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CompanyMark } from "@/components/hq/avatars"

/** Switches the HQ workspace context. Filters lists; it is not a login switch. */
export function CompanySwitcher({ className }: { className?: string }) {
  const { companyContext, setCompanyContext } = useHQ()
  const { companies, companyById } = useDirectory()
  const current = companyById.get(companyContext)

  const label = companyContext === "all" ? "All workspaces" : companyContext === "personal" ? "Personal" : current?.shortName ?? "Company"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("h-8 max-w-52 gap-2 px-2 font-normal", className)} aria-label="Switch workspace context">
          {current ? (
            <CompanyMark company={current} size="sm" className="size-5 rounded text-[9px]" />
          ) : companyContext === "personal" ? (
            <User className="text-muted-foreground" />
          ) : (
            <Globe2 className="text-muted-foreground" />
          )}
          <span className="truncate text-sm">{label}</span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Workspace context</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => setCompanyContext("all")}>
          <Globe2 /> All workspaces
          {companyContext === "all" && <Check className="ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setCompanyContext("personal")}>
          <User /> Personal & Alfred core
          {companyContext === "personal" && <Check className="ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Companies</DropdownMenuLabel>
        {companies.map((c) => (
          <DropdownMenuItem key={c.id} onSelect={() => setCompanyContext(c.id)}>
            <CompanyMark company={c} size="sm" className="size-5 rounded text-[9px]" />
            <span className="truncate">{c.name}</span>
            {companyContext === c.id && <Check className="ml-auto" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-[11px] leading-snug text-muted-foreground">
          Context filters HQ views. Company employees use their own websites and logins.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
