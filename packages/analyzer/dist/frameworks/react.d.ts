import { SymbolGraph } from '../types.js';
export declare class ReactAnalyzer {
    private graph;
    constructor(graph: SymbolGraph);
    analyze(): Record<string, any>;
}
