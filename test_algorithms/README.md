# AlgoDisplay Test Suite

A testing and benchmarking framework for the AlgoDisplay algorithm visualization platform. This test suite validates algorithm implementations across JavaScript and Python, covering sorting, searching, graph traversal, and grid pathfinding.

## Structure

```
test_algorithms/
├── javascript/                  # JavaScript algorithm test implementations
│   ├── bubble-sort.js           # Bubble Sort variants
│   ├── selection-sort.js        # Selection Sort variants
│   ├── insertion-sort.js        # Insertion Sort variants
│   ├── merge-sort.js            # Merge Sort variants
│   ├── quick-sort.js            # Quick Sort variants
│   ├── heap-sort.js             # Heap Sort variants
│   ├── shell-sort.js            # Shell Sort variants
│   ├── cocktail-sort.js         # Cocktail Shaker Sort
│   ├── counting-sort.js         # Counting Sort
│   ├── radix-sort.js            # Radix Sort (LSD)
│   ├── search-algorithms.js     # Linear, Binary, Interpolation, Exponential, Ternary Search
│   ├── graph-algorithms.js      # BFS, DFS, Dijkstra, A*, Bellman-Ford, Prim, Kruskal, TopoSort
│   ├── grid-algorithms.js       # Grid BFS, DFS, Dijkstra, A*
│   ├── test-runner.js           # Main JavaScript test runner
│   └── benchmark.js             # Performance benchmarking
├── python/                      # Python algorithm test implementations
│   ├── bubble_sort.py           # Bubble Sort variants
│   ├── selection_sort.py        # Selection Sort variants
│   ├── insertion_sort.py        # Insertion Sort variants
│   ├── merge_sort.py            # Merge Sort variants
│   ├── quick_sort.py            # Quick Sort variants
│   ├── heap_sort.py             # Heap Sort variants
│   ├── shell_sort.py            # Shell Sort variants
│   ├── cocktail_sort.py         # Cocktail Shaker Sort
│   ├── counting_sort.py         # Counting Sort
│   ├── radix_sort.py            # Radix Sort (LSD)
│   ├── search_algorithms.py     # Search algorithms in Python
│   ├── test_runner.py           # Main Python test runner
│   └── benchmark.py             # Python benchmarks
├── shared/                      # Shared test datasets
│   ├── test_data.js             # Common JavaScript test datasets
│   └── test_data.py             # Common Python test datasets
├── package.json                 # Node.js test configuration
└── README.md                    # Test suite documentation
```

## Supported Algorithms Tested

### 1. Sorting Algorithms
- Bubble Sort (Standard, Optimized, Early Exit)
- Selection Sort (Standard, Minimum Tracking, Bidirectional)
- Insertion Sort (Standard, Binary Insertion, Two-Way)
- Merge Sort (Top-Down, Bottom-Up, In-Place)
- Quick Sort (Lomuto, Randomized, Median-of-Three, Three-Way, Iterative)
- Heap Sort (Max Heap, Min Heap, Iterative, Bottom-Up)
- Shell Sort (Standard, Knuth Sequence)
- Cocktail Shaker Sort
- Counting Sort
- Radix Sort (Least Significant Digit)

### 2. Searching Algorithms
- Linear Search
- Binary Search
- Interpolation Search
- Exponential Search
- Ternary Search

### 3. Graph Algorithms
- Breadth-First Search (BFS)
- Depth-First Search (DFS)
- Dijkstra's Shortest Path
- A* Search (Heuristic Shortest Path)
- Bellman-Ford Algorithm
- Prim's Minimum Spanning Tree (MST)
- Kruskal's Minimum Spanning Tree (MST)
- Topological Sort (Kahn's Algorithm for DAGs)

### 4. Grid Pathfinding
- Grid BFS
- Grid DFS
- Grid Dijkstra (Terrain cost-aware)
- Grid A* Search (Manhattan distance heuristic)

## Running Tests

### JavaScript Tests
```bash
# Run JavaScript test suite
node test_algorithms/javascript/test-runner.js

# Run search tests
node test_algorithms/javascript/search-test.js

# Run benchmarks
node test_algorithms/javascript/benchmark.js
```

### Python Tests
```bash
# Run Python test runner
python test_algorithms/python/test_runner.py

# Run Python benchmarks
python test_algorithms/python/benchmark.py
```
