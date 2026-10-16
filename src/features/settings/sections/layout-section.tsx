"use client"

import { useHQ, type Preferences } from "@/components/providers/hq-store"
import { SettingsSection, SubHeading, SwitchRow } from "../settings-primitives"

type WidgetKey = keyof Preferences["dashboardWidgets"]

const widgets: { key: WidgetKey; label: string; description: string }[] = [
  { key: "health", label: "System health", description: "Verified service health summary." },
  { key: "agents", label: "Agents", description: "Registered and working agent counts." },
  { key: "approvals", label: "Approvals", description: "Pending approvals waiting on you." },
  { key: "incidents", label: "Incidents", description: "Open incidents and critical alerts." },
  { key: "activity", label: "Activity", description: "Recent operational events timeline." },
  { key: "companies", label: "Companies", description: "Company health and activity rows." },
  { key: "tasks", label: "Tasks", description: "Active tasks across projects." },
]

export function LayoutSection() {
  const { preferences, updatePreferences } = useHQ()
  const { sidebarSections, dashboardWidgets } = preferences

  return (
    <SettingsSection id="layout" title="Sidebar & dashboard" description="Choose what appears in the sidebar and on the Command Center.">
      <SubHeading>Sidebar sections</SubHeading>
      <SwitchRow
        id="pref-sidebar-sessions"
        label="Recent sessions"
        description="Pinned and recent chat sessions under the main navigation."
        checked={sidebarSections.sessions}
        onCheckedChange={(v) => updatePreferences({ sidebarSections: { ...sidebarSections, sessions: v } })}
      />
      <SwitchRow
        id="pref-sidebar-projects"
        label="Projects"
        description="Active projects list."
        checked={sidebarSections.projects}
        onCheckedChange={(v) => updatePreferences({ sidebarSections: { ...sidebarSections, projects: v } })}
      />

      <SubHeading>Command Center widgets</SubHeading>
      <div className="grid gap-x-8 md:grid-cols-2">
        {widgets.map((w) => (
          <SwitchRow
            key={w.key}
            id={`pref-widget-${w.key}`}
            label={w.label}
            description={w.description}
            checked={dashboardWidgets[w.key]}
            onCheckedChange={(v) => updatePreferences({ dashboardWidgets: { ...dashboardWidgets, [w.key]: v } })}
          />
        ))}
      </div>
    </SettingsSection>
  )
}
