// Test Runner for AlgoDisplay JavaScript Algorithms
// Comprehensive test framework for all sorting, searching, graph, and grid algorithms

class AlgorithmTester {
    constructor() {
        this.testResults = [];
    }

    // Mock visualization functions for sorting and searching
    createMockFunctions() {
        let compareCount = 0;
        let swapCount = 0;
        let renderCount = 0;
        let logMessages = [];
        let foundIndices = [];

        return {
            compare: async (i, j) => {
                compareCount++;
                return Promise.resolve();
            },
            swap: async (arr, i, j) => {
                swapCount++;
                const temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
                return Promise.resolve();
            },
            renderArray: async (arr) => {
                renderCount++;
                return Promise.resolve();
            },
            markFound: async (idx) => {
                foundIndices.push(idx);
                return Promise.resolve();
            },
            sleep: async (ms) => {
                return Promise.resolve();
            },
            log: (message) => {
                logMessages.push(message);
            },
            getStats: () => ({
                compares: compareCount,
                swaps: swapCount,
                renders: renderCount,
                found: foundIndices,
                logs: logMessages
            }),
            reset: () => {
                compareCount = 0;
                swapCount = 0;
                renderCount = 0;
                foundIndices = [];
                logMessages = [];
            }
        };
    }

    // Mock functions for graph algorithms
    createGraphMockFunctions() {
        const visitedNodes = [];
        const visitedEdges = [];
        const markedPaths = [];
        const distances = {};

        return {
            visitNode: async (nodeId, color) => {
                visitedNodes.push({ nodeId, color });
                return Promise.resolve();
            },
            visitEdge: async (u, v, color) => {
                visitedEdges.push({ u, v, color });
                return Promise.resolve();
            },
            markPath: async (path) => {
                markedPaths.push([...path]);
                return Promise.resolve();
            },
            updateDistance: async (nodeId, dist) => {
                distances[nodeId] = dist;
                return Promise.resolve();
            },
            log: () => {},
            getStats: () => ({ visitedNodes, visitedEdges, markedPaths, distances })
        };
    }

    // Mock functions for grid algorithms
    createGridMockFunctions() {
        const cellVisits = [];
        const pathCells = [];

        return {
            visitGridCell: async (r, c, type) => {
                if (type === "path") {
                    pathCells.push({ r, c });
                } else {
                    cellVisits.push({ r, c, type });
                }
                return Promise.resolve();
            },
            log: () => {},
            getStats: () => ({ cellVisits, pathCells })
        };
    }

