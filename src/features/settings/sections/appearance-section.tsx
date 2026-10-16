"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Rows3, Rows4, Sun } from "lucide-react"
import { useHQ } from "@/components/providers/hq-store"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SettingRow, SettingsSection, SwitchRow } from "../settings-primitives"

const subscribe = () => () => {}

/** True only after hydration, so theme-dependent UI never mismatches the server render. */
function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}

export function AppearanceSection() {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()
  const { preferences, updatePreferences } = useHQ()

  return (
    <SettingsSection id="appearance" title="Appearance" description="How HQ looks in this browser. Saved locally.">
      <SettingRow
        label="Theme"
        description="Dark is the default. System follows your device setting."
        control={
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={mounted ? (theme ?? "system") : undefined}
            onValueChange={(v) => v && setTheme(v)}
            aria-label="Theme"
          >
            <ToggleGroupItem value="dark" className="px-2.5">
              <Moon /> Dark
            </ToggleGroupItem>
            <ToggleGroupItem value="light" className="px-2.5">
              <Sun /> Light
            </ToggleGroupItem>
            <ToggleGroupItem value="system" className="px-2.5">
              <Monitor /> System
            </ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <SettingRow
        label="Density"
        description="Compact tightens text size across the shell."
        control={
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={preferences.density}
            onValueChange={(v) => v && updatePreferences({ density: v as "comfortable" | "compact" })}
            aria-label="Density"
          >
            <ToggleGroupItem value="comfortable" className="px-2.5">
              <Rows3 /> Comfortable
            </ToggleGroupItem>
            <ToggleGroupItem value="compact" className="px-2.5">
              <Rows4 /> Compact
            </ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <SwitchRow
        id="pref-demo-banner"
        label="Show demo data banner"
        description="The banner reminds you that every figure in the prototype is illustrative. Demo badges on pages remain visible either way."
        checked={preferences.showDemoBanner}
        onCheckedChange={(v) => updatePreferences({ showDemoBanner: v })}
      />
    </SettingsSection>
  )
}
