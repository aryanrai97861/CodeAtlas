export interface ParsedFile {
    filePath: string;
    imports: ImportNode[];
    exports: ExportNode[];
    functions: FunctionNode[];
    classes: ClassNode[];
    interfaces: InterfaceNode[];
    types: TypeAliasNode[];
    variables: VariableNode[];
}
export interface ImportNode {
    moduleSpecifier: string;
    defaultImport?: string;
    namedImports: {
        name: string;
        alias?: string;
    }[];
    namespaceImport?: string;
}
export interface ExportNode {
    isDefault: boolean;
    name?: string;
    moduleSpecifier?: string;
}
export interface FunctionNode {
    name: string;
    isAsync: boolean;
    isExported: boolean;
    parameters: {
        name: string;
        type: string;
    }[];
    returnType: string;
}
export interface ClassNode {
    name: string;
    isExported: boolean;
    methods: FunctionNode[];
    extends?: string;
}
export interface InterfaceNode {
    name: string;
    isExported: boolean;
}
export interface TypeAliasNode {
    name: string;
    isExported: boolean;
}
export interface VariableNode {
    name: string;
    isExported: boolean;
    type: string;
    kind: 'const' | 'let' | 'var';
}
