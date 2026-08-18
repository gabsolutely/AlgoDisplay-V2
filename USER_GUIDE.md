# AlgoDisplay V2 — User Guide & Reference Manual

## Overview
AlgoDisplay is an interactive web platform for writing, debugging, testing, and visualizing algorithms in real time. It features a dual-language execution engine (native JavaScript and WebAssembly Python via Pyodide), real-time complexity monitoring, step-by-step time travel undo/redo, and interactive Web Audio sonification across four visualization modes:

1. **Sorting Visualizer:** Array bars with comparison/swap animations and head-to-head dual race comparison.
2. **Search Visualizer:** Linear, Binary, Interpolation, Exponential, and Ternary search algorithms with target highlights.
3. **Graph & Tree Visualizer:** Interactive SVG network diagrams with draggable nodes, click-to-set Start (S) and Target (T) nodes, distance indicators, and path highlighting.
4. **Grid Pathfinding & Maze Visualizer:** Interactive 2D canvas with wall placement, weighted terrain multipliers (Grass, Sand, Mud), and instant optimal path reconstruction.

---

## Getting Started

### 1. Basic Workflow
1. Open `index.html` in any modern web browser.
2. Choose your **Category** (Sorting, Searching, Graph Algorithms, or Grid / Maze Mode).
3. Select your programming **Language** (JavaScript or Python).
4. Choose an algorithm template from the dropdown, or write your own custom code in the code editor.
5. Click **Generate** (or "New Graph" / "New Grid") to initialize the data structure.
6. Click **Run** to execute and visualize the algorithm step by step.

### 2. Main Toolbar Controls

#### Code & Data Card
- **Category:** Switch between Sorting, Searching, Graph, and Grid visualization modes.
- **Language:** Switch between JavaScript (native execution) and Python (Pyodide WebAssembly).
- **Algorithm:** Select an algorithm preset (loads starter code and pseudocode).
- **Preset:** Choose initial data conditions (Random, Nearly Sorted, Reversed, Few Unique, All Same, Custom Array, Binary Tree, Directed DAG, Negative Weights).
- **Size / Nodes / Grid:** Adjust element count (array size 5-50, graph nodes 4-18, grid dimensions 10x18 to 20x35).
- **Target:** Numeric search target input for search algorithms.
- **Pre-Sort:** Toggle whether the array is automatically sorted before executing search algorithms.
- **Directed:** Toggle directed vs undirected edge arrows for graph algorithms.

#### Sound Studio Card
- **Sound Toggle:** Master switch for sound effects.
- **Musical Toggle:** Enables scale-based musical chords mapped to element values, node IDs, and grid cells.
- **Producer Kit:** Select synthesizer presets (Default, 8-Bit Chiptune, Lo-Fi, Marimba, Synthwave, Sci-Fi, Organ).
- **Synth Waveform:** Select oscillator waveform (Triangle, Sine, Square, Sawtooth, Organ, Marimba, FM Laser).
- **Scale:** Select musical scale (Pentatonic, Major, Minor, Blues, Dorian, Harmonic Minor, InSen, Chromatic).
- **Pitch:** Octave multiplier (Bass / Low, Mid / Normal, Lead / High, Chimes / Ultra).
- **Volume & Beat:** Adjust output gain or audition the current synthesizer voice.

#### Mode & View Card
- **Race Mode:** Runs two algorithms side-by-side on identical input arrays to compare speed and operations.
- **Vs Dropdown:** Select the side-B opponent algorithm for Race Mode.
- **Light Theme:** Toggles between sleek dark mode and high-contrast light mode.
- **Colorblind:** Enables high-contrast accessible color palette.
- **Share Button:** Copies a shareable URL containing the current category, algorithm, speed, and custom code editor contents.
- **Cx Button:** Toggles the floating Complexity Monitor chart overlay.
- **Help (?) Button:** Opens the interactive reference panel.

