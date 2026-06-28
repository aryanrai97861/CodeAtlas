"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolResolver = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class SymbolResolver {
    parsedFiles;
    baseDir;
    graph = {
        nodes: {},
        edges: []
    };
    constructor(parsedFiles, baseDir) {
        this.parsedFiles = parsedFiles;
        this.baseDir = baseDir;
    }
    resolve() {
        this.buildNodes();
        this.resolveImports();
        return this.graph;
    }
    buildNodes() {
        for (const file of this.parsedFiles) {
            const filePath = this.normalizePath(file.filePath);
            // Register File Node
            this.graph.nodes[filePath] = {
                id: filePath,
                type: 'file',
                name: path.basename(filePath),
                file: filePath,
                isExported: true
            };
            // Register Functions
            for (const func of file.functions) {
                const id = `${filePath}::${func.name}`;
                this.graph.nodes[id] = {
                    id,
                    type: 'function',
                    name: func.name,
                    file: filePath,
                    isExported: func.isExported,
                    metadata: { isAsync: func.isAsync, parameters: func.parameters, returnType: func.returnType, calls: func.calls, jsxElements: func.jsxElements }
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
    resolveImports() {
        for (const file of this.parsedFiles) {
            const sourceFilePath = this.normalizePath(file.filePath);
            for (const imp of file.imports) {
                // Resolve local relative imports and @/ aliases
                if (imp.moduleSpecifier.startsWith('.') || imp.moduleSpecifier.startsWith('@/')) {
                    const targetFilePath = this.resolvePath(sourceFilePath, imp.moduleSpecifier);
                    if (!targetFilePath)
                        continue;
                    // Always add a File -> File import edge
                    this.graph.edges.push({
                        sourceId: sourceFilePath,
                        targetId: targetFilePath,
                        relationship: 'imports'
                    });
                    // For each named import, create an edge to the corresponding export node
                    for (const namedImport of imp.namedImports) {
                        const targetId = `${targetFilePath}::${namedImport.name}`;
                        if (this.graph.nodes[targetId]) {
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
    resolvePath(sourceFilePath, moduleSpecifier) {
        let target = '';
        if (moduleSpecifier.startsWith('@/')) {
            // Heuristic: Find the nearest 'src' folder above this file
            const parts = sourceFilePath.split('/');
            const srcIndex = parts.lastIndexOf('src');
            if (srcIndex !== -1) {
                const srcPath = parts.slice(0, srcIndex + 1).join('/');
                target = path.resolve(srcPath, moduleSpecifier.replace('@/', ''));
            }
            else {
                return null; // Can't resolve @/ if not in a src dir
            }
        }
        else {
            const dir = path.dirname(sourceFilePath);
            target = path.resolve(dir, moduleSpecifier);
        }
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
    normalizePath(p) {
        return p.replace(/\\/g, '/');
    }
}
exports.SymbolResolver = SymbolResolver;
