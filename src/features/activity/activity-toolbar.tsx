"use client"

import { RotateCcw, Search } from "lucide-react"
import { severityMeta } from "@/lib/status"
import type { Agent, Company, OperationalEventType, Severity } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { eventTypeMeta } from "@/components/hq/event-timeline"
import { activeFilterCount, dateRangeLabel, defaultActivityFilters, type ActivityFilters, type DateRange } from "./activity-filters"

const severities: Severity[] = ["critical", "high", "medium", "low", "info"]
const ranges: DateRange[] = ["today", "7d", "30d", "all"]

export function ActivityToolbar({
  value,
  onChange,
  agents,
  companies,
  scopeOptions,
}: {
  value: ActivityFilters
  onChange: (next: ActivityFilters) => void
  agents: Agent[]
  companies: Company[]
  /** Scopes available in the current company context. */
  scopeOptions: { global: boolean; personal: boolean; companyIds: string[] }
}) {
  const set = <K extends keyof ActivityFilters>(key: K, v: ActivityFilters[K]) => onChange({ ...value, [key]: v })
  const active = activeFilterCount(value)

  return (
    <div className="space-y-3 rounded-xl border bg-card p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <InputGroup className="md:max-w-sm">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={value.text}
            onChange={(e) => set("text", e.target.value)}
            placeholder="Search events, details, agents…"
            aria-label="Search operational history"
          />
        </InputGroup>
        <div className="-mx-1 overflow-x-auto px-1 md:ml-auto">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={0}
            value={value.range}
            onValueChange={(v) => v && set("range", v as DateRange)}
            aria-label="Date range"
          >
            {ranges.map((r) => (
              <ToggleGroupItem key={r} value={r} className="px-2.5 text-xs">
                {dateRangeLabel[r]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <Select value={value.scope} onValueChange={(v) => set("scope", v)}>
          <SelectTrigger size="sm" className="w-full sm:w-44" aria-label="Company or scope">
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
                      {companies.find((c) => c.id === id)?.shortName ?? id}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </>
            )}
          </SelectContent>
        </Select>

        <Select value={value.agentId} onValueChange={(v) => set("agentId", v)}>
          <SelectTrigger size="sm" className="w-full sm:w-44" aria-label="Agent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            {agents.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={value.type} onValueChange={(v) => set("type", v as ActivityFilters["type"])}>
          <SelectTrigger size="sm" className="w-full sm:w-48" aria-label="Event type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All event types</SelectItem>
            {(Object.keys(eventTypeMeta) as OperationalEventType[]).map((t) => {
              const Icon = eventTypeMeta[t].icon
              return (
                <SelectItem key={t} value={t}>
                  <Icon className="text-muted-foreground" /> {eventTypeMeta[t].label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        <Select value={value.severity} onValueChange={(v) => set("severity", v as ActivityFilters["severity"])}>
          <SelectTrigger size="sm" className="w-full sm:w-36" aria-label="Severity">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            {severities.map((s) => (
              <SelectItem key={s} value={s}>
                {severityMeta[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          className="col-span-2 sm:col-span-1 sm:ml-auto"
          disabled={active === 0}
          onClick={() => onChange(defaultActivityFilters)}
        >
          <RotateCcw /> Reset{active > 0 && ` (${active})`}
        </Button>
      </div>
    </div>
  )
}
