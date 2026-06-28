import React from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { FileCode, Box, Flame, Server, Component, FunctionSquare } from 'lucide-react';
import { useAtlasStore } from '../store/useAtlasStore';

export const CustomNode: React.FC<NodeProps> = ({ data, selected }) => {
  const { searchQuery } = useAtlasStore();
  const { label, type, file } = data as { label: string; type: string; file: string };

  // Helper to determine icon and badge styles
  const getNodeConfig = () => {
    switch (type) {
      case 'file':
        return {
          icon: FileCode,
          badgeText: 'File',
          badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          iconColor: 'text-emerald-400',
        };
      case 'react_component':
        return {
          icon: Component,
          badgeText: 'React Component',
          badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          iconColor: 'text-cyan-400',
        };
      case 'react_hook':
        return {
          icon: Flame,
          badgeText: 'React Hook',
          badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          iconColor: 'text-amber-400',
        };
      case 'express_middleware':
      case 'express_controller':
        return {
          icon: Server,
          badgeText: type === 'express_middleware' ? 'Middleware' : 'Controller',
          badgeBg: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
          iconColor: 'text-fuchsia-400',
        };
      case 'class':
        return {
          icon: Box,
          badgeText: 'Class',
          badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          iconColor: 'text-blue-400',
        };
      default:
        return {
          icon: FunctionSquare,
          badgeText: 'Function',
          badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          iconColor: 'text-indigo-400',
        };
    }
  };

  const { icon: Icon, badgeText, badgeBg, iconColor } = getNodeConfig();

  // Check if matches search query
  const isMatch =
    searchQuery &&
    (label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file && file.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div
      className={`relative w-72 rounded-2xl bg-slate-900/90 backdrop-blur-md border p-4 shadow-xl transition-all duration-300 group cursor-pointer ${
        selected
          ? 'border-violet-500 ring-2 ring-violet-500/30 shadow-violet-500/20'
          : isMatch
          ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-amber-500/20'
          : 'border-slate-800 hover:border-slate-700 hover:shadow-slate-900/50'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-700 !w-3 !h-3 !border-2 !border-slate-900" />
      <Handle type="target" position={Position.Left} className="!bg-slate-700 !w-3 !h-3 !border-2 !border-slate-900" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 group-hover:scale-105 transition-transform shadow-inner ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-100 text-sm truncate tracking-tight group-hover:text-indigo-300 transition-colors">
              {label}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5" title={file}>
              {file ? file.split(/[/\\]/).pop() : 'Unknown file'}
            </p>
          </div>
        </div>

        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shadow-sm truncate ${badgeBg}`}>
          {badgeText}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-slate-900" />
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-3 !h-3 !border-2 !border-slate-900" />
    </div>
  );
};
