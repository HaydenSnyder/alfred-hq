import type { Metadata } from "next"
import { AgentProfileView } from "@/features/agents/agent-profile-view"

export const metadata: Metadata = { title: "Agent" }

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AgentProfileView id={id} />
}
