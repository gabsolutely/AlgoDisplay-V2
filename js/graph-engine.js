/**
 * graph-engine.js — Pure data / logic layer for graphs and grids.
 *
 * This class owns NO DOM. It only manages:
 *   - General graphs: `nodes[]` + `edges[]` + neighbor / weight queries
 *   - Grids/mazes: `grid[r][c]` cells + maze generation
 *
 * Rendering is handled separately by GraphRenderer / GridRenderer.
 * The visualizer calls createVisualizationAPI which in turn reads from here.
 */

class GraphEngine {
  constructor() {
    // --- General graph state ---
    this.nodes = [];       // { id, label, x, y, status, distance, parent }
    this.edges = [];       // { id, source, target, weight, status, directed }
    this.isDirected = false;
    this.startNodeId = 0;
    this.targetNodeId = 4;

    // --- Grid / maze state ---
    this.gridRows = 15;
    this.gridCols = 25;
    this.grid = [];                   // 2D array of cell objects
    this.startCell = { row: 7, col: 4 };
    this.targetCell = { row: 7, col: 20 };
    // Terrain weights for meaningful Dijkstra / A* demonstration
    this.terrainWeights = {
      empty: 1,
      grass: 2,
      sand:  4,
      mud:   8
    };
  }

  // ================================================================
  //  GENERAL GRAPH METHODS
  // ================================================================

  /** Drop all nodes/edges (called before generating a new preset). */
  clearGraph() {
    this.nodes = [];
    this.edges = [];
  }

  /**
   * Toggle directed mode and retroactively update all existing edges.
   * @param {boolean} directed
   */
  setDirected(directed) {
    this.isDirected = directed;
    this.edges.forEach(e => e.directed = directed);
  }

  /**
   * Append a new node at the given canvas coordinates.
   * @returns {object} the created node.
   */
  addNode(x, y, label = null) {
    const id = this.nodes.length;
    const node = {
      id: id,
      label: label !== null ? label : `${id}`,
      x: x,
      y: y,
      status: "default",   // default | visiting | visited | path | start | target
      distance: Infinity,
      parent: null
    };
    this.nodes.push(node);
    return node;
  }

  /**
   * Deduplicated edge insertion — bidirectional lookup for undirected graphs.
   * @returns {object} the (possibly pre-existing) edge.
   */
  addEdge(source, target, weight = 1) {
    const existing = this.edges.find(e =>
      (e.source === source && e.target === target) ||
      (!this.isDirected && e.source === target && e.target === source)
    );
    if (existing) return existing;

    const edge = {
      id: `e_${source}_${target}`,
      source: source,
      target: target,
      weight: weight,
      status: "default",   // default | exploring | path | mst
      directed: this.isDirected
    };
    this.edges.push(edge);
    return edge;
  }

  /**
   * Return outgoing neighbors of a node.
   * Each neighbor carries BOTH `id` (primary) and `nodeId` (alias) for
   * compatibility with user code that uses either field.
   *
   * @returns {{ id:number, nodeId:number, weight:number, edge:object }[]}
   */
  getNeighbors(nodeId) {
    const neighbors = [];
    this.edges.forEach(e => {
      if (e.source === nodeId) {
        neighbors.push({ id: e.target, nodeId: e.target, weight: e.weight, edge: e });
      } else if (!this.isDirected && e.target === nodeId) {
        neighbors.push({ id: e.source, nodeId: e.source, weight: e.weight, edge: e });
      }
    });
    return neighbors;
  }

  /** Edge weight lookup (bidirectional for undirected, Infinity if absent). */
  getWeight(u, v) {
    const edge = this.edges.find(e =>
      (e.source === u && e.target === v) ||
      (!this.isDirected && e.source === v && e.target === u)
    );
    return edge ? edge.weight : Infinity;
  }

  /**
   * Reset algorithm-accumulated state on every node & edge
   * (status colors, distances, parents) WITHOUT dropping topology.
   */
  resetGraphState() {
    this.nodes.forEach(n => {
      n.status = (n.id === this.startNodeId) ? "start" : (n.id === this.targetNodeId ? "target" : "default");
      n.distance = (n.id === this.startNodeId) ? 0 : Infinity;
      n.parent = null;
    });
    this.edges.forEach(e => e.status = "default");
  }

  // ================================================================
  //  GRAPH PRESETS  (called from generateArray / onCategoryChange)
  // ================================================================

