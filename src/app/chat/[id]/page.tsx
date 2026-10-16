import { Conversation } from "@/features/chat/conversation"

export default async function ChatSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <Conversation sessionId={decodeURIComponent(id)} />
}
