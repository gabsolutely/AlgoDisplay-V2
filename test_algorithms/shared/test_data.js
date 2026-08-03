// Shared test data for AlgoDisplay algorithm testing
// This file contains common test cases and utilities

// Test case categories
export const TEST_CATEGORIES = {
    EMPTY: 'empty',
    SINGLE: 'single',
    SORTED: 'sorted',
    REVERSE: 'reverse',
    RANDOM: 'random',
    DUPLICATES: 'duplicates',
    EQUAL: 'equal',
    NEARLY_SORTED: 'nearly_sorted'
};

// Comprehensive test suite
export const TEST_CASES = [
    {
        name: 'Empty Array',
        category: TEST_CATEGORIES.EMPTY,
        input: [],
        expected: [],
        description: 'Test with empty array'
    },
    {
        name: 'Single Element',
        category: TEST_CATEGORIES.SINGLE,
        input: [1],
        expected: [1],
        description: 'Test with single element array'
    },
    {
        name: 'Already Sorted',
        category: TEST_CATEGORIES.SORTED,
        input: [1, 2, 3, 4, 5],
        expected: [1, 2, 3, 4, 5],
        description: 'Test with already sorted array'
    },
    {
        name: 'Reverse Sorted',
        category: TEST_CATEGORIES.REVERSE,
        input: [5, 4, 3, 2, 1],
        expected: [1, 2, 3, 4, 5],
        description: 'Test with reverse sorted array'
    },
    {
        name: 'Random with Duplicates',
        category: TEST_CATEGORIES.DUPLICATES,
        input: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5],
        expected: [1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9],
        description: 'Test with random array containing duplicates'
    },
    {
        name: 'Random Unique',
        category: TEST_CATEGORIES.RANDOM,
        input: [10, 80, 30, 90, 40, 50, 70],
        expected: [10, 30, 40, 50, 70, 80, 90],
        description: 'Test with random array of unique elements'
    },
    {
        name: 'All Equal',
        category: TEST_CATEGORIES.EQUAL,
        input: [2, 2, 2, 2, 2],
        expected: [2, 2, 2, 2, 2],
        description: 'Test with array of equal elements'
    },
    {
        name: 'Nearly Sorted',
        category: TEST_CATEGORIES.NEARLY_SORTED,
        input: [1, 3, 2, 4, 3, 5, 4, 6, 5, 7],
        expected: [1, 2, 3, 3, 4, 4, 5, 5, 6, 7],
        description: 'Test with nearly sorted array'
    },
    {
        name: 'Small Array',
        category: TEST_CATEGORIES.RANDOM,
        input: [4, 2],
        expected: [2, 4],
        description: 'Test with small array (2 elements)'
    },
    {
        name: 'Medium Array',
        category: TEST_CATEGORIES.RANDOM,
        input: [8, 3, 5, 2, 9, 1, 6, 4, 7],
        expected: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        description: 'Test with medium array (9 elements)'
    }
];

// Performance test sizes
export const PERFORMANCE_SIZES = [5, 10, 20, 50, 100, 200];

// Generate random array of specified size
export function generateRandomArray(size, min = 1, max = 100) {
    const arr = [];
    for (let i = 0; i < size; i++) {
        arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return arr;
}

// Generate sorted array of specified size
export function generateSortedArray(size, ascending = true) {
    const arr = [];
    for (let i = 0; i < size; i++) {
        arr.push(ascending ? i + 1 : size - i);
    }
    return arr;
}

// Generate array with duplicates
export function generateArrayWithDuplicates(size, uniqueElements = 5) {
    const arr = [];
    const uniqueValues = [];
    
    // Generate unique values
    for (let i = 0; i < uniqueElements; i++) {
        uniqueValues.push(Math.floor(Math.random() * 100) + 1);
    }
    
    // Fill array with random duplicates
    for (let i = 0; i < size; i++) {
        arr.push(uniqueValues[Math.floor(Math.random() * uniqueElements.length)]);
    }
    
    return arr;
}

// Generate nearly sorted array
export function generateNearlySortedArray(size, swapCount = 2) {
    const arr = generateSortedArray(size);
    
    // Make a few random swaps
    for (let i = 0; i < swapCount; i++) {
        const idx1 = Math.floor(Math.random() * size);
        const idx2 = Math.floor(Math.random() * size);
        [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
    }
    
    return arr;
}

// Utility functions for testing
export function isSorted(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) {
            return false;
        }
    }
    return true;
}

export function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    
    return true;
}

export function copyArray(arr) {
    return arr.slice();
}

// Test result validation
export function validateTestResult(input, output, expected) {
    const isCorrect = arraysEqual(output, expected);
    const isSortedCorrectly = isSorted(output);
    const hasSameElements = arraysEqual(input.sort((a, b) => a - b), output.sort((a, b) => a - b));
    
    return {
        isCorrect,
        isSortedCorrectly,
        hasSameElements,
        passed: isCorrect && isSortedCorrectly
    };
}

// Performance metrics calculation
export function calculateMetrics(startTime, endTime, stats) {
    return {
        executionTime: endTime - startTime,
        comparisonsPerElement: stats.compares / stats.arraySize,
        swapsPerElement: stats.swaps / stats.arraySize,
        efficiency: stats.swaps > 0 ? stats.compares / stats.swaps : stats.compares
    };
}

// Test suite generator
export function generateTestSuite(categories = null) {
    if (!categories) {
        return TEST_CASES;
    }
    
    return TEST_CASES.filter(testCase => 
        categories.includes(testCase.category)
    );
}

// Performance test suite generator
export function generatePerformanceSuite(sizes = PERFORMANCE_SIZES) {
    return sizes.map(size => ({
        name: `Size ${size}`,
        size: size,
        input: generateRandomArray(size),
        expected: null // Will be calculated during test
    }));
}

// Export for Node.js compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TEST_CATEGORIES,
        TEST_CASES,
        PERFORMANCE_SIZES,
        generateRandomArray,
        generateSortedArray,
        generateArrayWithDuplicates,
        generateNearlySortedArray,
        isSorted,
        arraysEqual,
        copyArray,
        validateTestResult,
        calculateMetrics,
        generateTestSuite,
        generatePerformanceSuite
    };
}
