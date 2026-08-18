/**
 * graph-renderer.js — SVG renderer for general node+edge graphs.
 *
 * Uses SVG 1.1 namespace (important for <marker> defs) with a 600×320 viewBox.
 * Layer order: edges <g> drawn first, nodes <g> drawn on top (so edge arrows
 * go behind node circles, not through them).
 *
 * The renderer is stateless except for drag state: it reads 100% of what to
 * draw from the injected GraphEngine reference on every `render()` call.
 */

class GraphRenderer {
  constructor() {
    this.container   = null;             // DOM parent
    this.svg         = null;             // <svg> root (600x320 viewBox)
    this.engine      = null;             // GraphEngine reference (data source)
    this.edgesGroup  = null;             // <g id="edges-layer">
    this.nodesGroup  = null;             // <g id="nodes-layer">
    this.activeNode  = null;             // node object currently pressed/dragged
    this.isDragging  = false;            // true if mouse moved beyond click threshold
    this.dragOffset  = { x: 0, y: 0 };   // mouse→node offset at drag start (viewBox coords)
    this.downPos     = { x: 0, y: 0 };   // screen coords where mousedown occurred
    this.downButton  = 0;                // 0 = left click, 2 = right click
    this.downShift   = false;            // true if shift was held on mousedown
  }

