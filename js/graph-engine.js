// graph-engine.js — Graph & Grid Data Structures, Presets, and Maze Generators

class GraphEngine {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this.isDirected = false;
    this.startNodeId = 0;
    this.targetNodeId = 4;
    
    // Grid mode state
    this.gridRows = 15;
    this.gridCols = 25;
    this.grid = [];
    this.startCell = { row: 7, col: 4 };
    this.targetCell = { row: 7, col: 20 };
  }

  // --- GENERAL GRAPH METHODS ---
  clearGraph() {
    this.nodes = [];
    this.edges = [];
  }

  setDirected(directed) {
    this.isDirected = directed;
    this.edges.forEach(e => e.directed = directed);
  }

  addNode(x, y, label = null) {
    const id = this.nodes.length;
    const node = {
      id: id,
      label: label !== null ? label : `${id}`,
      x: x,
      y: y,
      status: "default", // default, visiting, visited, path, start, target
      distance: Infinity,
      parent: null
    };
    this.nodes.push(node);
    return node;
  }

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
      status: "default", // default, exploring, path, mst
      directed: this.isDirected
    };
    this.edges.push(edge);
    return edge;
  }

  getNeighbors(nodeId) {
    const neighbors = [];
    this.edges.forEach(e => {
      if (e.source === nodeId) {
        neighbors.push({ nodeId: e.target, weight: e.weight, edge: e });
      } else if (!this.isDirected && e.target === nodeId) {
        neighbors.push({ nodeId: e.source, weight: e.weight, edge: e });
      }
    });
    return neighbors;
  }

  getWeight(u, v) {
    const edge = this.edges.find(e => 
      (e.source === u && e.target === v) ||
      (!this.isDirected && e.source === v && e.target === u)
    );
    return edge ? edge.weight : Infinity;
  }

  resetGraphState() {
    this.nodes.forEach(n => {
      n.status = (n.id === this.startNodeId) ? "start" : (n.id === this.targetNodeId ? "target" : "default");
      n.distance = (n.id === this.startNodeId) ? 0 : Infinity;
      n.parent = null;
    });
    this.edges.forEach(e => e.status = "default");
  }

  // --- PRESETS FOR GENERAL GRAPH ---
  generatePreset(presetType = "random", nodeCount = 7, density = 0.4) {
    this.clearGraph();
    const width = 600;
    const height = 320;
    const padding = 50;

    if (presetType === "tree") {
      // Binary Tree layout
      const levels = 3;
      let id = 0;
      const createTreeNode = (level, minX, maxX, y) => {
        if (level > levels) return null;
        const x = (minX + maxX) / 2;
        const currId = id++;
        this.addNode(x, y, `N${currId}`);
        if (level > 1) {
          // Parent connection is handled by caller
        }
        const leftChild = createTreeNode(level + 1, minX, x, y + 80);
        const rightChild = createTreeNode(level + 1, x, maxX, y + 80);
        if (leftChild !== null) this.addEdge(currId, leftChild, Math.floor(Math.random() * 8) + 1);
        if (rightChild !== null) this.addEdge(currId, rightChild, Math.floor(Math.random() * 8) + 1);
        return currId;
      };
      createTreeNode(1, padding, width - padding, padding);
      this.startNodeId = 0;
      this.targetNodeId = this.nodes.length - 1;
      this.resetGraphState();
      return;
    }

    if (presetType === "dag") {
      // Directed Acyclic Graph (DAG) for Topological Sort
      this.setDirected(true);
      const positions = [
        { x: 60, y: 160 },   // 0 (A)
        { x: 180, y: 80 },   // 1 (B)
        { x: 180, y: 240 },  // 2 (C)
        { x: 340, y: 80 },   // 3 (D)
        { x: 340, y: 240 },  // 4 (E)
        { x: 480, y: 160 }   // 5 (F)
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

    if (presetType === "negative") {
      // Bellman-Ford graph with negative weight edge
      this.setDirected(true);
      const pos = [
        { x: 80, y: 160 },
        { x: 220, y: 70 },
        { x: 220, y: 250 },
        { x: 380, y: 70 },
        { x: 380, y: 250 },
        { x: 520, y: 160 }
      ];
      pos.forEach((p, idx) => this.addNode(p.x, p.y, `N${idx}`));
      this.addEdge(0, 1, 5);
      this.addEdge(0, 2, 2);
      this.addEdge(1, 3, 1);
      this.addEdge(2, 1, -3); // Negative weight edge!
      this.addEdge(2, 4, 4);
      this.addEdge(3, 5, 3);
      this.addEdge(4, 3, -1); // Another negative weight
      this.addEdge(4, 5, 7);
      this.startNodeId = 0;
      this.targetNodeId = 5;
      this.resetGraphState();
      return;
    }

    // Default: Circular / Random placement
    const count = Math.max(4, Math.min(15, nodeCount));
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - padding;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      this.addNode(Math.round(x), Math.round(y), String.fromCharCode(65 + (i % 26)));
    }

    // Connect nodes based on density
    for (let i = 0; i < count; i++) {
      // Ensure at least connected to next in circle
      const next = (i + 1) % count;
      const w1 = Math.floor(Math.random() * 9) + 1;
      this.addEdge(i, next, w1);

      for (let j = i + 2; j < count; j++) {
        if (i === 0 && j === count - 1) continue; // already connected
        if (Math.random() < density) {
          const w = Math.floor(Math.random() * 9) + 1;
          this.addEdge(i, j, w);
        }
      }
    }

    this.startNodeId = 0;
    this.targetNodeId = Math.floor(count / 2);
    this.resetGraphState();
  }

  // --- GRID / MAZE METHODS ---
  initGrid(rows = 15, cols = 25) {
    this.gridRows = rows;
    this.gridCols = cols;
    this.grid = [];

    for (let r = 0; r < rows; r++) {
      const rowArr = [];
      for (let c = 0; c < cols; c++) {
        let type = "empty";
        if (r === this.startCell.row && c === this.startCell.col) type = "start";
        else if (r === this.targetCell.row && c === this.targetCell.col) type = "target";

        rowArr.push({
          row: r,
          col: c,
          type: type, // empty, wall, start, target, visiting, visited, path
          distance: (r === this.startCell.row && c === this.startCell.col) ? 0 : Infinity,
          gScore: (r === this.startCell.row && c === this.startCell.col) ? 0 : Infinity,
          fScore: (r === this.startCell.row && c === this.startCell.col) ? 0 : Infinity,
          parent: null
        });
      }
      this.grid.push(rowArr);
    }
  }

  resetGridState() {
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const cell = this.grid[r][c];
        if (cell.type !== "wall" && cell.type !== "start" && cell.type !== "target") {
          cell.type = "empty";
        }
        const isStart = (r === this.startCell.row && c === this.startCell.col);
        cell.distance = isStart ? 0 : Infinity;
        cell.gScore = isStart ? 0 : Infinity;
        cell.fScore = isStart ? 0 : Infinity;
        cell.parent = null;
      }
    }
  }

  clearGridWalls() {
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const cell = this.grid[r][c];
        if (cell.type === "wall") cell.type = "empty";
      }
    }
    this.resetGridState();
  }

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

  // Recursive Backtracking Maze Generation
  generateRecursiveMaze() {
    this.initGrid(this.gridRows, this.gridCols);
    
    // Fill with walls initially
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

      const dirs = [
        { r: -2, c: 0, midR: -1, midC: 0 },
        { r: 2, c: 0, midR: 1, midC: 0 },
        { r: 0, c: -2, midR: 0, midC: -1 },
        { r: 0, c: 2, midR: 0, midC: 1 }
      ];

      dirs.forEach(d => {
        const nr = current.r + d.r;
        const nc = current.c + d.c;
        if (nr > 0 && nr < this.gridRows - 1 && nc > 0 && nc < this.gridCols - 1) {
          if (this.grid[nr][nc].type === "wall") {
            unvisitedDirs.push({ nr, nc, midR: current.r + d.midR, midC: current.c + d.midC });
          }
        }
      });

      if (unvisitedDirs.length > 0) {
        const chosen = unvisitedDirs[Math.floor(Math.random() * unvisitedDirs.length)];
        this.grid[chosen.midR][chosen.midC].type = "empty";
        this.grid[chosen.nr][chosen.nc].type = "empty";
        stack.push({ r: chosen.nr, c: chosen.nc });
      } else {
        stack.pop();
      }
    }

    // Set start & target
    this.startCell = { row: 1, col: 1 };
    this.targetCell = { row: this.gridRows - 2, col: this.gridCols - 2 };
    this.grid[this.startCell.row][this.startCell.col].type = "start";
    this.grid[this.targetCell.row][this.targetCell.col].type = "target";
    this.resetGridState();
  }
}
