"use client"

import { useState } from "react"
import { toast } from "sonner"
import { RotateCcw, Trash2, Wrench } from "lucide-react"
import type { SourceSimulation } from "@/lib/data/provider"
import { useHQ } from "@/components/providers/hq-store"
import { ToneBadge } from "@/components/hq/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Note, SettingRow, SettingsSection } from "../settings-primitives"

const simulations: { value: SourceSimulation; label: string; description: string }[] = [
  { value: "normal", label: "Normal", description: "Demo data loads with a short realistic delay." },
  { value: "slow", label: "Slow (loading)", description: "Long delays to preview loading skeletons." },
  { value: "error", label: "Error", description: "Every request fails to preview error states and retry." },
  { value: "offline", label: "Offline", description: "The source is unreachable to preview offline states." },
  { value: "empty", label: "Empty", description: "Requests succeed with no records to preview empty states." },
]

type Pending = "clear" | "reset" | null

export function DeveloperSection() {
  const { simulation, setSimulation, clearLocalData, resetPreferences, localSessions } = useHQ()
  const [pending, setPending] = useState<Pending>(null)
  const current = simulations.find((s) => s.value === simulation) ?? simulations[0]

  const confirm = () => {
    if (pending === "clear") {
      clearLocalData()
      toast.success("Local demo sessions cleared")
    } else if (pending === "reset") {
      resetPreferences()
      toast.success("Preferences reset to defaults")
    }
    setPending(null)
  }

  return (
    <SettingsSection
      id="developer"
      title="Data source preview"
      description="Developer tools for previewing interface states. Affects only this browser tab."
      badge={<ToneBadge tone="info">Developer</ToneBadge>}
    >
      <SettingRow
        label="Simulated source condition"
        htmlFor="pref-simulation"
        description={current.description}
        control={
          <Select value={simulation} onValueChange={(v) => setSimulation(v as SourceSimulation)}>
            <SelectTrigger id="pref-simulation" className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {simulations.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      {simulation !== "normal" && (
        <Note icon={<Wrench />} className="border-status-warning/25 bg-status-warning/[0.07]">
          Previewing the <span className="font-medium text-foreground">{current.label.toLowerCase()}</span> state across HQ. This page&apos;s
          controls keep working.{" "}
          <button type="button" className="font-medium text-foreground underline underline-offset-2" onClick={() => setSimulation("normal")}>
            Return to normal
          </button>
        </Note>
      )}
      <SettingRow
        label="Clear local demo sessions"
        description={`Removes chat sessions and messages created in this browser (${localSessions.length} session${localSessions.length === 1 ? "" : "s"}). Built-in demo sessions are unaffected.`}
        control={
          <Button variant="outline" size="sm" onClick={() => setPending("clear")} disabled={localSessions.length === 0}>
            <Trash2 /> Clear sessions
          </Button>
        }
      />
      <SettingRow
        label="Reset preferences"
        description="Restores appearance density, banner, sidebar, widget, notification and graph defaults. Theme is managed separately."
        control={
          <Button variant="outline" size="sm" onClick={() => setPending("reset")}>
            <RotateCcw /> Reset
          </Button>
        }
      />

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pending === "clear" ? "Clear local demo sessions?" : "Reset preferences?"}</DialogTitle>
            <DialogDescription>
              {pending === "clear"
                ? "Sessions and messages you created in this browser will be removed. This cannot be undone. Nothing was ever sent to Hermes."
                : "All HQ preferences return to their defaults. Your workspace context and local sessions are kept."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant={pending === "clear" ? "destructive" : "default"} onClick={confirm}>
              {pending === "clear" ? "Clear sessions" : "Reset preferences"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  )
}
