"use client"

import Link from "next/link"
import { ExternalLink, Globe2, Info, User } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { useHQ } from "@/components/providers/hq-store"
import { CompanyMark } from "@/components/hq/avatars"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { StatusBadge } from "@/components/hq/status-badge"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Note, SettingRow, SettingsSection } from "../settings-primitives"

export function CompaniesSection() {
  const { companyContext, setCompanyContext } = useHQ()
  const q = useHQQuery("settings-companies", (p) => p.listCompanies())
  const companies = q.data ?? []

  return (
    <SettingsSection
      id="companies"
      title="Company directory"
      description="Companies HQ observes. Your default workspace context filters lists across HQ."
    >
      <SettingRow
        label="Default workspace context"
        htmlFor="pref-company-context"
        description="Same as the switcher in the top bar. Remembered in this browser."
        control={
          <Select value={companyContext} onValueChange={setCompanyContext}>
            <SelectTrigger id="pref-company-context" className="w-full sm:w-56">
              <SelectValue placeholder="Choose context" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <Globe2 /> All workspaces
              </SelectItem>
              <SelectItem value="personal">
                <User /> Personal & Alfred core
              </SelectItem>
              {companies.length > 0 && (
                <>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Companies</SelectLabel>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <CompanyMark company={c} size="sm" className="size-4 rounded text-[8px]" />
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </>
              )}
            </SelectContent>
          </Select>
        }
      />

      <div className="py-3">
        {q.status === "loading" ? (
          <LoadingState rows={3} />
        ) : q.status === "error" || q.status === "offline" ? (
          <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
        ) : companies.length === 0 ? (
          <EmptyState title="No companies" description="The data source returned no companies." />
        ) : (
          <ul className="divide-y rounded-lg border">
            {companies.map((c) => (
              <li key={c.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <CompanyMark company={c} />
                  <div className="min-w-0">
                    <Link href={`/companies/${c.id}`} className="block truncate text-sm font-medium hover:underline">
                      {c.name}
                    </Link>
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <ExternalLink className="size-3 shrink-0" aria-hidden />
                      {c.website.url ?? "No website on record"}
                    </p>
                  </div>
                </div>
                <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <dt>Website</dt>
                    <dd>
                      <StatusBadge status={c.website.status} />
                    </dd>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <dt>Company Alfred</dt>
                    <dd>
                      <StatusBadge status={c.companyAlfred.status} />
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Note icon={<Info />}>
        Read-only. Company settings — staff, logins, branding, website configuration — live in each company&apos;s own system. HQ
        does not edit them.
      </Note>
    </SettingsSection>
  )
}
