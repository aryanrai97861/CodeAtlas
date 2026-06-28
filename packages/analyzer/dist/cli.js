#!/usr/bin/env node
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
const resolver_js_1 = require("./resolver.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const targetPath = args[1] || process.cwd();
    if (command === 'analyze') {
        const analysisPath = path.join(process.cwd(), 'analysis.json');
        if (!fs.existsSync(analysisPath)) {
            console.error(`Could not find analysis.json at ${analysisPath}. Run 'code-atlas parse' first.`);
            process.exit(1);
        }
        console.log(`Analyzing AST data from ${analysisPath}...`);
        const parsedFiles = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
        const resolver = new resolver_js_1.SymbolResolver(parsedFiles, targetPath);
        const graph = resolver.resolve();
        const { ImportGraphGenerator } = await import('./generators/import-graph.js');
        const { CallGraphGenerator } = await import('./generators/call-graph.js');
        const { ComponentGraphGenerator } = await import('./generators/component-graph.js');
        const importGraph = new ImportGraphGenerator(graph).generate();
        const callGraph = new CallGraphGenerator(graph).generate();
        const componentGraph = new ComponentGraphGenerator(graph).generate();
        const { ReactAnalyzer } = await import('./frameworks/react.js');
        const { ExpressAnalyzer } = await import('./frameworks/express.js');
        const reactAnalysis = new ReactAnalyzer(graph).analyze();
        const expressAnalysis = new ExpressAnalyzer(graph).analyze();
        const frameworkAnalysis = {
            react: reactAnalysis,
            express: expressAnalysis
        };
        const importPath = path.join(process.cwd(), 'import-graph.json');
        const callPath = path.join(process.cwd(), 'call-graph.json');
        const componentPath = path.join(process.cwd(), 'component-graph.json');
        const frameworkPath = path.join(process.cwd(), 'framework-analysis.json');
        const outputPath = path.join(process.cwd(), 'graph.json');
        fs.writeFileSync(importPath, JSON.stringify(importGraph, null, 2));
        fs.writeFileSync(callPath, JSON.stringify(callGraph, null, 2));
        fs.writeFileSync(componentPath, JSON.stringify(componentGraph, null, 2));
        fs.writeFileSync(frameworkPath, JSON.stringify(frameworkAnalysis, null, 2));
        fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));
        console.log(`Analysis complete!`);
        console.log(`- Import Graph written to ${importPath}`);
        console.log(`- Call Graph written to ${callPath}`);
        console.log(`- Component Graph written to ${componentPath}`);
        console.log(`- Framework Analysis written to ${frameworkPath}`);
        console.log(`- Updated Graph written to ${outputPath}`);
    }
    else {
        console.log(`
Usage: code-atlas-analyze <command> [path]

Commands:
  analyze [path]    Analyze analysis.json and generate graph.json
    `);
    }
}
main();
