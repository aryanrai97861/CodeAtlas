import React from 'react';
import { useAtlasStore } from '../store/useAtlasStore';
import { X, FileCode, Tag, ArrowUpRight, ArrowDownLeft, BookOpen, Layers } from 'lucide-react';

export const NodeSidebar: React.FC = () => {
  const { selectedNodeId, selectedNodeData, incomingEdges, outgoingEdges, setSelectedNodeId } = useAtlasStore();

  if (!selectedNodeId) return null;

  const { name, type, file, metadata, frameworkTags } = selectedNodeData || {};

  return (
    <aside className="absolute top-24 right-6 z-20 w-96 max-h-[calc(100vh-8rem)] bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-950/40">
        <div className="flex items-center gap-2.5 min-w-0">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-slate-100 text-base truncate tracking-tight">
            {name || selectedNodeId.split(/[/\\]/).pop()}
          </h2>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Type</span>
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold capitalize">
              {type || 'Unknown'}
            </span>
          </div>

          {file && (
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" /> Source File
              </span>
              <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 break-all font-mono shadow-inner">
                {file}
              </p>
            </div>
          )}
        </div>

        {/* Framework Tags */}
        {frameworkTags && frameworkTags.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-fuchsia-400" /> Framework Metadata
            </span>
            <div className="flex flex-wrap gap-2">
              {frameworkTags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2.5 py-1 rounded-lg bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20 text-xs font-semibold shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Function Metadata */}
        {metadata && (
          <div className="space-y-4 pt-2 border-t border-slate-800/60">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Signature Details
            </span>

            {metadata.parameters && metadata.parameters.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Parameters</span>
                <div className="space-y-1">
                  {metadata.parameters.map((p: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800/80">
                      <span className="font-mono text-slate-200 font-medium">{p.name}</span>
                      <span className="font-mono text-cyan-400 text-[11px]">{p.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {metadata.returnType && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Return Type</span>
                <div className="text-xs font-mono bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800/80 text-cyan-400">
                  {metadata.returnType}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Relationships */}
        <div className="space-y-4 pt-2 border-t border-slate-800/60">
          {/* Incoming Dependencies */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> Incoming Dependencies ({incomingEdges.length})
            </span>
            {incomingEdges.length === 0 ? (
              <p className="text-xs text-slate-600 italic pl-5">No incoming dependencies</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {incomingEdges.map((edge: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => setSelectedNodeId(edge.sourceId)}
                    className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/30 transition-all cursor-pointer group shadow-inner"
                  >
                    <p className="text-xs font-medium text-slate-300 group-hover:text-indigo-300 truncate transition-colors">
                      {edge.sourceId.split(/[/\\]/).pop()}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{edge.relationship}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Dependencies */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-indigo-400" /> Outgoing Dependencies ({outgoingEdges.length})
            </span>
            {outgoingEdges.length === 0 ? (
              <p className="text-xs text-slate-600 italic pl-5">No outgoing dependencies</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {outgoingEdges.map((edge: any, index: number) => (
                  <div
                    key={index}
                    onClick={() => setSelectedNodeId(edge.targetId)}
                    className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/30 transition-all cursor-pointer group shadow-inner"
                  >
                    <p className="text-xs font-medium text-slate-300 group-hover:text-indigo-300 truncate transition-colors">
                      {edge.targetId.split(/[/\\]/).pop()}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{edge.relationship}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
