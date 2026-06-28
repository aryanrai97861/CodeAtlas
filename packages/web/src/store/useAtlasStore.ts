import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, type Node, type Edge, type OnNodesChange, type OnEdgesChange } from '@xyflow/react';
import dagre from 'dagre';

const API_BASE = 'http://localhost:3000/api';

interface NodeData {
  label: string;
  type: string;
  file: string;
  [key: string]: any;
}

export type CustomNodeType = Node<NodeData>;

interface AtlasState {
  activeGraph: 'import' | 'call' | 'component';
  nodes: CustomNodeType[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedNodeData: any | null;
  incomingEdges: any[];
  outgoingEdges: any[];
  searchQuery: string;
  typeFilter: string;
  loading: boolean;
  error: string | null;

  setActiveGraph: (graph: 'import' | 'call' | 'component') => void;
  setSelectedNodeId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setTypeFilter: (type: string) => void;
  onNodesChange: OnNodesChange<CustomNodeType>;
  onEdgesChange: OnEdgesChange;
  fetchGraphData: (type: 'import' | 'call' | 'component') => Promise<void>;
  fetchNodeDetails: (id: string) => Promise<void>;
}

const getLayoutedElements = (nodes: CustomNodeType[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 280, height: 80 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition ? nodeWithPosition.x - 140 : 0,
        y: nodeWithPosition ? nodeWithPosition.y - 40 : 0,
      },
    };
  });

  return { nodes: newNodes, edges };
};

export const useAtlasStore = create<AtlasState>((set, get) => ({
  activeGraph: 'import',
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedNodeData: null,
  incomingEdges: [],
  outgoingEdges: [],
  searchQuery: '',
  typeFilter: '',
  loading: false,
  error: null,

  setActiveGraph: (graph) => {
    set({ activeGraph: graph, selectedNodeId: null, selectedNodeData: null });
    get().fetchGraphData(graph);
  },

  setSelectedNodeId: (id) => {
    set({ selectedNodeId: id });
    if (id) {
      get().fetchNodeDetails(id);
    } else {
      set({ selectedNodeData: null, incomingEdges: [], outgoingEdges: [] });
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setTypeFilter: (type) => {
    set({ typeFilter: type });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as CustomNodeType[],
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  fetchGraphData: async (type) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/graphs/${type}`);
      if (!res.ok) throw new Error(`Failed to fetch ${type} graph`);
      const data = await res.json();

      // Transform data into React Flow format
      const initialNodes: CustomNodeType[] = (data.nodes || []).map((n: any) => ({
        id: n.id,
        type: 'custom',
        position: { x: 0, y: 0 },
        data: {
          label: n.name || n.file.split(/[/\\]/).pop() || n.id,
          type: type === 'import' ? 'file' : n.type || 'function',
          file: n.file,
          ...n,
        },
      }));

      const initialEdges: Edge[] = (data.edges || []).map((e: any, index: number) => ({
        id: `e-${e.source}-${e.target}-${index}`,
        source: e.source,
        target: e.target,
        animated: type === 'call',
        style: { stroke: '#64748b', strokeWidth: 2 },
      }));

      const { nodes, edges } = getLayoutedElements(initialNodes, initialEdges, type === 'import' ? 'LR' : 'TB');

      set({ nodes, edges, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchNodeDetails: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/nodes/${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error('Node details not found');
      const data = await res.json();
      set({
        selectedNodeData: data.node,
        incomingEdges: data.edges?.incoming || [],
        outgoingEdges: data.edges?.outgoing || [],
      });
    } catch (err: any) {
      console.error('Failed to fetch node details', err);
    }
  },
}));
