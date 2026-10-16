import { Suspense } from "react"
import { LoadingState } from "@/components/hq/states"
import { NotificationsView } from "@/features/notifications/notifications-view"

export const metadata = { title: "Notifications & Approvals" }

export default function NotificationsPage() {
  return (
    <Suspense fallback={<LoadingState variant="list" rows={6} />}>
      <NotificationsView />
    </Suspense>
  )
}
