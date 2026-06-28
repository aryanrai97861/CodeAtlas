"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressAnalyzer = void 0;
class ExpressAnalyzer {
    graph;
    constructor(graph) {
        this.graph = graph;
    }
    analyze() {
        const expressMetadata = {};
        for (const node of Object.values(this.graph.nodes)) {
            if (node.type === 'function') {
                const tags = new Set();
                const params = node.metadata?.parameters || [];
                // Detect Middleware (req, res, next)
                const paramNames = params.map((p) => p.name.toLowerCase());
                if (paramNames.includes('req') || paramNames.includes('request')) {
                    if (paramNames.includes('res') || paramNames.includes('response')) {
                        if (paramNames.includes('next')) {
                            tags.add('express_middleware');
                        }
                        else {
                            tags.add('express_controller');
                        }
                    }
                }
                if (tags.size > 0) {
                    expressMetadata[node.id] = { tags: Array.from(tags) };
                    // Append to original node as well
                    node.metadata = { ...node.metadata, framework: { ...node.metadata?.framework, express: Array.from(tags) } };
                }
            }
        }
        return expressMetadata;
    }
}
exports.ExpressAnalyzer = ExpressAnalyzer;
