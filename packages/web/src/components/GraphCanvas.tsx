import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant } from '@xyflow/react';
import { useAtlasStore } from '../store/useAtlasStore';
import { CustomNode } from './CustomNode';
import { Loader2 } from 'lucide-react';

export const GraphCanvas: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, setSelectedNodeId, loading, error } = useAtlasStore();

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <div className="w-full h-screen bg-slate-950 relative">
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-300 animate-pulse">Loading architecture graph...</p>
        </div>
      )}

      {error && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        nodeTypes={nodeTypes}
        fitView
        className="bg-slate-950"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#334155" />
        <Controls className="!bg-slate-900 !border !border-slate-800 !rounded-xl !shadow-xl !overflow-hidden [&>button]:!bg-slate-900 [&>button]:!border-slate-800 [&>button]:!text-slate-300 hover:[&>button]:!bg-slate-800" />
        <MiniMap
          className="!bg-slate-900 !border !border-slate-800 !rounded-2xl !shadow-2xl !p-2"
          nodeColor={(node: any) => {
            switch (node.data?.type) {
              case 'file': return '#34d399';
              case 'react_component': return '#06b6d4';
              case 'express_middleware':
              case 'express_controller': return '#d946ef';
              case 'class': return '#60a5fa';
              default: return '#818cf8';
            }
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
        />
      </ReactFlow>
    </div>
  );
};
