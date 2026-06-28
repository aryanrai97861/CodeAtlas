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

    const outputPath = path.join(process.cwd(), 'graph.json');
    fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));
    console.log(`Analysis complete. Graph written to ${outputPath}`);
    
  } else {
    console.log(`
Usage: code-atlas-analyze <command> [path]

Commands:
  analyze [path]    Analyze analysis.json and generate graph.json
    `);
  }
}

main();
