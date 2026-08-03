// Test Runner for AlgoDisplay JavaScript Algorithms
// This file provides a testing framework for algorithm implementations

class AlgorithmTester {
    constructor() {
        this.testResults = [];
        this.currentTest = null;
    }

    // Mock visualization functions for testing
    createMockFunctions() {
        let compareCount = 0;
        let swapCount = 0;
        let renderCount = 0;
        let logMessages = [];

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
            sleep: async (ms) => {
                return new Promise(resolve => setTimeout(resolve, ms));
            },
            log: (message) => {
                logMessages.push(message);
            },
            getStats: () => ({
                compares: compareCount,
                swaps: swapCount,
                renders: renderCount,
                logs: logMessages
            }),
            reset: () => {
                compareCount = 0;
                swapCount = 0;
                renderCount = 0;
                logMessages = [];
            }
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

    // Generate test arrays
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

    // Run a single algorithm test
    async runAlgorithmTest(algorithmName, algorithmFunction, testArray) {
        const mock = this.createMockFunctions();
        const originalArray = [...testArray];
        const testArrayCopy = [...testArray];

        // Set up global functions for algorithm
        global.compare = mock.compare;
        global.swap = mock.swap;
        global.renderArray = mock.renderArray;
        global.sleep = mock.sleep;
        global.log = mock.log;

        try {
            const startTime = performance.now();
            await algorithmFunction(testArrayCopy);
            const endTime = performance.now();

            const stats = mock.getStats();
            const isSorted = this.isSorted(testArrayCopy);

            return {
                algorithmName,
                input: originalArray,
                output: testArrayCopy,
                isSorted,
                executionTime: endTime - startTime,
                stats,
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

    // Run comprehensive tests for an algorithm
    async runComprehensiveTest(algorithmName, algorithmFunction) {
        console.log(`Running tests for ${algorithmName}...`);
        const testArrays = this.generateTestArrays();
        const results = [];

        for (let i = 0; i < testArrays.length; i++) {
            const testArray = testArrays[i];
            console.log(`Test ${i + 1}: [${testArray.join(', ')}]`);
            
            const result = await this.runAlgorithmTest(algorithmName, algorithmFunction, testArray);
            results.push(result);
            
            console.log(`Result: ${result.passed ? 'PASSED' : 'FAILED'}`);
            if (!result.passed) {
                console.log(`Error: ${result.error || 'Array not sorted'}`);
            }
            console.log(`Stats: ${result.stats.compares} compares, ${result.stats.swaps} swaps, ${result.stats.renders} renders`);
            console.log(`Time: ${result.executionTime.toFixed(2)}ms`);
            console.log('---');
        }

        const passedTests = results.filter(r => r.passed).length;
        const totalTests = results.length;
        
        console.log(`\n${algorithmName} Summary: ${passedTests}/${totalTests} tests passed`);

        return {
            algorithmName,
            totalTests,
            passedTests,
            results
        };
    }

    // Run all algorithm tests
    async runAllTests() {
        console.log('Starting AlgoDisplay JavaScript Algorithm Tests...\n');

        // Import algorithm functions
        const { bubbleSort, optimizedBubbleSort } = require('./bubble-sort.js');
        const { selectionSort, selectionSortWithStats } = require('./selection-sort.js');
        const { insertionSort, insertionSortWithLogging, binaryInsertionSort } = require('./insertion-sort.js');
        const { mergeSort, bottomUpMergeSort, inPlaceMergeSort, mergeSortWithLogging } = require('./merge-sort.js');
        const { quickSort, randomizedQuickSort, medianOfThreeQuickSort, iterativeQuickSort, quickSortWithStats, threeWayQuickSort } = require('./quick-sort.js');
        const { heapSort, heapSortWithLogging, minHeapSort, heapSortWithStats, iterativeHeapSort } = require('./heap-sort.js');

        const algorithms = [
            // Basic Sorting Algorithms
            { name: 'Bubble Sort', func: bubbleSort },
            { name: 'Optimized Bubble Sort', func: optimizedBubbleSort },
            { name: 'Selection Sort', func: selectionSort },
            { name: 'Selection Sort with Stats', func: selectionSortWithStats },
            { name: 'Insertion Sort', func: insertionSort },
            { name: 'Insertion Sort with Logging', func: insertionSortWithLogging },
            { name: 'Binary Insertion Sort', func: binaryInsertionSort },
            
            // Advanced Sorting Algorithms
            { name: 'Merge Sort', func: mergeSort },
            { name: 'Bottom-up Merge Sort', func: bottomUpMergeSort },
            { name: 'In-place Merge Sort', func: inPlaceMergeSort },
            { name: 'Merge Sort with Logging', func: mergeSortWithLogging },
            
            { name: 'Quick Sort', func: quickSort },
            { name: 'Randomized Quick Sort', func: randomizedQuickSort },
            { name: 'Median-of-Three Quick Sort', func: medianOfThreeQuickSort },
            { name: 'Iterative Quick Sort', func: iterativeQuickSort },
            { name: 'Quick Sort with Stats', func: quickSortWithStats },
            { name: 'Three-Way Quick Sort', func: threeWayQuickSort },
            
            { name: 'Heap Sort', func: heapSort },
            { name: 'Heap Sort with Logging', func: heapSortWithLogging },
            { name: 'Min Heap Sort', func: minHeapSort },
            { name: 'Heap Sort with Stats', func: heapSortWithStats },
            { name: 'Iterative Heap Sort', func: iterativeHeapSort }
        ];

        const allResults = [];

        for (const algorithm of algorithms) {
            const result = await this.runComprehensiveTest(algorithm.name, algorithm.func);
            allResults.push(result);
            console.log('\n' + '='.repeat(50) + '\n');
        }

        // Final summary
        console.log('FINAL TEST SUMMARY');
        console.log('='.repeat(50));
        
        let totalPassed = 0;
        let totalTests = 0;

        for (const result of allResults) {
            console.log(`${result.algorithmName}: ${result.passedTests}/${result.totalTests} tests passed`);
            totalPassed += result.passedTests;
            totalTests += result.totalTests;
        }

        console.log(`\nOverall: ${totalPassed}/${totalTests} tests passed`);
        console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

        return allResults;
    }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlgorithmTester;
} else {
    window.AlgorithmTester = AlgorithmTester;
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    const tester = new AlgorithmTester();
    tester.runAllTests().catch(console.error);
}
