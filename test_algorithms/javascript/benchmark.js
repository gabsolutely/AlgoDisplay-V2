// Performance Benchmark Suite for AlgoDisplay JavaScript Algorithms
// This file provides comprehensive performance testing and analysis

const { generateRandomArray, generateSortedArray, PERFORMANCE_SIZES } = require('../shared/test_data.js');

class PerformanceBenchmark {
    constructor() {
        this.results = [];
        this.algorithms = [];
    }

    addAlgorithm(name, func) {
        this.algorithms.push({ name, func });
    }

    async benchmarkAlgorithm(name, func, size, testArray = null) {
        // Generate test array if not provided
        const arr = testArray || generateRandomArray(size);
        
        // Create mock functions for performance tracking
        let compareCount = 0;
        let swapCount = 0;
        let renderCount = 0;

        const mockFunctions = {
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
                return Promise.resolve();
            },
            log: (message) => {
                // Silent during benchmarking
            }
        };

        // Set up global functions
        global.compare = mockFunctions.compare;
        global.swap = mockFunctions.swap;
        global.renderArray = mockFunctions.renderArray;
        global.sleep = mockFunctions.sleep;
        global.log = mockFunctions.log;

        try {
            const startTime = performance.now();
            await func([...arr]); // Use copy to preserve original
            const endTime = performance.now();

            return {
                algorithm: name,
                size: size,
                time: endTime - startTime,
                compares: compareCount,
                swaps: swapCount,
                renders: renderCount,
                success: true
            };
        } catch (error) {
            return {
                algorithm: name,
                size: size,
                error: error.message,
                success: false
            };
        }
    }

    async runBenchmarkSuite(sizes = PERFORMANCE_SIZES) {
        console.log('Running Performance Benchmarks...');
        console.log('='.repeat(80));
        
        const results = {};

        for (const { name, func } of this.algorithms) {
            console.log(`\nBenchmarking ${name}...`);
            results[name] = [];
            
            for (const size of sizes) {
                const result = await this.benchmarkAlgorithm(name, func, size);
                results[name].push(result);
                
                if (result.success) {
                    console.log(`  Size ${size.toString().padStart(3)}: ${result.time.toFixed(2).padStart(8)}ms, ${result.compares.toString().padStart(6)} compares, ${result.swaps.toString().padStart(5)} swaps`);
                } else {
                    console.log(`  Size ${size.toString().padStart(3)}: FAILED - ${result.error}`);
                }
            }
        }

        return results;
    }

    analyzeResults(results) {
        console.log('\n' + '='.repeat(80));
        console.log('PERFORMANCE ANALYSIS');
        console.log('='.repeat(80));

        const analysis = {};

        for (const [algorithmName, algorithmResults] of Object.entries(results)) {
            const successfulResults = algorithmResults.filter(r => r.success);
            
            if (successfulResults.length === 0) {
                console.log(`\n${algorithmName}: No successful benchmarks`);
                continue;
            }

            const times = successfulResults.map(r => r.time);
            const compares = successfulResults.map(r => r.compares);
            const swaps = successfulResults.map(r => r.swaps);
            const sizes = successfulResults.map(r => r.size);

            // Calculate statistics
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            const avgCompares = compares.reduce((a, b) => a + b, 0) / compares.length;
            const avgSwaps = swaps.reduce((a, b) => a + b, 0) / swaps.length;

            // Estimate complexity
            const complexity = this.estimateComplexity(sizes, times);

            analysis[algorithmName] = {
                avgTime: avgTime.toFixed(2),
                avgCompares: Math.round(avgCompares),
                avgSwaps: Math.round(avgSwaps),
                complexity: complexity,
                scalability: this.calculateScalability(sizes, times)
            };

            console.log(`\n${algorithmName}:`);
            console.log(`  Average Time: ${avgTime.toFixed(2)}ms`);
            console.log(`  Average Comparisons: ${Math.round(avgCompares)}`);
            console.log(`  Average Swaps: ${Math.round(avgSwaps)}`);
            console.log(`  Estimated Complexity: ${complexity}`);
            console.log(`  Scalability Score: ${this.calculateScalability(sizes, times).toFixed(2)}`);
        }

        return analysis;
    }

    estimateComplexity(sizes, times) {
        if (sizes.length < 2) return 'Unknown';

        // Simple complexity estimation based on growth rate
        const sizeRatio = sizes[sizes.length - 1] / sizes[0];
        const timeRatio = times[times.length - 1] / times[0];

        if (timeRatio < sizeRatio * 2) {
            return 'O(n)';
        } else if (timeRatio < sizeRatio * 10) {
            return 'O(n log n)';
        } else if (timeRatio < sizeRatio ** 2 * 2) {
            return 'O(n²)';
        } else {
            return 'O(n³) or worse';
        }
    }

    calculateScalability(sizes, times) {
        if (sizes.length < 2) return 0;

        // Calculate how well the algorithm scales (lower is better)
        const sizeGrowth = sizes[sizes.length - 1] / sizes[0];
        const timeGrowth = times[times.length - 1] / times[0];

        return timeGrowth / sizeGrowth;
    }

    generateComparisonTable(results) {
        console.log('\n' + '='.repeat(80));
        console.log('ALGORITHM COMPARISON TABLE');
        console.log('='.repeat(80));

        const algorithms = Object.keys(results);
        const sizes = PERFORMANCE_SIZES;

        // Header
        let header = 'Algorithm'.padEnd(20);
        for (const size of sizes) {
            header += ` | Size ${size}`.padEnd(12);
        }
        header += ' | Avg Time';
        console.log(header);
        console.log('-'.repeat(header.length));

        // Rows
        for (const algorithm of algorithms) {
            let row = algorithm.padEnd(20);
            const algorithmResults = results[algorithm];
            let totalTime = 0;
            let validResults = 0;

            for (const size of sizes) {
                const result = algorithmResults.find(r => r.size === size);
                if (result && result.success) {
                    row += ` | ${result.time.toFixed(1).padStart(6)}ms`.padEnd(12);
                    totalTime += result.time;
                    validResults++;
                } else {
                    row += ' | FAILED    '.padEnd(12);
                }
            }

            const avgTime = validResults > 0 ? totalTime / validResults : 0;
            row += ` | ${avgTime.toFixed(1).padStart(6)}ms`;
            console.log(row);
        }
    }

    async runFullBenchmark() {
        const results = await this.runBenchmarkSuite();
        const analysis = this.analyzeResults(results);
        this.generateComparisonTable(results);

        return { results, analysis };
    }
}

