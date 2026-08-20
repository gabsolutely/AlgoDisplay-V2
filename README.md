# AlgoStudio — Interactive Algorithm Visualizer & Studio

A modern, high-performance, fully browser-based algorithm visualizer and audio laboratory. Zero installation, zero external servers, zero build steps. Write custom JavaScript or Python algorithms and watch them animate live across 4 distinct visualization modes with real-time complexity monitoring, step-back undo/redo, and interactive Web Audio synthesis.

---

## Key Highlights

- 4 Core Visualization Modes: Sorting (10 algorithms), Searching (5 algorithms), Graph & Tree Traversal (8 algorithms), and Grid Pathfinding (4 algorithms).
- Dual-Language Engine: Native JavaScript async runtime + WebAssembly Python (Pyodide) runtime.
- Interactive Graph Studio: Force-directed organic graph generation, tree generator, free node dragging, and click-to-set Start (S) & Target (T) endpoints.
- Grid Terrain & Weight System: Interactive canvas maze with walls and weighted terrain cells (Grass *2, Sand *4, Mud *8).
- Web Audio Synthesizer: Sonify operations with 8 musical scales (Pentatonic, Dorian, Harmonic Minor, etc.) and 7 producer synthesizer kits (Marimba, Organ, FM Laser, etc.).
- Live Complexity Monitor: Real-time chart comparing theoretical Big-O curves (O(1), O(log n), O(n log n), O(n^2), O(V+E)) against actual measured operations.
- Step-by-Step Time Travel: 500-level snapshot undo/redo system to step backwards and forwards through any algorithm execution.
- Shareable URLs: Encode algorithm configuration, presets, and custom written code into shareable links.

---

## Visualization Categories & Algorithms

### 1. Sorting Algorithms
- Bubble Sort — O(n^2)
- Selection Sort — O(n^2)
- Insertion Sort — O(n^2)
- Merge Sort — O(n log n)
- Quick Sort — O(n log n) avg, O(n^2) worst
- Heap Sort — O(n log n)
- Shell Sort — O(n^1.3)
- Cocktail Shaker Sort — O(n^2)
- Counting Sort — O(n+k)
- Radix Sort (LSD) — O(nk)
- Features: Dual Race Mode side-by-side head-to-head comparison, customizable array sizes, pre-sorted and nearly-sorted generator presets.

### 2. Searching Algorithms
- Linear Search — O(n)
- Binary Search — O(log n) (auto-sorts array before search)
- Interpolation Search — O(log log n) avg, O(n) worst
- Exponential Search — O(log n)
- Ternary Search — O(log n)
- Features: Target value input selector, search found animations, automatic pre-sorting toggle.

