// Search Algorithm Test Runner for AlgoDisplay
// This file provides a testing framework for search algorithm implementations

const { 
    linearSearch, 
    binarySearch, 
    jumpSearch, 
    interpolationSearch, 
    exponentialSearch, 
    fibonacciSearch,
    searchWithVisualization,
    compareSearchAlgorithms
} = require('./search-algorithms.js');

class SearchAlgorithmTester {
    constructor() {
        this.testResults = [];
        this.currentTest = null;
    }

    // Mock visualization functions for testing
    createMockFunctions() {
        let compareCount = 0;
        let logMessages = [];

        return {
            compare: async (i, j) => {
                compareCount++;
                return Promise.resolve();
            },
            swap: async (arr, i, j) => {
                const temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
                return Promise.resolve();
            },
            renderArray: async (arr) => {
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
                logs: logMessages
            }),
            reset: () => {
                compareCount = 0;
                logMessages = [];
            }
        };
    }

    // Generate test arrays for searching
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
            [1, 2, 3, 5, 8, 13, 21, 34, 55, 89], // Fibonacci sequence
            [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] // Multiples of 10
        ];
    }

    // Generate test targets
    generateTestTargets() {
        return [
            1,  // First element
            5,  // Middle element
            10, // Last element (in some arrays)
            25, // Not present
            90, // Present in some arrays
            99, // Not present
            0,  // Not present (below range)
            100 // Not present (above range)
        ];
    }

    // Run a single search algorithm test
    async runSearchTest(algorithmName, searchFunction, testArray, target) {
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
            const result = await searchFunction(testArrayCopy, target);
            const endTime = performance.now();

            const stats = mock.getStats();
            const expectedResult = originalArray.indexOf(target);
            const passed = result === expectedResult;

            return {
                algorithmName,
                input: originalArray,
                target: target,
                output: result,
                expected: expectedResult,
                isCorrect: passed,
                executionTime: endTime - startTime,
                stats,
                passed
            };
        } catch (error) {
            return {
                algorithmName,
                input: originalArray,
                target: target,
                output: -1,
                expected: originalArray.indexOf(target),
                error: error.message,
                passed: false
            };
        }
    }

    // Run comprehensive tests for a search algorithm
    async runComprehensiveSearchTest(algorithmName, searchFunction) {
        console.log(`Running tests for ${algorithmName}...`);
        const testArrays = this.generateTestArrays();
        const testTargets = this.generateTestTargets();
        const results = [];

        let testCount = 0;
        for (const testArray of testArrays) {
            for (const target of testTargets) {
                testCount++;
                console.log(`Test ${testCount}: Searching for ${target} in [${testArray.join(', ')}]`);
                
                const result = await this.runSearchTest(algorithmName, searchFunction, testArray, target);
                results.push(result);
                
                console.log(`Result: ${result.passed ? 'PASSED' : 'FAILED'}`);
                if (!result.passed) {
                    console.log(`Error: ${result.error || `Expected ${result.expected}, got ${result.output}`}`);
                }
                console.log(`Stats: ${result.stats.compares} comparisons`);
                console.log(`Time: ${result.executionTime.toFixed(2)}ms`);
                console.log('---');
            }
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

    // Run all search algorithm tests
    async runAllSearchTests() {
        console.log('Starting AlgoDisplay JavaScript Search Algorithm Tests...\n');

        const algorithms = [
            { name: 'Linear Search', func: linearSearch },
            { name: 'Binary Search', func: binarySearch },
            { name: 'Jump Search', func: jumpSearch },
            { name: 'Interpolation Search', func: interpolationSearch },
            { name: 'Exponential Search', func: exponentialSearch },
            { name: 'Fibonacci Search', func: fibonacciSearch }
        ];

        const allResults = [];

        for (const algorithm of algorithms) {
            const result = await this.runComprehensiveSearchTest(algorithm.name, algorithm.func);
            allResults.push(result);
            console.log('\n' + '='.repeat(50) + '\n');
        }

        // Final summary
        console.log('FINAL SEARCH TEST SUMMARY');
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

    // Test search algorithm performance
    async runSearchPerformanceTest() {
        console.log('Running Search Algorithm Performance Tests...\n');

        // Generate large sorted arrays for performance testing
        const sizes = [100, 500, 1000, 5000];
        const results = {};

        for (const size of sizes) {
            const sortedArray = Array.from({length: size}, (_, i) => i * 2 + 1);
            const targets = [1, size, size * 2 + 1, -1]; // First, last, not present, below range

            console.log(`\nTesting with array size: ${size}`);
            console.log('-'.repeat(30));

            results[size] = {};

            for (const algorithm of [
                { name: 'Linear Search', func: linearSearch },
                { name: 'Binary Search', func: binarySearch },
                { name: 'Jump Search', func: jumpSearch },
                { name: 'Interpolation Search', func: interpolationSearch },
                { name: 'Exponential Search', func: exponentialSearch },
                { name: 'Fibonacci Search', func: fibonacciSearch }
            ]) {
                const algorithmResults = [];

                for (const target of targets) {
                    const result = await this.runSearchTest(algorithm.name, algorithm.func, sortedArray, target);
                    algorithmResults.push(result);
                }

                const avgTime = algorithmResults.reduce((sum, r) => sum + r.executionTime, 0) / algorithmResults.length;
                const avgComparisons = algorithmResults.reduce((sum, r) => sum + r.stats.compares, 0) / algorithmResults.length;

                results[size][algorithm.name] = {
                    avgTime: avgTime.toFixed(2),
                    avgComparisons: avgComparisons.toFixed(1)
                };

                console.log(`${algorithm.name}: ${avgTime.toFixed(2)}ms avg, ${avgComparisons.toFixed(1)} avg comparisons`);
            }
        }

        return results;
    }
}

// Main execution
async function runSearchTests() {
    const tester = new SearchAlgorithmTester();
    
    // Run functional tests
    await tester.runAllSearchTests();
    
    // Run performance tests
    await tester.runSearchPerformanceTest();
}

// Run tests if this file is executed directly
if (require.main === module) {
    runSearchTests().catch(console.error);
}

module.exports = { SearchAlgorithmTester, runSearchTests };
