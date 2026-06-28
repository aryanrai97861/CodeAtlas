import { SymbolGraph } from '../types.js';
export declare class ExpressAnalyzer {
    private graph;
    constructor(graph: SymbolGraph);
    analyze(): Record<string, any>;
}
