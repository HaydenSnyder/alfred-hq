import type { Metadata } from "next"
import { ResourcesView } from "@/features/resources/resources-view"

export const metadata: Metadata = { title: "Resources & Costs" }

export default function ResourcesPage() {
  return <ResourcesView />
}
