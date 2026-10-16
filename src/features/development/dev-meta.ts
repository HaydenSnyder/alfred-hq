import type { Tone } from "@/lib/status"
import type { Approval, DevelopmentInfo } from "@/lib/types"

type PRState = DevelopmentInfo["pullRequests"][number]["state"]
type TestStatus = DevelopmentInfo["tests"]["status"]

export const prStateMeta: Record<PRState, { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "info" },
  draft: { label: "Draft", tone: "muted" },
  merged: { label: "Merged", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
}

export const testStatusMeta: Record<TestStatus, { label: string; tone: Tone }> = {
  passing: { label: "Passing", tone: "success" },
  failing: { label: "Failing", tone: "danger" },
  running: { label: "Running", tone: "info" },
  unknown: { label: "Unknown", tone: "muted" },
}

export const approvalStateMeta: Record<Approval["state"], { label: string; tone: Tone }> = {
  pending: { label: "Awaiting approval", tone: "info" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Changes requested", tone: "danger" },
  expired: { label: "Expired", tone: "muted" },
}
