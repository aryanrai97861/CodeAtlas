import { SymbolGraph, SymbolEdge } from '../types.js';

export interface ImportGraphNode {
  id: string;
  file: string;
}

export interface ImportGraphEdge {
  source: string;
  target: string;
}

export interface ImportGraph {
  nodes: ImportGraphNode[];
  edges: ImportGraphEdge[];
}

export class ImportGraphGenerator {
  constructor(private symbolGraph: SymbolGraph) {}

  public generate(): ImportGraph {
    const nodes = new Map<string, ImportGraphNode>();
    const edges = new Set<string>();
    const parsedEdges: ImportGraphEdge[] = [];

    // Import graph is file to file
    for (const edge of this.symbolGraph.edges) {
      if (edge.relationship === 'imports') {
        const sourceFile = edge.sourceId; // currently sourceId is the file path
        const targetNode = this.symbolGraph.nodes[edge.targetId];
        if (!targetNode) continue;
        
        const targetFile = targetNode.file;
        
        if (!nodes.has(sourceFile)) nodes.set(sourceFile, { id: sourceFile, file: sourceFile });
        if (!nodes.has(targetFile)) nodes.set(targetFile, { id: targetFile, file: targetFile });

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
