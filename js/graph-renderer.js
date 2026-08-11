// graph-renderer.js — SVG Node-Edge General Graph Renderer

class GraphRenderer {
  constructor() {
    this.container = null;
    this.svg = null;
    this.engine = null;
    this.draggedNode = null;
    this.dragOffset = { x: 0, y: 0 };
    this.onNodeClick = null;
    this.onEdgeClick = null;
  }

  init(container, engine) {
    this.container = container;
    this.engine = engine;
    this.container.innerHTML = "";
    
    // Create SVG element
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.svg.setAttribute("viewBox", "0 0 600 320");
    this.svg.style.background = "var(--card)";
    this.svg.style.borderRadius = "var(--radius)";
    this.svg.style.userSelect = "none";

    // SVG Marker Defs (Arrowheads for directed edges)
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "22"); // Offset to sit outside circle radius
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "6");
    marker.setAttribute("markerHeight", "6");
    marker.setAttribute("orient", "auto-start-reverse");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    path.setAttribute("fill", "var(--muted)");

    marker.appendChild(path);
    defs.appendChild(marker);
    this.svg.appendChild(defs);

    // Layers: Edges group below, Nodes group above
    this.edgesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.edgesGroup.setAttribute("id", "edges-layer");
    this.nodesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.nodesGroup.setAttribute("id", "nodes-layer");

    this.svg.appendChild(this.edgesGroup);
    this.svg.appendChild(this.nodesGroup);
    this.container.appendChild(this.svg);

    this.setupInteractions();
    this.render();
  }

  setupInteractions() {
    this.svg.addEventListener("mousemove", (e) => {
      if (!this.draggedNode) return;
      const rect = this.svg.getBoundingClientRect();
      const scaleX = 600 / rect.width;
      const scaleY = 320 / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      this.draggedNode.x = Math.max(30, Math.min(570, mouseX - this.dragOffset.x));
      this.draggedNode.y = Math.max(30, Math.min(290, mouseY - this.dragOffset.y));
      this.render();
    });

    window.addEventListener("mouseup", () => {
      this.draggedNode = null;
    });
  }

  render() {
    if (!this.engine || !this.svg) return;

    // Clear layers
    this.edgesGroup.innerHTML = "";
    this.nodesGroup.innerHTML = "";

    // Render Edges
    this.engine.edges.forEach(edge => {
      const sourceNode = this.engine.nodes.find(n => n.id === edge.source);
      const targetNode = this.engine.nodes.find(n => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", sourceNode.x);
      line.setAttribute("y1", sourceNode.y);
      line.setAttribute("x2", targetNode.x);
      line.setAttribute("y2", targetNode.y);

      // Color coding for edges
      let strokeColor = "var(--muted)";
      let strokeWidth = "2";
      if (edge.status === "exploring") {
        strokeColor = "var(--danger)"; // Red glow
        strokeWidth = "4";
      } else if (edge.status === "path" || edge.status === "mst") {
        strokeColor = "var(--ok)"; // Green glow
        strokeWidth = "4";
      }

      line.setAttribute("stroke", strokeColor);
      line.setAttribute("stroke-width", strokeWidth);
      if (edge.directed) {
        line.setAttribute("marker-end", "url(#arrowhead)");
      }

      group.appendChild(line);

      // Edge Weight Text
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

    // Render Nodes
    this.engine.nodes.forEach(node => {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.style.cursor = "pointer";

      // Color coding for nodes
      let fillColor = "var(--card)";
      let strokeColor = "var(--accent)"; // Default blue
      let strokeWidth = "2";

      if (node.status === "start") {
        strokeColor = "var(--ok)";
        fillColor = "rgba(16, 185, 129, 0.2)";
      } else if (node.status === "target") {
        strokeColor = "var(--danger)";
        fillColor = "rgba(251, 113, 133, 0.2)";
      } else if (node.status === "visiting") {
        strokeColor = "var(--warn)";
        fillColor = "rgba(245, 158, 11, 0.3)";
        strokeWidth = "3";
      } else if (node.status === "visited") {
        strokeColor = "#a855f7"; // Purple
        fillColor = "rgba(168, 85, 247, 0.2)";
      } else if (node.status === "path") {
        strokeColor = "var(--ok)";
        fillColor = "rgba(16, 185, 129, 0.4)";
        strokeWidth = "3";
      }

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", node.x);
      circle.setAttribute("cy", node.y);
      circle.setAttribute("r", "16");
      circle.setAttribute("fill", fillColor);
      circle.setAttribute("stroke", strokeColor);
      circle.setAttribute("stroke-width", strokeWidth);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", node.x);
      label.setAttribute("y", node.y);
      label.setAttribute("fill", "var(--text)");
      label.setAttribute("font-size", "12");
      label.setAttribute("font-weight", "600");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "central");
      label.textContent = node.label;

      // Distance Badge if modified
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

      // Drag listener
      group.addEventListener("mousedown", (e) => {
        this.draggedNode = node;
        const rect = this.svg.getBoundingClientRect();
        const scaleX = 600 / rect.width;
        const scaleY = 320 / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        this.dragOffset = { x: mouseX - node.x, y: mouseY - node.y };
      });

      this.nodesGroup.appendChild(group);
    });
  }
}
