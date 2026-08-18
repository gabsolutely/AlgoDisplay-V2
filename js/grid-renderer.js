/**
 * grid-renderer.js — Canvas 2D renderer for grid/maze pathfinding.
 *
 * Unlike the DOM-based ArrayRenderer and SVG-based GraphRenderer, this uses
 * a 600×320 <canvas> for perf because a 15×25 grid = 375 cells, redrawn on
 * every step of a pathfinding algorithm.
 *
 * Interaction model: mousedown inspects the cell under the cursor and locks
 * `dragMode` for the duration of the drag. This lets you click-and-drag to
 * paint walls, erase walls, or drag the start/target markers around.
 */

class GridRenderer {
  constructor() {
    this.container   = null;
    this.canvas      = null;
    this.ctx         = null;
    this.engine      = null;      // GraphEngine reference (owns grid[][] data)
    this.isMouseDown = false;
    this.dragMode    = null;      // "wall" | "erase" | "moveStart" | "moveTarget"
  }

  /**
   * Create canvas, attach to DOM, and wire interactions.
   * @param {HTMLElement} container
   * @param {GraphEngine} engine
   */
  init(container, engine) {
    this.container = container;
    this.engine    = engine;
    this.container.innerHTML = "";

    this.canvas = document.createElement("canvas");
    this.canvas.width  = 600;
    this.canvas.height = 320;
    this.canvas.style.width        = "100%";
    this.canvas.style.height       = "100%";
    this.canvas.style.borderRadius = "var(--radius)";
    this.canvas.style.background   = "var(--card)";
    this.canvas.style.cursor       = "pointer";

    this.ctx = this.canvas.getContext("2d");
    this.container.appendChild(this.canvas);

    this.setupInteractions();
    this.render();
  }

  /** Convert a mouse event → {row, col} cell under the cursor, or null if out of bounds. */
  setupInteractions() {
    const getCellAtMouse = (e) => {
      const rect   = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width  / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top)  * scaleY;

      const cellW = this.canvas.width  / this.engine.gridCols;
      const cellH = this.canvas.height / this.engine.gridRows;

      const col = Math.floor(mouseX / cellW);
      const row = Math.floor(mouseY / cellH);

      if (row >= 0 && row < this.engine.gridRows && col >= 0 && col < this.engine.gridCols) {
        return { row, col };
      }
      return null;
    };

    // Mousedown: decide drag mode based on the FIRST cell we clicked on.
    this.canvas.addEventListener("mousedown", (e) => {
      const pos = getCellAtMouse(e);
      if (!pos) return;
      this.isMouseDown = true;

      const cell = this.engine.grid[pos.row][pos.col];
      if      (cell.type === "start")  this.dragMode = "moveStart";
      else if (cell.type === "target") this.dragMode = "moveTarget";
      else if (cell.type === "wall")   { this.dragMode = "erase";  cell.type = "empty"; cell.terrain = "empty"; }
      else                             { this.dragMode = "wall";   cell.type = "wall";  cell.terrain = "empty"; }
      this.render();
    });

