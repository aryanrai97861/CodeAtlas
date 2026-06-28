import React from 'react';
import { useAtlasStore } from '../store/useAtlasStore';
import { Network, GitFork, Compass, Search } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeGraph, setActiveGraph, searchQuery, setSearchQuery } = useAtlasStore();

  const navItems = [
    { id: 'import', label: 'Import Graph', icon: Network },
    { id: 'call', label: 'Call Graph', icon: GitFork },
    { id: 'component', label: 'Component Graph', icon: Compass },
  ] as const;

  return (
    <header className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-11/12 max-w-6xl rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-2xl px-6 py-4 flex items-center justify-between gap-6 transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 animate-pulse">
          <Network className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-300 via-white to-violet-400 bg-clip-text text-transparent">
            Code Atlas
          </h1>
          <p className="text-xs text-slate-400 font-medium">Semantic Codebase Visualization</p>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex items-center bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeGraph === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveGraph(item.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Search Bar */}
      <div className="relative w-72">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search symbols or files..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
        />
      </div>
    </header>
  );
};
