"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactAnalyzer = void 0;
class ReactAnalyzer {
    graph;
    constructor(graph) {
        this.graph = graph;
    }
    analyze() {
        const reactMetadata = {};
        for (const node of Object.values(this.graph.nodes)) {
            if (node.type === 'function') {
                const tags = new Set();
                // Detect Hooks
                if (node.name.startsWith('use') && node.name[3] === node.name[3]?.toUpperCase()) {
                    tags.add('react_hook');
                }
                // Detect Components
                const jsx = node.metadata?.jsxElements || [];
                if (jsx.length > 0) {
                    tags.add('react_component');
                }
                // Detect Providers
                if (jsx.some((tag) => tag.endsWith('.Provider'))) {
                    tags.add('react_provider');
                }
                if (tags.size > 0) {
                    reactMetadata[node.id] = { tags: Array.from(tags) };
                    // Append to original node as well
                    node.metadata = { ...node.metadata, framework: { ...node.metadata?.framework, react: Array.from(tags) } };
                }
            }
        }
        return reactMetadata;
    }
}
exports.ReactAnalyzer = ReactAnalyzer;
