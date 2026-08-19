// Graph Algorithms for AlgoDisplay Test Suite

/**
 * Breadth-First Search (BFS) on Graph
 */
async function graphBFS(nodes, startId, targetId, getNeighbors) {
    if (!nodes || nodes.length === 0) return null;
    const queue = [startId];
    const visited = new Set([startId]);
    const parent = {};

    while (queue.length > 0) {
        const current = queue.shift();
        await visitNode(current, "visiting");

        if (current === targetId) {
            const path = [];
            let c = current;
            while (c !== undefined) {
                path.unshift(c);
                c = parent[c];
            }
            await markPath(path);
            return path;
        }

        const neighbors = getNeighbors(current);
        for (const n of neighbors) {
            if (!visited.has(n.id)) {
                visited.add(n.id);
                parent[n.id] = current;
                queue.push(n.id);
            }
        }
    }
    return null;
}

/**
 * Depth-First Search (DFS) on Graph
 */
async function graphDFS(nodes, startId, targetId, getNeighbors) {
    if (!nodes || nodes.length === 0) return null;
    const visited = new Set();
    const parent = {};

    async function dfs(u) {
        visited.add(u);
        await visitNode(u, "visiting");

        if (u === targetId) {
            const path = [];
            let c = u;
            while (c !== undefined) {
                path.unshift(c);
                c = parent[c];
            }
            await markPath(path);
            return path;
        }

        const neighbors = getNeighbors(u);
        for (const n of neighbors) {
            if (!visited.has(n.id)) {
                parent[n.id] = u;
                const res = await dfs(n.id);
                if (res) return res;
            }
        }
        return null;
    }

    return await dfs(startId);
}

/**
 * Dijkstra's Shortest Path Algorithm
 */
async function graphDijkstra(nodes, startId, targetId, getNeighbors) {
    if (!nodes || nodes.length === 0) return null;
    const dist = {};
    const parent = {};
    const visited = new Set();

    nodes.forEach(n => dist[n.id] = Infinity);
    dist[startId] = 0;

    while (visited.size < nodes.length) {
        let minNode = null;
        let minDist = Infinity;

        nodes.forEach(n => {
            if (!visited.has(n.id) && dist[n.id] < minDist) {
                minDist = dist[n.id];
                minNode = n.id;
            }
        });

        if (minNode === null) break;
        visited.add(minNode);
        await visitNode(minNode, "visiting");

        if (minNode === targetId) {
            const path = [];
            let c = minNode;
            while (c !== undefined) {
                path.unshift(c);
                c = parent[c];
            }
            await markPath(path);
            return { path, distance: dist[targetId] };
        }

        const neighbors = getNeighbors(minNode);
        for (const n of neighbors) {
            if (dist[minNode] + n.weight < dist[n.id]) {
                dist[n.id] = dist[minNode] + n.weight;
                parent[n.id] = minNode;
            }
        }
    }

    return null;
}

/**
 * A* Search Algorithm on Graph
 */
async function graphAStar(nodes, startId, targetId, getNeighbors) {
    if (!nodes || nodes.length === 0) return null;
    const targetNode = nodes.find(n => n.id === targetId);
    if (!targetNode) return null;

    const heuristic = (nid) => {
        const n = nodes.find(x => x.id === nid);
        if (!n) return 0;
        // Euclidean distance scaled so h(n) <= true distance (admissible)
        return Math.hypot(n.x - targetNode.x, n.y - targetNode.y) / 100;
    };

    const openSet = new Set([startId]);
    const cameFrom = {};
    const gScore = {};
    const fScore = {};

    nodes.forEach(n => {
        gScore[n.id] = Infinity;
        fScore[n.id] = Infinity;
    });

    gScore[startId] = 0;
    fScore[startId] = heuristic(startId);

    while (openSet.size > 0) {
        let current = null;
        let minF = Infinity;

        for (const id of openSet) {
            if (fScore[id] < minF) {
                minF = fScore[id];
                current = id;
            }
        }

        if (current === null) break;
        await visitNode(current, "visiting");

        if (current === targetId) {
            const path = [];
            let c = current;
            while (c !== undefined) {
                path.unshift(c);
                c = cameFrom[c];
            }
            await markPath(path);
            return { path, cost: gScore[targetId] };
        }

        openSet.delete(current);
        const neighbors = getNeighbors(current);

        for (const n of neighbors) {
            const tentativeG = gScore[current] + n.weight;
            if (tentativeG < gScore[n.id]) {
                cameFrom[n.id] = current;
                gScore[n.id] = tentativeG;
                fScore[n.id] = tentativeG + heuristic(n.id);
                openSet.add(n.id);
            }
        }
    }

    return null;
}

