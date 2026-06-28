import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';

interface GraphNode {
  id: string;
  type: string;
  name: string;
  file: string;
  isExported: boolean;
  metadata?: any;
}

interface GraphEdge {
  sourceId: string;
  targetId: string;
  relationship: string;
}

interface SymbolGraph {
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory data store
let symbolGraph: SymbolGraph = { nodes: {}, edges: [] };
let importGraph: any = { nodes: [], edges: [] };
let callGraph: any = { nodes: [], edges: [] };
let componentGraph: any = { nodes: [], edges: [] };
let frameworkAnalysis: any = { react: {}, express: {} };

// Helper to load JSON files safely
function loadJsonFile(fileName: string, defaultValue: any = null): any {
  const filePath = path.join(process.cwd(), fileName);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error parsing ${fileName}:`, error);
      return defaultValue;
    }
  }
  console.warn(`File not found: ${filePath}`);
  return defaultValue;
}

// Load data into memory
function initData() {
  console.log(`Loading graph data from working directory: ${process.cwd()}`);
  symbolGraph = loadJsonFile('graph.json', { nodes: {}, edges: [] });
  importGraph = loadJsonFile('import-graph.json', { nodes: [], edges: [] });
  callGraph = loadJsonFile('call-graph.json', { nodes: [], edges: [] });
  componentGraph = loadJsonFile('component-graph.json', { nodes: [], edges: [] });
  frameworkAnalysis = loadJsonFile('framework-analysis.json', { react: {}, express: {} });
  console.log('Graph data successfully loaded into memory!');
}

// Endpoints
app.get('/api/graphs/import', (req, res) => {
  res.json(importGraph);
});

app.get('/api/graphs/call', (req, res) => {
  res.json(callGraph);
});

app.get('/api/graphs/component', (req, res) => {
  res.json(componentGraph);
});

// Search and Paginate Nodes
app.get('/api/nodes', (req, res) => {
  const query = (req.query.q as string || '').toLowerCase();
  const typeFilter = req.query.type as string || '';
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '50', 10);

  let filteredNodes = Object.values(symbolGraph.nodes);

  if (query) {
    filteredNodes = filteredNodes.filter(
      node => node.name.toLowerCase().includes(query) || node.file.toLowerCase().includes(query)
    );
  }

  if (typeFilter) {
    filteredNodes = filteredNodes.filter(node => node.type === typeFilter);
  }

  const total = filteredNodes.length;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  res.json({
    total,
    page,
    limit,
    nodes: filteredNodes.slice(startIndex, endIndex)
  });
});

// Get Single Node details + incoming/outgoing edges
app.get('/api/nodes/:id', (req, res) => {
  const nodeId = req.params.id;
  const decodeId = decodeURIComponent(nodeId);
  const node = symbolGraph.nodes[decodeId];

  if (!node) {
    return res.status(404).json({ error: `Node not found: ${decodeId}` });
  }

  // Find incoming and outgoing edges for this node
  const incoming = symbolGraph.edges.filter(edge => edge.targetId === decodeId);
  const outgoing = symbolGraph.edges.filter(edge => edge.sourceId === decodeId);

  // Framework tags
  const reactTags = frameworkAnalysis.react?.[decodeId]?.tags || [];
  const expressTags = frameworkAnalysis.express?.[decodeId]?.tags || [];

  res.json({
    node: {
      ...node,
      frameworkTags: [...reactTags, ...expressTags]
    },
    edges: {
      incoming,
      outgoing
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', loaded: Object.keys(symbolGraph.nodes).length > 0 });
});

// Start Server
initData();
app.listen(PORT, () => {
  console.log(`Code Atlas backend running at http://localhost:${PORT}`);
});
