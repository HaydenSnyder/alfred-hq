import type { Metadata } from "next"
import { ChatLayout } from "@/features/chat/chat-layout"

export const metadata: Metadata = { title: "Alfred Chat" }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ChatLayout>{children}</ChatLayout>
}
