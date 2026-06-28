import * as fs from 'fs';
import * as path from 'path';
import { RepositoryMetadata, DirectoryStructure } from './types.js';

export class RepositoryScanner {
  constructor(private repoPath: string) {
    this.repoPath = path.resolve(repoPath);
  }

  public async scan(): Promise<RepositoryMetadata> {
    const packageJson = this.readJsonFile(path.join(this.repoPath, 'package.json'));
    const tsconfigJson = this.readJsonFile(path.join(this.repoPath, 'tsconfig.json'));
    
    const structure = this.buildDirectoryStructure(this.repoPath);
    const frameworks = this.detectFrameworks(packageJson);
    const languages = this.detectLanguages(structure);

    return {
      path: this.repoPath,
      packageJson,
      tsconfigJson,
      frameworks,
      languages,
      structure,
    };
  }

  private readJsonFile(filePath: string): any | null {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn(`Failed to read or parse JSON at ${filePath}:`, error);
    }
    return null;
  }

  private detectFrameworks(packageJson: any): string[] {
    const frameworks = new Set<string>();
    if (!packageJson) return [];

    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps['react']) frameworks.add('React');
    if (deps['next']) frameworks.add('Next.js');
    if (deps['express']) frameworks.add('Express');
    if (deps['vue']) frameworks.add('Vue');
    if (deps['@angular/core']) frameworks.add('Angular');
    if (deps['@nestjs/core']) frameworks.add('NestJS');
    if (deps['fastify']) frameworks.add('Fastify');

    return Array.from(frameworks);
  }

  private detectLanguages(structure: DirectoryStructure): string[] {
    const extensions = new Set<string>();
    
    const traverse = (node: DirectoryStructure) => {
      if (node.type === 'file') {
        const ext = path.extname(node.name).toLowerCase();
        extensions.add(ext);
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    
    traverse(structure);

    const languages = new Set<string>();
    if (extensions.has('.ts') || extensions.has('.tsx')) languages.add('TypeScript');
    if (extensions.has('.js') || extensions.has('.jsx')) languages.add('JavaScript');
    if (extensions.has('.py')) languages.add('Python');
    if (extensions.has('.go')) languages.add('Go');
    if (extensions.has('.java')) languages.add('Java');

    return Array.from(languages);
  }

  private buildDirectoryStructure(dirPath: string): DirectoryStructure {
    const stats = fs.statSync(dirPath);
    const name = path.basename(dirPath);

    if (stats.isDirectory()) {
      const children: DirectoryStructure[] = [];
      const entries = fs.readdirSync(dirPath);

      for (const entry of entries) {
        if (entry === 'node_modules' || entry === '.git') continue; // Ignore typical large dirs
        children.push(this.buildDirectoryStructure(path.join(dirPath, entry)));
      }

      return {
        name,
        type: 'directory',
        path: dirPath,
        children,
      };
    } else {
      return {
        name,
        type: 'file',
        path: dirPath,
      };
    }
  }
}
