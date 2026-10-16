"use client"

import { BellRing, MessageCircle, MonitorSmartphone, Smartphone } from "lucide-react"
import type { NotificationChannel, Severity } from "@/lib/types"
import { severityMeta } from "@/lib/status"
import { useHQ } from "@/components/providers/hq-store"
import { SeverityBadge, ToneBadge } from "@/components/hq/status-badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Note, SettingsSection } from "../settings-primitives"

const severities: Severity[] = ["critical", "high", "medium", "low", "info"]
const channels: { key: NotificationChannel; label: string; icon: typeof BellRing }[] = [
  { key: "hq", label: "HQ", icon: MonitorSmartphone },
  { key: "imessage", label: "iMessage", icon: MessageCircle },
  { key: "push", label: "Mobile push", icon: Smartphone },
]

export function NotificationsSection() {
  const { preferences, updatePreferences } = useHQ()
  const routing = preferences.notificationChannels

  const toggle = (severity: Severity, channel: NotificationChannel, on: boolean) => {
    const current = routing[severity]
    const next = on ? [...new Set([...current, channel])] : current.filter((c) => c !== channel)
    // Keep a stable channel order regardless of click order.
    const ordered = channels.map((c) => c.key).filter((k) => next.includes(k))
    updatePreferences({ notificationChannels: { ...routing, [severity]: ordered } })
  }

  return (
    <SettingsSection
      id="notifications"
      title="Notifications"
      description="Where each severity should reach you once delivery is connected."
      badge={<ToneBadge tone="warning">Proposed — not active</ToneBadge>}
    >
      <div className="overflow-x-auto py-2">
        <table className="w-full min-w-[360px] text-sm">
          <caption className="sr-only">Notification channels per severity (proposed, not active)</caption>
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th scope="col" className="py-2 text-left font-medium">
                Severity
              </th>
              {channels.map((c) => (
                <th key={c.key} scope="col" className="px-2 py-2 text-center font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <c.icon className="size-3.5" aria-hidden />
                    {c.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {severities.map((s) => (
              <tr key={s}>
                <th scope="row" className="py-2.5 text-left font-normal">
                  <SeverityBadge severity={s} />
                </th>
                {channels.map((c) => {
                  const id = `notify-${s}-${c.key}`
                  return (
                    <td key={c.key} className="px-2 py-2.5 text-center">
                      <label htmlFor={id} className="sr-only">
                        {`${severityMeta[s].label} via ${c.label}`}
                      </label>
                      <Checkbox
                        id={id}
                        className="mx-auto"
                        checked={routing[s].includes(c.key)}
                        onCheckedChange={(v) => toggle(s, c.key, v === true)}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note icon={<BellRing />}>
        Preferences are saved in this browser only. No messages are sent by the prototype — iMessage delivery via Photon and mobile push
        are not connected.
      </Note>
    </SettingsSection>
  )
}
