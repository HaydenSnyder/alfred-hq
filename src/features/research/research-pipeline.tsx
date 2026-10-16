"use client"

import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { toneClasses } from "@/lib/status"
import type { ResearchRecord } from "@/lib/types"
import { stageMeta, stageOrder, type ResearchStage } from "./research-meta"

/**
 * Horizontal pipeline (stacked on phones) with record counts per stage.
 * Selecting a stage filters the record list; selecting it again clears.
 */
export function ResearchPipeline({
  records,
  selected,
  onSelect,
}: {
  records: ResearchRecord[]
  selected?: ResearchStage
  onSelect: (stage: ResearchStage | undefined) => void
}) {
  return (
    <ol className="grid gap-2 sm:grid-cols-5 sm:gap-0" aria-label="Research pipeline">
      {stageOrder.map((stage, i) => {
        const meta = stageMeta[stage]
        const items = records.filter((r) => r.stage === stage)
        const active = selected === stage
        const t = toneClasses[meta.tone]
        return (
          <li key={stage} className="relative flex min-w-0 items-stretch">
            <button
              type="button"
              onClick={() => onSelect(active ? undefined : stage)}
              aria-pressed={active}
              className={cn(
                "flex w-full min-w-0 items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:flex-col sm:items-start sm:gap-2",
                active && "border-foreground/25 bg-surface-2",
                selected && !active && "opacity-60"
              )}
            >
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={cn("flex size-5 items-center justify-center rounded-full border text-[10px] font-medium tabular", t.text, t.border, t.bg)}>
                  {i + 1}
                </span>
                <span className="font-medium text-foreground">{meta.label}</span>
              </span>
              <span className="ml-auto text-2xl font-semibold tracking-tight tabular sm:ml-0">{items.length}</span>
              <span className="hidden truncate text-[11px] text-muted-foreground sm:block sm:w-full">{meta.description}</span>
            </button>
            {i < stageOrder.length - 1 && (
              <ChevronRight className="hidden size-4 shrink-0 self-center text-muted-foreground/60 sm:mx-0.5 sm:block" aria-hidden />
            )}
          </li>
        )
      })}
    </ol>
  )
}
