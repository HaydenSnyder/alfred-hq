"use client"

import { Building2, KeyRound, ShieldCheck, UserRound } from "lucide-react"
import { PropertyList } from "@/components/hq/panel"
import { ToneBadge } from "@/components/hq/status-badge"
import { Note, SettingsSection } from "../settings-primitives"

const points = [
  {
    icon: ShieldCheck,
    title: "Owner-only headquarters",
    body: "HQ is a private interface for the owner of the Alfred ecosystem. It is not shared with staff or customers.",
  },
  {
    icon: UserRound,
    title: "No employee or multi-tenant access",
    body: "There are no employee accounts, roles, or tenant logins inside HQ, and none are planned for this surface.",
  },
  {
    icon: Building2,
    title: "Companies keep their own front doors",
    body: "Each company runs its own website and login. HQ observes company status; it never replaces or proxies their authentication.",
  },
]

export function AccessSection() {
  return (
    <SettingsSection
      id="access"
      title="Private access"
      description="Informational. Nothing here changes how anyone signs in."
      badge={<ToneBadge tone="muted">Read-only</ToneBadge>}
    >
      <ul className="divide-y">
        {points.map((p) => (
          <li key={p.title} className="flex items-start gap-3 py-3">
            <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg border bg-surface-2 text-muted-foreground">
              <p.icon className="size-3.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">{p.title}</p>
              <p className="text-xs text-muted-foreground text-pretty">{p.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t py-3">
        <PropertyList
          items={[
            { label: "Current session", value: "Owner (prototype — no authentication implemented)" },
            { label: "Sign-in method", value: <span className="text-muted-foreground">None in the prototype</span> },
          ]}
        />
      </div>
      <Note icon={<KeyRound />}>
        Authentication for HQ will be designed separately before any live data is connected. The prototype assumes the person viewing it is the owner.
      </Note>
    </SettingsSection>
  )
}