#### Playback Controls
- **Run:** Begins algorithm execution.
- **Pause / Resume:** Temporarily halts or resumes live execution without resetting state.
- **Step Mode / Next Step:** Advances execution by exactly one operation.
- **Step Back (Undo):** Reverts to the previous snapshot state.
- **Step Forward (Redo):** Advances to the next captured redo state.
- **Clear:** Resets the dataset, canvas, and execution statistics.
- **Speed Slider:** Adjusts animation delay from 50ms (fast) to 1000ms (slow).

---

## Grid Mode & Terrain Values Guide

The Grid Pathfinding visualizer uses a canvas matrix with interactive obstacles and weighted terrain cells:

### Grid Cell Types & Multipliers

| Indicator | Appearance | Movement Cost Multiplier | Description |
| :--- | :--- | :--- | :--- |
| **`S`** | Green Badge | 1x | **Start Cell:** Origin point for pathfinding. Click and drag to move. |
| **`T`** | Red Badge | 1x | **Target Cell:** Goal destination. Click and drag to move. |
| **Wall** | Slate Navy | Impassable | **Obstacle:** Cannot be traversed by any pathfinding algorithm. |
| **Grass** | Green Tint (`*2`) | 2x | **Light Terrain:** Moderate movement cost penalty. |
| **Sand** | Yellow Tint (`*4`) | 4x | **Medium Terrain:** Significant movement cost penalty. |
| **Mud** | Amber/Brown Tint (`*8`) | 8x | **Heavy Terrain:** Severe movement cost penalty. |
| **Visiting** | Amber Glow | - | **Wavefront:** Active exploration boundary. |
| **Visited** | Cyan Overlay | - | **Visited:** Explored cell closed set. |
| **Path** | Green Glow | - | **Final Path:** Optimal path reconstructed from Target to Start. |

### How Algorithms Interact with Terrain
- **Unweighted Algorithms (BFS / DFS):** Treat all open cells as equal cost (1). BFS will always find the path with the fewest cells, ignoring mud and sand.
- **Weighted Algorithms (Dijkstra / A*):** Calculate cumulative movement cost using cell multipliers. They will intelligently route around high-cost Mud (`*8`) and Sand (`*4`) if a cheaper detour through Grass (`*2`) or clear terrain is available.

### Grid Interactions
- **Draw Walls:** Click and drag over empty cells to paint walls.
- **Erase Walls:** Click and drag over wall cells to erase them.
- **Move Endpoints:** Click and drag the `S` or `T` badge to relocate start and target coordinates.
- **Maze Generator:** Click the "Maze" button to generate a randomized recursive backtracking maze.
- **Clear Walls:** Click "Clear Walls" to remove all obstacles while preserving terrain patches.

---

## Graph Mode & Controls

The Graph Visualizer renders general node-edge graphs and trees with SVG graphics and interactive physics:

### Graph Interactions
- **Move Nodes:** Click and drag any node circle freely across the canvas to rearrange the layout. Nodes stay smoothly in place upon release.
- **Set Start Node (S):** Left-click any node. The node is marked with a green border, green glow, and an `S` indicator badge.
- **Set Target Node (T):** Right-click (or Shift + Left-Click) any node. The node is marked with a red border, red glow, and a `T` indicator badge.
- **Automatic Swapping:** If you select the current Target node as the new Start node, the endpoints swap roles automatically.
- **Distance Badges:** Dijkstra and Bellman-Ford algorithms display numeric distance badges on the top-right corner of visited nodes.
- **Path Glow:** Reconstructed paths light up both nodes and connecting edges in glowing emerald green.

### Graph Presets
- **Random Graph:** Generates an organic topology using force-directed layout separation and a guaranteed spanning tree.
- **Binary Tree:** Generates a structured binary tree where the Target node is placed on an organic leaf node.
- **Directed DAG:** Generates an acyclic directed graph with directional arrowhead markers.
- **Negative Weights:** Generates graphs with mixed positive and negative weights for testing Bellman-Ford.

---

## Writing Custom Algorithms

### 1. JavaScript API Reference

Your JavaScript algorithm code executes directly inside an async runner. Use `await` before all visualization functions:

