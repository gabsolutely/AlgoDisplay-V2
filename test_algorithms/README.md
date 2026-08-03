# AlgoDisplay Test Suite

A comprehensive testing framework for the AlgoDisplay algorithm visualization platform. This test suite validates algorithm implementations in both JavaScript and Python, ensuring correctness, performance, and compatibility with the AlgoDisplay visualization API.

## Structure

```
test_algorithms/
├── javascript/              # JavaScript algorithm tests
│   ├── bubble-sort.js       # Bubble sort implementations
│   ├── selection-sort.js    # Selection sort implementations
│   ├── insertion-sort.js    # Insertion sort implementations
│   ├── test-runner.js       # JavaScript test framework
│   └── benchmark.js         # Performance benchmarking
├── python/                  # Python algorithm tests
│   ├── bubble_sort.py       # Bubble sort implementations
│   ├── selection_sort.py    # Selection sort implementations
│   ├── insertion_sort.py    # Insertion sort implementations
│   ├── test_runner.py       # Python test framework
│   └── benchmark.py         # Performance benchmarking
├── shared/                  # Shared utilities and data
│   ├── test_data.js         # Common test cases
│   ├── test_data.py         # Common test cases (Python)
│   └── utils.js             # Utility functions
├── package.json             # Node.js configuration
└── README.md                # This file
```

## Features

### Algorithm Implementations
- **Bubble Sort**: Standard, optimized, and statistics-tracking versions
- **Selection Sort**: Standard, with statistics, and with minimum tracking
- **Insertion Sort**: Standard, with logging, binary search, and statistics versions

### Testing Capabilities
- **Functional Testing**: Verifies algorithm correctness across multiple test cases
- **Performance Benchmarking**: Measures execution time, comparisons, and swaps
- **API Compatibility**: Ensures proper usage of AlgoDisplay visualization functions
- **Cross-Language Validation**: Compares JavaScript and Python implementations

### Test Cases
- Empty arrays
- Single-element arrays
- Already sorted arrays
- Reverse sorted arrays
- Random arrays with duplicates
- Arrays with all equal elements
- Nearly sorted arrays

## Quick Start

### JavaScript Tests

```bash
# Install Node.js dependencies (if any)
npm install

# Run all JavaScript tests
npm run test:js

# Run JavaScript benchmarks
npm run benchmark
```

### Python Tests

```bash
# Run all Python tests
npm run test:python

# Run Python benchmarks
npm run benchmark:python
```

### All Tests

```bash
# Run both JavaScript and Python tests
npm run test:all
```

## Algorithm Implementation Guidelines

### JavaScript Format
```javascript
async function algorithmName(arr) {
    // Use AlgoDisplay visualization functions
    await compare(i, j);
    await swap(arr, i, j);
    await renderArray(arr);
    await sleep(ms);
    log("message");
}
```

### Python Format
```python
async def algorithm_name(arr):
    # Use AlgoDisplay visualization functions
    await compare(i, j)
    await swap(arr, i, j)
    await render_array(arr)
    await sleep(ms)
    log("message")
```

### Required Functions
- `compare(i, j)`: Highlight elements for comparison
- `swap(arr, i, j)`: Swap elements with animation
- `renderArray(arr)` / `render_array(arr)`: Re-render the array
- `sleep(ms)`: Pause execution
- `log(message)`: Log messages

## Test Framework Features

### Mock Visualization Functions
The test framework provides mock implementations of all AlgoDisplay visualization functions:
- Tracks function calls and statistics
- Validates proper async/await usage
- Measures performance metrics
- Captures log messages

### Automated Test Execution
- Runs comprehensive test suites automatically
- Generates detailed performance reports
- Validates algorithm correctness
- Provides success/failure summaries

### Performance Benchmarking
- Measures execution time across different array sizes
- Tracks comparison and swap counts
- Compares algorithm efficiency
- Generates performance charts and tables

## Adding New Algorithms

### 1. Create Algorithm File
Create a new file in the appropriate language directory:

```javascript
// javascript/new-algorithm.js
async function newAlgorithm(arr) {
    // Implementation here
    await compare(i, j);
    await swap(arr, i, j);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { newAlgorithm };
}
```

```python
# python/new_algorithm.py
async def new_algorithm(arr):
    # Implementation here
    await compare(i, j)
    await swap(arr, i, j)
```

### 2. Add to Test Runner
Import and include the new algorithm in the test runner:

```javascript
// javascript/test-runner.js
const { newAlgorithm } = require('./new-algorithm.js');

const algorithms = [
    // ... existing algorithms
    { name: 'New Algorithm', func: newAlgorithm }
];
```

```python
# python/test_runner.py
from new_algorithm import new_algorithm

algorithms = [
    # ... existing algorithms
    ('New Algorithm', new_algorithm),
]
```

### 3. Run Tests
Execute the test suite to validate the new implementation.

## Performance Analysis

### Metrics Tracked
- **Execution Time**: Total algorithm runtime in milliseconds
- **Comparisons**: Number of element comparisons performed
- **Swaps**: Number of element exchanges executed
- **Memory Usage**: Peak memory consumption (when available)
- **Success Rate**: Percentage of test cases passed

### Benchmark Results
The test suite generates detailed performance reports including:
- Time complexity analysis
- Space complexity analysis
- Comparative performance between algorithms
- Scalability analysis across array sizes

## Troubleshooting

### Common Issues

#### "Algorithm not found"
- Ensure the algorithm file exists in the correct directory
- Check that the algorithm is properly exported/imported
- Verify function names match between files

#### "Async function required"
- All algorithm functions must be async
- Use `await` before visualization function calls
- Ensure proper async/await syntax

#### "Test failed: Array not sorted"
- Algorithm implementation may have bugs
- Check array manipulation logic
- Verify swap function usage

#### Performance issues
- Large test arrays may cause slow execution
- Consider reducing array size for testing
- Check for infinite loops

### Debug Mode
Enable detailed logging by modifying the test runner:
```javascript
// Set debug mode for verbose output
const DEBUG_MODE = true;
```

```python
# Set debug mode for verbose output
DEBUG_MODE = True
```

## Contributing

### Code Style
- Follow the existing code style and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Include proper error handling

### Test Coverage
- Ensure all edge cases are covered
- Add comprehensive test cases
- Validate both success and failure scenarios
- Include performance benchmarks

### Documentation
- Update README.md with new features
- Document algorithm implementations
- Add usage examples
- Include troubleshooting information

## License

This test suite is part of the AlgoDisplay project and follows the same license terms as the main project.

## Support

For issues, questions, or contributions:
1. Check the troubleshooting section
2. Review existing test cases
3. Run tests with debug mode enabled
4. Consult the main AlgoDisplay documentation
