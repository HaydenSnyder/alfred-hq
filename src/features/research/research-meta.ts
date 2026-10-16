import { Database, FileText, FolderGit2, Globe, Lock, Mic, Video, type LucideIcon } from "lucide-react"
import type { Tone } from "@/lib/status"
import type { ResearchRecord, SourceType } from "@/lib/types"

export type ResearchStage = ResearchRecord["stage"]

export const stageOrder: ResearchStage[] = ["collecting", "analyzing", "verifying", "drafting", "published"]

export const stageMeta: Record<ResearchStage, { label: string; tone: Tone; description: string }> = {
  collecting: { label: "Collecting", tone: "neutral", description: "Gathering sources" },
  analyzing: { label: "Analyzing", tone: "info", description: "Extracting findings" },
  verifying: { label: "Verifying", tone: "warning", description: "Cross-checking claims" },
  drafting: { label: "Drafting", tone: "info", description: "Writing the report" },
  published: { label: "Published", tone: "success", description: "Delivered to knowledge" },
}

export const sourceTypeMeta: Record<SourceType, { label: string; icon: LucideIcon }> = {
  web: { label: "Web", icon: Globe },
  pdf: { label: "PDF", icon: FileText },
  video: { label: "Video", icon: Video },
  podcast: { label: "Podcast", icon: Mic },
  dataset: { label: "Dataset", icon: Database },
  repository: { label: "Repository", icon: FolderGit2 },
  internal: { label: "Internal", icon: Lock },
}

export const sourceTypeOrder: SourceType[] = ["web", "pdf", "video", "podcast", "dataset", "repository", "internal"]
