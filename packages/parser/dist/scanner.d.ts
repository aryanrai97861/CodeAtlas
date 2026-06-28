import { RepositoryMetadata } from './types.js';
export declare class RepositoryScanner {
    private repoPath;
    constructor(repoPath: string);
    scan(): Promise<RepositoryMetadata>;
    private readJsonFile;
    private detectFrameworks;
    private detectLanguages;
    private buildDirectoryStructure;
}
