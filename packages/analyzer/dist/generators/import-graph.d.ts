import { SymbolGraph } from '../types.js';
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
export declare class ImportGraphGenerator {
    private symbolGraph;
    constructor(symbolGraph: SymbolGraph);
    generate(): ImportGraph;
}
