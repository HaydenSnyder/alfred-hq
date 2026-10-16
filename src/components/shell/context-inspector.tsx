"use client"

import { X } from "lucide-react"
import { useHQ } from "@/components/providers/hq-store"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { InspectorContent } from "./inspector-content"

const KIND_LABEL: Record<string, string> = {
  agent: "Agent",
  company: "Company",
  project: "Project",
  task: "Task",
  session: "Session",
  incident: "Incident",
  approval: "Approval",
  research: "Research",
  device: "Device",
  service: "Service",
  integration: "Integration",
  node: "Memory node",
}

/**
 * Context-sensitive inspector. Docked on wide screens (≥1280px); an overlay
 * sheet on tablets and phones.
 */
export function ContextInspector() {
  const { inspector, setInspectorOpen } = useHQ()
  const docked = useMediaQuery("(min-width: 1280px)")
  const kind = inspector.selection ? KIND_LABEL[inspector.selection.kind] : "Inspector"

  if (docked) {
    if (!inspector.open) return null
    return (
      <aside
        aria-label="Context inspector"
        className="hidden w-[22rem] shrink-0 flex-col border-l bg-surface xl:flex animate-in slide-in-from-right-4 fade-in-0 duration-200"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <p className="text-sm font-medium">{kind}</p>
          <Button variant="ghost" size="icon-sm" onClick={() => setInspectorOpen(false)} aria-label="Close inspector">
            <X />
          </Button>
        </div>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-4">
          <InspectorContent selection={inspector.selection} />
        </div>
      </aside>
    )
  }

  return (
    <Sheet open={inspector.open} onOpenChange={setInspectorOpen}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>{kind}</SheetTitle>
          <SheetDescription className="sr-only">Details for the selected record</SheetDescription>
        </SheetHeader>
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-4">
          <InspectorContent selection={inspector.selection} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
