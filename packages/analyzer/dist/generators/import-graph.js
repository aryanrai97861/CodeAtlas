"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportGraphGenerator = void 0;
class ImportGraphGenerator {
    symbolGraph;
    constructor(symbolGraph) {
        this.symbolGraph = symbolGraph;
    }
    generate() {
        const nodes = new Map();
        const edges = new Set();
        const parsedEdges = [];
        // Import graph is file to file
        for (const edge of this.symbolGraph.edges) {
            if (edge.relationship === 'imports') {
                const sourceFile = edge.sourceId; // currently sourceId is the file path
                const targetNode = this.symbolGraph.nodes[edge.targetId];
                if (!targetNode)
                    continue;
                const targetFile = targetNode.file;
                if (!nodes.has(sourceFile))
                    nodes.set(sourceFile, { id: sourceFile, file: sourceFile });
                if (!nodes.has(targetFile))
                    nodes.set(targetFile, { id: targetFile, file: targetFile });
                const edgeId = `${sourceFile}->${targetFile}`;
                if (!edges.has(edgeId) && sourceFile !== targetFile) {
                    edges.add(edgeId);
                    parsedEdges.push({ source: sourceFile, target: targetFile });
                }
            }
        }
        return {
            nodes: Array.from(nodes.values()),
            edges: parsedEdges
        };
    }
}
exports.ImportGraphGenerator = ImportGraphGenerator;
