import { Suspense } from "react"
import type { Metadata } from "next"
import { LoadingState } from "@/components/hq/states"
import { ProjectsView } from "@/features/projects/projects-view"

export const metadata: Metadata = { title: "Projects" }

export default function ProjectsPage() {
  return (
    <Suspense fallback={<LoadingState rows={6} />}>
      <ProjectsView />
    </Suspense>
  )
}
