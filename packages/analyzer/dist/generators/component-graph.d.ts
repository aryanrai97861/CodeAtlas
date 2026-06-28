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
export declare class ComponentGraphGenerator {
    private symbolGraph;
    constructor(symbolGraph: SymbolGraph);
    generate(): ComponentGraph;
}
