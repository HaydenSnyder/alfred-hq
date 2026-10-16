"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { setSourceSimulation } from "@/lib/data/mock-provider"
import type { SourceSimulation } from "@/lib/data/provider"
import type { Message, NotificationChannel, RecordRef, Session } from "@/lib/types"

/** "all" = every company + personal; "personal" = owner-only work; else a company id. */
export type CompanyContext = "all" | "personal" | string

export interface Preferences {
  density: "comfortable" | "compact"
  showDemoBanner: boolean
  sidebarSections: { sessions: boolean; projects: boolean }
  dashboardWidgets: Record<"health" | "agents" | "approvals" | "incidents" | "activity" | "companies" | "tasks", boolean>
  notificationChannels: Record<"critical" | "high" | "medium" | "low" | "info", NotificationChannel[]>
  graph: { showLabels: boolean; showMinimap: boolean; animateEdges: boolean }
  obsidianVaultPath: string
}

const defaultPreferences: Preferences = {
  density: "comfortable",
  showDemoBanner: true,
  sidebarSections: { sessions: true, projects: true },
  dashboardWidgets: { health: true, agents: true, approvals: true, incidents: true, activity: true, companies: true, tasks: true },
  notificationChannels: {
    critical: ["hq", "imessage", "push"],
    high: ["hq", "push"],
    medium: ["hq"],
    low: ["hq"],
    info: ["hq"],
  },
  graph: { showLabels: true, showMinimap: true, animateEdges: false },
  obsidianVaultPath: "",
}

interface HQStore {
  companyContext: CompanyContext
  setCompanyContext: (ctx: CompanyContext) => void

  inspector: { open: boolean; selection?: RecordRef }
  inspect: (ref: RecordRef) => void
  setInspectorOpen: (open: boolean) => void
  toggleInspector: () => void

  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
  mobileNavOpen: boolean
  setMobileNavOpen: (v: boolean) => void
  searchOpen: boolean
  setSearchOpen: (v: boolean) => void

  /** Sessions and messages created in this browser. Never sent to Hermes. */
  localSessions: Session[]
  localMessages: Message[]
  addLocalSession: (session: Session) => void
  updateLocalSession: (id: string, patch: Partial<Session>) => void
  addLocalMessage: (message: Message) => void
  clearLocalData: () => void

  preferences: Preferences
  updatePreferences: (patch: Partial<Preferences>) => void
  resetPreferences: () => void

  simulation: SourceSimulation
  setSimulation: (s: SourceSimulation) => void
  /** Bumps whenever data should be re-read (e.g. simulation changed). */
  dataEpoch: number
}

const HQContext = createContext<HQStore | null>(null)

const STORAGE_KEY = "alfred-hq:v1"

interface Persisted {
  companyContext?: CompanyContext
  sidebarCollapsed?: boolean
  localSessions?: Session[]
  localMessages?: Message[]
  preferences?: Partial<Preferences>
}

function readStorage(): Persisted {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Persisted) : {}
  } catch {
    return {}
  }
}

export function HQStoreProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [companyContext, setCompanyContext] = useState<CompanyContext>("all")
  const [inspector, setInspector] = useState<{ open: boolean; selection?: RecordRef }>({ open: false })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [localSessions, setLocalSessions] = useState<Session[]>([])
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences)
  const [simulation, setSimulationState] = useState<SourceSimulation>("normal")
  const [dataEpoch, setDataEpoch] = useState(0)

  // Hydrate per-browser conveniences after mount (keeps SSR output stable).
  useEffect(() => {
    const saved = readStorage()
    if (saved.companyContext) setCompanyContext(saved.companyContext)
    if (saved.sidebarCollapsed != null) setSidebarCollapsed(saved.sidebarCollapsed)
    if (saved.localSessions) setLocalSessions(saved.localSessions)
    if (saved.localMessages) setLocalMessages(saved.localMessages)
    if (saved.preferences) setPreferences((p) => ({ ...p, ...saved.preferences }))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      const data: Persisted = { companyContext, sidebarCollapsed, localSessions, localMessages, preferences }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Storage unavailable (private mode, blocked): the app still works without it.
    }
  }, [hydrated, companyContext, sidebarCollapsed, localSessions, localMessages, preferences])

  const inspect = useCallback((ref: RecordRef) => setInspector({ open: true, selection: ref }), [])
  const setInspectorOpen = useCallback((open: boolean) => setInspector((s) => ({ ...s, open })), [])
  const toggleInspector = useCallback(() => setInspector((s) => ({ ...s, open: !s.open })), [])

  const addLocalSession = useCallback((session: Session) => setLocalSessions((s) => [session, ...s]), [])
  const updateLocalSession = useCallback(
    (id: string, patch: Partial<Session>) => setLocalSessions((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s))),
    []
  )
  const addLocalMessage = useCallback((message: Message) => {
    setLocalMessages((m) => [...m, message])
    setLocalSessions((list) =>
      list.map((s) => (s.id === message.sessionId ? { ...s, updatedAt: message.createdAt } : s))
    )
  }, [])
  const clearLocalData = useCallback(() => {
    setLocalSessions([])
    setLocalMessages([])
  }, [])

  const updatePreferences = useCallback((patch: Partial<Preferences>) => setPreferences((p) => ({ ...p, ...patch })), [])
  const resetPreferences = useCallback(() => setPreferences(defaultPreferences), [])

  const setSimulation = useCallback((s: SourceSimulation) => {
    setSourceSimulation(s)
    setSimulationState(s)
    setDataEpoch((n) => n + 1)
  }, [])

  const value = useMemo<HQStore>(
    () => ({
      companyContext,
      setCompanyContext,
      inspector,
      inspect,
      setInspectorOpen,
      toggleInspector,
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileNavOpen,
      setMobileNavOpen,
      searchOpen,
      setSearchOpen,
      localSessions,
      localMessages,
      addLocalSession,
      updateLocalSession,
      addLocalMessage,
      clearLocalData,
      preferences,
      updatePreferences,
      resetPreferences,
      simulation,
      setSimulation,
      dataEpoch,
    }),
    [
      companyContext,
      inspector,
      inspect,
      setInspectorOpen,
      toggleInspector,
      sidebarCollapsed,
      mobileNavOpen,
      searchOpen,
      localSessions,
      localMessages,
      addLocalSession,
      updateLocalSession,
      addLocalMessage,
      clearLocalData,
      preferences,
      updatePreferences,
      resetPreferences,
      simulation,
      setSimulation,
      dataEpoch,
    ]
  )

  return <HQContext.Provider value={value}>{children}</HQContext.Provider>
}

export function useHQ() {
  const ctx = useContext(HQContext)
  if (!ctx) throw new Error("useHQ must be used inside <HQStoreProvider>")
  return ctx
}
