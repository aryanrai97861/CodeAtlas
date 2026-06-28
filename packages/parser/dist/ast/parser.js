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
exports.ASTParser = void 0;
const ts_morph_1 = require("ts-morph");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class ASTParser {
    targetDir;
    project;
    constructor(targetDir, tsconfigPath) {
        this.targetDir = targetDir;
        this.targetDir = path.resolve(targetDir);
        // Initialize ts-morph project
        if (tsconfigPath && fs.existsSync(tsconfigPath)) {
            this.project = new ts_morph_1.Project({ tsConfigFilePath: tsconfigPath });
        }
        else {
            this.project = new ts_morph_1.Project();
            // Globs must use forward slashes, even on Windows
            const normalizedTarget = this.targetDir.replace(/\\/g, '/');
            this.project.addSourceFilesAtPaths([
                `${normalizedTarget}/**/*.{ts,tsx,js,jsx}`,
                `!${normalizedTarget}/**/node_modules/**`,
                `!${normalizedTarget}/**/.git/**`
            ]);
        }
    }
    parse() {
        const parsedFiles = [];
        const sourceFiles = this.project.getSourceFiles();
        for (const sourceFile of sourceFiles) {
            // Ignore node_modules
            if (sourceFile.getFilePath().includes('node_modules'))
                continue;
            parsedFiles.push(this.parseFile(sourceFile));
        }
        return parsedFiles;
    }
    parseFile(sourceFile) {
        return {
            filePath: sourceFile.getFilePath(),
            imports: this.extractImports(sourceFile),
            exports: this.extractExports(sourceFile),
            functions: this.extractFunctions(sourceFile),
            classes: this.extractClasses(sourceFile),
            interfaces: this.extractInterfaces(sourceFile),
            types: this.extractTypeAliases(sourceFile),
            variables: this.extractVariables(sourceFile)
        };
    }
    extractImports(sourceFile) {
        const importDeclarations = sourceFile.getImportDeclarations();
        return importDeclarations.map(decl => {
            const defaultImport = decl.getDefaultImport();
            const namespaceImport = decl.getNamespaceImport();
            const namedImports = decl.getNamedImports().map(ni => ({
                name: ni.getName(),
                alias: ni.getAliasNode()?.getText()
            }));
            return {
                moduleSpecifier: decl.getModuleSpecifierValue(),
                defaultImport: defaultImport ? defaultImport.getText() : undefined,
                namespaceImport: namespaceImport ? namespaceImport.getText() : undefined,
                namedImports
            };
        });
    }
    extractExports(sourceFile) {
        const exports = [];
        // Handle explicit export declarations (e.g. export { x } from 'y')
        const exportDeclarations = sourceFile.getExportDeclarations();
        for (const decl of exportDeclarations) {
            const moduleSpecifier = decl.getModuleSpecifierValue();
            const namedExports = decl.getNamedExports();
            if (namedExports.length > 0) {
                for (const namedExport of namedExports) {
                    exports.push({
                        isDefault: false,
                        name: namedExport.getName(),
                        moduleSpecifier
                    });
                }
            }
            else if (moduleSpecifier) {
                // export * from 'y'
                exports.push({
                    isDefault: false,
                    moduleSpecifier
                });
            }
        }
        // Default exports (export default ...)
        const exportAssignment = sourceFile.getExportAssignments();
        for (const assignment of exportAssignment) {
            exports.push({
                isDefault: true,
                name: assignment.getExpression().getText()
            });
        }
        return exports;
    }
    extractFunctions(sourceFile) {
        const functions = [];
        // Standard Function Declarations
        const functionDecls = sourceFile.getFunctions();
        for (const func of functionDecls) {
            const name = func.getName() || 'anonymous';
            functions.push({
                name,
                isAsync: func.isAsync(),
                isExported: func.isExported(),
                parameters: func.getParameters().map(p => ({
                    name: p.getName(),
                    type: p.getTypeNode()?.getText() || 'any'
                })),
                returnType: func.getReturnTypeNode()?.getText() || 'any'
            });
        }
        return functions;
    }
    extractClasses(sourceFile) {
        const classes = [];
        const classDecls = sourceFile.getClasses();
        for (const cls of classDecls) {
            const methods = cls.getMethods().map(m => ({
                name: m.getName(),
                isAsync: m.isAsync(),
                isExported: false, // Class methods aren't exported individually
                parameters: m.getParameters().map(p => ({
                    name: p.getName(),
                    type: p.getTypeNode()?.getText() || 'any'
                })),
                returnType: m.getReturnTypeNode()?.getText() || 'any'
            }));
            classes.push({
                name: cls.getName() || 'anonymous',
                isExported: cls.isExported(),
                methods,
                extends: cls.getExtends()?.getText()
            });
        }
        return classes;
    }
    extractInterfaces(sourceFile) {
        const interfaces = [];
        const interfaceDecls = sourceFile.getInterfaces();
        for (const iface of interfaceDecls) {
            interfaces.push({
                name: iface.getName(),
                isExported: iface.isExported()
            });
        }
        return interfaces;
    }
    extractTypeAliases(sourceFile) {
        const types = [];
        const typeDecls = sourceFile.getTypeAliases();
        for (const type of typeDecls) {
            types.push({
                name: type.getName(),
                isExported: type.isExported()
            });
        }
        return types;
    }
    extractVariables(sourceFile) {
        const variables = [];
        const variableStatements = sourceFile.getVariableStatements();
        for (const stmt of variableStatements) {
            const isExported = stmt.isExported();
            const kind = stmt.getDeclarationKind();
            const decls = stmt.getDeclarations();
            for (const decl of decls) {
                variables.push({
                    name: decl.getName(),
                    isExported,
                    type: decl.getTypeNode()?.getText() || 'any',
                    kind
                });
            }
        }
        return variables;
    }
}
exports.ASTParser = ASTParser;
