import { ParsedFile } from '@code-atlas/parser';
import { SymbolGraph, SymbolNode, SymbolEdge } from './types.js';
import * as path from 'path';
import * as fs from 'fs';

export class SymbolResolver {
  private graph: SymbolGraph = {
    nodes: {},
    edges: []
  };

  constructor(private parsedFiles: ParsedFile[], private baseDir: string) {}

  public resolve(): SymbolGraph {
    this.buildNodes();
    this.resolveImports();
    return this.graph;
  }

  private buildNodes() {
    for (const file of this.parsedFiles) {
      const filePath = this.normalizePath(file.filePath);
      
      // Register Functions
      for (const func of file.functions) {
        const id = `${filePath}::${func.name}`;
        this.graph.nodes[id] = {
          id,
          type: 'function',
          name: func.name,
          file: filePath,
          isExported: func.isExported,
          metadata: { isAsync: func.isAsync, parameters: func.parameters, returnType: func.returnType }
        };
      }

      // Register Classes
      for (const cls of file.classes) {
        const id = `${filePath}::${cls.name}`;
        this.graph.nodes[id] = {
          id,
          type: 'class',
          name: cls.name,
          file: filePath,
          isExported: cls.isExported,
          metadata: { methods: cls.methods, extends: cls.extends }
        };
      }

      // Register Variables
      for (const v of file.variables) {
        const id = `${filePath}::${v.name}`;
        this.graph.nodes[id] = {
          id,
          type: 'variable',
          name: v.name,
          file: filePath,
          isExported: v.isExported,
          metadata: { kind: v.kind, type: v.type }
        };
      }

      // Interfaces and Types
      for (const iface of file.interfaces) {
        const id = `${filePath}::${iface.name}`;
        this.graph.nodes[id] = {
          id,
          type: 'interface',
          name: iface.name,
          file: filePath,
          isExported: iface.isExported
        };
      }
      
      for (const t of file.types) {
        const id = `${filePath}::${t.name}`;
        this.graph.nodes[id] = {
          id,
          type: 'type',
          name: t.name,
          file: filePath,
          isExported: t.isExported
        };
      }
    }
  }

  private resolveImports() {
    for (const file of this.parsedFiles) {
      const sourceFilePath = this.normalizePath(file.filePath);
      
      for (const imp of file.imports) {
        // Only resolve local relative imports for now
        if (imp.moduleSpecifier.startsWith('.')) {
          const targetFilePath = this.resolvePath(sourceFilePath, imp.moduleSpecifier);
          if (!targetFilePath) continue;

          // For each named import, create an edge to the corresponding export node
          for (const namedImport of imp.namedImports) {
            const targetId = `${targetFilePath}::${namedImport.name}`;
            
            // If the target node exists in our graph, link it!
            if (this.graph.nodes[targetId]) {
              // Create an edge from the file itself or we could map to exact function calls later.
              // For now, representing an import dependency from File -> Node.
              this.graph.edges.push({
                sourceId: sourceFilePath,
                targetId: targetId,
                relationship: 'imports'
              });
            }
          }
        }
      }
    }
  }

  private resolvePath(sourceFilePath: string, moduleSpecifier: string): string | null {
    const dir = path.dirname(sourceFilePath);
    let target = path.resolve(dir, moduleSpecifier);
    target = this.normalizePath(target);

    // Try extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    for (const ext of extensions) {
      if (fs.existsSync(target + ext)) {
        return target + ext;
      }
      // Also try index files (e.g. ./utils -> ./utils/index.ts)
      if (fs.existsSync(target + '/index' + ext)) {
        return target + '/index' + ext;
      }
    }

    return null;
  }

  private normalizePath(p: string): string {
    return p.replace(/\\/g, '/');
  }
}
