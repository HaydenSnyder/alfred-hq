"use client"

import Link from "next/link"
import { ArrowUpRight, Database, Lock, PlugZap } from "lucide-react"
import { cn } from "@/lib/utils"
import { getDataProvider } from "@/lib/data"
import { ToneBadge } from "@/components/hq/status-badge"
import { Note, SettingsSection, SubHeading } from "../settings-primitives"

const options = [
  {
    value: "demo",
    title: "Demo data (MockDataProvider)",
    description: "Deterministic illustrative records generated in the browser. Nothing is read from Alfred systems.",
    icon: Database,
    disabled: false,
  },
  {
    value: "live",
    title: "Live read-only adapter",
    description: "Reads Hermes state through the planned HQ adapter. Not available until the adapter exists.",
    icon: PlugZap,
    disabled: true,
  },
]

export function IntegrationsSection() {
  const provider = getDataProvider()
  const selected = provider.origin === "live" ? "live" : "demo"

  return (
    <SettingsSection
      id="integrations"
      title="Integration preferences"
      description="How HQ reads the ecosystem. Integrations are observe-only in this phase."
      badge={<ToneBadge tone="muted">Read-only</ToneBadge>}
    >
      <SubHeading>Preferred data source</SubHeading>
      <div role="radiogroup" aria-label="Preferred data source" className="grid gap-2 py-2 sm:grid-cols-2">
        {options.map((o) => {
          const checked = o.value === selected
          return (
            <div
              key={o.value}
              role="radio"
              aria-checked={checked}
              aria-disabled={o.disabled || undefined}
              tabIndex={checked ? 0 : -1}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                checked ? "border-foreground/25 bg-surface-2" : "bg-transparent",
                o.disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                  checked ? "border-primary" : "border-input"
                )}
                aria-hidden
              >
                {checked && <span className="size-2 rounded-full bg-primary" />}
              </span>
              <div className="min-w-0 space-y-0.5">
                <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                  <o.icon className="size-3.5 text-muted-foreground" aria-hidden />
                  {o.title}
                  {o.disabled && (
                    <ToneBadge tone="muted" dot={false}>
                      <Lock className="size-2.5" aria-hidden /> Unavailable
                    </ToneBadge>
                  )}
                </p>
                <p className="text-xs text-muted-foreground text-pretty">{o.description}</p>
              </div>
            </div>
          )
        })}
      </div>
      <Note icon={<Lock />}>
        Adapter mode: <span className="font-medium text-foreground">read-only</span>. When a live adapter is connected, HQ will only
        observe — no restarts, deployments, approvals or configuration changes are sent to Hermes from this interface. Active
        provider: <span className="font-mono">{provider.label}</span>.
      </Note>
      <div className="pb-3">
        <Link href="/integrations" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          View integration status <ArrowUpRight className="size-3" aria-hidden />
        </Link>
      </div>
    </SettingsSection>
  )
}
