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
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          iconColor: 'text-emerald-600',
        };
      case 'react_component':
        return {
          icon: Component,
          badgeText: 'React Component',
          badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          iconColor: 'text-cyan-600',
        };
      case 'react_hook':
        return {
          icon: Flame,
          badgeText: 'React Hook',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          iconColor: 'text-amber-600',
        };
      case 'express_middleware':
      case 'express_controller':
        return {
          icon: Server,
          badgeText: type === 'express_middleware' ? 'Middleware' : 'Controller',
          badgeBg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
          iconColor: 'text-fuchsia-600',
        };
      case 'class':
        return {
          icon: Box,
          badgeText: 'Class',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          iconColor: 'text-blue-600',
        };
      default:
        return {
          icon: FunctionSquare,
          badgeText: 'Function',
          badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
          iconColor: 'text-pink-600',
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
      className={`relative w-72 rounded-2xl bg-white/90 backdrop-blur-md border p-4 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer ${
        selected
          ? 'border-pink-500 ring-2 ring-pink-500/30 shadow-pink-500/20'
          : isMatch
          ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-amber-500/20'
          : 'border-slate-200 hover:border-pink-300 hover:shadow-pink-500/10'
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-3 !h-3 !border-2 !border-white" />
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-3 !h-3 !border-2 !border-white" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform shadow-sm ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm truncate tracking-tight group-hover:text-pink-600 transition-colors">
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

      <Handle type="source" position={Position.Bottom} className="!bg-pink-500 !w-3 !h-3 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!bg-pink-500 !w-3 !h-3 !border-2 !border-white" />
    </div>
  );
};
