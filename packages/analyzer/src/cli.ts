#!/usr/bin/env node

import { SymbolResolver } from './resolver.js';
import * as fs from 'fs';
import * as path from 'path';

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
    
    const resolver = new SymbolResolver(parsedFiles, targetPath);
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
    
  } else {
    console.log(`
Usage: code-atlas-analyze <command> [path]

Commands:
  analyze [path]    Analyze analysis.json and generate graph.json
    `);
  }
}

main();
