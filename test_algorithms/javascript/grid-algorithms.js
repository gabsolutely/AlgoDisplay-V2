// Grid Pathfinding Algorithms for AlgoDisplay Test Suite

/**
 * Grid BFS Pathfinding
 */
async function gridBFS(start, target, getGridNeighbors) {
    if (!start || !target) return null;
    const queue = [{ r: start.row, c: start.col }];
    const visited = new Set([`${start.row},${start.col}`]);
    const parent = {};

    while (queue.length > 0) {
        const curr = queue.shift();
        await visitGridCell(curr.r, curr.c, "visiting");

        if (curr.r === target.row && curr.c === target.col) {
            const path = [];
            let k = `${curr.r},${curr.c}`;
            while (parent[k]) {
                const [pr, pc] = parent[k].split(",");
                await visitGridCell(parseInt(pr), parseInt(pc), "path");
                path.unshift({ r: parseInt(pr), c: parseInt(pc) });
                k = parent[k];
            }
            return path;
        }

        const neighbors = getGridNeighbors(curr.r, curr.c);
        for (const n of neighbors) {
            const key = `${n.row},${n.col}`;
            if (!visited.has(key)) {
                visited.add(key);
                parent[key] = `${curr.r},${curr.c}`;
                queue.push({ r: n.row, c: n.col });
            }
        }
    }
    return null;
}

/**
 * Grid DFS Pathfinding
 */
async function gridDFS(start, target, getGridNeighbors) {
    if (!start || !target) return null;
    const visited = new Set();
    const parent = {};

    async function dfs(r, c) {
        const key = `${r},${c}`;
        if (visited.has(key)) return false;
        visited.add(key);
        await visitGridCell(r, c, "visiting");

        if (r === target.row && c === target.col) {
            let k = key;
            const path = [];
            while (parent[k]) {
                const [pr, pc] = parent[k].split(",");
                await visitGridCell(parseInt(pr), parseInt(pc), "path");
                path.unshift({ r: parseInt(pr), c: parseInt(pc) });
                k = parent[k];
            }
            return path;
        }

        const neighbors = getGridNeighbors(r, c);
        for (const n of neighbors) {
            const nk = `${n.row},${n.col}`;
            if (!parent[nk]) parent[nk] = key;
            const res = await dfs(n.row, n.col);
            if (res) return res;
        }
        return false;
    }

    return await dfs(start.row, start.col);
}

/**
 * Grid Dijkstra Pathfinding (Terrain-aware)
 */
async function gridDijkstra(start, target, getGridNeighbors) {
    if (!start || !target) return null;
    const dist = {};
    const parent = {};
    const sKey = `${start.row},${start.col}`;
    dist[sKey] = 0;

    const pq = [{ r: start.row, c: start.col, d: 0 }];

    while (pq.length > 0) {
        pq.sort((a, b) => a.d - b.d);
        const curr = pq.shift();
        const cKey = `${curr.r},${curr.c}`;

        if (curr.d > (dist[cKey] ?? Infinity)) continue;
        await visitGridCell(curr.r, curr.c, "visiting");

        if (curr.r === target.row && curr.c === target.col) {
            let k = cKey;
            const path = [];
            while (parent[k]) {
                const [pr, pc] = parent[k].split(",");
                await visitGridCell(parseInt(pr), parseInt(pc), "path");
                path.unshift({ r: parseInt(pr), c: parseInt(pc) });
                k = parent[k];
            }
            return { path, cost: curr.d };
        }

        const neighbors = getGridNeighbors(curr.r, curr.c);
        for (const n of neighbors) {
            const nKey = `${n.row},${n.col}`;
            const nd = curr.d + (n.weight ?? 1);
            if (nd < (dist[nKey] ?? Infinity)) {
                dist[nKey] = nd;
                parent[nKey] = cKey;
                pq.push({ r: n.row, c: n.col, d: nd });
            }
        }
    }
    return null;
}

/**
 * Grid A* Pathfinding (Terrain + Manhattan heuristic)
 */
async function gridAStar(start, target, getGridNeighbors) {
    if (!start || !target) return null;
    const h = (r, c) => Math.abs(r - target.row) + Math.abs(c - target.col);
    const openSet = new Set([`${start.row},${start.col}`]);
    const cameFrom = {};
    const gScore = {};
    const fScore = {};

    const sKey = `${start.row},${start.col}`;
    gScore[sKey] = 0;
    fScore[sKey] = h(start.row, start.col);

    while (openSet.size > 0) {
        let currKey = null;
        let currF = Infinity;

        for (const k of openSet) {
            const f = fScore[k] ?? Infinity;
            if (f < currF) {
                currF = f;
                currKey = k;
            }
        }

        if (!currKey) break;
        const [rs, cs] = currKey.split(",");
        const r = parseInt(rs);
        const c = parseInt(cs);

        await visitGridCell(r, c, "visiting");

        if (r === target.row && c === target.col) {
            let k = currKey;
            const path = [];
            while (cameFrom[k]) {
                const [pr, pc] = cameFrom[k].split(",");
                await visitGridCell(parseInt(pr), parseInt(pc), "path");
                path.unshift({ r: parseInt(pr), c: parseInt(pc) });
                k = cameFrom[k];
            }
            return { path, cost: gScore[currKey] };
        }

        openSet.delete(currKey);
        const neighbors = getGridNeighbors(r, c);

        for (const n of neighbors) {
            const nKey = `${n.row},${n.col}`;
            const tentative = (gScore[currKey] ?? Infinity) + (n.weight ?? 1);
            if (tentative < (gScore[nKey] ?? Infinity)) {
                cameFrom[nKey] = currKey;
                gScore[nKey] = tentative;
                fScore[nKey] = tentative + h(n.row, n.col);
                openSet.add(nKey);
            }
        }
    }
    return null;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gridBFS,
        gridDFS,
        gridDijkstra,
        gridAStar
    };
}
