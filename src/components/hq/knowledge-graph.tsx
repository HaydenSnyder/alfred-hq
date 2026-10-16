"use client"

import "@xyflow/react/dist/style.css"
import { memo, useEffect, useMemo } from "react"
import { useTheme } from "next-themes"
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import { cn } from "@/lib/utils"
import type { KnowledgeEdge, KnowledgeNode } from "@/lib/types"
import { degreeMap, layoutGraph, nodeColor } from "@/features/brain/graph-utils"

interface BrainNodeData extends Record<string, unknown> {
  node: KnowledgeNode
  radius: number
  dimmed: boolean
  highlighted: boolean
  isSelected: boolean
  showLabel: boolean
}

type BrainFlowNode = Node<BrainNodeData, "brain">

const BrainNodeView = memo(function BrainNodeView({ data }: NodeProps<BrainFlowNode>) {
  const { node, radius, dimmed, highlighted, isSelected, showLabel } = data
  const d = radius * 2
  return (
    <div className={cn("relative flex flex-col items-center transition-opacity duration-200", dimmed && "opacity-25")}>
      <Handle type="target" position={Position.Top} className="!top-1/2 !left-1/2 !size-px !min-h-0 !min-w-0 !border-0 !bg-transparent" isConnectable={false} />
      <div
        className={cn(
          "rounded-full border-2 border-background shadow-sm transition-transform duration-150",
          isSelected && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
          highlighted && !isSelected && "ring-2 ring-brand ring-offset-1 ring-offset-background"
        )}
        style={{ width: d, height: d, backgroundColor: nodeColor(node.type) }}
        title={`${node.label} (${node.type})`}
      />
      {showLabel && (
        <span
          className={cn(
            "pointer-events-none absolute top-full mt-1 max-w-36 truncate rounded px-1 text-center text-[11px] leading-tight whitespace-nowrap",
            isSelected ? "bg-background/80 font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {node.label}
        </span>
      )}
      <Handle type="source" position={Position.Bottom} className="!top-1/2 !left-1/2 !size-px !min-h-0 !min-w-0 !border-0 !bg-transparent" isConnectable={false} />
    </div>
  )
})

const nodeTypes = { brain: BrainNodeView }

/**
 * Interactive knowledge graph (zoom, pan, drag, touch). Layout is computed
 * deterministically from the nodes and edges it is given.
 */
export function KnowledgeGraph({
  nodes,
  edges,
  selectedId,
  highlightIds,
  focusIds,
  onSelect,
  showLabels = true,
  showMinimap = true,
  animateEdges = false,
  className,
}: {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
  selectedId?: string
  /** Search matches. */
  highlightIds?: Set<string>
  /** When set, nodes outside it are dimmed (e.g. the selection's neighbours). */
  focusIds?: Set<string>
  onSelect: (id: string | undefined) => void
  showLabels?: boolean
  showMinimap?: boolean
  animateEdges?: boolean
  className?: string
}) {
  const { resolvedTheme } = useTheme()
  const graphKey = useMemo(() => nodes.map((n) => n.id).join("|") + "#" + edges.map((e) => e.id).join("|"), [nodes, edges])

  const positions = useMemo(() => layoutGraph({ nodes, edges }), [nodes, edges])
  const degrees = useMemo(() => degreeMap({ nodes, edges }), [nodes, edges])

  const flowNodes = useMemo<BrainFlowNode[]>(
    () =>
      nodes.map((n) => {
        const p = positions.get(n.id) ?? { x: 0, y: 0 }
        const radius = 7 + Math.min(degrees.get(n.id) ?? 0, 8) * 1.4
        return {
          id: n.id,
          type: "brain",
          position: { x: p.x - radius, y: p.y - radius },
          data: {
            node: n,
            radius,
            dimmed: !!focusIds && !focusIds.has(n.id) && !(highlightIds?.has(n.id) ?? false),
            highlighted: highlightIds?.has(n.id) ?? false,
            isSelected: n.id === selectedId,
            showLabel: showLabels,
          },
        }
      }),
    [nodes, positions, degrees, focusIds, highlightIds, selectedId, showLabels]
  )

  const flowEdges = useMemo<Edge[]>(
    () =>
      edges.map((e) => {
        const active = selectedId && (e.source === selectedId || e.target === selectedId)
        const dim = focusIds && !(focusIds.has(e.source) && focusIds.has(e.target))
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: "straight",
          animated: animateEdges && !!active,
          label: active ? e.relation.replace(/_/g, " ") : undefined,
          labelStyle: { fontSize: 10, fill: "var(--muted-foreground)" },
          labelBgStyle: { fill: "var(--background)", fillOpacity: 0.85 },
          labelBgPadding: [4, 2] as [number, number],
          style: {
            stroke: active ? "var(--brand)" : undefined,
            strokeWidth: active ? 1.6 : 0.6 + e.weight * 0.4,
            opacity: dim ? 0.15 : 1,
          },
          selectable: false,
        }
      }),
    [edges, selectedId, focusIds, animateEdges]
  )

  // Keep user-dragged positions until the graph itself changes.
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<BrainFlowNode>(flowNodes)
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>(flowEdges)
  useEffect(() => {
    setRfNodes((current) => {
      const prev = new Map(current.map((n) => [n.id, n.position]))
      return flowNodes.map((n) => ({ ...n, position: prev.get(n.id) ?? n.position }))
    })
  }, [flowNodes, setRfNodes])
  useEffect(() => setRfEdges(flowEdges), [flowEdges, setRfEdges])

  return (
    <div className={cn("relative h-full w-full", className)}>
      <ReactFlow
        key={graphKey}
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        colorMode={resolvedTheme === "light" ? "light" : "dark"}
        onNodeClick={(_, n) => onSelect(n.id)}
        onPaneClick={() => onSelect(undefined)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2.5}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        aria-label="Knowledge graph"
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="var(--border)" />
        <Controls showInteractive={false} position="bottom-left" />
        {showMinimap && (
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            className="!hidden md:!block"
            nodeColor={(n) => nodeColor((n.data as BrainNodeData).node.type)}
            nodeStrokeWidth={0}
          />
        )}
      </ReactFlow>
    </div>
  )
}