#### Array Operations (Sort / Search)
```javascript
await compare(i, j);        // Highlights and compares elements at index i and j
await swap(arr, i, j);      // Animates visual swap of elements at index i and j
await renderArray(arr);     // Redraws the array bars
await markFound(index);     // Highlights matching target element in search mode
await sleep(ms);            // Custom delay (respects speed slider and pause button)
log("message");             // Appends message to the execution console
```

#### Graph Operations
```javascript
const nodes = getNodes();                   // Returns array of all { id, label, x, y, status }
const startNode = getStartNode();           // Returns designated start node object (S)
const targetNode = getTargetNode();         // Returns designated target node object (T)
const neighbors = getNeighbors(nodeId);     // Returns [{ id, weight }, ...] for outgoing edges

await visitNode(nodeId, "visiting");        // Highlights node (visiting: amber | visited: purple | path: green)
await visitEdge(fromId, toId, "exploring"); // Highlights edge traversal
await updateDistance(nodeId, distance);     // Displays numeric distance badge on node
await markPath([nodeA, nodeB, ...]);        // Highlights complete path (nodes and connecting edges)
```

#### Grid Operations
```javascript
const start = getStartCell();               // Returns { row, col }
const target = getTargetCell();             // Returns { row, col }
const neighbors = getGridNeighbors(r, c);   // Returns walkable neighbors with .weight and .terrain

await visitGridCell(r, c, "visiting");      // Highlights cell during exploration wavefront (amber)
await visitGridCell(r, c, "path");          // Instantly paints cell on final path (green)
```

---

### 2. Python API Reference (Pyodide WebAssembly)

Python algorithms run via the Pyodide WebAssembly runtime for Sorting and Searching:

#### Python Function Signatures
```python
# Required signature for sorting algorithms:
async def sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            await compare(j, j + 1)
            if arr[j] > arr[j + 1]:
                await swap(arr, j, j + 1)

# Required signature for searching algorithms:
async def search(arr, target):
    for i in range(len(arr)):
        await compare(i, i)
        if arr[i] == target:
            await mark_found(i)
            return i
    return -1
```

#### Python Visualization Functions
- `await compare(i, j)`: Highlights and compares indices `i` and `j`.
- `await swap(arr, i, j)`: Animates swap between indices `i` and `j`.
- `await render_array(arr)`: Redraws the array bars.
- `await mark_found(index)`: Highlights target element.
- `await sleep(ms)`: Pauses execution.
- `log("message")`: Outputs message to console log.

---

## Live Complexity Monitor

Click the **Cx** button in the Mode & View toolbar to open the live Complexity Monitor overlay:

- **Theoretical Curve:** Plots the expected mathematical curve based on input size ($n$, $V+E$, or grid cells).
- **Actual Measured Curve:** Continuously plots the real cumulative operation count (comparisons + swaps for sort/search, visited nodes/cells for graph/grid) as the algorithm runs.
- **Race Comparison:** When Race Mode is active, both Side A (blue) and Side B (purple) curves are plotted concurrently with operation differential readouts.
- **Draggable Window:** Drag the title bar of the Complexity Monitor to position the chart anywhere on screen.

---

## Step-by-Step Snapshot Time Travel

AlgoDisplay V2 captures up to 500 deep visual snapshots of the entire application state during live execution:

- **Step Back (Undo):** Reverts the visualizer, statistics, array, graph/grid, and pseudocode line highlight to the exact state before the previous operation.
- **Step Forward (Redo):** Re-advances through the captured history stack.
- **Navigation Controls:** Step Back and Step Forward buttons appear automatically in the playback toolbar when history is available.

---

## Keyboard Shortcuts Summary

| Shortcut | Action |
| :--- | :--- |
| `Ctrl / Cmd + Enter` | Run currently active algorithm |
| `Ctrl / Cmd + R` | Generate new dataset (Array, Graph, Grid) |
| `Ctrl / Cmd + L` | Clear canvas and reset statistics |
| `Spacebar` | Pause or Resume live visualization |
