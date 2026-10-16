"use client"

import { Cpu, Lock, Pencil, RotateCcw } from "lucide-react"
import { formatCompact, titleCase } from "@/lib/format"
import type { Agent } from "@/lib/types"
import { Panel, PropertyList } from "@/components/hq/panel"
import { ToneBadge } from "@/components/hq/status-badge"
import { DemoActionButton } from "@/components/hq/demo-action"

const memoryDescription: Record<Agent["config"]["memoryAccess"], string> = {
  global: "Can read Alfred's global memory",
  company: "Limited to its company's authorised knowledge",
  project: "Limited to memory of assigned projects",
  none: "No memory access",
}

export function AgentConfigTab({ agent }: { agent: Agent }) {
  const { config, model } = agent
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Read-only. Configuration changes go through Hermes with owner approval and are not possible from this prototype.
        </p>
        <div className="flex flex-wrap gap-2">
          <DemoActionButton>
            <Pencil /> Edit
          </DemoActionButton>
          <DemoActionButton>
            <Cpu /> Change model
          </DemoActionButton>
          <DemoActionButton>
            <RotateCcw /> Restart agent
          </DemoActionButton>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Runtime configuration">
          <PropertyList
            items={[
              { label: "Temperature", value: <span className="tabular">{config.temperature.toFixed(1)}</span> },
              { label: "Max concurrent tasks", value: <span className="tabular">{config.maxConcurrentTasks}</span> },
              {
                label: "Memory access",
                value: (
                  <span>
                    {titleCase(config.memoryAccess)}
                    <span className="block text-xs text-muted-foreground">{memoryDescription[config.memoryAccess]}</span>
                  </span>
                ),
              },
              {
                label: "Approval required for",
                value:
                  config.approvalRequiredFor.length === 0 ? (
                    <span className="text-muted-foreground">Nothing — fully autonomous</span>
                  ) : (
                    <span className="flex flex-wrap gap-1.5">
                      {config.approvalRequiredFor.map((a) => (
                        <ToneBadge key={a} tone="neutral" dot={false}>
                          {a}
                        </ToneBadge>
                      ))}
                    </span>
                  ),
              },
            ]}
          />
        </Panel>
        <Panel title="Model">
          <PropertyList
            items={[
              { label: "Provider", value: model.provider },
              { label: "Model", value: <span className="font-mono text-xs">{model.name}</span> },
              { label: "Context window", value: `${formatCompact(model.contextWindow)} tokens` },
              { label: "Tools granted", value: <span className="tabular">{agent.tools.length}</span> },
            ]}
          />
        </Panel>
      </div>
    </div>
  )
}