    // Mousemove: apply drag mode to every cell we slide over.
    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.isMouseDown) return;
      const pos = getCellAtMouse(e);
      if (!pos) return;

      const cell = this.engine.grid[pos.row][pos.col];

      if      (this.dragMode === "moveStart"  && cell.type !== "target" && cell.type !== "wall") {
        this.engine.grid[this.engine.startCell.row][this.engine.startCell.col].type = "empty";
        this.engine.startCell = { row: pos.row, col: pos.col };
        cell.type = "start";
      }
      else if (this.dragMode === "moveTarget" && cell.type !== "start"  && cell.type !== "wall") {
        this.engine.grid[this.engine.targetCell.row][this.engine.targetCell.col].type = "empty";
        this.engine.targetCell = { row: pos.row, col: pos.col };
        cell.type = "target";
      }
      else if (this.dragMode === "wall"  && cell.type !== "start" && cell.type !== "target" && cell.type !== "wall") { cell.type = "wall"; cell.terrain = "empty"; }
      else if (this.dragMode === "erase" && cell.type === "wall")  { cell.type = "empty"; cell.terrain = "empty"; }
      this.render();
    });

    window.addEventListener("mouseup", () => {
      this.isMouseDown = false;
      this.dragMode    = null;
    });
  }

  /**
   * Full canvas redraw. Iterates cells row-major: background fill, then a
   * 1px inset border (subtle grid lines), then S/T glyphs for start/target.
   * Terrain fills are applied first so visiting/visited/path overlays show on top.
   */
  render() {
    if (!this.engine || !this.ctx) return;
    const { gridRows, gridCols, grid } = this.engine;
    const cellW = this.canvas.width  / gridCols;
    const cellH = this.canvas.height / gridRows;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const cell = grid[r][c];
        const x = c * cellW;
        const y = r * cellH;

        // Base terrain fill (drawn first so overlays appear on top)
        const terrain = cell.terrain || "empty";
        if (terrain === "grass")      this.ctx.fillStyle = "rgba(34,197,94,0.12)";
        else if (terrain === "sand") this.ctx.fillStyle = "rgba(250,204,21,0.16)";
        else if (terrain === "mud")  this.ctx.fillStyle = "rgba(146,64,14,0.22)";
        else                          this.ctx.fillStyle = "transparent";
        this.ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

        // Overlay fill (walls, start/target, algorithm states)
        if      (cell.type === "wall")     this.ctx.fillStyle = "#1e293b";
        else if (cell.type === "start")    this.ctx.fillStyle = "rgba(16, 185, 129, 0.35)";
        else if (cell.type === "target")   this.ctx.fillStyle = "rgba(251, 113, 133, 0.35)";
        else if (cell.type === "visiting") this.ctx.fillStyle = "#f59e0b";
        else if (cell.type === "visited")  this.ctx.fillStyle = "rgba(6, 182, 212, 0.45)";
        else if (cell.type === "path")     this.ctx.fillStyle = "#10b981";
        else if (cell.type === "grass")    this.ctx.fillStyle = "rgba(34,197,94,0.20)";
        else if (cell.type === "sand")     this.ctx.fillStyle = "rgba(250,204,21,0.26)";
        else if (cell.type === "mud")      this.ctx.fillStyle = "rgba(146,64,14,0.32)";
        else                               this.ctx.fillStyle = "transparent";

        // Glow effect for active traversal cells
        if (cell.type === "visiting") {
          this.ctx.shadowColor = "rgba(245, 158, 11, 0.85)";
          this.ctx.shadowBlur  = 10;
        } else if (cell.type === "path") {
          this.ctx.shadowColor = "rgba(16, 185, 129, 0.95)";
          this.ctx.shadowBlur  = 14;
        } else {
          this.ctx.shadowColor = "transparent";
          this.ctx.shadowBlur  = 0;
        }
        this.ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
        // Always reset shadow to avoid bleed onto subsequent cells
        this.ctx.shadowColor = "transparent";
        this.ctx.shadowBlur  = 0;

        // Grid cell outline (very faint white on dark bg).
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        this.ctx.lineWidth   = 1;
        this.ctx.strokeRect(x, y, cellW, cellH);

        // Start / Target glyphs centered in the cell.
        if (cell.type === "start") {
          this.ctx.fillStyle    = "#10b981";
          this.ctx.font         = "bold 14px sans-serif";
          this.ctx.textAlign    = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText("S", x + cellW / 2, y + cellH / 2);
        } else if (cell.type === "target") {
          this.ctx.fillStyle    = "#fb7185";
          this.ctx.font         = "bold 14px sans-serif";
          this.ctx.textAlign    = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText("T", x + cellW / 2, y + cellH / 2);
        } else if (terrain === "grass" || terrain === "sand" || terrain === "mud") {
          this.ctx.fillStyle    = "rgba(255,255,255,0.55)";
          this.ctx.font         = "10px sans-serif";
          this.ctx.textAlign    = "center";
          this.ctx.textBaseline = "middle";
          const label = terrain === "grass" ? "·2" : terrain === "sand" ? "·4" : "·8";
          this.ctx.fillText(label, x + cellW / 2, y + cellH / 2);
        }
      }
    }
  }
}
