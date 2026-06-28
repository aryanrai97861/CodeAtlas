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
const scanner_js_1 = require("./scanner.js");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const targetDir = args[1] || process.cwd();
    if (command === 'scan') {
        console.log(`Scanning repository at ${targetDir}...`);
        const scanner = new scanner_js_1.RepositoryScanner(targetDir);
        try {
            const metadata = await scanner.scan();
            const outputPath = path.join(process.cwd(), 'repository.json');
            fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
            console.log(`Scan complete. Metadata written to ${outputPath}`);
        }
        catch (error) {
            console.error('Scan failed:', error);
            process.exit(1);
        }
    }
    else if (command === 'parse') {
        console.log(`Parsing repository at ${targetDir}...`);
        const { ASTParser } = await import('./ast/parser.js');
        const parser = new ASTParser(targetDir);
        try {
            const parsedFiles = parser.parse();
            const outputPath = path.join(process.cwd(), 'analysis.json');
            fs.writeFileSync(outputPath, JSON.stringify(parsedFiles, null, 2));
            console.log(`Parse complete. AST Data written to ${outputPath}`);
        }
        catch (error) {
            console.error('Parse failed:', error);
            process.exit(1);
        }
    }
    else {
        console.log(`
Usage: code-atlas <command> [path]

Commands:
  scan [path]    Scan repository and generate repository.json
  parse [path]   Parse repository and generate analysis.json
    `);
    }
}
main();