  /**
   * Build a graph matching `presetType` in a 600×320 canvas.
   * Presets: "random" (default) | "tree" (binary) | "dag" (toposort demo) | "negative" (Bellman-Ford demo)
   */
  generatePreset(presetType = "random", nodeCount = 7, density = 0.4) {
    this.clearGraph();
    const width = 600;
    const height = 320;
    const padding = 50;

    // ---- Binary Tree preset: recursive split placement ----
    if (presetType === "tree") {
      const levels = 3;
      let id = 0;
      const createTreeNode = (level, minX, maxX, y) => {
        if (level > levels) return null;
        const x = (minX + maxX) / 2;
        const currId = id++;
        this.addNode(x, y, `N${currId}`);
        const leftChild  = createTreeNode(level + 1, minX, x,      y + 80);
        const rightChild = createTreeNode(level + 1, x,    maxX,   y + 80);
        // Link to children after they're created.
        if (leftChild  !== null) this.addEdge(currId, leftChild,  Math.floor(Math.random() * 8) + 1);
        if (rightChild !== null) this.addEdge(currId, rightChild, Math.floor(Math.random() * 8) + 1);
        return currId;
      };
      createTreeNode(1, padding, width - padding, padding);
      this.startNodeId = 0;
      this.targetNodeId = this.nodes.length - 1;
      this.resetGraphState();
      return;
    }

    // ---- Directed Acyclic Graph preset: 2-source → 2-middle → sink layout ----
    if (presetType === "dag") {
      this.setDirected(true);
      const positions = [
        { x: 60,  y: 160 },   // 0 A (source)
        { x: 180, y: 80  },   // 1 B
        { x: 180, y: 240 },   // 2 C
        { x: 340, y: 80  },   // 3 D
        { x: 340, y: 240 },   // 4 E
        { x: 480, y: 160 }    // 5 F (sink)
      ];
      positions.forEach((pos, idx) => this.addNode(pos.x, pos.y, String.fromCharCode(65 + idx)));
      this.addEdge(0, 1, 3);
      this.addEdge(0, 2, 2);
      this.addEdge(1, 3, 4);
      this.addEdge(1, 4, 1);
      this.addEdge(2, 4, 5);
      this.addEdge(3, 5, 2);
      this.addEdge(4, 5, 3);
      this.startNodeId = 0;
      this.targetNodeId = 5;
      this.resetGraphState();
      return;
    }

    // ---- Bellman-Ford preset: contains intentional negative-weight edges ----
    if (presetType === "negative") {
      this.setDirected(true);
      const pos = [
        { x: 80,  y: 160 },
        { x: 220, y: 70  },
        { x: 220, y: 250 },
        { x: 380, y: 70  },
        { x: 380, y: 250 },
        { x: 520, y: 160 }
      ];
      pos.forEach((p, idx) => this.addNode(p.x, p.y, `N${idx}`));
      this.addEdge(0, 1, 5);
      this.addEdge(0, 2, 2);
      this.addEdge(1, 3, 1);
      this.addEdge(2, 1, -3);   // Negative weight (key Bellman-Ford test)
      this.addEdge(2, 4, 4);
      this.addEdge(3, 5, 3);
      this.addEdge(4, 3, -1);   // Another negative weight
      this.addEdge(4, 5, 7);
      this.startNodeId = 0;
      this.targetNodeId = 5;
      this.resetGraphState();
      return;
    }

    // ---- Default / random preset: circular placement + probabilistic edges ----
    // More nodes + start/target on opposite sides + biased weights so weighted
    // algorithms (Dijkstra, A*) don't just look like BFS.
    const count = Math.max(8, Math.min(14, nodeCount));
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - padding;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;   // start at 12 o'clock
      const jitterR = 0.82 + Math.random() * 0.32;              // slight radius jitter → non-circular
      const jitterA = (Math.random() - 0.5) * 0.12;             // slight angle jitter
      const x = centerX + radius * jitterR * Math.cos(angle + jitterA);
      const y = centerY + radius * jitterR * Math.sin(angle + jitterA);
      this.addNode(Math.round(x), Math.round(y), String.fromCharCode(65 + (i % 26)));
    }

