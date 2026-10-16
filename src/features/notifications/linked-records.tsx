import Link from "next/link"
import {
  AlertOctagon,
  BadgeCheck,
  Bot,
  Building2,
  FolderKanban,
  HardDrive,
  ListTodo,
  MessageSquare,
  Microscope,
  Network,
  Plug,
  Server,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { hrefFor } from "@/lib/routes"
import type { RecordRef } from "@/lib/types"
import { recordKindLabel, recordName, type RecordIndex, type RecordKind } from "./record-index"

const kindIcon: Record<RecordKind, typeof Bot> = {
  company: Building2,
  agent: Bot,
  project: FolderKanban,
  task: ListTodo,
  session: MessageSquare,
  incident: AlertOctagon,
  approval: BadgeCheck,
  research: Microscope,
  device: HardDrive,
  service: Server,
  integration: Plug,
  node: Network,
}

/** Linked records rendered as navigable rows with resolved names. */
export function LinkedRecords({ refs, index, className }: { refs: RecordRef[]; index: RecordIndex; className?: string }) {
  if (refs.length === 0) return <p className={cn("text-xs text-muted-foreground", className)}>No linked records.</p>
  return (
    <ul className={cn("divide-y rounded-lg border", className)}>
      {refs.map((ref) => {
        const Icon = kindIcon[ref.kind]
        const name = recordName(index, ref)
        return (
          <li key={`${ref.kind}:${ref.id}`}>
            <Link
              href={hrefFor(ref)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Icon className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate", !name && "text-muted-foreground")}>{name ?? "Record not found"}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {recordKindLabel[ref.kind]} · <span className="font-mono">{ref.id}</span>
                </span>
              </span>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/** Compact inline chips variant for cards. */
export function LinkedRecordChips({ refs, index }: { refs: RecordRef[]; index: RecordIndex }) {
  if (refs.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-1.5">
      {refs.map((ref) => {
        const Icon = kindIcon[ref.kind]
        return (
          <li key={`${ref.kind}:${ref.id}`} className="min-w-0 max-w-full">
            <Link
              href={hrefFor(ref)}
              className="relative z-10 inline-flex max-w-full items-center gap-1.5 rounded-md border bg-surface-2/60 px-2 py-1 text-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Icon className="size-3 shrink-0 text-muted-foreground" />
              <span className="truncate">{recordName(index, ref) ?? `${recordKindLabel[ref.kind]} ${ref.id}`}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
