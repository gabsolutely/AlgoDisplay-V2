// grid-renderer.js — Canvas 2D Grid & Maze Renderer

class GridRenderer {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.engine = null;
    this.isMouseDown = false;
    this.dragMode = null; // "wall", "erase", "moveStart", "moveTarget"
  }

  init(container, engine) {
    this.container = container;
    this.engine = engine;
    this.container.innerHTML = "";

    this.canvas = document.createElement("canvas");
    this.canvas.width = 600;
    this.canvas.height = 320;
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.borderRadius = "var(--radius)";
    this.canvas.style.background = "var(--card)";
    this.canvas.style.cursor = "pointer";

    this.ctx = this.canvas.getContext("2d");
    this.container.appendChild(this.canvas);

    this.setupInteractions();
    this.render();
  }

  setupInteractions() {
    const getCellAtMouse = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      const cellW = this.canvas.width / this.engine.gridCols;
      const cellH = this.canvas.height / this.engine.gridRows;

      const col = Math.floor(mouseX / cellW);
      const row = Math.floor(mouseY / cellH);

      if (row >= 0 && row < this.engine.gridRows && col >= 0 && col < this.engine.gridCols) {
        return { row, col };
      }
      return null;
    };

    this.canvas.addEventListener("mousedown", (e) => {
      const pos = getCellAtMouse(e);
      if (!pos) return;
      this.isMouseDown = true;

      const cell = this.engine.grid[pos.row][pos.col];
      if (cell.type === "start") {
        this.dragMode = "moveStart";
      } else if (cell.type === "target") {
        this.dragMode = "moveTarget";
      } else if (cell.type === "wall") {
        this.dragMode = "erase";
        cell.type = "empty";
      } else {
        this.dragMode = "wall";
        cell.type = "wall";
      }
      this.render();
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.isMouseDown) return;
      const pos = getCellAtMouse(e);
      if (!pos) return;

      const cell = this.engine.grid[pos.row][pos.col];

      if (this.dragMode === "moveStart" && cell.type !== "target" && cell.type !== "wall") {
        this.engine.grid[this.engine.startCell.row][this.engine.startCell.col].type = "empty";
        this.engine.startCell = { row: pos.row, col: pos.col };
        cell.type = "start";
      } else if (this.dragMode === "moveTarget" && cell.type !== "start" && cell.type !== "wall") {
        this.engine.grid[this.engine.targetCell.row][this.engine.targetCell.col].type = "empty";
        this.engine.targetCell = { row: pos.row, col: pos.col };
        cell.type = "target";
      } else if (this.dragMode === "wall" && cell.type === "empty") {
        cell.type = "wall";
      } else if (this.dragMode === "erase" && cell.type === "wall") {
        cell.type = "empty";
      }
      this.render();
    });

    window.addEventListener("mouseup", () => {
      this.isMouseDown = false;
      this.dragMode = null;
    });
  }

  render() {
    if (!this.engine || !this.ctx) return;
    const { gridRows, gridCols, grid } = this.engine;
    const cellW = this.canvas.width / gridCols;
    const cellH = this.canvas.height / gridRows;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const cell = grid[r][c];
        const x = c * cellW;
        const y = r * cellH;

        // Fill cell background based on type
        if (cell.type === "wall") {
          this.ctx.fillStyle = "#1e293b";
        } else if (cell.type === "start") {
          this.ctx.fillStyle = "rgba(16, 185, 129, 0.3)";
        } else if (cell.type === "target") {
          this.ctx.fillStyle = "rgba(251, 113, 133, 0.3)";
        } else if (cell.type === "visiting") {
          this.ctx.fillStyle = "#f59e0b";
        } else if (cell.type === "visited") {
          this.ctx.fillStyle = "rgba(6, 182, 212, 0.4)";
        } else if (cell.type === "path") {
          this.ctx.fillStyle = "#10b981";
        } else {
          this.ctx.fillStyle = "transparent";
        }

        this.ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);

        // Grid border line
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, cellW, cellH);

        // Icons for Start & Target
        if (cell.type === "start") {
          this.ctx.fillStyle = "#10b981";
          this.ctx.font = "bold 14px sans-serif";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText("S", x + cellW / 2, y + cellH / 2);
        } else if (cell.type === "target") {
          this.ctx.fillStyle = "#fb7185";
          this.ctx.font = "bold 14px sans-serif";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText("T", x + cellW / 2, y + cellH / 2);
        }
      }
    }
  }
}
