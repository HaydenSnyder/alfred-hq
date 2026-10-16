import { Suspense } from "react"
import { NewChat } from "@/features/chat/new-chat"

export default function ChatPage() {
  return (
    <Suspense>
      <NewChat />
    </Suspense>
  )
}
