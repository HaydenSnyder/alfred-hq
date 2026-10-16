import type { Metadata } from "next"
import { DevProjectDetailView } from "@/features/development/dev-project-detail-view"

export const metadata: Metadata = { title: "Development project" }

export default async function DevelopmentProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DevProjectDetailView id={id} />
}