  /**
   * Create SVG root, defs (arrowhead marker), and layer groups. Hook up drag.
   * @param {HTMLElement} container
   * @param {GraphEngine} engine
   */
  init(container, engine) {
    this.container = container;
    this.engine    = engine;
    this.container.innerHTML = "";

    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.svg.setAttribute("viewBox", "0 0 600 320");
    this.svg.style.background   = "var(--card)";
    this.svg.style.borderRadius = "var(--radius)";
    this.svg.style.userSelect   = "none";

    // --- Arrowhead marker: used by directed edges via marker-end="url(#arrowhead)" ---
    const defs   = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "22");                 // offset so tip sits just outside node circle
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "6");
    marker.setAttribute("markerHeight", "6");
    marker.setAttribute("orient", "auto-start-reverse");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    path.setAttribute("fill", "var(--muted)");

    marker.appendChild(path);
    defs.appendChild(marker);

    // Glow filter — visiting nodes (amber pulse) and path nodes (green)
    const mkFilter = (id, blur) => {
      const f = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      f.setAttribute("id", id);
      f.setAttribute("x", "-50%"); f.setAttribute("y", "-50%");
      f.setAttribute("width", "200%"); f.setAttribute("height", "200%");
      const fe = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
      fe.setAttribute("in", "SourceGraphic"); fe.setAttribute("stdDeviation", String(blur)); fe.setAttribute("result", "blur");
      const merge = document.createElementNS("http://www.w3.org/2000/svg", "feMerge");
      const n1 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode"); n1.setAttribute("in", "blur");
      const n2 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode"); n2.setAttribute("in", "SourceGraphic");
      merge.appendChild(n1); merge.appendChild(n2);
      f.appendChild(fe); f.appendChild(merge);
      return f;
    };
    defs.appendChild(mkFilter("glow-visiting", 4));
    defs.appendChild(mkFilter("glow-path",     6));

    this.svg.appendChild(defs);

    this.edgesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.edgesGroup.setAttribute("id", "edges-layer");
    this.nodesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.nodesGroup.setAttribute("id", "nodes-layer");

    // Static hint text for click-to-select interaction
    const hint = document.createElementNS("http://www.w3.org/2000/svg", "text");
    hint.setAttribute("x", "300");
    hint.setAttribute("y", "314");
    hint.setAttribute("text-anchor", "middle");
    hint.setAttribute("fill", "rgba(255,255,255,0.30)");
    hint.setAttribute("font-size", "10");
    hint.setAttribute("font-family", "Inter, system-ui, sans-serif");
    hint.setAttribute("pointer-events", "none");
    hint.textContent = "Left-Click node: Set Start (S)  |  Right-Click / Shift+Click: Set Target (T)  |  Drag to move";
    this.svg.appendChild(hint);

    this.svg.appendChild(this.edgesGroup);
    this.svg.appendChild(this.nodesGroup);
    this.container.appendChild(this.svg);

    this.setupInteractions();
    this.render();
  }

  /**
   * Wire up node drag-to-reposition and click-to-set start/target.
   * Handles mouse events cleanly on window so drags never stick.
   */
  setupInteractions() {
    // Prevent browser context menu on graph so right-clicking smoothly sets target node
    this.svg.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.activeNode) return;

      const dist = Math.hypot(e.clientX - this.downPos.x, e.clientY - this.downPos.y);
      if (dist > 3) {
        this.isDragging = true;
      }

      if (this.isDragging) {
        const rect   = this.svg.getBoundingClientRect();
        const scaleX = 600 / rect.width;
        const scaleY = 320 / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top)  * scaleY;

        // Clamp to a 30px inner margin so nodes stay visible inside the canvas.
        this.activeNode.x = Math.max(30, Math.min(570, mouseX - this.dragOffset.x));
        this.activeNode.y = Math.max(30, Math.min(290, mouseY - this.dragOffset.y));
        this.render();
      }
    });

    window.addEventListener("mouseup", (e) => {
      if (this.activeNode) {
        if (!this.isDragging) {
          // Clean tap/click without dragging
          if (this.downButton === 2 || this.downShift) {
            // Set as Target node
            this.engine.setTargetNode(this.activeNode.id);
          } else {
            // Set as Start node
            this.engine.setStartNode(this.activeNode.id);
          }
        }
        this.activeNode = null;
        this.isDragging = false;
        this.render();
      }
    });
  }

  /**
   * Full redraw: rebuild edges + nodes from GraphEngine state.
   * Called after every graph-algo step and after any drag move.
   */
  render() {
    if (!this.engine || !this.svg) return;

    this.edgesGroup.innerHTML = "";
    this.nodesGroup.innerHTML = "";

    // ---- EDGES ----
    this.engine.edges.forEach(edge => {
      const sourceNode = this.engine.nodes.find(n => n.id === edge.source);
      const targetNode = this.engine.nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const line  = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", sourceNode.x);
      line.setAttribute("y1", sourceNode.y);
      line.setAttribute("x2", targetNode.x);
      line.setAttribute("y2", targetNode.y);

      // Edge color based on status. exploring=red mid-step, path/mst=green final.
      let strokeColor = "var(--muted)";
      let strokeWidth = "2";
      if      (edge.status === "exploring")             { strokeColor = "var(--danger)"; strokeWidth = "4"; }
      else if (edge.status === "path" || edge.status === "mst") { strokeColor = "var(--ok)"; strokeWidth = "4"; }

      line.setAttribute("stroke", strokeColor);
      line.setAttribute("stroke-width", strokeWidth);
      if (edge.directed) line.setAttribute("marker-end", "url(#arrowhead)");
      if (edge.status === "path" || edge.status === "mst") line.setAttribute("filter", "url(#glow-path)");

      group.appendChild(line);

      // Edge weight label: drawn on top of a tiny <rect> background for contrast.
      if (edge.weight !== undefined) {
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;

        const textBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        textBg.setAttribute("x", midX - 10);
        textBg.setAttribute("y", midY - 10);
        textBg.setAttribute("width", "20");
        textBg.setAttribute("height", "14");
        textBg.setAttribute("rx", "3");
        textBg.setAttribute("fill", "var(--card)");
        textBg.setAttribute("stroke", "var(--muted)");

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", midX);
        text.setAttribute("y", midY);
        text.setAttribute("fill", "var(--text)");
        text.setAttribute("font-size", "11");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "central");
        text.textContent = edge.weight;

        group.appendChild(textBg);
        group.appendChild(text);
      }

      this.edgesGroup.appendChild(group);
    });

    // ---- NODES ----
    this.engine.nodes.forEach(node => {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.style.cursor = "pointer";

      const isStart  = node.id === this.engine.startNodeId;
      const isTarget = node.id === this.engine.targetNodeId;

      // Status → fill/stroke color map.
      let fillColor   = "var(--card)";
      let strokeColor = "var(--accent)";
      let strokeWidth = "2";

      if      (isStart)                    { strokeColor = "var(--ok)";          fillColor = "rgba(16, 185, 129, 0.25)"; strokeWidth = "2.5"; }
      else if (isTarget)                   { strokeColor = "var(--danger)";      fillColor = "rgba(251, 113, 133, 0.25)"; strokeWidth = "2.5"; }
      else if (node.status === "visiting") { strokeColor = "var(--warn)";        fillColor = "rgba(245, 158, 11, 0.3)";  strokeWidth = "3"; }
      else if (node.status === "visited")  { strokeColor = "#a855f7";            fillColor = "rgba(168, 85, 247, 0.2)"; }
      else if (node.status === "path")     { strokeColor = "var(--ok)";          fillColor = "rgba(16, 185, 129, 0.4)";  strokeWidth = "3"; }

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", node.x);
      circle.setAttribute("cy", node.y);
      circle.setAttribute("r", "16");
      circle.setAttribute("fill", fillColor);
      circle.setAttribute("stroke", strokeColor);
      circle.setAttribute("stroke-width", strokeWidth);

      // Apply SVG glow filter for active node states
      if      (node.status === "visiting") circle.setAttribute("filter", "url(#glow-visiting)");
      else if (node.status === "path" || isStart) circle.setAttribute("filter", "url(#glow-path)");

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", node.x);
      label.setAttribute("y", node.y);
      label.setAttribute("fill", "var(--text)");
      label.setAttribute("font-size", "12");
      label.setAttribute("font-weight", "600");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "central");
      label.textContent = node.label;

      // Start / Target indicator badge (top-left of node)
      if (isStart || isTarget) {
        const tagBg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        tagBg.setAttribute("cx", node.x - 12);
        tagBg.setAttribute("cy", node.y - 12);
        tagBg.setAttribute("r", "7");
        tagBg.setAttribute("fill", isStart ? "var(--ok)" : "var(--danger)");

        const tagText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        tagText.setAttribute("x", node.x - 12);
        tagText.setAttribute("y", node.y - 11.5);
        tagText.setAttribute("fill", "#ffffff");
        tagText.setAttribute("font-size", "8");
        tagText.setAttribute("font-weight", "bold");
        tagText.setAttribute("text-anchor", "middle");
        tagText.setAttribute("dominant-baseline", "central");
        tagText.textContent = isStart ? "S" : "T";

        group.appendChild(tagBg);
        group.appendChild(tagText);
      }

      // Distance badge (top-right of node) — shown only once Dijkstra/Bellman writes a finite distance.
      if (node.distance !== undefined && node.distance !== Infinity) {
        const badgeBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        badgeBg.setAttribute("x", node.x + 8);
        badgeBg.setAttribute("y", node.y - 20);
        badgeBg.setAttribute("width", "18");
        badgeBg.setAttribute("height", "14");
        badgeBg.setAttribute("rx", "3");
        badgeBg.setAttribute("fill", "var(--warn)");

        const badgeText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        badgeText.setAttribute("x", node.x + 17);
        badgeText.setAttribute("y", node.y - 13);
        badgeText.setAttribute("fill", "var(--bg)");
        badgeText.setAttribute("font-size", "10");
        badgeText.setAttribute("font-weight", "bold");
        badgeText.setAttribute("text-anchor", "middle");
        badgeText.setAttribute("dominant-baseline", "central");
        badgeText.textContent = node.distance;

        group.appendChild(badgeBg);
        group.appendChild(badgeText);
      }

      group.appendChild(circle);
      group.appendChild(label);

      // Node mousedown hook: captures drag initiation and records click parameters
      group.addEventListener("mousedown", (e) => {
        this.activeNode = node;
        this.isDragging = false;
        this.downPos    = { x: e.clientX, y: e.clientY };
        this.downButton = e.button;
        this.downShift  = e.shiftKey;

        const rect   = this.svg.getBoundingClientRect();
        const scaleX = 600 / rect.width;
        const scaleY = 320 / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top)  * scaleY;
        this.dragOffset = { x: mouseX - node.x, y: mouseY - node.y };

        e.preventDefault();
      });

      this.nodesGroup.appendChild(group);
    });
  }
}
