import { SymbolGraph } from '../types.js';

export interface CallGraphNode {
  id: string;
  name: string;
  file: string;
}

export interface CallGraphEdge {
  source: string;
  target: string;
}

export interface CallGraph {
  nodes: CallGraphNode[];
  edges: CallGraphEdge[];
}

export class CallGraphGenerator {
  constructor(private symbolGraph: SymbolGraph) {}

  public generate(): CallGraph {
    const nodes = new Map<string, CallGraphNode>();
    const edges = new Set<string>();
    const parsedEdges: CallGraphEdge[] = [];

    const functions = Object.values(this.symbolGraph.nodes).filter(
      node => node.type === 'function' && node.metadata?.calls
    );

    for (const func of functions) {
      nodes.set(func.id, { id: func.id, name: func.name, file: func.file });

      const calls: string[] = func.metadata.calls;
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
