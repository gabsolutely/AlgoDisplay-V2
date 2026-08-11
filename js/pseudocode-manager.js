// pseudocode-manager.js — Canonical Pseudocode & Highlighting Sync for AlgoDisplay V2

class PseudocodeManager {
  constructor() {
    this.pseudocodes = {
      // --- SORTING ALGORITHMS ---
      sort: {
        bubble: [
          "for i = 0 to n - 1:",
          "  for j = 0 to n - i - 2:",
          "    if arr[j] > arr[j + 1]:",
          "      swap(arr[j], arr[j + 1])"
        ],
        selection: [
          "for i = 0 to n - 1:",
          "  minIdx = i",
          "  for j = i + 1 to n - 1:",
          "    if arr[j] < arr[minIdx]: minIdx = j",
          "  if minIdx != i:",
          "    swap(arr[i], arr[minIdx])"
        ],
        insertion: [
          "for i = 1 to n - 1:",
          "  key = arr[i]",
          "  j = i - 1",
          "  while j >= 0 and arr[j] > key:",
          "    arr[j + 1] = arr[j]",
          "    j = j - 1",
          "  arr[j + 1] = key"
        ],
        merge: [
          "function mergeSort(arr, left, right):",
          "  if left >= right: return",
          "  mid = floor((left + right) / 2)",
          "  mergeSort(arr, left, mid)",
          "  mergeSort(arr, mid + 1, right)",
          "  merge(arr, left, mid, right)"
        ],
        quick: [
          "function quickSort(arr, low, high):",
          "  if low < high:",
          "    pivotIdx = partition(arr, low, high)",
          "    quickSort(arr, low, pivotIdx - 1)",
          "    quickSort(arr, pivotIdx + 1, high)"
        ],
        heap: [
          "for i = floor(n / 2) - 1 down to 0:",
          "  heapify(arr, n, i)",
          "for i = n - 1 down to 1:",
          "  swap(arr[0], arr[i])",
          "  heapify(arr, i, 0)"
        ],
        shell: [
          "gap = floor(n / 2)",
          "while gap > 0:",
          "  for i = gap to n - 1:",
          "    temp = arr[i], j = i",
          "    while j >= gap and arr[j - gap] > temp:",
          "      arr[j] = arr[j - gap], j -= gap",
          "    arr[j] = temp",
          "  gap = floor(gap / 2)"
        ],
        cocktail: [
          "swapped = true, start = 0, end = n - 1",
          "while swapped:",
          "  swapped = false",
          "  for i = start to end - 1:",
          "    if arr[i] > arr[i+1]: swap & swapped = true",
          "  if not swapped: break",
          "  end -= 1",
          "  for i = end - 1 down to start:",
          "    if arr[i] > arr[i+1]: swap & swapped = true",
          "  start += 1"
        ],
        counting: [
          "maxVal = max(arr)",
          "count = array of size maxVal + 1 with 0",
          "for num in arr: count[num]++",
          "idx = 0",
          "for val = 0 to maxVal:",
          "  while count[val] > 0:",
          "    arr[idx++] = val, count[val]--"
        ],
        radix: [
          "maxVal = max(arr)",
          "exp = 1",
          "while maxVal / exp > 0:",
          "  countingSortByDigit(arr, exp)",
          "  exp *= 10"
        ]
      },

      // --- SEARCHING ALGORITHMS ---
      search: {
        linear: [
          "for i = 0 to n - 1:",
          "  compare arr[i] with target",
          "  if arr[i] == target: return i",
          "return -1 (Not Found)"
        ],
        binary: [
          "low = 0, high = n - 1",
          "while low <= high:",
          "  mid = floor((low + high) / 2)",
          "  if arr[mid] == target: return mid",
          "  else if arr[mid] < target: low = mid + 1",
          "  else: high = mid - 1",
          "return -1"
        ],
        interpolation: [
          "low = 0, high = n - 1",
          "while low <= high and target in range:",
          "  pos = low + floor((target - arr[low]) * (high - low) / (arr[high] - arr[low]))",
          "  if arr[pos] == target: return pos",
          "  if arr[pos] < target: low = pos + 1",
          "  else: high = pos - 1"
        ],
        exponential: [
          "if arr[0] == target: return 0",
          "i = 1",
          "while i < n and arr[i] <= target:",
          "  i *= 2",
          "return binarySearch(arr, i / 2, min(i, n - 1), target)"
        ],
        ternary: [
          "low = 0, high = n - 1",
          "while low <= high:",
          "  m1 = low + floor((high - low) / 3)",
          "  m2 = high - floor((high - low) / 3)",
          "  if arr[m1] == target: return m1",
          "  if arr[m2] == target: return m2",
          "  if target < arr[m1]: high = m1 - 1",
          "  else if target > arr[m2]: low = m2 + 1",
          "  else: low = m1 + 1, high = m2 - 1"
        ]
      },

      // --- GRAPH ALGORITHMS ---
      graph: {
        bfs: [
          "queue = [startNode], visited = {startNode}",
          "while queue is not empty:",
          "  node = queue.shift()",
          "  visitNode(node)",
          "  for neighbor in getNeighbors(node):",
          "    if neighbor not in visited:",
          "      visited.add(neighbor)",
          "      queue.push(neighbor)"
        ],
        dfs: [
          "stack = [startNode], visited = {}",
          "while stack is not empty:",
          "  node = stack.pop()",
          "  if node not in visited:",
          "    visited.add(node), visitNode(node)",
          "    for neighbor in getNeighbors(node):",
          "      if neighbor not in visited: stack.push(neighbor)"
        ],
        dijkstra: [
          "dist[start] = 0, dist[v] = infinity for others",
          "pq = PriorityQueue({ (0, start) })",
          "while pq is not empty:",
          "  (d, u) = pq.popMin()",
          "  visitNode(u)",
          "  for (v, weight) in getNeighbors(u):",
          "    if dist[u] + weight < dist[v]:",
          "      dist[v] = dist[u] + weight",
          "      parent[v] = u, pq.push((dist[v], v))"
        ],
        astar: [
          "gScore[start] = 0, fScore[start] = heuristic(start, target)",
          "openSet = { start }",
          "while openSet is not empty:",
          "  current = node in openSet with min fScore",
          "  if current == target: return reconstructPath()",
          "  openSet.remove(current)",
          "  for (neighbor, weight) in getNeighbors(current):",
          "    tentative_g = gScore[current] + weight",
          "    if tentative_g < gScore[neighbor]:",
          "      gScore[neighbor] = tentative_g",
          "      fScore[neighbor] = tentative_g + heuristic(neighbor, target)",
          "      openSet.add(neighbor)"
        ],
        bellman_ford: [
          "dist[start] = 0, all other dist = infinity",
          "for i = 1 to |V| - 1:",
          "  for edge (u, v, weight) in Edges:",
          "    if dist[u] + weight < dist[v]:",
          "      dist[v] = dist[u] + weight, parent[v] = u",
          "for edge (u, v, weight) in Edges:",
          "  if dist[u] + weight < dist[v]: report Negative Cycle!"
        ],
        prim: [
          "mst = [], visited = { startNode }",
          "pq = edges connected to startNode",
          "while pq is not empty and |visited| < |V|:",
          "  edge (u, v, w) = pq.popMinEdge()",
          "  if v not in visited:",
          "    visited.add(v), mst.push(edge)",
          "    add edges of v to pq"
        ],
        kruskal: [
          "sort all edges by weight ascending",
          "uf = DisjointSet(|V|)",
          "for edge (u, v, w) in sortedEdges:",
          "  if uf.find(u) != uf.find(v):",
          "    uf.union(u, v)",
          "    mst.push(edge)"
        ],
        toposort: [
          "inDegree = calculateInDegrees(graph)",
          "queue = [ nodes with inDegree == 0 ]",
          "topoOrder = []",
          "while queue is not empty:",
          "  u = queue.shift(), topoOrder.push(u)",
          "  for v in getNeighbors(u):",
          "    inDegree[v]--",
          "    if inDegree[v] == 0: queue.push(v)"
        ]
      },

      // --- GRID / MAZE ALGORITHMS ---
      grid: {
        bfs: [
          "queue = [startCell], visited = {startCell}",
          "while queue is not empty:",
          "  cell = queue.shift()",
          "  if cell == targetCell: return markPath()",
          "  for neighbor in getGridNeighbors(cell):",
          "    if neighbor not wall & not visited:",
          "      visited.add(neighbor), queue.push(neighbor)"
        ],
        dfs: [
          "stack = [startCell], visited = {}",
          "while stack is not empty:",
          "  cell = stack.pop()",
          "  if cell == targetCell: return markPath()",
          "  if cell not in visited:",
          "    visited.add(cell)",
          "    for neighbor in getGridNeighbors(cell):",
          "      stack.push(neighbor)"
        ],
        dijkstra: [
          "dist[startCell] = 0, pq = PriorityQueue()",
          "while pq is not empty:",
          "  cell = pq.popMin()",
          "  if cell == targetCell: return markPath()",
          "  for (neighbor, weight) in getGridNeighbors(cell):",
          "    if dist[cell] + weight < dist[neighbor]:",
          "      dist[neighbor] = dist[cell] + weight",
          "      pq.push(neighbor)"
        ],
        astar: [
          "gScore[start] = 0, fScore[start] = Manhattan(start, target)",
          "openSet = { startCell }",
          "while openSet is not empty:",
          "  curr = cell with min fScore in openSet",
          "  if curr == targetCell: return reconstructPath()",
          "  for neighbor in getGridNeighbors(curr):",
          "    if neighbor is wall: continue",
          "    tentative_g = gScore[curr] + stepCost",
          "    if tentative_g < gScore[neighbor]:",
          "      gScore[neighbor] = tentative_g",
          "      fScore[neighbor] = tentative_g + Manhattan(neighbor, target)",
          "      openSet.add(neighbor)"
        ]
      }
    };
  }

