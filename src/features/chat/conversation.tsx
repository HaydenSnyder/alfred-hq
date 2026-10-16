"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef } from "react"
import { ArrowLeft, FolderKanban, Info, ListTodo } from "lucide-react"
import { useHQ } from "@/components/providers/hq-store"
import { useDirectory } from "@/lib/data/use-directory"
import { useHQQuery } from "@/lib/data/use-hq-query"
import { scopeLabel } from "@/lib/format"
import type { Scope, Session } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AgentAvatar } from "@/components/hq/avatars"
import { ChatComposer } from "@/components/hq/chat-composer"
import { DemoDataIndicator } from "@/components/hq/demo-data-indicator"
import { EmptyState, ErrorState, LoadingState } from "@/components/hq/states"
import { TaskStatusBadge } from "@/components/hq/status-badge"
import { useChat, useSessionMessages } from "./chat-context"
import { MessageItem, TypingIndicator } from "./message-item"

function scopeValue(scope: Scope) {
  return scope.kind === "company" ? scope.companyId : scope.kind
}

export function Conversation({ sessionId }: { sessionId: string }) {
  const { allSessions, status } = useChat()
  const session = allSessions.find((s) => s.id === sessionId)

  if (!session) {
    if (status === "loading") return <LoadingState variant="detail" className="p-6" />
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <EmptyState
          title="Session not found"
          description="It may be a local session from another browser, or the source has no record of it."
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/chat?new=1">Start a new session</Link>
            </Button>
          }
        />
      </div>
    )
  }
  return <ConversationBody key={session.id} session={session} />
}

function ConversationBody({ session }: { session: Session }) {
  const { send, pending, companies, projects } = useChat()
  const { updateLocalSession, inspect } = useHQ()
  const { agentById } = useDirectory()
  const { messages, status, error, refetch } = useSessionMessages(session.id, !!session.local)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isPending = pending.has(session.id)

  const tasksQ = useHQQuery(`session-tasks:${session.id}:${session.taskIds.join(",")}`, async (p) => {
    const tasks = await Promise.all(session.taskIds.map((id) => p.getTask(id)))
    return tasks.filter((t) => t !== undefined)
  })

  const replyAgentId = useMemo(() => {
    const company = session.scope.kind === "company" ? companies.find((c) => c.id === (session.scope as { companyId: string }).companyId) : undefined
    return company?.companyAlfred.agentId ?? "ag-alfred"
  }, [session.scope, companies])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages.length, isPending])

  const projectOptions = projects.filter((p) =>
    session.scope.kind === "company" ? p.scope.kind === "company" && p.scope.companyId === session.scope.companyId : p.scope.kind !== "company"
  )
  const project = projects.find((p) => p.id === session.projectId)
  const agents = session.agentIds.map((id) => agentById.get(id)).filter((a) => a !== undefined)
  const editable = !!session.local

  return (
    <>
      <header className="shrink-0 border-b px-3 py-2.5 md:px-5">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon-sm" className="md:hidden">
            <Link href="/chat" aria-label="Back to sessions">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold md:text-base">{session.title}</h2>
          </div>
          <div className="hidden -space-x-1.5 sm:flex" aria-label="Agents in this session">
            {agents.map((a) => (
              <Tooltip key={a.id}>
                <TooltipTrigger asChild>
                  <Link href={`/agents/${a.id}`} className="rounded-lg ring-2 ring-background">
                    <AgentAvatar agent={a} size="sm" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  {a.name} · {a.title}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <DemoDataIndicator label={session.local ? "Local demo" : "Demo"} className="hidden sm:inline-flex" />
          <Button variant="ghost" size="icon-sm" onClick={() => inspect({ kind: "session", id: session.id })} aria-label="Session details">
            <Info />
          </Button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          {editable ? (
            <Select
              value={scopeValue(session.scope)}
              onValueChange={(v) =>
                updateLocalSession(session.id, {
                  scope: v === "personal" ? { kind: "personal" } : { kind: "company", companyId: v },
                  projectId: undefined,
                })
              }
            >
              <SelectTrigger size="sm" className="h-7 text-xs" aria-label="Company context">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectGroup>
                  <SelectLabel>Companies</SelectLabel>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <span className="inline-flex h-7 items-center rounded-md border px-2 text-muted-foreground">{scopeLabel(session.scope, companies)}</span>
          )}

          {editable ? (
            <Select
              value={session.projectId ?? "none"}
              onValueChange={(v) => updateLocalSession(session.id, { projectId: v === "none" ? undefined : v })}
            >
              <SelectTrigger size="sm" className="h-7 text-xs" aria-label="Project association">
                <FolderKanban className="size-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {projectOptions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : project ? (
            <Link href={`/projects/${project.id}`} className="inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-muted-foreground hover:text-foreground">
              <FolderKanban className="size-3.5" /> {project.name}
            </Link>
          ) : null}

          {(tasksQ.data ?? []).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => inspect({ kind: "task", id: t.id })}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-muted-foreground hover:text-foreground"
            >
              <ListTodo className="size-3.5" />
              <span className="font-mono text-[11px]">{t.key}</span>
              <TaskStatusBadge status={t.status} />
            </button>
          ))}
        </div>
      </header>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 md:px-6">
          {status === "loading" && <LoadingState rows={3} />}
          {(status === "error" || status === "offline") && <ErrorState error={error} offline={status === "offline"} onRetry={refetch} />}
          {status === "success" && messages.length === 0 && (
            <EmptyState title="No messages yet" description="Send a message to start this demo session." />
          )}
          {messages.map((m) => (
            <MessageItem key={m.id} message={m} agent={m.author.kind === "agent" ? agentById.get(m.author.agentId) : undefined} />
          ))}
          {isPending && <TypingIndicator agent={agentById.get(replyAgentId)} />}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="shrink-0 px-3 pt-2 pb-3 md:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <ChatComposer onSubmit={(text, attachments) => send(session.id, text, attachments)} disabled={isPending} />
        </div>
      </div>
    </>
  )
}
