import { CircleDashed } from "lucide-react"
import type { Integration } from "@/lib/types"
import { Panel } from "@/components/hq/panel"
import { ToneBadge } from "@/components/hq/status-badge"
import { connectionChecklist } from "./integration-meta"

/** Mock checklist of what a future read-only connection would require. */
export function ConnectionChecklist({ integration }: { integration: Integration }) {
  const items = connectionChecklist(integration)
  return (
    <Panel
      title="Connection checklist"
      description="What will be needed later. Illustrative — none of these steps can be completed from HQ."
      actions={<ToneBadge tone="muted" dot={false}>0 of {items.length} complete</ToneBadge>}
    >
      <ol className="space-y-3">
        {items.map((item, idx) => (
          <li key={item.id} className="flex gap-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-muted-foreground" aria-hidden>
              <CircleDashed className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <span className="mr-1.5 text-xs text-muted-foreground tabular">{idx + 1}.</span>
                {item.label}
              </p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground">Not started</span>
          </li>
        ))}
      </ol>
    </Panel>
  )
}
