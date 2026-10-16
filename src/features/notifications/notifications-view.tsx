"use client"

import { useCallback, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { BellRing, ShieldCheck } from "lucide-react"
import { useHQQuery } from "@/lib/data/use-hq-query"
import type { Notification } from "@/lib/types"
import { useHQ } from "@/components/providers/hq-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/hq/page-header"
import { Panel } from "@/components/hq/panel"
import { ErrorState, LoadingState } from "@/components/hq/states"
import { visibleInContext } from "@/lib/format"
import { ApprovalsTab } from "./approvals-tab"
import { ChannelPreferences } from "./channel-preferences"
import { HistoryTab } from "./history-tab"
import { InboxTab } from "./inbox-tab"
import { loadRecordIndex } from "./record-index"

type Tab = "inbox" | "approvals" | "history"
const tabs: Tab[] = ["inbox", "approvals", "history"]

export function NotificationsView() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const { companyContext } = useHQ()

  const q = useHQQuery("notifications-approvals", async (p) => {
    const [notifications, approvals, index, agents, companies] = await Promise.all([
      p.listNotifications(),
      p.listApprovals(),
      loadRecordIndex(p),
      p.listAgents(),
      p.listCompanies(),
    ])
    return { notifications, approvals, index, agents, companies }
  })

  // Local-only read state. Never written back to the data source.
  const [readOverrides, setReadOverrides] = useState<Record<string, boolean>>({})
  const isRead = useCallback((n: Notification) => readOverrides[n.id] ?? n.read, [readOverrides])
  const setRead = useCallback((id: string, read: boolean) => setReadOverrides((m) => ({ ...m, [id]: read })), [])
  const markAllRead = useCallback(
    (ids: string[]) => setReadOverrides((m) => ({ ...m, ...Object.fromEntries(ids.map((id) => [id, true])) })),
    []
  )

  const approvalParam = params.get("approval") ?? undefined
  const tabParam = params.get("tab")
  const linkedApproval = approvalParam ? q.data?.approvals.find((a) => a.id === approvalParam) : undefined
  const tab: Tab = tabs.includes(tabParam as Tab)
    ? (tabParam as Tab)
    : approvalParam
      ? linkedApproval && linkedApproval.state !== "pending"
        ? "history"
        : "approvals"
      : "inbox"

  const changeTab = (next: string) => {
    const sp = new URLSearchParams()
    if (next !== "inbox") sp.set("tab", next)
    const qs = sp.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const header = (
    <PageHeader
      title="Notifications & Approvals"
      description="Unified inbox of alerts from Alfred and company agents, plus requests waiting on you. Review only — nothing is sent or approved from HQ."
    />
  )

  if (q.status === "loading")
    return (
      <>
        {header}
        <LoadingState variant="list" rows={6} />
      </>
    )
  if (q.status === "error" || q.status === "offline")
    return (
      <>
        {header}
        <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
      </>
    )

  const { index, companies } = q.data
  const notifications = q.data.notifications.filter((n) => visibleInContext(n.scope, companyContext))
  const approvals = q.data.approvals.filter((a) => visibleInContext(a.scope, companyContext))
  const agentById = new Map(q.data.agents.map((a) => [a.id, a]))
  const unread = notifications.filter((n) => !isRead(n)).length
  const pending = approvals.filter((a) => a.state === "pending").length
  const decided = approvals.length - pending
  const linkedHidden = approvalParam && (!linkedApproval || !approvals.some((a) => a.id === approvalParam))

  return (
    <>
      {header}

      {linkedHidden && (
        <div role="status" className="mb-4 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
          {linkedApproval
            ? "The linked approval belongs to a company outside the current context. Switch to “All companies” to see it."
            : <>The linked approval <span className="font-mono">{approvalParam}</span> was not found in the data source.</>}
        </div>
      )}

      <Tabs value={tab} onValueChange={changeTab} className="gap-4">
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <TabsList variant="line">
            <TabsTrigger value="inbox">
              Inbox {unread > 0 && <span className="rounded-full bg-brand/15 px-1.5 text-[11px] text-brand tabular">{unread}</span>}
            </TabsTrigger>
            <TabsTrigger value="approvals">
              Approvals {pending > 0 && <span className="rounded-full bg-status-warning/15 px-1.5 text-[11px] text-status-warning tabular">{pending}</span>}
            </TabsTrigger>
            <TabsTrigger value="history">
              History <span className="text-[11px] text-muted-foreground tabular">{decided}</span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="inbox">
          <InboxTab
            notifications={notifications}
            companies={companies}
            index={index}
            isRead={isRead}
            setRead={setRead}
            markAllRead={markAllRead}
          />
        </TabsContent>
        <TabsContent value="approvals">
          <ApprovalsTab approvals={approvals} agentById={agentById} companies={companies} index={index} selectedId={approvalParam} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab approvals={approvals} agentById={agentById} companies={companies} index={index} selectedId={approvalParam} />
        </TabsContent>
      </Tabs>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <ChannelPreferences />
        <Panel title="How notifications work in this phase">
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2.5">
              <BellRing className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">
                Alerts are generated by Alfred and company agents. HQ displays them; it does not create, route or deliver them.
              </span>
            </li>
            <li className="flex gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">
                Approvals continue through existing Alfred channels. HQ shows risk, requester and linked records so you can review context first.
              </span>
            </li>
          </ul>
        </Panel>
      </div>
    </>
  )
}
