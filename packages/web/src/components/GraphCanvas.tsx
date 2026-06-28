import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant } from '@xyflow/react';
import { useAtlasStore } from '../store/useAtlasStore';
import { CustomNode } from './CustomNode';
import { Loader2 } from 'lucide-react';

export const GraphCanvas: React.FC = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, setSelectedNodeId, loading, error } = useAtlasStore();

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <div className="w-full h-screen bg-slate-50 relative">
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-3">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
          <p className="text-sm font-medium text-slate-800 animate-pulse">Loading architecture graph...</p>
        </div>
      )}

      {error && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
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
        className="bg-slate-50"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#cbd5e1" />
        <Controls className="!bg-white !border !border-slate-200 !rounded-xl !shadow-lg !overflow-hidden [&>button]:!bg-white [&>button]:!border-slate-200 [&>button]:!text-slate-700 hover:[&>button]:!bg-slate-50" />
        <MiniMap
          className="!bg-white !border !border-slate-200 !rounded-2xl !shadow-xl !p-2"
          nodeColor={(node: any) => {
            switch (node.data?.type) {
              case 'file': return '#10b981';
              case 'react_component': return '#06b6d4';
              case 'express_middleware':
              case 'express_controller': return '#d946ef';
              case 'class': return '#3b82f6';
              default: return '#ec4899';
            }
          }}
          maskColor="rgba(248, 250, 252, 0.7)"
        />
      </ReactFlow>
    </div>
  );
};
