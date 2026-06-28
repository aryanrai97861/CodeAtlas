import { Project, SourceFile, SyntaxKind } from 'ts-morph';
import {
  ParsedFile,
  ImportNode,
  ExportNode,
  FunctionNode,
  ClassNode,
  InterfaceNode,
  TypeAliasNode,
  VariableNode
} from './types.js';
import * as path from 'path';
import * as fs from 'fs';

export class ASTParser {
  private project: Project;

  constructor(private targetDir: string, tsconfigPath?: string) {
    this.targetDir = path.resolve(targetDir);
    
    // Initialize ts-morph project
    if (tsconfigPath && fs.existsSync(tsconfigPath)) {
      this.project = new Project({ tsConfigFilePath: tsconfigPath });
    } else {
      this.project = new Project();
      // Globs must use forward slashes, even on Windows
      const normalizedTarget = this.targetDir.replace(/\\/g, '/');
      this.project.addSourceFilesAtPaths([
        `${normalizedTarget}/**/*.{ts,tsx,js,jsx}`,
        `!${normalizedTarget}/**/node_modules/**`,
        `!${normalizedTarget}/**/.git/**`
      ]);
    }
  }

  public parse(): ParsedFile[] {
    const parsedFiles: ParsedFile[] = [];
    const sourceFiles = this.project.getSourceFiles();

    for (const sourceFile of sourceFiles) {
      // Ignore node_modules
      if (sourceFile.getFilePath().includes('node_modules')) continue;

      parsedFiles.push(this.parseFile(sourceFile));
    }

    return parsedFiles;
  }

  private parseFile(sourceFile: SourceFile): ParsedFile {
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

  private extractImports(sourceFile: SourceFile): ImportNode[] {
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

  private extractExports(sourceFile: SourceFile): ExportNode[] {
    const exports: ExportNode[] = [];
    
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
      } else if (moduleSpecifier) {
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

  private extractFunctions(sourceFile: SourceFile): FunctionNode[] {
    const functions: FunctionNode[] = [];

    // Standard Function Declarations
    const functionDecls = sourceFile.getFunctions();
    for (const func of functionDecls) {
      const name = func.getName() || 'anonymous';
      
      const calls = new Set<string>();
      func.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
        const expression = call.getExpression();
        calls.add(expression.getText());
      });

      const jsxElements = new Set<string>();
      func.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).forEach(jsx => {
        jsxElements.add(jsx.getTagNameNode().getText());
      });
      func.getDescendantsOfKind(SyntaxKind.JsxOpeningElement).forEach(jsx => {
        jsxElements.add(jsx.getTagNameNode().getText());
      });

      functions.push({
        name,
        isAsync: func.isAsync(),
        isExported: func.isExported(),
        parameters: func.getParameters().map(p => ({
          name: p.getName(),
          type: p.getTypeNode()?.getText() || 'any'
        })),
        returnType: func.getReturnTypeNode()?.getText() || 'any',
        calls: Array.from(calls),
        jsxElements: Array.from(jsxElements)
      });
    }

    return functions;
  }

  private extractClasses(sourceFile: SourceFile): ClassNode[] {
    const classes: ClassNode[] = [];
    const classDecls = sourceFile.getClasses();

    for (const cls of classDecls) {
      const methods = cls.getMethods().map(m => {
        const calls = new Set<string>();
        m.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
          calls.add(call.getExpression().getText());
        });
        
        const jsxElements = new Set<string>();
        m.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).forEach(jsx => jsxElements.add(jsx.getTagNameNode().getText()));
        m.getDescendantsOfKind(SyntaxKind.JsxOpeningElement).forEach(jsx => jsxElements.add(jsx.getTagNameNode().getText()));

        return {
          name: m.getName(),
          isAsync: m.isAsync(),
          isExported: false, // Class methods aren't exported individually
          parameters: m.getParameters().map(p => ({
            name: p.getName(),
            type: p.getTypeNode()?.getText() || 'any'
          })),
          returnType: m.getReturnTypeNode()?.getText() || 'any',
          calls: Array.from(calls),
          jsxElements: Array.from(jsxElements)
        };
      });

      classes.push({
        name: cls.getName() || 'anonymous',
        isExported: cls.isExported(),
        methods,
        extends: cls.getExtends()?.getText()
      });
    }

    return classes;
  }

  private extractInterfaces(sourceFile: SourceFile): InterfaceNode[] {
    const interfaces: InterfaceNode[] = [];
    const interfaceDecls = sourceFile.getInterfaces();

    for (const iface of interfaceDecls) {
      interfaces.push({
        name: iface.getName(),
        isExported: iface.isExported()
      });
    }

    return interfaces;
  }

  private extractTypeAliases(sourceFile: SourceFile): TypeAliasNode[] {
    const types: TypeAliasNode[] = [];
    const typeDecls = sourceFile.getTypeAliases();

    for (const type of typeDecls) {
      types.push({
        name: type.getName(),
        isExported: type.isExported()
      });
    }

    return types;
  }

  private extractVariables(sourceFile: SourceFile): VariableNode[] {
    const variables: VariableNode[] = [];
    const variableStatements = sourceFile.getVariableStatements();

    for (const stmt of variableStatements) {
      const isExported = stmt.isExported();
      const kind = stmt.getDeclarationKind() as 'const' | 'let' | 'var';

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