    // Guarantee connectedness via a ring (with larger random weight range so
    // the shortest path isn't trivially the ring direction).
    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      const ringW = Math.floor(Math.random() * 14) + 3;          // 3..16
      this.addEdge(i, next, ringW);
    }

    // Chord edges: denser at short distances (8..15%), some long-range chords
    // with larger weights so Dijkstra has to choose between fast-short and slow-long.
    for (let i = 0; i < count; i++) {
      for (let j = i + 2; j < count; j++) {
        if (i === 0 && j === count - 1) continue;                // ring already covers
        const dist = Math.min(j - i, count - (j - i));
        const p = dist <= 2 ? 0.55 : dist <= 4 ? 0.22 : 0.08;
        if (Math.random() < p) {
          // Biased weight: short chords = light/cheap, long chords = heavy/expensive
          const baseW = 2 + dist * 2;
          const w = baseW + Math.floor(Math.random() * 8);
          this.addEdge(i, j, w);
        }
      }
    }

    // Start at 12 o'clock (node 0), target opposite side so paths are long
    // enough that BFS / Dijkstra / A* meaningfully differ.
    this.startNodeId = 0;
    this.targetNodeId = Math.floor(count / 2);
    this.resetGraphState();
  }

  // ================================================================
  //  GRID / MAZE METHODS
  // ================================================================

  /**
   * Allocate a fresh rows × cols cell grid.
   * Each cell carries per-run algorithm state (distance, A* g/f scores, parent pointer).
   * When `features` is true, scatters random walls + terrain patches so Dijkstra/A*
   * actually have something meaningful to optimize against (instead of an empty field).
   */
  initGrid(rows = 15, cols = 25, features = true) {
    this.gridRows = rows;
    this.gridCols = cols;
    this.grid = [];

    // Clamp start/target inside the grid if they somehow exceed dims.
    this.startCell  = {
      row: Math.min(this.startCell.row, rows - 2),
      col: Math.min(this.startCell.col, Math.floor(cols / 3))
    };
    this.targetCell = {
      row: Math.min(this.targetCell.row, rows - 2),
      col: Math.min(this.targetCell.col, cols - 2)
    };

    for (let r = 0; r < rows; r++) {
      const rowArr = [];
      for (let c = 0; c < cols; c++) {
        let type = "empty";
        let terrain = "empty";
        if (r === this.startCell.row && c === this.startCell.col) type = "start";
        else if (r === this.targetCell.row && c === this.targetCell.col) type = "target";

        rowArr.push({
          row: r,
          col: c,
          type: type,                 // empty | wall | start | target | visiting | visited | path | grass | sand | mud
          terrain: terrain,           // empty | grass | sand | mud  (logical terrain, independent of visit overlay)
          distance: (r === this.startCell.row && c === this.startCell.col) ? 0 : Infinity,
          gScore:   (r === this.startCell.row && c === this.startCell.col) ? 0 : Infinity,
          fScore:   (r === this.startCell.row && c === this.startCell.col) ? 0 : Infinity,
          parent: null
        });
      }
      this.grid.push(rowArr);
    }

    if (!features) return;

    // --- Scatter random wall clusters ---
    const wallDensity = 0.22;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.grid[r][c];
        if (cell.type === "start" || cell.type === "target") continue;
        if (Math.random() < wallDensity) {
          cell.type = "wall";
          // Occasionally grow a small wall cluster.
          if (Math.random() < 0.45) {
            const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
            const [dr, dc] = dirs[Math.floor(Math.random() * 4)];
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const nb = this.grid[nr][nc];
              if (nb.type !== "start" && nb.type !== "target") nb.type = "wall";
            }
          }
        }
      }
    }

    // Carve guaranteed horizontal+vertical corridors so start → target is always reachable
    const sr = this.startCell.row, sc = this.startCell.col;
    const tr = this.targetCell.row, tc = this.targetCell.col;
    for (let c = Math.min(sc, tc); c <= Math.max(sc, tc); c++) {
      if (this.grid[sr][c].type !== "start" && this.grid[sr][c].type !== "target") {
        this.grid[sr][c].type = "empty";
      }
    }
    for (let r = Math.min(sr, tr); r <= Math.max(sr, tr); r++) {
      if (this.grid[r][tc].type !== "start" && this.grid[r][tc].type !== "target") {
        this.grid[r][tc].type = "empty";
      }
    }

    // --- Scatter terrain patches (grass / sand / mud) with different costs ---
    const terrainPatches = [
      { terrain: "grass", count: 4, size: 10, chance: 0.8 },
      { terrain: "sand",  count: 3, size: 8,  chance: 0.75 },
      { terrain: "mud",   count: 2, size: 6,  chance: 0.7 }
    ];
    terrainPatches.forEach(patch => {
      for (let i = 0; i < patch.count; i++) {
        const seedR = Math.floor(Math.random() * rows);
        const seedC = Math.floor(Math.random() * cols);
        const stack = [{ r: seedR, c: seedC }];
        const visited = new Set([`${seedR},${seedC}`]);
        let placed = 0;
        while (stack.length > 0 && placed < patch.size) {
          const cur = stack.pop();
          const cell = this.grid[cur.r]?.[cur.c];
          if (!cell || cell.type === "start" || cell.type === "target" || cell.type === "wall") continue;
          cell.terrain = patch.terrain;
          placed++;
          [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => {
            const nr = cur.r + dr, nc = cur.c + dc;
            const k = `${nr},${nc}`;
            if (!visited.has(k) && Math.random() < patch.chance) {
              visited.add(k);
              stack.push({ r: nr, c: nc });
            }
          });
        }
      }
    });

    this.resetGridState();
  }

  /** Reset pathfinding state WITHOUT erasing walls or terrain. */
  resetGridState() {
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const cell = this.grid[r][c];
        if (cell.type !== "wall" && cell.type !== "start" && cell.type !== "target") {
          cell.type = cell.terrain && cell.terrain !== "empty" ? cell.terrain : "empty";
        }
        const isStart = (r === this.startCell.row && c === this.startCell.col);
        cell.distance = isStart ? 0 : Infinity;
        cell.gScore   = isStart ? 0 : Infinity;
        cell.fScore   = isStart ? 0 : Infinity;
        cell.parent   = null;
      }
    }
  }

  /** Turn every wall cell back into empty. */
  clearGridWalls() {
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const cell = this.grid[r][c];
        if (cell.type === "wall") cell.type = "empty";
      }
    }
    this.resetGridState();
  }

  /**
   * Return the 4 (or 8 if diagonal) in-bounds neighbor cells.
   * Skips out-of-bounds; does NOT filter by wall state — caller decides.
   */
  getGridNeighbors(r, c, allowDiagonal = false) {
    const neighbors = [];
    const dirs = [
      { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
    ];
    if (allowDiagonal) {
      dirs.push({ r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 });
    }

    dirs.forEach(d => {
      const nr = r + d.r;
      const nc = c + d.c;
      if (nr >= 0 && nr < this.gridRows && nc >= 0 && nc < this.gridCols) {
        neighbors.push(this.grid[nr][nc]);
      }
    });
    return neighbors;
  }

  /**
   * Classic Recursive Backtracking maze generator.
   * Fills every cell as wall, then carves passages by depth-first walk
   * stepping 2 cells at a time so walls remain between corridors.
   */
  generateRecursiveMaze() {
    this.initGrid(this.gridRows, this.gridCols);

    // Start with everything walled.
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        this.grid[r][c].type = "wall";
      }
    }

    const stack = [];
    const startR = 1;
    const startC = 1;
    this.grid[startR][startC].type = "empty";
    stack.push({ r: startR, c: startC });

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const unvisitedDirs = [];

      // 4 directions, 2 cells each (middle + far) — middle becomes the carved wall.
      const dirs = [
        { r: -2, c: 0, midR: -1, midC: 0 },
        { r: 2,  c: 0, midR:  1, midC: 0 },
        { r: 0, c: -2, midR: 0, midC: -1 },
        { r: 0, c:  2, midR: 0, midC:  1 }
      ];

      dirs.forEach(d => {
        const nr = current.r + d.r;
        const nc = current.c + d.c;
        // Must stay inside border (so the maze has a perimeter wall).
        if (nr > 0 && nr < this.gridRows - 1 && nc > 0 && nc < this.gridCols - 1) {
          if (this.grid[nr][nc].type === "wall") {
            unvisitedDirs.push({ nr, nc, midR: current.r + d.midR, midC: current.c + d.midC });
          }
        }
      });

      if (unvisitedDirs.length > 0) {
        // Pick a random unvisited direction, carve the wall, and descend.
        const chosen = unvisitedDirs[Math.floor(Math.random() * unvisitedDirs.length)];
        this.grid[chosen.midR][chosen.midC].type = "empty";
        this.grid[chosen.nr][chosen.nc].type = "empty";
        stack.push({ r: chosen.nr, c: chosen.nc });
      } else {
        // Dead end: backtrack.
        stack.pop();
      }
    }

    // Place start in top-left and target in bottom-right (guaranteed reachable).
    this.startCell = { row: 1, col: 1 };
    this.targetCell = { row: this.gridRows - 2, col: this.gridCols - 2 };
    this.grid[this.startCell.row][this.startCell.col].type = "start";
    this.grid[this.targetCell.row][this.targetCell.col].type = "target";
    this.resetGridState();
  }
}
