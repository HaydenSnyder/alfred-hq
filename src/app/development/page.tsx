import { Suspense } from "react"
import type { Metadata } from "next"
import { LoadingState } from "@/components/hq/states"
import { DevelopmentView } from "@/features/development/development-view"

export const metadata: Metadata = { title: "Development HQ" }

export default function DevelopmentPage() {
  return (
    <Suspense fallback={<LoadingState rows={6} />}>
      <DevelopmentView />
    </Suspense>
  )
}
