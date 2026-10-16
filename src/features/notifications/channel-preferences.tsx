"use client"

import { cn } from "@/lib/utils"
import { severityMeta, toneClasses } from "@/lib/status"
import type { NotificationChannel } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { Checkbox } from "@/components/ui/checkbox"
import { Panel } from "@/components/hq/panel"
import { ToneBadge } from "@/components/hq/status-badge"
import { channelMeta, channelOrder } from "./channels"
import { severityOrder } from "./inbox-filters"

/**
 * Per-severity delivery channel matrix. Stored in local preferences only —
 * nothing routes notifications from HQ in this phase.
 */
export function ChannelPreferences({ className }: { className?: string }) {
  const { preferences, updatePreferences } = useHQ()
  const matrix = preferences.notificationChannels

  const toggle = (sev: keyof typeof matrix, channel: NotificationChannel, on: boolean) => {
    const current = matrix[sev]
    const next = on ? channelOrder.filter((c) => c === channel || current.includes(c)) : current.filter((c) => c !== channel)
    updatePreferences({ notificationChannels: { ...matrix, [sev]: next } })
  }

  return (
    <Panel
      title="Channel preferences"
      description="Where each severity should reach you once delivery is wired up."
      actions={<ToneBadge tone="warning">Proposed — not active</ToneBadge>}
      className={className}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px] text-sm">
          <caption className="sr-only">Notification channels per severity (proposed, not active)</caption>
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th scope="col" className="py-2 pr-2 text-left font-normal">
                Severity
              </th>
              {channelOrder.map((c) => {
                const Icon = channelMeta[c].icon
                return (
                  <th key={c} scope="col" className="px-2 py-2 text-center font-normal">
                    <span className="inline-flex flex-col items-center gap-1">
                      <Icon className="size-3.5" aria-hidden />
                      {channelMeta[c].short}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody className="divide-y">
            {severityOrder.map((sev) => (
              <tr key={sev}>
                <th scope="row" className="py-2.5 pr-2 text-left font-normal">
                  <span className={cn("inline-flex items-center gap-2", toneClasses[severityMeta[sev].tone].text)}>
                    <span className={cn("size-1.5 rounded-full", toneClasses[severityMeta[sev].tone].dot)} aria-hidden />
                    {severityMeta[sev].label}
                  </span>
                </th>
                {channelOrder.map((c) => (
                  <td key={c} className="px-2 py-2.5 text-center">
                    <span className="inline-flex justify-center">
                      <Checkbox
                        checked={matrix[sev].includes(c)}
                        onCheckedChange={(v) => toggle(sev, c, v === true)}
                        aria-label={`${severityMeta[sev].label}: ${channelMeta[c].label}`}
                      />
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Saved in this browser only. HQ does not send iMessages or push notifications; Photon delivery is unchanged.
      </p>
    </Panel>
  )
}
