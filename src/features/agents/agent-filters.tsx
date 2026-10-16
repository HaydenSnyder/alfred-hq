"use client"

import { LayoutGrid, List, Network, Search, X } from "lucide-react"
import type { AgentRole, Company } from "@/lib/types"
import { agentRoleLabel } from "@/components/hq/agent-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { roleOptions, statusFilterOptions, type AgentFilterState, type StatusFilter, type ViewMode } from "./agent-utils"

export function AgentFilters({
  filters,
  companies,
  scopeOptions,
  view,
  onStatusChange,
  onScopeChange,
  onDepartmentChange,
  onRoleChange,
  onQueryChange,
  onViewChange,
  onClear,
}: {
  filters: AgentFilterState
  companies: Company[]
  /** Scopes present in the current HQ context. */
  scopeOptions: { global: boolean; personal: boolean; companyIds: string[] }
  view: ViewMode
  onStatusChange: (v: StatusFilter) => void
  onScopeChange: (v: string) => void
  onDepartmentChange: (v: string) => void
  onRoleChange: (v: "all" | AgentRole) => void
  onQueryChange: (v: string) => void
  onViewChange: (v: ViewMode) => void
  onClear: () => void
}) {
  const selectedCompany = companies.find((c) => c.id === filters.scope)
  const active =
    filters.status !== "all" || filters.scope !== "all" || filters.department !== "all" || filters.role !== "all" || filters.query.trim() !== ""

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={filters.query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search agents, titles, models…"
            aria-label="Search agents"
            className="pl-8"
          />
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={view}
          onValueChange={(v) => v && onViewChange(v as ViewMode)}
          aria-label="View"
          className="self-start sm:self-auto"
        >
          <ToggleGroupItem value="grid" aria-label="Card grid">
            <LayoutGrid /> <span className="hidden md:inline">Cards</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Dense list">
            <List /> <span className="hidden md:inline">List</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="hierarchy" aria-label="Hierarchy">
            <Network /> <span className="hidden md:inline">Hierarchy</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <Select value={filters.status} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
          <SelectTrigger size="sm" className="w-full sm:w-44" aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilterOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.scope} onValueChange={onScopeChange}>
          <SelectTrigger size="sm" className="w-full sm:w-44" aria-label="Scope">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All scopes</SelectItem>
            {scopeOptions.global && <SelectItem value="global">Global</SelectItem>}
            {scopeOptions.personal && <SelectItem value="personal">Personal</SelectItem>}
            {scopeOptions.companyIds.length > 0 && (
              <>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Companies</SelectLabel>
                  {scopeOptions.companyIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {companies.find((c) => c.id === id)?.name ?? id}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </>
            )}
          </SelectContent>
        </Select>

        {selectedCompany && (
          <Select value={filters.department} onValueChange={onDepartmentChange}>
            <SelectTrigger size="sm" className="w-full sm:w-44" aria-label="Department">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {selectedCompany.departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={filters.role} onValueChange={(v) => onRoleChange(v as "all" | AgentRole)}>
          <SelectTrigger size="sm" className="w-full sm:w-40" aria-label="Role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roleOptions.map((r) => (
              <SelectItem key={r} value={r}>
                {agentRoleLabel[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {active && (
          <Button variant="ghost" size="sm" onClick={onClear} className="justify-self-start">
            <X /> Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
