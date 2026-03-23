"use client";

import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Position,
  Handle,
  NodeProps,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useRouter } from "next/navigation";
import { HealthCheckResponse } from "@/lib/service-health";

// ─── Types ────────────────────────────────────────────────────────────────

interface ServiceNodeData {
  label: string;
  icon: string;
  serviceId: string;
  status: "healthy" | "degraded" | "unhealthy" | "loading";
  description: string;
  port: number;
  category: "core" | "execution" | "analysis" | "ai" | "data";
  role?: string;
  [key: string]: unknown;
}

// ─── Custom Node ──────────────────────────────────────────────────────────

function ServiceNode({ data, selected }: NodeProps<Node<ServiceNodeData>>) {
  const statusColors = {
    healthy: {
      bg: "from-emerald-500/20 to-emerald-500/5",
      border: "border-emerald-500/40",
      dot: "bg-emerald-400",
      glow: "shadow-emerald-500/20",
      pulse: "animate-pulse",
    },
    degraded: {
      bg: "from-yellow-500/20 to-yellow-500/5",
      border: "border-yellow-500/40",
      dot: "bg-yellow-400",
      glow: "shadow-yellow-500/20",
      pulse: "",
    },
    unhealthy: {
      bg: "from-red-500/20 to-red-500/5",
      border: "border-red-500/40",
      dot: "bg-red-400",
      glow: "shadow-red-500/20",
      pulse: "",
    },
    loading: {
      bg: "from-white/10 to-white/5",
      border: "border-white/20",
      dot: "bg-white/40",
      glow: "",
      pulse: "animate-pulse",
    },
  };

  const s = statusColors[data.status];

  return (
    <div
      className={`
        relative group cursor-pointer
        bg-gradient-to-br ${s.bg}
        border ${s.border}
        rounded-xl px-5 py-4 min-w-[180px]
        transition-all duration-300
        ${selected ? "ring-2 ring-purple-400/60 scale-105" : "hover:scale-[1.03]"}
        shadow-lg ${s.glow}
      `}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-white/20 !border-white/30 !-top-1.5"
      />

      {/* Status indicator dot */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${s.dot} ${s.pulse}`} />
      </div>

      {/* Content */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{data.icon}</span>
        <div>
          <div className="font-semibold text-sm text-white">{data.label}</div>
          <div className="text-[10px] text-white/40 font-mono">:{data.port}</div>
        </div>
      </div>

      {/* Role tag */}
      {data.role && (
        <div className="mt-1 text-[10px] text-white/50 bg-white/5 rounded px-2 py-0.5 inline-block">
          {data.role}
        </div>
      )}

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-white/20 !border-white/30 !-bottom-1.5"
      />

      {/* Left handle for side connections */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-white/20 !border-white/30 !-left-1.5"
      />

      {/* Right handle for side connections */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-white/20 !border-white/30 !-right-1.5"
      />
    </div>
  );
}

const nodeTypes = { serviceNode: ServiceNode };

// ─── Graph Data ───────────────────────────────────────────────────────────

/**
 * TRUE architecture based on actual codebase analysis:
 * 
 * data_ingestion → fetches external market data → stores in PostgreSQL/Redis
 * config → provides configuration to all services (on request)
 * 
 * PIPELINE FLOW (orchestrator drives everything):
 * data_ingestion (external APIs) → Redis/DB
 * portfolio (reads prices, creates snapshot) → Redis
 * orchestrator reads snapshot → calls strategy → calls risk → calls execution
 * analytics reads from DB post-trade
 * local_ai provides AI inference (called by frontend, available to orchestrator)
 */

const CENTER_X = 450;

const initialNodes: Node<ServiceNodeData>[] = [
  // ── Layer 0: External Data ──
  {
    id: "data_ingestion",
    type: "serviceNode",
    position: { x: CENTER_X - 90, y: 0 },
    data: {
      label: "Data Ingestion",
      icon: "📡",
      serviceId: "data_ingestion",
      status: "loading",
      description: "Market data ingestion",
      port: 3009,
      category: "data",
      role: "Market Data Provider",
    },
  },

  // ── Layer 1: Config + AI (side services) ──
  {
    id: "config",
    type: "serviceNode",
    position: { x: 30, y: 135 },
    data: {
      label: "Config",
      icon: "⚙️",
      serviceId: "config",
      status: "loading",
      description: "Configuration hub",
      port: 3007,
      category: "core",
      role: "Configuration Hub",
    },
  },
  {
    id: "local_ai",
    type: "serviceNode",
    position: { x: CENTER_X + 280, y: 135 },
    data: {
      label: "Local AI",
      icon: "🤖",
      serviceId: "local_ai",
      status: "loading",
      description: "AI models",
      port: 3008,
      category: "ai",
      role: "ML Inference Engine",
    },
  },

  // ── Layer 2: Orchestrator (THE hub) ──
  {
    id: "orchestrator",
    type: "serviceNode",
    position: { x: CENTER_X - 90, y: 180 },
    data: {
      label: "Orchestrator",
      icon: "🎯",
      serviceId: "orchestrator",
      status: "loading",
      description: "Pipeline coordinator",
      port: 3001,
      category: "core",
      role: "Pipeline Coordinator",
    },
  },

  // ── Layer 3: Strategy + Risk (parallel evaluation) ──
  {
    id: "strategy",
    type: "serviceNode",
    position: { x: CENTER_X - 260, y: 370 },
    data: {
      label: "Strategy",
      icon: "📈",
      serviceId: "strategy",
      status: "loading",
      description: "Signal generation",
      port: 3002,
      category: "core",
      role: "Signal Generator",
    },
  },
  {
    id: "risk",
    type: "serviceNode",
    position: { x: CENTER_X + 80, y: 370 },
    data: {
      label: "Risk",
      icon: "⚠️",
      serviceId: "risk",
      status: "loading",
      description: "Risk assessment",
      port: 3003,
      category: "analysis",
      role: "Capital Protection",
    },
  },

  // ── Layer 4: Execution ──
  {
    id: "execution",
    type: "serviceNode",
    position: { x: CENTER_X - 90, y: 540 },
    data: {
      label: "Execution",
      icon: "⚡",
      serviceId: "execution",
      status: "loading",
      description: "Order execution",
      port: 3004,
      category: "execution",
      role: "Order Router",
    },
  },

  // ── Layer 5: Portfolio + Analytics (post-trade) ──
  {
    id: "portfolio",
    type: "serviceNode",
    position: { x: CENTER_X - 260, y: 700 },
    data: {
      label: "Portfolio",
      icon: "💼",
      serviceId: "portfolio",
      status: "loading",
      description: "Position tracking",
      port: 3005,
      category: "analysis",
      role: "Position Tracker",
    },
  },
  {
    id: "analytics",
    type: "serviceNode",
    position: { x: CENTER_X + 80, y: 700 },
    data: {
      label: "Analytics",
      icon: "📊",
      serviceId: "analytics",
      status: "loading",
      description: "Performance metrics",
      port: 3006,
      category: "analysis",
      role: "Performance Analysis",
    },
  },
];

// ─── Edges: TRUE data flow from codebase analysis ─────────────────────────

const initialEdges: Edge[] = [
  // ── Primary Pipeline Flow (animated = active data path) ──

  // Data Ingestion feeds market data into the system
  {
    id: "e-ingestion-orchestrator",
    source: "data_ingestion",
    target: "orchestrator",
    animated: true,
    label: "market data",
    labelStyle: { fill: "rgba(255,255,255,0.5)", fontSize: 10 },
    labelBgStyle: { fill: "rgba(0,0,0,0.7)", fillOpacity: 0.7 },
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 4,
    style: { stroke: "rgba(45, 212, 191, 0.6)", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(45, 212, 191, 0.6)" },
  },

  // Orchestrator → Strategy (evaluate signals)
  {
    id: "e-orch-strategy",
    source: "orchestrator",
    target: "strategy",
    animated: true,
    label: "evaluate signals",
    labelStyle: { fill: "rgba(255,255,255,0.5)", fontSize: 10 },
    labelBgStyle: { fill: "rgba(0,0,0,0.7)", fillOpacity: 0.7 },
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 4,
    style: { stroke: "rgba(129, 140, 248, 0.6)", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(129, 140, 248, 0.6)" },
  },

  // Orchestrator → Risk (approve trades)
  {
    id: "e-orch-risk",
    source: "orchestrator",
    target: "risk",
    animated: true,
    label: "risk check",
    labelStyle: { fill: "rgba(255,255,255,0.5)", fontSize: 10 },
    labelBgStyle: { fill: "rgba(0,0,0,0.7)", fillOpacity: 0.7 },
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 4,
    style: { stroke: "rgba(251, 191, 36, 0.6)", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(251, 191, 36, 0.6)" },
  },

  // Orchestrator → Execution (enqueue approved trades)
  {
    id: "e-orch-execution",
    source: "orchestrator",
    target: "execution",
    animated: true,
    label: "execute trade",
    labelStyle: { fill: "rgba(255,255,255,0.5)", fontSize: 10 },
    labelBgStyle: { fill: "rgba(0,0,0,0.7)", fillOpacity: 0.7 },
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 4,
    style: { stroke: "rgba(52, 211, 153, 0.6)", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(52, 211, 153, 0.6)" },
  },

  // Orchestrator → Analytics (post-trade metrics)
  {
    id: "e-orch-analytics",
    source: "orchestrator",
    target: "analytics",
    animated: false,
    label: "query metrics",
    labelStyle: { fill: "rgba(255,255,255,0.4)", fontSize: 10 },
    labelBgStyle: { fill: "rgba(0,0,0,0.7)", fillOpacity: 0.7 },
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 4,
    style: { stroke: "rgba(244, 114, 182, 0.4)", strokeWidth: 1.5, strokeDasharray: "6 3" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(244, 114, 182, 0.4)" },
  },

  // Orchestrator → Portfolio (read snapshot via LangChain)
  {
    id: "e-orch-portfolio",
    source: "orchestrator",
    target: "portfolio",
    animated: false,
    label: "portfolio state",
    labelStyle: { fill: "rgba(255,255,255,0.4)", fontSize: 10 },
    labelBgStyle: { fill: "rgba(0,0,0,0.7)", fillOpacity: 0.7 },
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 4,
    style: { stroke: "rgba(6, 182, 212, 0.4)", strokeWidth: 1.5, strokeDasharray: "6 3" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(6, 182, 212, 0.4)" },
  },

  // ── Side Service Connections ──

  // Config provides configuration to orchestrator
  {
    id: "e-config-orch",
    source: "config",
    target: "orchestrator",
    sourceHandle: "right",
    targetHandle: "left",
    animated: false,
    label: "config",
    labelStyle: { fill: "rgba(255,255,255,0.35)", fontSize: 9 },
    labelBgStyle: { fill: "rgba(0,0,0,0.7)", fillOpacity: 0.7 },
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 4,
    style: { stroke: "rgba(148, 163, 184, 0.3)", strokeWidth: 1, strokeDasharray: "4 4" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(148, 163, 184, 0.3)" },
  },

  // Risk reads portfolio snapshot from Redis (indirect)
  {
    id: "e-portfolio-risk",
    source: "portfolio",
    target: "risk",
    sourceHandle: "right",
    targetHandle: "left",
    animated: false,
    label: "positions (Redis)",
    labelStyle: { fill: "rgba(255,255,255,0.35)", fontSize: 9 },
    labelBgStyle: { fill: "rgba(0,0,0,0.7)", fillOpacity: 0.7 },
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 4,
    style: { stroke: "rgba(6, 182, 212, 0.3)", strokeWidth: 1, strokeDasharray: "4 4" },
    markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(6, 182, 212, 0.3)" },
  },
];

// ─── Pipeline Step Labels ─────────────────────────────────────────────────

const PIPELINE_STEPS = [];

// ─── Main Component ──────────────────────────────────────────────────────

interface SystemFlowViewProps {
  healthData?: HealthCheckResponse[];
  loading?: boolean;
}

export default function SystemFlowView({ healthData = [], loading = false }: SystemFlowViewProps) {
  const router = useRouter();

  // Build health status map
  const healthMap = useMemo(() => {
    const map = new Map<string, "healthy" | "degraded" | "unhealthy">();
    healthData.forEach((h) => {
      // Service IDs are already normalized (e.g., "data_ingestion", "config")
      map.set(h.service, h.status);
    });
    return map;
  }, [healthData]);

  // Update nodes with real health status
  const nodesWithStatus = useMemo(() => {
    return initialNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        status: loading ? "loading" as const : (healthMap.get(node.id) || "loading" as const),
      },
    }));
  }, [healthMap, loading]);

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesWithStatus);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when health data changes
  React.useEffect(() => {
    setNodes(nodesWithStatus);
  }, [nodesWithStatus, setNodes]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const serviceId = (node.data as ServiceNodeData).serviceId;
      router.push(`/portal/trading/${serviceId}`);
    },
    [router]
  );

  return (
    <div className="relative w-full h-[860px] bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      {/* Legend */}
      <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3">
        <div className="text-[10px] font-semibold text-white/50 mb-2 uppercase tracking-wider">Pipeline Flow</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-teal-400/60 rounded" />
            <span className="text-[10px] text-white/40">HTTP call (active)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 border-t border-dashed border-white/30 rounded" />
            <span className="text-[10px] text-white/40">Indirect / on-demand</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-white/40">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-[10px] text-white/40">Degraded</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[10px] text-white/40">Down</span>
          </div>
        </div>
      </div>

      {/* Click hint */}
      <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
        <span className="text-[10px] text-white/40">Click a node to view details →</span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.05)"
        />
        <Controls
          position="bottom-right"
          showInteractive={false}
          className="!bg-black/60 !border-white/10 !rounded-lg [&>button]:!bg-transparent [&>button]:!border-white/10 [&>button]:!text-white/40 [&>button:hover]:!bg-white/10"
        />
        <MiniMap
          position="bottom-left"
          className="!bg-black/40 !border-white/10 !rounded-lg"
          nodeColor={(node) => {
            const status = (node.data as ServiceNodeData)?.status;
            if (status === "healthy") return "rgba(52, 211, 153, 0.6)";
            if (status === "degraded") return "rgba(251, 191, 36, 0.6)";
            if (status === "unhealthy") return "rgba(248, 113, 113, 0.6)";
            return "rgba(255, 255, 255, 0.2)";
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}
