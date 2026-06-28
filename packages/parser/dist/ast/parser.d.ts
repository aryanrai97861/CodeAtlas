import { ParsedFile } from './types.js';
export declare class ASTParser {
    private targetDir;
    private project;
    constructor(targetDir: string, tsconfigPath?: string);
    parse(): ParsedFile[];
    private parseFile;
    private extractImports;
    private extractExports;
    private extractFunctions;
    private extractClasses;
    private extractInterfaces;
    private extractTypeAliases;
    private extractVariables;
}
