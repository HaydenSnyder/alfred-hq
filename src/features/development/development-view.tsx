"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Code2 } from "lucide-react"
import { PageHeader } from "@/components/hq/page-header"
import { ErrorState, LoadingState } from "@/components/hq/states"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DevBoard } from "./dev-board"
import { DevOverview } from "./dev-overview"
import { DevRequests } from "./dev-requests"
import { useDevelopmentData } from "./use-development-data"

const tabs = ["overview", "requests", "board"] as const
type Tab = (typeof tabs)[number]

export function DevelopmentView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const raw = searchParams.get("tab")
  const tab: Tab = tabs.includes(raw as Tab) ? (raw as Tab) : "overview"
  const q = useDevelopmentData()

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next === "overview") params.delete("tab")
    else params.set("tab", next)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  return (
    <>
      <PageHeader
        title="Development HQ"
        icon={<Code2 className="size-5 text-muted-foreground" aria-hidden />}
        description="Development projects, requests and execution coordinated by the Development CTO. Read-only: HQ never calls the Development Gateway."
      />
      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <div className="border-b">
          <TabsList variant="line" className="h-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {q.data && <span className="text-xs text-muted-foreground tabular">{q.data.tasks.length + q.data.approvals.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="board">Task board</TabsTrigger>
          </TabsList>
        </div>

        {q.status === "loading" ? (
          <>
            <LoadingState variant="metrics" />
            <LoadingState rows={5} />
          </>
        ) : q.status === "error" || q.status === "offline" ? (
          <ErrorState error={q.error} offline={q.status === "offline"} onRetry={q.refetch} />
        ) : q.data ? (
          <>
            <TabsContent value="overview">
              <DevOverview data={q.data} />
            </TabsContent>
            <TabsContent value="requests">
              <DevRequests data={q.data} />
            </TabsContent>
            <TabsContent value="board">
              <DevBoard data={q.data} />
            </TabsContent>
          </>
        ) : null}
      </Tabs>
    </>
  )
}
