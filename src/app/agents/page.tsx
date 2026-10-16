import { Suspense } from "react"
import type { Metadata } from "next"
import { LoadingState } from "@/components/hq/states"
import { AgentsDirectoryView } from "@/features/agents/agents-directory-view"

export const metadata: Metadata = { title: "Agents" }

export default function AgentsPage() {
  return (
    <Suspense fallback={<LoadingState variant="cards" rows={6} />}>
      <AgentsDirectoryView />
    </Suspense>
  )
}
