import type { RecordRef } from "@/lib/types"

/** Canonical HQ route for any referenced record. */
export function hrefFor(ref: RecordRef): string {
  switch (ref.kind) {
    case "company":
      return `/companies/${ref.id}`
    case "agent":
      return `/agents/${ref.id}`
    case "project":
      return `/projects/${ref.id}`
    case "task":
      return `/projects?task=${ref.id}`
    case "session":
      return `/chat/${ref.id}`
    case "incident":
      return `/infrastructure?incident=${ref.id}`
    case "approval":
      return `/notifications?approval=${ref.id}`
    case "research":
      return `/research/${ref.id}`
    case "device":
      return `/infrastructure?device=${ref.id}`
    case "service":
      return `/infrastructure?service=${ref.id}`
    case "integration":
      return `/integrations/${ref.id}`
    case "node":
      return `/brain?node=${ref.id}`
  }
}
