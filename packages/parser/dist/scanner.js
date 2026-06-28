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
exports.RepositoryScanner = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class RepositoryScanner {
    repoPath;
    constructor(repoPath) {
        this.repoPath = repoPath;
        this.repoPath = path.resolve(repoPath);
    }
    async scan() {
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
    readJsonFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                return JSON.parse(content);
            }
        }
        catch (error) {
            console.warn(`Failed to read or parse JSON at ${filePath}:`, error);
        }
        return null;
    }
    detectFrameworks(packageJson) {
        const frameworks = new Set();
        if (!packageJson)
            return [];
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        if (deps['react'])
            frameworks.add('React');
        if (deps['next'])
            frameworks.add('Next.js');
        if (deps['express'])
            frameworks.add('Express');
        if (deps['vue'])
            frameworks.add('Vue');
        if (deps['@angular/core'])
            frameworks.add('Angular');
        if (deps['@nestjs/core'])
            frameworks.add('NestJS');
        if (deps['fastify'])
            frameworks.add('Fastify');
        return Array.from(frameworks);
    }
    detectLanguages(structure) {
        const extensions = new Set();
        const traverse = (node) => {
            if (node.type === 'file') {
                const ext = path.extname(node.name).toLowerCase();
                extensions.add(ext);
            }
            if (node.children) {
                node.children.forEach(traverse);
            }
        };
        traverse(structure);
        const languages = new Set();
        if (extensions.has('.ts') || extensions.has('.tsx'))
            languages.add('TypeScript');
        if (extensions.has('.js') || extensions.has('.jsx'))
            languages.add('JavaScript');
        if (extensions.has('.py'))
            languages.add('Python');
        if (extensions.has('.go'))
            languages.add('Go');
        if (extensions.has('.java'))
            languages.add('Java');
        return Array.from(languages);
    }
    buildDirectoryStructure(dirPath) {
        const stats = fs.statSync(dirPath);
        const name = path.basename(dirPath);
        if (stats.isDirectory()) {
            const children = [];
            const entries = fs.readdirSync(dirPath);
            for (const entry of entries) {
                if (entry === 'node_modules' || entry === '.git')
                    continue; // Ignore typical large dirs
                children.push(this.buildDirectoryStructure(path.join(dirPath, entry)));
            }
            return {
                name,
                type: 'directory',
                path: dirPath,
                children,
            };
        }
        else {
            return {
                name,
                type: 'file',
                path: dirPath,
            };
        }
    }
}
exports.RepositoryScanner = RepositoryScanner;
