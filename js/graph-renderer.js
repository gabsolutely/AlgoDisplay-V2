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
    this.draggedNode = null;             // node object currently being dragged
    this.dragOffset  = { x: 0, y: 0 };   // mouse→node offset at drag start (viewBox coords)
    this.onNodeClick = null;             // optional callback
    this.onEdgeClick = null;             // optional callback
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

    // Glow filter — visiting nodes (amber pulse)
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
    hint.setAttribute("x", "300"); hint.setAttribute("y", "314");
    hint.setAttribute("text-anchor", "middle");
    hint.setAttribute("fill", "rgba(255,255,255,0.20)");
    hint.setAttribute("font-size", "9");
    hint.setAttribute("font-family", "Inter, system-ui, sans-serif");
    hint.setAttribute("pointer-events", "none");
    hint.textContent = "Click node → Set Start  |  Shift+Click → Set Target  |  Drag to reposition";
    this.svg.appendChild(hint);

    this.svg.appendChild(this.edgesGroup);
    this.svg.appendChild(this.nodesGroup);
    this.container.appendChild(this.svg);

    this.setupInteractions();
    this.render();
  }

  /**
   * Wire up node drag-to-reposition.
   * Mouse→viewBox conversion: scale client coords by viewBox/canvas ratio because
   * the SVG is responsive (width=100%) but node coords are in viewBox units.
   */
  setupInteractions() {
    this.svg.addEventListener("mousemove", (e) => {
      if (!this.draggedNode) return;
      const rect   = this.svg.getBoundingClientRect();
      const scaleX = 600 / rect.width;
      const scaleY = 320 / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top)  * scaleY;

      // Clamp to a 30px inner margin so nodes stay visible inside the canvas.
      this.draggedNode.x = Math.max(30, Math.min(570, mouseX - this.dragOffset.x));
      this.draggedNode.y = Math.max(30, Math.min(290, mouseY - this.dragOffset.y));
      this.render();
    });

    window.addEventListener("mouseup", () => {
      this.draggedNode = null;
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

      // Status → fill/stroke color map.
      let fillColor   = "var(--card)";
      let strokeColor = "var(--accent)";
      let strokeWidth = "2";

      if      (node.status === "start")    { strokeColor = "var(--ok)";          fillColor = "rgba(16, 185, 129, 0.2)"; }
      else if (node.status === "target")   { strokeColor = "var(--danger)";      fillColor = "rgba(251, 113, 133, 0.2)"; }
      else if (node.status === "visiting") { strokeColor = "var(--warn)";        fillColor = "rgba(245, 158, 11, 0.3)"; strokeWidth = "3"; }
      else if (node.status === "visited")  { strokeColor = "#a855f7";            fillColor = "rgba(168, 85, 247, 0.2)"; }
      else if (node.status === "path")     { strokeColor = "var(--ok)";          fillColor = "rgba(16, 185, 129, 0.4)"; strokeWidth = "3"; }

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", node.x);
      circle.setAttribute("cy", node.y);
      circle.setAttribute("r", "16");
      circle.setAttribute("fill", fillColor);
      circle.setAttribute("stroke", strokeColor);
      circle.setAttribute("stroke-width", strokeWidth);

      // Apply SVG glow filter for active node states
      if      (node.status === "visiting") circle.setAttribute("filter", "url(#glow-visiting)");
      else if (node.status === "path")     circle.setAttribute("filter", "url(#glow-path)");

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", node.x);
      label.setAttribute("y", node.y);
      label.setAttribute("fill", "var(--text)");
      label.setAttribute("font-size", "12");
      label.setAttribute("font-weight", "600");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "central");
      label.textContent = node.label;

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

      // Drag + click handler.
      // Movement < 6px on mouseup = click (set start/target).
      // Movement >= 6px = drag (reposition).
      let _downX = 0, _downY = 0;
      group.addEventListener("mousedown", (e) => {
        _downX = e.clientX; _downY = e.clientY;
        this.draggedNode = node;
        const rect   = this.svg.getBoundingClientRect();
        const scaleX = 600 / rect.width;
        const scaleY = 320 / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top)  * scaleY;
        this.dragOffset = { x: mouseX - node.x, y: mouseY - node.y };
        e.stopPropagation();
      });
      group.addEventListener("mouseup", (e) => {
        const moved = Math.hypot(e.clientX - _downX, e.clientY - _downY);
        if (moved < 6) {
          // Treat as click: shift = set target, plain = set start
          if (e.shiftKey) {
            if (node.id !== this.engine.startNodeId) {
              this.engine.setTargetNode(node.id);
              this.render();
            }
          } else {
            if (node.id !== this.engine.targetNodeId) {
              this.engine.setStartNode(node.id);
              this.render();
            }
          }
        }
        e.stopPropagation();
      });

      this.nodesGroup.appendChild(group);
    });
  }
}
