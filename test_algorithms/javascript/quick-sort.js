// Quick Sort Algorithm for AlgoDisplay
// Time Complexity: O(n log n) average, O(n²) worst case
// Space Complexity: O(log n) average, O(n) worst case

async function quickSort(arr) {
    await quickSortHelper(arr, 0, arr.length - 1);
}

async function quickSortHelper(arr, low, high) {
    if (low < high) {
        // Partition the array and get the pivot index
        const pivotIndex = await partition(arr, low, high);
        
        // Recursively sort elements before and after partition
        await quickSortHelper(arr, low, pivotIndex - 1);
        await quickSortHelper(arr, pivotIndex + 1, high);
    }
}

async function partition(arr, low, high) {
    // Choose the rightmost element as pivot
    const pivot = arr[high];
    let i = low - 1; // Index of smaller element
    
    log(`Selected pivot ${pivot} at position ${high}`);
    
    for (let j = low; j < high; j++) {
        await compare(j, high);
        
        // If current element is smaller than or equal to pivot
        if (arr[j] <= pivot) {
            i++;
            
            if (i !== j) {
                await swap(arr, i, j);
                log(`Swapped ${arr[j]} with ${arr[i]}`);
            }
        }
    }
    
    // Place pivot in the correct position
    if (i + 1 !== high) {
        await swap(arr, i + 1, high);
        log(`Placed pivot ${pivot} at position ${i + 1}`);
    }
    
    return i + 1;
}

// Quick Sort with randomized pivot selection
async function randomizedQuickSort(arr) {
    await randomizedQuickSortHelper(arr, 0, arr.length - 1);
}

async function randomizedQuickSortHelper(arr, low, high) {
    if (low < high) {
        const pivotIndex = await randomizedPartition(arr, low, high);
        await randomizedQuickSortHelper(arr, low, pivotIndex - 1);
        await randomizedQuickSortHelper(arr, pivotIndex + 1, high);
    }
}

async function randomizedPartition(arr, low, high) {
    // Generate a random index between low and high
    const randomIndex = low + Math.floor(Math.random() * (high - low + 1));
    
    // Swap random element with the last element
    if (randomIndex !== high) {
        await swap(arr, randomIndex, high);
        log(`Randomized pivot: swapped ${arr[high]} with ${arr[randomIndex]}`);
    }
    
    return await partition(arr, low, high);
}

// Quick Sort with median-of-three pivot selection
async function medianOfThreeQuickSort(arr) {
    await medianOfThreeQuickSortHelper(arr, 0, arr.length - 1);
}

async function medianOfThreeQuickSortHelper(arr, low, high) {
    if (low < high) {
        const pivotIndex = await medianOfThreePartition(arr, low, high);
        await medianOfThreeQuickSortHelper(arr, low, pivotIndex - 1);
        await medianOfThreeQuickSortHelper(arr, pivotIndex + 1, high);
    }
}

async function medianOfThreePartition(arr, low, high) {
    const mid = Math.floor((low + high) / 2);
    
    // Find median of first, middle, and last elements
    await compare(low, mid);
    await compare(mid, high);
    await compare(low, high);
    
    // Order the three elements
    if (arr[low] > arr[mid]) {
        await swap(arr, low, mid);
    }
    if (arr[mid] > arr[high]) {
        await swap(arr, mid, high);
    }
    if (arr[low] > arr[mid]) {
        await swap(arr, low, mid);
    }
    
    // Place median at the end as pivot
    if (mid !== high) {
        await swap(arr, mid, high);
        log(`Median-of-three pivot: selected ${arr[high]} at position ${high}`);
    }
    
    return await partition(arr, low, high);
}

// Iterative Quick Sort (stack-based)
async function iterativeQuickSort(arr) {
    // Create a stack for storing subarray indices
    const stack = [];
    
    // Push initial values
    stack.push(0);
    stack.push(arr.length - 1);
    
    while (stack.length > 0) {
        // Pop high and low
        const high = stack.pop();
        const low = stack.pop();
        
        if (low < high) {
            const pivotIndex = await partition(arr, low, high);
            
            // Push right side
            if (pivotIndex + 1 < high) {
                stack.push(pivotIndex + 1);
                stack.push(high);
            }
            
            // Push left side
            if (low < pivotIndex - 1) {
                stack.push(low);
                stack.push(pivotIndex - 1);
            }
        }
    }
}

// Quick Sort with detailed logging and statistics
async function quickSortWithStats(arr) {
    let totalComparisons = 0;
    let totalSwaps = 0;
    let recursionDepth = 0;
    let maxRecursionDepth = 0;
    
    const originalCompare = global.compare;
    const originalSwap = global.swap;
    const originalLog = global.log;
    
    // Override global functions to track statistics
    global.compare = async (i, j) => {
        totalComparisons++;
        return await originalCompare(i, j);
    };
    
    global.swap = async (arr, i, j) => {
        totalSwaps++;
        return await originalSwap(arr, i, j);
    };
    
    global.log = (message) => {
        originalLog(message);
    };
    
    async function statsQuickSortHelper(arr, low, high, depth) {
        recursionDepth++;
        maxRecursionDepth = Math.max(maxRecursionDepth, recursionDepth);
        
        log(`Recursion depth: ${depth}, sorting [${low}:${high}]`);
        
        if (low < high) {
            const pivotIndex = await partition(arr, low, high);
            
            await statsQuickSortHelper(arr, low, pivotIndex - 1, depth + 1);
            await statsQuickSortHelper(arr, pivotIndex + 1, high, depth + 1);
        }
        
        recursionDepth--;
    }
    
    await statsQuickSortHelper(arr, 0, arr.length - 1, 1);
    
    // Restore original functions
    global.compare = originalCompare;
    global.swap = originalSwap;
    global.log = originalLog;
    
    log(`Quick Sort Statistics:`);
    log(`  Total Comparisons: ${totalComparisons}`);
    log(`  Total Swaps: ${totalSwaps}`);
    log(`  Max Recursion Depth: ${maxRecursionDepth}`);
    log(`  Efficiency Ratio: ${(totalComparisons / totalSwaps).toFixed(2)}`);
}

// Quick Sort with three-way partitioning (Dutch National Flag)
async function threeWayQuickSort(arr) {
    await threeWayQuickSortHelper(arr, 0, arr.length - 1);
}

async function threeWayQuickSortHelper(arr, low, high) {
    if (low >= high) return;
    
    // Three-way partition
    let lt = low;    // Elements < pivot
    let gt = high;   // Elements > pivot
    let i = low;     // Current element
    const pivot = arr[low];
    
    log(`Three-way partition with pivot ${pivot}`);
    
    while (i <= gt) {
        await compare(i, low);
        
        if (arr[i] < pivot) {
            if (i !== lt) {
                await swap(arr, i, lt);
            }
            i++;
            lt++;
        } else if (arr[i] > pivot) {
            await swap(arr, i, gt);
            gt--;
        } else {
            i++;
        }
    }
    
    // Recursively sort the < and > partitions
    await threeWayQuickSortHelper(arr, low, lt - 1);
    await threeWayQuickSortHelper(arr, gt + 1, high);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        quickSort, 
        randomizedQuickSort, 
        medianOfThreeQuickSort, 
        iterativeQuickSort, 
        quickSortWithStats, 
        threeWayQuickSort 
    };
}
