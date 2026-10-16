import { Bell, LayoutDashboard, MessageCircle } from "lucide-react"
import type { NotificationChannel } from "@/lib/types"

export const channelMeta: Record<NotificationChannel, { label: string; short: string; icon: typeof Bell }> = {
  hq: { label: "HQ inbox", short: "HQ", icon: LayoutDashboard },
  imessage: { label: "iMessage (via Photon)", short: "iMessage", icon: MessageCircle },
  push: { label: "Mobile push", short: "Push", icon: Bell },
}

export const channelOrder: NotificationChannel[] = ["hq", "imessage", "push"]
