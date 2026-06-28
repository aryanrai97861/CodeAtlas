import { SymbolGraph } from '../types.js';

export interface ComponentGraphNode {
  id: string;
  name: string;
  file: string;
}

export interface ComponentGraphEdge {
  source: string;
  target: string;
}

export interface ComponentGraph {
  nodes: ComponentGraphNode[];
  edges: ComponentGraphEdge[];
}

export class ComponentGraphGenerator {
  constructor(private symbolGraph: SymbolGraph) {}

  public generate(): ComponentGraph {
    const nodes = new Map<string, ComponentGraphNode>();
    const edges = new Set<string>();
    const parsedEdges: ComponentGraphEdge[] = [];

    // Find all functions that return JSX (React Components)
    const components = Object.values(this.symbolGraph.nodes).filter(
      node => node.type === 'function' && node.metadata?.jsxElements && node.metadata.jsxElements.length > 0
    );

    for (const component of components) {
      nodes.set(component.id, { id: component.id, name: component.name, file: component.file });

      // Look at the JSX elements it renders
      const renderedTags: string[] = component.metadata.jsxElements;
      
      for (const tag of renderedTags) {
        // Tag could be 'Header', 'div', etc. Only care about capitalized tags (React components)
        if (tag[0] === tag[0].toUpperCase()) {
          // Find the node corresponding to this tag in the same file or imported
          // Simple heuristic: find a component in the graph with this name
          const targetComponent = components.find(c => c.name === tag);
          if (targetComponent) {
             nodes.set(targetComponent.id, { id: targetComponent.id, name: targetComponent.name, file: targetComponent.file });
             
             const edgeId = `${component.id}->${targetComponent.id}`;
             if (!edges.has(edgeId)) {
               edges.add(edgeId);
               parsedEdges.push({ source: component.id, target: targetComponent.id });
             }
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
