# AlgoDisplay V2 — Product & Technical Spec
### "One platform, every algorithm, real code, no compromises"

---

## 0. Positioning — why this is worth building

Searched the space before writing this. The landscape splits cleanly into two camps:

- **Pathfinding-only visualizers** (grid + walls + Dijkstra/A*/BFS/DFS) — polished, but sorting is either absent or bolted on as a separate page with zero shared code.
- **Sorting-only bar visualizers** — same story in reverse.
- A few "comprehensive" academic projects (USF's Data Structure Visualization, a couple of research-paper prototypes) cover trees, graphs, and sorting together — but they're static demos with no code editor. You can watch, you can't write your own algorithm and test it.

**Nobody combines**: multi-category coverage (sorting + searching + graph + trees + DP) **+** a real dual-language code editor where the user's own implementation drives the animation **+** a shared visualization engine across all of it. That's the gap. AlgoDisplay V1 already has the hardest part (the code-editor-drives-animation architecture) — V2 is about generalizing that engine across categories instead of building five separate tools.

The one-line pitch: **"Bring your own algorithm, watch it run, on anything — arrays, graphs, trees."**

---

## 1. Scope for V2

### 1.1 Algorithm categories (in build order)

**Phase 1 — Sorting completion** (reuses existing bar renderer, cheapest to ship)
- Merge Sort, Quick Sort (pivot strategy selectable: first / last / random / median-of-three), Heap Sort, Shell Sort, Cocktail Shaker Sort, Counting Sort, Radix Sort

**Phase 2 — Searching** (still array/bar based, near-zero new architecture)
- Linear, Binary, Interpolation, Exponential, Ternary

**Phase 3 — Graph algorithms** (new renderer: nodes + edges, new interaction model — the real V2 milestone)
- Traversal: BFS, DFS
- Shortest path: Dijkstra, A*, Bellman-Ford (teaches negative weights / why Dijkstra fails there)
- MST: Prim's, Kruskal's
- Topological Sort
- Grid/maze mode reusing the same engine: click-to-place walls, drag start/end, maze generation (recursive backtracking, Prim's-based maze gen)

**Phase 4 — Trees**
- BST insert / delete / search / traversal (in-order, pre-order, post-order, level-order)
- AVL Tree (rotation visualization — this is usually the most requested "I never understood this until I saw it" feature)
- Heap (binary min/max heap) — sift-up/sift-down animation, doubles as a visual explainer for Heap Sort from Phase 1
- Trie — nice-to-have if time allows, good for a "string algorithms" teaser

**Phase 5 — Stretch (only if the above shipped clean)**
- Dynamic Programming grid visualizer (LCS, Knapsack, edit distance) — a 2D table that fills in cell-by-cell, very different visual language from bars/graphs and a strong differentiator since almost nobody visualizes DP well
- Linked List (insert/delete/reverse) — cheap, but low visual/pedagogical payoff, don't prioritize over DP

**Explicitly cut from V2** (revisit only with real demand/backing):
- Video/GIF export — canvas recording + encoding pipeline is real infra work for a nice-to-have
- LMS integration — implies auth/accounts/backend, a V3-or-never unless a school partnership specifically drives it
- Multi-threading visualization — cool on paper, but no existing product does this well and it risks becoming a time sink with no clear payoff

### 1.2 Convenience & UX features (higher leverage per hour than raw algorithm count)

- **Algorithm racing mode** — two algorithms, same seed/array/graph, side-by-side. This is your best demo moment; almost nobody in the space does this cleanly across categories.
- **Complexity overlay** — live-plot actual comparisons/operations against theoretical Big-O curve as it runs. Turns your existing stat counters into a teaching tool instead of a scoreboard.
- **Preset input types** — nearly-sorted, reversed, few-unique, all-same (for sorting); sparse/dense, negative-weight, disconnected (for graphs). Cheapest way to teach best/worst-case behavior — it's config, not architecture.
- **Undo / step-back** — you're already stepping forward; snapshotting state for backward stepping is a moderate lift with high UX payoff.
- **Shareable run state** — URL param or JSON export of `{algorithm, input, speed, language}`. Lets a teacher link a specific case to a class.
- **Pseudocode-synced highlighting** — show canonical pseudocode alongside the running visualization, highlight the active line as it executes. Very common ask in every review of these tools; ties the user's code back to the "textbook" version.
- **Dark/light theme + colorblind-safe palette toggle** — cheap, matters for an educational tool.

---

## 2. Architecture changes

### 2.1 Core problem with V1's architecture for V2

V1's `AlgorithmVisualizer` assumes one shape of data: an array of numbers, rendered as bars. Graph and tree visualizations need fundamentally different data models and renderers. Rather than bolt these on, V2 should generalize the pipeline:

```
User Input (Code Editor)
      v
Language Parser (JS native / Python via Pyodide)  [unchanged from V1]
      v
Algorithm Engine
      v
Visualization API  <-- becomes data-model-aware (array | graph | tree)
      v
Renderer Registry  <-- picks ArrayRenderer | GraphRenderer | TreeRenderer
      v
Audio + Stats  [unchanged, category-agnostic]
```

### 2.2 New component structure

```
AlgoDisplay/
├── js/
│   ├── core.js                    # Main controller — now category-aware
│   ├── python-runner.js           # Pyodide integration (unchanged)
│   ├── renderers/
│   │   ├── array-renderer.js      # V1's existing bar renderer
│   │   ├── graph-renderer.js      # NEW — node/edge canvas or SVG renderer
│   │   ├── grid-renderer.js       # NEW — maze/grid pathfinding (shares graph engine, different layout)
│   │   ├── tree-renderer.js       # NEW — BST/AVL/Heap renderer (Reingold-Tilford layout for node positioning)
│   │   └── dp-grid-renderer.js    # NEW — Phase 5, 2D table fill visualization
│   ├── engines/
│   │   ├── sort-engine.js         # extends V1 sort logic with new algorithms
│   │   ├── search-engine.js       # NEW
│   │   ├── graph-engine.js        # NEW — adjacency list/matrix model, edge weights
│   │   └── tree-engine.js         # NEW — node class, rotation logic for AVL
│   ├── visualization-api.js       # NEW — unified API surface (see below)
│   ├── racing-mode.js             # NEW — dual-engine synchronized runner
│   ├── complexity-overlay.js      # NEW — theoretical vs actual curve plotting
│   ├── init.js
│   └── sound-manager.js           # unchanged
├── index.html
├── style.css
├── README.md
└── USER_GUIDE.md
```

### 2.3 Unified Visualization API (what the user's code calls)

Keep the existing array functions unchanged (backward compatible with V1 templates), add category-specific primitives:

**Array (existing, unchanged):**
- `await compare(i, j)`, `await swap(arr, i, j)`, `await renderArray(arr)`, `await sleep(ms)`, `log(message)`

**Graph (new):**
- `await visitNode(nodeId)` — mark node as visited/exploring
- `await visitEdge(fromId, toId)` — highlight edge being traversed
- `await markPath(nodeIds[])` — highlight final path (pathfinding results)
- `await updateDistance(nodeId, value)` — for Dijkstra/A* distance labels
- `getNeighbors(nodeId)`, `getEdgeWeight(fromId, toId)` — read-only graph accessors

**Tree (new):**
- `await visitTreeNode(nodeId)`, `await insertNode(value, parentId)`, `await rotateLeft(nodeId)` / `await rotateRight(nodeId)` — AVL rotation animation
- `await highlightPath(rootToNodeIds[])`

**Shared across all:**
- `log(message)`, `sleep(ms)` unchanged
- All functions remain async/await — non-negotiable, this is what makes V1's step-through model work at all

### 2.4 Algorithm template format stays consistent

Same pattern as V1 — user writes `async function sort(arr)` or `async def sort(arr):`. New categories follow suit: `async function findPath(graph, start, end)`, `async function traverse(tree)`. Consistency here matters more than cleverness — someone who learned the sort template shouldn't have to relearn the mental model for graphs.

---

## 3. Data input models (new — V1 only had "array of numbers")

| Category | Input method |
|---|---|
| Sorting/Search | Existing: random array generator + presets (nearly-sorted, reversed, few-unique) |
| Graph (general) | Click-to-place nodes, drag-to-connect edges, weight input on edge click; random graph generator with density slider |
| Graph (pathfinding/grid) | Click-and-drag walls on a grid, drag start/end nodes, maze generator button (reuse DFS backtracking or Prim's-based gen — nice bit of dogfooding, the maze generator *is* one of your visualized algorithms) |
| Trees | Sequential insert via input field, or "insert random N values" button, click node to delete |
| DP (stretch) | Preset problem selector (LCS strings, knapsack items+weights, edit-distance word pair) with editable inputs |

---

## 4. Rendering approach notes

- **Graph renderer**: SVG for the general graph mode (need directed/weighted edges, arbitrary layout, is manipulable via CSS for state colors). Canvas for the grid/pathfinding mode (large grids of many cells render faster on canvas than as hundreds of SVG rects).
- **Tree renderer**: Reingold-Tilford algorithm for automatic node positioning — this is the standard approach every serious tree visualizer uses (confirmed via the USF visualizer and academic sources above) and avoids manual layout math.
- **Keep V1's color-coding language consistent across renderers** — if "yellow = currently comparing" in bars, use the equivalent semantic color for "currently exploring" in graphs. Cross-category visual consistency reinforces the mental model instead of making each category feel like a different app.

---

## 5. Suggested build order (sequencing, not a timeline commitment)

1. Sorting completion (Phase 1) — validates nothing is broken, reuses 100% of existing renderer
2. Searching (Phase 2) — same renderer, cheap
3. Preset input types + shareable run state — cheap UX wins, do these before graph work while momentum is on easy features
4. Graph engine + renderer + BFS/DFS/Dijkstra (Phase 3 core) — the real architecture lift
5. Grid/maze mode reusing graph engine
6. A*, Bellman-Ford, MST algorithms (Phase 3 remainder)
7. Racing mode + complexity overlay — now genuinely showable across sort AND graph categories
8. Trees (Phase 4)
9. DP grid visualizer (Phase 5) — only if everything above is solid

---

## 6. Open questions worth deciding before Phase 3 starts

- Directed vs undirected graphs — support both, or undirected-only for V2 and directed as V3? (Topological Sort needs directed, so this forces the decision earlier than it looks.)
- Should grid/pathfinding mode share the *exact* same engine as general graph mode, or a lighter-weight parallel implementation? Sharing is more elegant but couples two things with different performance needs (grid = potentially thousands of nodes, general graph = dozens).
- Pyodide performance on graph algorithms with larger node counts — worth a quick spike test before committing to "Python support for everything" as a blanket promise.