  getPseudocode(category, algorithm) {
    const catObj = this.pseudocodes[category] || this.pseudocodes.sort;
    return catObj[algorithm] || catObj.bubble || ["// Pseudocode unavailable"];
  }

  renderPseudocode(container, category, algorithm, algoTitle = "", titleElOverride = null) {
    if (!container) return;
    const lines = this.getPseudocode(category, algorithm);
    
    // Title label
    const titleEl = titleElOverride || document.getElementById("pseudocode-algo-title");
    if (titleEl && algoTitle) {
      titleEl.textContent = algoTitle;
    }

    container.innerHTML = "";
    lines.forEach((lineText, idx) => {
      const lineDiv = document.createElement("div");
      lineDiv.className = "pseudocode-line";
      lineDiv.dataset.line = idx + 1;
      
      const numSpan = document.createElement("span");
      numSpan.className = "pseudocode-line-num";
      numSpan.textContent = idx + 1;

      const codeSpan = document.createElement("span");
      codeSpan.className = "pseudocode-line-code";
      codeSpan.textContent = lineText;

      lineDiv.appendChild(numSpan);
      lineDiv.appendChild(codeSpan);
      container.appendChild(lineDiv);
    });
  }

  highlightLine(container, lineNumber) {
    if (!container) return;
    const lines = container.querySelectorAll(".pseudocode-line");
    lines.forEach((line) => {
      if (parseInt(line.dataset.line) === lineNumber) {
        line.classList.add("active");
        // Scroll inside container only, DO NOT use scrollIntoView to prevent page jump
        const lineTop = line.offsetTop;
        const lineH = line.clientHeight;
        const containerH = container.clientHeight;
        container.scrollTop = lineTop - containerH / 2 + lineH / 2;
      } else {
        line.classList.remove("active");
      }
    });
  }
}