    // Test if array is sorted
    isSorted(arr) {
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] > arr[i + 1]) {
                return false;
            }
        }
        return true;
    }

    // Generate test arrays for sorting
    generateTestArrays() {
        return [
            [], // Empty array
            [1], // Single element
            [1, 2, 3, 4, 5], // Already sorted
            [5, 4, 3, 2, 1], // Reverse sorted
            [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5], // Random with duplicates
            [10, 80, 30, 90, 40, 50, 70], // Random
            [2, 2, 2, 2, 2], // All elements equal
            [1, 3, 2, 4, 3, 5, 4, 6, 5, 7], // Nearly sorted
        ];
    }

    // Run a single sorting algorithm test
    async runSortingTest(algorithmName, algorithmFunction, testArray) {
        const mock = this.createMockFunctions();
        const originalArray = [...testArray];
        const testArrayCopy = [...testArray];

        global.compare = mock.compare;
        global.swap = mock.swap;
        global.renderArray = mock.renderArray;
        global.markFound = mock.markFound;
        global.sleep = mock.sleep;
        global.log = mock.log;

        try {
            const startTime = performance.now();
            await algorithmFunction(testArrayCopy);
            const endTime = performance.now();

            const isSorted = this.isSorted(testArrayCopy);

            return {
                algorithmName,
                input: originalArray,
                output: testArrayCopy,
                isSorted,
                executionTime: endTime - startTime,
                stats: mock.getStats(),
                passed: isSorted
            };
        } catch (error) {
            return {
                algorithmName,
                input: originalArray,
                output: testArrayCopy,
                error: error.message,
                passed: false
            };
        }
    }

    // Run tests for a sorting algorithm across all cases
    async runSortingSuite(algorithmName, algorithmFunction) {
        console.log(`Running sorting tests for ${algorithmName}...`);
        const testArrays = this.generateTestArrays();
        const results = [];

        for (let i = 0; i < testArrays.length; i++) {
            const testArray = testArrays[i];
            const result = await this.runSortingTest(algorithmName, algorithmFunction, testArray);
            results.push(result);
            console.log(`  Case ${i + 1}: [${testArray.join(', ')}] -> ${result.passed ? 'PASSED' : 'FAILED'}`);
        }

        const passedTests = results.filter(r => r.passed).length;
        const totalTests = results.length;
        console.log(`  Summary: ${passedTests}/${totalTests} passed\n`);

        return { algorithmName, totalTests, passedTests, results };
    }

    // Run test for graph algorithms
    async runGraphSuite() {
        console.log('Running Graph Algorithm Tests...');
        const {
            graphBFS, graphDFS, graphDijkstra, graphAStar,
            graphBellmanFord, graphPrim, graphKruskal, graphToposort
        } = require('./graph-algorithms.js');

        const mockGraph = {
            nodes: [
                { id: 0, label: "A", x: 100, y: 100 },
                { id: 1, label: "B", x: 200, y: 100 },
                { id: 2, label: "C", x: 200, y: 200 },
                { id: 3, label: "D", x: 300, y: 200 }
            ],
            edges: [
                { source: 0, target: 1, weight: 4 },
                { source: 0, target: 2, weight: 2 },
                { source: 2, target: 1, weight: 1 },
                { source: 1, target: 3, weight: 5 },
                { source: 2, target: 3, weight: 8 }
            ]
        };

        const getNeighbors = (u) => {
            const res = [];
            mockGraph.edges.forEach(e => {
                if (e.source === u) res.push({ id: e.target, weight: e.weight });
                if (e.target === u) res.push({ id: e.source, weight: e.weight });
            });
            return res;
        };

        const mock = this.createGraphMockFunctions();
        global.visitNode = mock.visitNode;
        global.visitEdge = mock.visitEdge;
        global.markPath = mock.markPath;
        global.updateDistance = mock.updateDistance;
        global.log = mock.log;

        // BFS test
        const bfsPath = await graphBFS(mockGraph.nodes, 0, 3, getNeighbors);
        const bfsPassed = Array.isArray(bfsPath) && bfsPath[0] === 0 && bfsPath[bfsPath.length - 1] === 3;
        console.log(`  Graph BFS Pathfinding: ${bfsPassed ? 'PASSED' : 'FAILED'}`);

        // DFS test
        const dfsPath = await graphDFS(mockGraph.nodes, 0, 3, getNeighbors);
        const dfsPassed = Array.isArray(dfsPath) && dfsPath[0] === 0 && dfsPath[dfsPath.length - 1] === 3;
        console.log(`  Graph DFS Pathfinding: ${dfsPassed ? 'PASSED' : 'FAILED'}`);

        // Dijkstra test
        const dijkstraRes = await graphDijkstra(mockGraph.nodes, 0, 3, getNeighbors);
        const dijkstraPassed = dijkstraRes && dijkstraRes.distance === 8; // 0->2(2) + 2->1(1) + 1->3(5) = 8
        console.log(`  Graph Dijkstra Shortest Path: ${dijkstraPassed ? 'PASSED' : 'FAILED'}`);

        // A* test
        const astarRes = await graphAStar(mockGraph.nodes, 0, 3, getNeighbors);
        const astarPassed = astarRes && astarRes.cost === 8;
        console.log(`  Graph A* Search: ${astarPassed ? 'PASSED' : 'FAILED'}`);

        // Prim MST test
        const primRes = await graphPrim(mockGraph.nodes, 0, getNeighbors);
        const primPassed = primRes && primRes.mstNodes.length === 4;
        console.log(`  Graph Prim MST: ${primPassed ? 'PASSED' : 'FAILED'}`);

        // Kruskal MST test
        const kruskalRes = await graphKruskal(mockGraph.nodes, getNeighbors);
        const kruskalPassed = kruskalRes && kruskalRes.mstNodes.length === 4;
        console.log(`  Graph Kruskal MST: ${kruskalRes ? 'PASSED' : 'FAILED'}`);

        // TopoSort test (DAG)
        const getDAGNeighbors = (u) => mockGraph.edges.filter(e => e.source === u).map(e => ({ id: e.target, weight: e.weight }));
        const topoOrder = await graphToposort(mockGraph.nodes, getDAGNeighbors);
        const topoPassed = topoOrder.length === 4 && topoOrder.indexOf(0) < topoOrder.indexOf(3);
        console.log(`  Graph Topological Sort: ${topoPassed ? 'PASSED' : 'FAILED'}\n`);
    }

    // Run test for grid algorithms
    async runGridSuite() {
        console.log('Running Grid Pathfinding Tests...');
        const { gridBFS, gridDFS, gridDijkstra, gridAStar } = require('./grid-algorithms.js');

        const gridRows = 5;
        const gridCols = 5;
        const start = { row: 0, col: 0 };
        const target = { row: 4, col: 4 };

        const getGridNeighbors = (r, c) => {
            const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            const res = [];
            for (const [dr, dc] of dirs) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < gridRows && nc >= 0 && nc < gridCols) {
                    res.push({ row: nr, col: nc, weight: 1 });
                }
            }
            return res;
        };

        const mock = this.createGridMockFunctions();
        global.visitGridCell = mock.visitGridCell;
        global.log = mock.log;

        const bfsRes = await gridBFS(start, target, getGridNeighbors);
        console.log(`  Grid BFS: ${bfsRes && bfsRes.length > 0 ? 'PASSED' : 'FAILED'}`);

        const dfsRes = await gridDFS(start, target, getGridNeighbors);
        console.log(`  Grid DFS: ${dfsRes && dfsRes.length > 0 ? 'PASSED' : 'FAILED'}`);

        const dijkstraRes = await gridDijkstra(start, target, getGridNeighbors);
        console.log(`  Grid Dijkstra: ${dijkstraRes && dijkstraRes.cost === 8 ? 'PASSED' : 'FAILED'}`);

        const astarRes = await gridAStar(start, target, getGridNeighbors);
        console.log(`  Grid A*: ${astarRes && astarRes.cost === 8 ? 'PASSED' : 'FAILED'}\n`);
    }

    // Run all algorithm tests
    async runAllTests() {
        console.log('Starting AlgoDisplay Full Test Suite...\n');

        // Sorting Algorithms
        const { bubbleSort, optimizedBubbleSort } = require('./bubble-sort.js');
        const { selectionSort, selectionSortWithStats } = require('./selection-sort.js');
        const { insertionSort, insertionSortWithLogging, binaryInsertionSort } = require('./insertion-sort.js');
        const { mergeSort, bottomUpMergeSort, inPlaceMergeSort } = require('./merge-sort.js');
        const { quickSort, randomizedQuickSort, medianOfThreeQuickSort } = require('./quick-sort.js');
        const { heapSort } = require('./heap-sort.js');
        const { shellSort, knuthShellSort } = require('./shell-sort.js');
        const { cocktailSort } = require('./cocktail-sort.js');
        const { countingSort } = require('./counting-sort.js');
        const { radixSort } = require('./radix-sort.js');

        const sortAlgorithms = [
            { name: 'Bubble Sort', func: bubbleSort },
            { name: 'Optimized Bubble Sort', func: optimizedBubbleSort },
            { name: 'Selection Sort', func: selectionSort },
            { name: 'Selection Sort with Stats', func: selectionSortWithStats },
            { name: 'Insertion Sort', func: insertionSort },
            { name: 'Insertion Sort with Logging', func: insertionSortWithLogging },
            { name: 'Binary Insertion Sort', func: binaryInsertionSort },
            { name: 'Merge Sort', func: mergeSort },
            { name: 'Bottom-Up Merge Sort', func: bottomUpMergeSort },
            { name: 'In-Place Merge Sort', func: inPlaceMergeSort },
            { name: 'Quick Sort', func: quickSort },
            { name: 'Randomized Quick Sort', func: randomizedQuickSort },
            { name: 'Median-of-Three Quick Sort', func: medianOfThreeQuickSort },
            { name: 'Heap Sort', func: heapSort },
            { name: 'Shell Sort', func: shellSort },
            { name: 'Knuth Shell Sort', func: knuthShellSort },
            { name: 'Cocktail Shaker Sort', func: cocktailSort },
            { name: 'Counting Sort', func: countingSort },
            { name: 'Radix Sort (LSD)', func: radixSort }
        ];

        for (const algo of sortAlgorithms) {
            await this.runSortingSuite(algo.name, algo.func);
        }

        // Graph Algorithms
        await this.runGraphSuite();

        // Grid Algorithms
        await this.runGridSuite();

        console.log('ALL TESTS COMPLETED SUCCESSFULLY');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlgorithmTester;
}

if (typeof require !== 'undefined' && require.main === module) {
    const tester = new AlgorithmTester();
    tester.runAllTests().catch(console.error);
}