// Specialized benchmark tests
class SpecializedBenchmarks extends PerformanceBenchmark {
    async benchmarkBestCase(algorithmName, func, size) {
        // Best case: already sorted array
        const sortedArray = generateSortedArray(size);
        return await this.benchmarkAlgorithm(algorithmName, func, size, sortedArray);
    }

    async benchmarkWorstCase(algorithmName, func, size) {
        // Worst case: reverse sorted array
        const reverseArray = generateSortedArray(size, false);
        return await this.benchmarkAlgorithm(algorithmName, func, size, reverseArray);
    }

    async benchmarkAverageCase(algorithmName, func, size) {
        // Average case: random array
        return await this.benchmarkAlgorithm(algorithmName, func, size);
    }

    async runCaseAnalysis(size = 50) {
        console.log(`\nCase Analysis for Size ${size}:`);
        console.log('-'.repeat(50));

        const caseResults = {};

        for (const { name, func } of this.algorithms) {
            console.log(`\n${name}:`);
            
            const bestCase = await this.benchmarkBestCase(name, func, size);
            const worstCase = await this.benchmarkWorstCase(name, func, size);
            const averageCase = await this.benchmarkAverageCase(name, func, size);

            caseResults[name] = { bestCase, worstCase, averageCase };

            console.log(`  Best Case:   ${bestCase.time.toFixed(2)}ms`);
            console.log(`  Worst Case:  ${worstCase.time.toFixed(2)}ms`);
            console.log(`  Average Case: ${averageCase.time.toFixed(2)}ms`);
            
            const ratio = worstCase.time / bestCase.time;
            console.log(`  Worst/Best Ratio: ${ratio.toFixed(2)}x`);
        }

        return caseResults;
    }
}

// Main execution
async function runBenchmarks() {
    // Import algorithms
    const { bubbleSort, optimizedBubbleSort } = require('./bubble-sort.js');
    const { selectionSort, selectionSortWithStats } = require('./selection-sort.js');
    const { insertionSort, insertionSortWithLogging, binaryInsertionSort } = require('./insertion-sort.js');
    const { mergeSort, bottomUpMergeSort, inPlaceMergeSort, mergeSortWithLogging } = require('./merge-sort.js');
    const { quickSort, randomizedQuickSort, medianOfThreeQuickSort, iterativeQuickSort, threeWayQuickSort } = require('./quick-sort.js');
    const { heapSort, heapSortWithLogging, minHeapSort, heapSortWithStats, iterativeHeapSort } = require('./heap-sort.js');

    // Create benchmark instance
    const benchmark = new PerformanceBenchmark();
    
    // Add algorithms
    benchmark.addAlgorithm('Bubble Sort', bubbleSort);
    benchmark.addAlgorithm('Optimized Bubble Sort', optimizedBubbleSort);
    benchmark.addAlgorithm('Selection Sort', selectionSort);
    benchmark.addAlgorithm('Insertion Sort', insertionSort);
    benchmark.addAlgorithm('Binary Insertion Sort', binaryInsertionSort);
    
    // Advanced algorithms
    benchmark.addAlgorithm('Merge Sort', mergeSort);
    benchmark.addAlgorithm('Bottom-up Merge Sort', bottomUpMergeSort);
    benchmark.addAlgorithm('In-place Merge Sort', inPlaceMergeSort);
    
    benchmark.addAlgorithm('Quick Sort', quickSort);
    benchmark.addAlgorithm('Randomized Quick Sort', randomizedQuickSort);
    benchmark.addAlgorithm('Median-of-Three Quick Sort', medianOfThreeQuickSort);
    benchmark.addAlgorithm('Three-Way Quick Sort', threeWayQuickSort);
    
    benchmark.addAlgorithm('Heap Sort', heapSort);
    benchmark.addAlgorithm('Iterative Heap Sort', iterativeHeapSort);

    // Run full benchmark
    const results = await benchmark.runFullBenchmark();

    // Run specialized case analysis
    const specializedBenchmark = new SpecializedBenchmarks();
    specializedBenchmark.addAlgorithm('Bubble Sort', bubbleSort);
    specializedBenchmark.addAlgorithm('Selection Sort', selectionSort);
    specializedBenchmark.addAlgorithm('Insertion Sort', insertionSort);
    
    await specializedBenchmark.runCaseAnalysis();

    return results;
}

// Run benchmarks if this file is executed directly
if (require.main === module) {
    runBenchmarks().catch(console.error);
}

module.exports = { PerformanceBenchmark, SpecializedBenchmarks, runBenchmarks };
