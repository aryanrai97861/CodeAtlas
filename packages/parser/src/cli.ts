#!/usr/bin/env node

import { RepositoryScanner } from './scanner.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const targetDir = args[1] || process.cwd();

  if (command === 'scan') {
    console.log(`Scanning repository at ${targetDir}...`);
    const scanner = new RepositoryScanner(targetDir);
    
    try {
      const metadata = await scanner.scan();
      const outputPath = path.join(process.cwd(), 'repository.json');
      fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
      console.log(`Scan complete. Metadata written to ${outputPath}`);
    } catch (error) {
      console.error('Scan failed:', error);
      process.exit(1);
    }
  } else if (command === 'parse') {
    console.log(`Parsing repository at ${targetDir}...`);
    const { ASTParser } = await import('./ast/parser.js');
    const parser = new ASTParser(targetDir);
    
    try {
      const parsedFiles = parser.parse();
      const outputPath = path.join(process.cwd(), 'analysis.json');
      fs.writeFileSync(outputPath, JSON.stringify(parsedFiles, null, 2));
      console.log(`Parse complete. AST Data written to ${outputPath}`);
    } catch (error) {
      console.error('Parse failed:', error);
      process.exit(1);
    }
  } else {
    console.log(`
Usage: code-atlas <command> [path]

Commands:
  scan [path]    Scan repository and generate repository.json
  parse [path]   Parse repository and generate analysis.json
    `);
  }
}

main();
