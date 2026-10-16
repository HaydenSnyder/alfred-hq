"use client"

import { FolderOpen, Info } from "lucide-react"
import { useHQ } from "@/components/providers/hq-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Note, SettingsSection, SubHeading, SwitchRow } from "../settings-primitives"

export function GraphSection() {
  const { preferences, updatePreferences } = useHQ()
  const graph = preferences.graph

  return (
    <SettingsSection id="graph" title="Brain Graph display" description="Defaults for the knowledge graph explorer.">
      <SwitchRow
        id="pref-graph-labels"
        label="Show node labels"
        description="Display names next to nodes. Turn off for dense graphs."
        checked={graph.showLabels}
        onCheckedChange={(v) => updatePreferences({ graph: { ...graph, showLabels: v } })}
      />
      <SwitchRow
        id="pref-graph-minimap"
        label="Show minimap"
        description="Overview map in the corner of the canvas."
        checked={graph.showMinimap}
        onCheckedChange={(v) => updatePreferences({ graph: { ...graph, showMinimap: v } })}
      />
      <SwitchRow
        id="pref-graph-animate"
        label="Animate edges"
        description="Flowing edge animation. Respects reduced-motion settings."
        checked={graph.animateEdges}
        onCheckedChange={(v) => updatePreferences({ graph: { ...graph, animateEdges: v } })}
      />

      <SubHeading>Obsidian vault</SubHeading>
      <div className="space-y-1.5 py-2">
        <Label htmlFor="pref-obsidian-path" className="text-sm font-normal">
          <FolderOpen className="size-3.5 text-muted-foreground" aria-hidden /> Vault path
        </Label>
        <Input
          id="pref-obsidian-path"
          value={preferences.obsidianVaultPath}
          onChange={(e) => updatePreferences({ obsidianVaultPath: e.target.value })}
          placeholder="~/Documents/Alfred Vault"
          spellCheck={false}
          autoComplete="off"
          className="font-mono text-xs sm:max-w-md"
          aria-describedby="pref-obsidian-note"
        />
      </div>
      <Note icon={<Info />}>
        <span id="pref-obsidian-note">
          Optional — the HQ Brain works without Obsidian; nothing is read from disk in the prototype.
        </span>
      </Note>
    </SettingsSection>
  )
}