### 3. Graph & Tree Algorithms
- BFS (Breadth-First Search) — O(V + E)
- DFS (Depth-First Search) — O(V + E)
- Dijkstra's Algorithm — O(E log V) (finds shortest weighted path)
- A* Search Algorithm — O(E) (Euclidean heuristic)
- Bellman-Ford Algorithm — O(V * E) (supports general weighted graphs)
- Prim's Algorithm — O(E log V) (Minimum Spanning Tree)
- Kruskal's Algorithm — O(E log E) (Minimum Spanning Tree)
- Topological Sort — O(V + E) (Kahn's Algorithm for DAGs)

### 4. Grid Pathfinding & Mazes
- Grid BFS — Unweighted shortest path
- Grid DFS — Unweighted deep exploration
- Grid Dijkstra — Terrain-cost weighted shortest path
- Grid A* Search — Manhattan distance guided heuristic shortest path

---

## What Do The Values & Glyphs on the Grid Mean?

The grid canvas uses color coding, labels, and numeric multipliers:

| Glyph / Label | Color / Style | Meaning & Effect |
| :--- | :--- | :--- |
| **S** | Green Badge | **Start Cell** — Origin of pathfinding algorithms. Drag or click to reposition. |
| **T** | Red Badge | **Target Cell** — Goal destination. Drag or click to reposition. |
| **Dark Cell** | Slate Navy (#1e293b) | **Wall / Obstacle** — Impassable cell. Algorithms cannot travel through walls. |
| **`*2` (Grass)** | Green Tint | **Grass Terrain (Weight 2)** — Takes 2x movement cost to traverse. |
| **`*4` (Sand)** | Yellow Tint | **Sand Terrain (Weight 4)** — Takes 4x movement cost to traverse. |
| **`*8` (Mud)** | Amber/Brown Tint | **Mud Terrain (Weight 8)** — Heavy movement penalty (8x cost). |
| **Amber Glow** | Golden Yellow (#f59e0b) | **Visiting Cell** — Currently active exploration wavefront. |
| **Cyan Overlay** | Cyan (#06b6d4) | **Visited Cell** — Previously inspected cell. |
| **Green Glow** | Emerald Green (#10b981) | **Final Path** — Optimal path reconstructed from Target to Start. |

> **Why Terrain Weights Matter:**
> Unweighted algorithms (like BFS) treat all open cells as equal cost (1) and find the path with the fewest cells. Weighted algorithms (like Dijkstra and A*) calculate total movement cost, smartly routing around high-penalty mud (*8) and sand (*4) cells when a cheaper grass or clear detour is available.

---

## Graph Controls & Selection

- **Move Nodes:** Click and drag any node circle freely across the SVG canvas.
- **Set Start Node (S):** Left-click any node. The node is outlined in emerald green with an S badge.
- **Set Target Node (T):** Right-click (or Shift + Left-Click) any node. The node is outlined in rose red with a T badge.
- **Start/Target Swap:** Clicking the current Target node as the new Start node automatically swaps their positions.
- **Organic Generation:** The "New Graph" generator uses a force-directed layout with repulsion separation and a guaranteed spanning tree so nodes are well-spaced and organic.
- **Tree Generator:** Generates clean hierarchical trees with the Target node placed on an organic leaf node.
- **Path Glow:** Reconstructed paths light up both nodes and connecting edges in glowing emerald green.

---

## Sound Studio & Musical Sonification

AlgoStudio features a Web Audio synthesizer that generates audio directly from mathematical frequencies:

- **Musical Mode:** Instead of plain blips, operations trigger chords and scale notes mapped to element magnitudes or node/cell coordinates.
- **8 Musical Scales:**
  1. `Pentatonic` (default melodic scale)
  2. `Major`
  3. `Minor`
  4. `Blues`
  5. `Dorian`
  6. `Harmonic Minor`
  7. `Insen` (Traditional Japanese scale)
  8. `Chromatic`
- **7 Producer Kits & Waveforms:**
  - `Default` (Triangle wave)
  - `Chiptune` (8-bit Square wave)
  - `Lo-Fi` (Smooth Sine wave)
  - `Marimba` (Fast-decay percussive acoustic simulation)
  - `Synthwave` (Sawtooth wave with rich harmonics)
  - `Sci-Fi` (2-oscillator Frequency Modulation laser synth)
  - `Organ` (3-harmonic stacked sine organ)

---

## Visualization API Reference

When writing custom algorithms in the code editor, the following functions are injected into the runtime environment:

### Common & Array Operations (Sort / Search)
```javascript
await compare(i, j);        // Highlights indices i and j, plays comparison audio
await swap(arr, i, j);      // Animates visual swap between indices i and j
await renderArray(arr);     // Redraws the array
await markFound(i);         // Highlights matching target element
await sleep(ms);            // Pauses execution (respects speed slider and pause button)
log(message);               // Prints message to the operation console
```

### Graph Operations
```javascript
const nodes = getNodes();                   // Returns array of all { id, label, x, y }
const startNode = getStartNode();           // Returns designated start node
const targetNode = getTargetNode();         // Returns designated target node
const neighbors = getNeighbors(nodeId);     // Returns [{ id, weight }, ...]
await visitNode(nodeId, "visiting");        // Highlights node (visiting | visited | path)
await visitEdge(fromId, toId, "exploring"); // Highlights edge
await markPath([nodeA, nodeB, ...]);        // Highlights complete path (nodes + edges)
await updateDistance(nodeId, distance);     // Displays distance badge on node
```

### Grid Operations
```javascript
const start = getStartCell();               // Returns { row, col }
const target = getTargetCell();             // Returns { row, col }
const neighbors = getGridNeighbors(r, c);   // Returns walkable neighbors with .weight
await visitGridCell(r, c, "visiting");      // Highlights cell (visiting | visited)
await visitGridCell(r, c, "path");          // Instantly paints cell on final path
```

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl / Cmd + Enter` | Run currently active algorithm |
| `Ctrl / Cmd + R` | Generate new dataset (Array / Graph / Grid) |
| `Ctrl / Cmd + L` | Clear canvas and reset statistics |
| `Space` | Pause / Resume live visualization |

---

## Getting Started

Simply open `index.html` in any modern web browser. No web server is required for JavaScript mode. For Python execution, an active internet connection is used to load the Pyodide WebAssembly package.

```bash
# Optional local development server
npx serve .
# Or with Python
python -m http.server 8000
```

---

## License

AlgoStudio is licensed under the **PolyForm Noncommercial License 1.0.0**.

You may use, study, modify, and build upon this project for permitted noncommercial purposes, subject to the terms of the license.

**Commercial use is not permitted under this license.**

See the [`LICENSE`](./LICENSE) file for the complete license terms.

**Copyright © 2026 gabsolutely.**
