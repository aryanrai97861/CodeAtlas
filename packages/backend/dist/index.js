"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// In-memory data store
let symbolGraph = { nodes: {}, edges: [] };
let importGraph = { nodes: [], edges: [] };
let callGraph = { nodes: [], edges: [] };
let componentGraph = { nodes: [], edges: [] };
let frameworkAnalysis = { react: {}, express: {} };
// Helper to load JSON files safely
function loadJsonFile(fileName, defaultValue = null) {
    const filePath = path.join(process.cwd(), fileName);
    if (fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
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
    const query = (req.query.q || '').toLowerCase();
    const typeFilter = req.query.type || '';
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    let filteredNodes = Object.values(symbolGraph.nodes);
    if (query) {
        filteredNodes = filteredNodes.filter(node => node.name.toLowerCase().includes(query) || node.file.toLowerCase().includes(query));
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
