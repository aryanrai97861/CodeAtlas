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
export declare class CallGraphGenerator {
    private symbolGraph;
    constructor(symbolGraph: SymbolGraph);
    generate(): CallGraph;
}
