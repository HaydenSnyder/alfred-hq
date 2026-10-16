"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import { useHQ } from "@/components/providers/hq-store"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { inCompanyContext } from "@/lib/format"
import type { Company, Message, Project, Scope, Session } from "@/lib/types"
import type { ComposerAttachment } from "@/components/hq/chat-composer"
import { buildDemoReply } from "./demo-reply"

interface ChatContextValue {
  status: "loading" | "success" | "error" | "offline"
  refetch: () => void
  sessions: Session[]
  /** All sessions regardless of company context (for direct links). */
  allSessions: Session[]
  companies: Company[]
  projects: Project[]
  pending: Set<string>
  startSession: (prompt: string, attachments?: ComposerAttachment[]) => string
  send: (sessionId: string, text: string, attachments?: ComposerAttachment[]) => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

const REPLY_DELAY_MS = 900

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { localSessions, addLocalSession, addLocalMessage, companyContext } = useHQ()
  const [pending, setPending] = useState<Set<string>>(new Set())

  const q = useHQQuery("chat:base", async (p) => {
    const [sessions, companies, projects] = await Promise.all([p.listSessions(), p.listCompanies(), p.listProjects()])
    return { sessions, companies, projects }
  })

  const allSessions = useMemo(() => [...localSessions, ...(q.data?.sessions ?? [])], [localSessions, q.data])
  const sessions = useMemo(
    () =>
      allSessions
        .filter((s) => inCompanyContext(s.scope, companyContext))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [allSessions, companyContext]
  )
  const companies = useMemo(() => q.data?.companies ?? [], [q.data])
  const projects = useMemo(() => q.data?.projects ?? [], [q.data])

  const send = useCallback(
    (sessionId: string, text: string, attachments: ComposerAttachment[] = [], sessionOverride?: Session) => {
      const now = new Date().toISOString()
      addLocalMessage({
        id: newId("msg"),
        origin: "demo",
        sessionId,
        author: { kind: "user" },
        content: text,
        attachments: attachments.length ? attachments : undefined,
        createdAt: now,
        updatedAt: now,
      })
      setPending((s) => new Set(s).add(sessionId))

      const session = sessionOverride ?? allSessions.find((s) => s.id === sessionId)
      const company =
        session?.scope.kind === "company" ? companies.find((c) => c.id === (session.scope as { companyId: string }).companyId) : undefined
      const project = session?.projectId ? projects.find((p) => p.id === session.projectId) : undefined
      const agentId = company?.companyAlfred.agentId ?? "ag-alfred"

      window.setTimeout(() => {
        const at = new Date().toISOString()
        addLocalMessage({
          id: newId("msg"),
          origin: "demo",
          sessionId,
          author: { kind: "agent", agentId },
          content: buildDemoReply(text, session ?? ({ id: sessionId } as Session), { company, project }),
          simulated: true,
          createdAt: at,
          updatedAt: at,
        })
        setPending((s) => {
          const next = new Set(s)
          next.delete(sessionId)
          return next
        })
      }, REPLY_DELAY_MS)
    },
    [addLocalMessage, allSessions, companies, projects]
  )

  const startSession = useCallback(
    (prompt: string, attachments: ComposerAttachment[] = []) => {
      const now = new Date().toISOString()
      const scope: Scope =
        companyContext !== "all" && companyContext !== "personal" ? { kind: "company", companyId: companyContext } : { kind: "personal" }
      const company = scope.kind === "company" ? companies.find((c) => c.id === scope.companyId) : undefined
      const session: Session = {
        id: newId("local"),
        origin: "demo",
        title: prompt.length > 52 ? `${prompt.slice(0, 52).trim()}…` : prompt,
        scope,
        agentIds: [company?.companyAlfred.agentId ?? "ag-alfred"],
        taskIds: [],
        local: true,
        createdAt: now,
        updatedAt: now,
      }
      addLocalSession(session)
      send(session.id, prompt, attachments, session)
      return session.id
    },
    [addLocalSession, companies, companyContext, send]
  )

  const value = useMemo<ChatContextValue>(
    () => ({
      status: q.status,
      refetch: q.refetch,
      sessions,
      allSessions,
      companies,
      projects,
      pending,
      startSession,
      send: (id, text, attachments) => send(id, text, attachments),
    }),
    [q.status, q.refetch, sessions, allSessions, companies, projects, pending, startSession, send]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>")
  return ctx
}

/** Seeded messages for a session merged with any messages added locally. */
export function useSessionMessages(sessionId: string, isLocal: boolean) {
  const { localMessages } = useHQ()
  const q = useHQQuery(`messages:${sessionId}`, (p) => (isLocal ? Promise.resolve([] as Message[]) : p.listMessages(sessionId)))
  // Seeded messages use the demo clock and local ones use real time, so keep
  // local messages after the seeded history in the order they were added.
  const messages = useMemo(
    () => [
      ...[...(q.data ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
      ...localMessages.filter((m) => m.sessionId === sessionId),
    ],
    [q.data, localMessages, sessionId]
  )
  return { status: q.status, error: q.error, refetch: q.refetch, messages }
}
