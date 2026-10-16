import type { Metadata } from "next"
import { ResearchView } from "@/features/research/research-view"

export const metadata: Metadata = { title: "Research & Intelligence" }

export default function ResearchPage() {
  return <ResearchView />
}
