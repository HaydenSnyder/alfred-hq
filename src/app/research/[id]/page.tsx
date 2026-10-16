import type { Metadata } from "next"
import { ResearchDetailView } from "@/features/research/research-detail-view"

export const metadata: Metadata = { title: "Research record" }

export default async function ResearchRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ResearchDetailView id={id} />
}