/**
 * Bellman-Ford Shortest Path Algorithm
 */
async function graphBellmanFord(nodes, startId, targetId, getNeighbors) {
    if (!nodes || nodes.length === 0) return null;
    const dist = {};
    const parent = {};

    nodes.forEach(n => dist[n.id] = Infinity);
    dist[startId] = 0;

    for (let i = 0; i < nodes.length - 1; i++) {
        let updated = false;
        for (const u of nodes) {
            await visitNode(u.id, "visiting");
            for (const n of getNeighbors(u.id)) {
                if (dist[u.id] !== Infinity && dist[u.id] + n.weight < dist[n.id]) {
                    dist[n.id] = dist[u.id] + n.weight;
                    parent[n.id] = u.id;
                    updated = true;
                }
            }
        }
        if (!updated) break;
    }

    const path = [];
    let c = targetId;
    while (c !== undefined) {
        path.unshift(c);
        c = parent[c];
    }

    if (path[0] === startId) {
        await markPath(path);
        return { path, distance: dist[targetId] };
    }
    return null;
}

/**
 * Prim's Minimum Spanning Tree Algorithm
 */
async function graphPrim(nodes, startId, getNeighbors) {
    if (!nodes || nodes.length === 0) return null;
    const inMST = new Set();
    const key = {};

    nodes.forEach(n => key[n.id] = Infinity);
    key[startId] = 0;
    let totalCost = 0;

    for (let i = 0; i < nodes.length; i++) {
        let u = null;
        let minKey = Infinity;

        nodes.forEach(n => {
            if (!inMST.has(n.id) && key[n.id] < minKey) {
                minKey = key[n.id];
                u = n.id;
            }
        });

        if (u === null) break;
        inMST.add(u);
        if (minKey !== Infinity) totalCost += minKey;
        await visitNode(u, "visiting");

        for (const n of getNeighbors(u)) {
            if (!inMST.has(n.id) && n.weight < key[n.id]) {
                key[n.id] = n.weight;
            }
        }
    }

    await markPath([...inMST]);
    return { mstNodes: [...inMST], totalCost };
}

/**
 * Kruskal's Minimum Spanning Tree Algorithm
 */
async function graphKruskal(nodes, getNeighbors) {
    if (!nodes || nodes.length === 0) return null;
    const parent = {};
    nodes.forEach(n => parent[n.id] = n.id);

    const find = (x) => {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };

    const union = (a, b) => {
        const rootA = find(a);
        const rootB = find(b);
        if (rootA !== rootB) parent[rootA] = rootB;
    };

    const edgeArray = [];
    for (const u of nodes) {
        for (const n of getNeighbors(u.id)) {
            if (u.id < n.id) {
                edgeArray.push({ a: u.id, b: n.id, weight: n.weight });
            }
        }
    }

    edgeArray.sort((x, y) => x.weight - y.weight);
    let edgesCount = 0;
    let totalCost = 0;
    const mstNodes = new Set();

    for (const edge of edgeArray) {
        if (find(edge.a) !== find(edge.b)) {
            union(edge.a, edge.b);
            await visitNode(edge.a, "visiting");
            await visitNode(edge.b, "visiting");
            mstNodes.add(edge.a);
            mstNodes.add(edge.b);
            totalCost += edge.weight;
            edgesCount++;
            if (edgesCount >= nodes.length - 1) break;
        }
    }

    await markPath([...mstNodes]);
    return { mstNodes: [...mstNodes], totalCost };
}

/**
 * Topological Sort Algorithm (Kahn's Algorithm for DAGs)
 */
async function graphToposort(nodes, getNeighbors) {
    if (!nodes || nodes.length === 0) return [];
    const inDegree = {};
    nodes.forEach(n => inDegree[n.id] = 0);

    for (const u of nodes) {
        for (const n of getNeighbors(u.id)) {
            inDegree[n.id] = (inDegree[n.id] || 0) + 1;
        }
    }

    const queue = nodes.filter(n => (inDegree[n.id] || 0) === 0).map(n => n.id);
    const order = [];

    while (queue.length > 0) {
        const u = queue.shift();
        order.push(u);
        await visitNode(u, "visiting");

        for (const n of getNeighbors(u)) {
            inDegree[n.id]--;
            if (inDegree[n.id] === 0) {
                queue.push(n.id);
            }
        }
    }

    return order;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        graphBFS,
        graphDFS,
        graphDijkstra,
        graphAStar,
        graphBellmanFord,
        graphPrim,
        graphKruskal,
        graphToposort
    };
}
