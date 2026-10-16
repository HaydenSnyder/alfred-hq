import { Suspense } from "react"
import { LoadingState } from "@/components/hq/states"
import { InfrastructureView } from "@/features/infrastructure/infrastructure-view"

export const metadata = { title: "Infrastructure & Devices" }

export default function InfrastructurePage() {
  return (
    <Suspense fallback={<LoadingState variant="metrics" />}>
      <InfrastructureView />
    </Suspense>
  )
}
