import type { Metadata } from "next"
import { Suspense } from "react"
import { BrainView } from "@/features/brain/brain-view"

export const metadata: Metadata = { title: "Brain & Memory" }

export default function BrainPage() {
  return (
    <Suspense>
      <BrainView />
    </Suspense>
  )
}
