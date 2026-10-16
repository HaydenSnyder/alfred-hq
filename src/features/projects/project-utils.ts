import type { OperationalEvent, Project, RecordRef } from "@/lib/types"

/** Events that reference the project or any of its tasks, sessions or research. */
export function eventsForProject(events: OperationalEvent[], project: Project, taskIds: string[]) {
  const match = (r: RecordRef) =>
    (r.kind === "project" && r.id === project.id) ||
    (r.kind === "task" && taskIds.includes(r.id)) ||
    (r.kind === "session" && project.sessionIds.includes(r.id)) ||
    (r.kind === "research" && project.researchIds.includes(r.id))
  return events.filter((e) => e.refs.some(match)).sort((a, b) => b.at.localeCompare(a.at))
}
