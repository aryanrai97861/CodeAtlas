"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallGraphGenerator = void 0;
class CallGraphGenerator {
    symbolGraph;
    constructor(symbolGraph) {
        this.symbolGraph = symbolGraph;
    }
    generate() {
        const nodes = new Map();
        const edges = new Set();
        const parsedEdges = [];
        const functions = Object.values(this.symbolGraph.nodes).filter(node => node.type === 'function' && node.metadata?.calls);
        for (const func of functions) {
            nodes.set(func.id, { id: func.id, name: func.name, file: func.file });
            const calls = func.metadata.calls;
            for (const callName of calls) {
                // Find a function in the graph with this name
                const targetFunc = functions.find(f => f.name === callName);
                if (targetFunc) {
                    nodes.set(targetFunc.id, { id: targetFunc.id, name: targetFunc.name, file: targetFunc.file });
                    const edgeId = `${func.id}->${targetFunc.id}`;
                    if (!edges.has(edgeId)) {
                        edges.add(edgeId);
                        parsedEdges.push({ source: func.id, target: targetFunc.id });
                    }
                }
            }
        }
        return {
            nodes: Array.from(nodes.values()),
            edges: parsedEdges
        };
    }
}
exports.CallGraphGenerator = CallGraphGenerator;
