export interface SymbolNode {
    id: string;
    type: 'function' | 'class' | 'interface' | 'variable' | 'type' | 'file';
    name: string;
    file: string;
    isExported: boolean;
    metadata?: any;
}
export interface SymbolEdge {
    sourceId: string;
    targetId: string;
    relationship: 'imports' | 'calls' | 'extends' | 'implements' | 'uses';
}
export interface SymbolGraph {
    nodes: Record<string, SymbolNode>;
    edges: SymbolEdge[];
}
