# Code Atlas 🗺️

**Code Atlas** is a deterministic static code analysis engine and visualizer designed to drastically reduce developer onboarding time. It builds a complete semantic understanding of large codebases by parsing ASTs, resolving symbols, detecting web framework idioms (React, Express), and rendering fully interactive architecture graphs—**all without relying on an LLM for its core engine**.

---

## 🌟 Key Features

- **Deterministic Static Analysis**: Operates like an IDE language server or compiler, guaranteeing 100% accurate symbol linkages.
- **Multi-Graph Generation**:
  - **Import Graph**: Visualizes file-to-file architecture and module dependencies.
  - **Call Graph**: Displays function-to-function logic flows and call hierarchies.
  - **Component Graph**: Models the React UI layer and component render trees.
- **Framework Analysis Engine**:
  - Automatically identifies React components (functions returning JSX) and custom hooks (`use*`).
  - Automatically flags Express middleware and controllers matching `(req, res, next)` schemas.
- **High-Performance Express Backend**: Loads massive parsed JSON graph datasets into memory and serves them via lightning-fast REST APIs to eliminate browser DOM bottlenecks.
- **Premium White & Accent-Pink Visualizer**: A beautiful, state-of-the-art Single Page Application (SPA) built with Vite, React Flow, Zustand, and Tailwind CSS, featuring glassmorphic panels, dynamic badges, live search, and micro-animations.

---

## 🏗️ Monorepo Architecture

The project is structured as a `pnpm` monorepo containing highly modular packages:

```
code-atlas/
├── packages/
│   ├── parser/      # File discovery, AST parsing with ts-morph, and repository scanner
│   ├── analyzer/    # Symbol resolution, graph generation, and React/Express framework tagging
│   ├── backend/     # Express API server serving graph data and node searching
│   └── web/         # Vite + React Flow frontend visualizer (White & Accent Pink theme)
├── shared/
│   ├── types/       # Shared TypeScript definitions (Nodes, Edges, Graphs, Metadata)
│   └── utils/       # Shared utilities
└── package.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies & Build
Ensure you have `pnpm` installed, then run:
```bash
pnpm install
pnpm build
```

### 2. Scan & Parse Your Target Repository
Use the `code-atlas` CLI to parse any TypeScript/JavaScript project:
```bash
# 1. Scan repository structure
node packages/parser/dist/cli.js scan /path/to/your/project

# 2. Parse ASTs into analysis.json
node packages/parser/dist/cli.js parse /path/to/your/project

# 3. Analyze symbols, generate graphs, and perform framework tagging
node packages/analyzer/dist/cli.js analyze /path/to/your/project
```

### 3. Start the API Backend & Visualizer
```bash
# Start the Express backend server (http://localhost:3000)
node packages/parser/dist/cli.js serve

# Start the Vite React visualizer frontend (http://localhost:5173)
pnpm --filter @code-atlas/web dev
```
Open `http://localhost:5173` in your browser to explore your codebase in a gorgeous white & accent-pink UI!
