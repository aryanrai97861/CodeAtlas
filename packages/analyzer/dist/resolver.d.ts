import { ParsedFile } from '@code-atlas/parser';
import { SymbolGraph } from './types.js';
export declare class SymbolResolver {
    private parsedFiles;
    private baseDir;
    private graph;
    constructor(parsedFiles: ParsedFile[], baseDir: string);
    resolve(): SymbolGraph;
    private buildNodes;
    private resolveImports;
    private resolvePath;
    private normalizePath;
}
