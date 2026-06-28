import React, { useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { GraphCanvas } from './components/GraphCanvas';
import { NodeSidebar } from './components/NodeSidebar';
import { useAtlasStore } from './store/useAtlasStore';

export const App: React.FC = () => {
  const { fetchGraphData } = useAtlasStore();

  useEffect(() => {
    // Fetch default graph view (Import Graph) on mount
    fetchGraphData('import');
  }, [fetchGraphData]);

  return (
    <main className="w-screen h-screen overflow-hidden bg-slate-50 flex flex-col relative select-none">
      <Navigation />
      <GraphCanvas />
      <NodeSidebar />
    </main>
  );
};

export default App;
