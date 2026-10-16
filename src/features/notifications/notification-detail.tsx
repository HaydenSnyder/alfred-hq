import { Check, MailOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime, scopeLabel, timeAgo, titleCase } from "@/lib/format"
import type { Company, Notification } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { DemoDataIndicator } from "@/components/hq/demo-data-indicator"
import { PropertyList } from "@/components/hq/panel"
import { SeverityBadge, ToneBadge } from "@/components/hq/status-badge"
import { channelMeta, channelOrder } from "./channels"
import { LinkedRecords } from "./linked-records"
import type { RecordIndex } from "./record-index"

export function NotificationDetail({
  notification,
  read,
  onToggleRead,
  index,
  companies,
  className,
}: {
  notification: Notification
  read: boolean
  onToggleRead: () => void
  index: RecordIndex
  companies: Company[]
  className?: string
}) {
  const n = notification
  return (
    <article className={cn("space-y-5", className)}>
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <SeverityBadge severity={n.severity} />
          <ToneBadge tone="muted" dot={false}>
            {titleCase(n.category)}
          </ToneBadge>
          {!read && <ToneBadge tone="info">Unread</ToneBadge>}
        </div>
        <h2 className="text-base font-semibold leading-snug text-pretty">{n.title}</h2>
        <p className="text-xs text-muted-foreground">
          <time dateTime={n.createdAt}>{formatDateTime(n.createdAt)}</time> · {timeAgo(n.createdAt)} · {scopeLabel(n.scope, companies)}
        </p>
      </header>

      <p className="text-sm leading-relaxed">{n.body}</p>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToggleRead}>
          {read ? <MailOpen /> : <Check />} {read ? "Mark unread" : "Mark read"}
        </Button>
        <span className="text-[11px] text-muted-foreground">Read state is local to this browser tab — not synced.</span>
      </div>

      <section className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground">Linked records</h3>
        <LinkedRecords refs={n.refs} index={index} />
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-medium text-muted-foreground">Delivery channels (recorded)</h3>
        <PropertyList
          items={channelOrder.map((c) => {
            const meta = channelMeta[c]
            const used = n.channels.includes(c)
            return {
              label: meta.label,
              value: used ? <ToneBadge tone="neutral">Recorded as sent</ToneBadge> : <span className="text-xs text-muted-foreground">Not sent</span>,
            }
          })}
        />
        <p className="text-[11px] text-muted-foreground">Delivery records are demo values. HQ does not send notifications.</p>
      </section>

      <div className="flex justify-center pt-1">
        <DemoDataIndicator variant="inline" label="Demo notification" />
      </div>
    </article>
  )
}
