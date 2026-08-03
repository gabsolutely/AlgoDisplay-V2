// Heap Sort Algorithm for AlgoDisplay
// Time Complexity: O(n log n)
// Space Complexity: O(1)

async function heapSort(arr) {
    const n = arr.length;
    
    // Build heap (rearrange array)
    await buildHeap(arr, n);
    
    // One by one extract an element from heap
    for (let i = n - 1; i > 0; i--) {
        // Move current root to end
        await swap(arr, 0, i);
        log(`Swapped root ${arr[i]} to position ${i}`);
        
        // Call maxHeapify on the reduced heap
        await maxHeapify(arr, 0, i);
    }
}

async function buildHeap(arr, n) {
    // Build max heap from last non-leaf node
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await maxHeapify(arr, i, n);
    }
}

async function maxHeapify(arr, i, heapSize) {
    let largest = i;        // Initialize largest as root
    const left = 2 * i + 1; // left child
    const right = 2 * i + 2; // right child
    
    // If left child is larger than root
    if (left < heapSize) {
        await compare(left, largest);
        if (arr[left] > arr[largest]) {
            largest = left;
        }
    }
    
    // If right child is larger than largest so far
    if (right < heapSize) {
        await compare(right, largest);
        if (arr[right] > arr[largest]) {
            largest = right;
        }
    }
    
    // If largest is not root
    if (largest !== i) {
        await swap(arr, i, largest);
        log(`Swapped ${arr[largest]} with ${arr[i]} to maintain heap property`);
        
        // Recursively heapify the affected sub-tree
        await maxHeapify(arr, largest, heapSize);
    }
}

// Heap Sort with detailed logging
async function heapSortWithLogging(arr) {
    const n = arr.length;
    
    log("Building initial max heap");
    await buildHeapWithLogging(arr, n);
    log("Max heap built");
    
    for (let i = n - 1; i > 0; i--) {
        log(`Extracting max element ${arr[0]} to position ${i}`);
        await swap(arr, 0, i);
        
        log(`Rebuilding heap for remaining ${i} elements`);
        await maxHeapifyWithLogging(arr, 0, i);
        log(`Heap rebuilt for positions 0 to ${i - 1}`);
    }
    
    log("Heap sort completed");
}

async function buildHeapWithLogging(arr, n) {
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        log(`Heapifying node ${i} with value ${arr[i]}`);
        await maxHeapifyWithLogging(arr, i, n);
    }
}

async function maxHeapifyWithLogging(arr, i, heapSize) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (left < heapSize) {
        await compare(left, largest);
        if (arr[left] > arr[largest]) {
            largest = left;
            log(`Left child ${arr[left]} is larger than parent ${arr[i]}`);
        }
    }
    
    if (right < heapSize) {
        await compare(right, largest);
        if (arr[right] > arr[largest]) {
            largest = right;
            log(`Right child ${arr[right]} is larger than current largest ${arr[largest]}`);
        }
    }
    
    if (largest !== i) {
        await swap(arr, i, largest);
        log(`Swapped parent ${arr[largest]} with child ${arr[i]}`);
        await maxHeapifyWithLogging(arr, largest, heapSize);
    }
}

// Min Heap Sort (sorts in descending order)
async function minHeapSort(arr) {
    const n = arr.length;
    
    // Build min heap
    await buildMinHeap(arr, n);
    
    // Extract elements one by one
    for (let i = n - 1; i > 0; i--) {
        // Move current root to end
        await swap(arr, 0, i);
        log(`Swapped min element ${arr[i]} to position ${i}`);
        
        // Call minHeapify on the reduced heap
        await minHeapify(arr, 0, i);
    }
}

async function buildMinHeap(arr, n) {
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await minHeapify(arr, i, n);
    }
}

async function minHeapify(arr, i, heapSize) {
    let smallest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (left < heapSize) {
        await compare(left, smallest);
        if (arr[left] < arr[smallest]) {
            smallest = left;
        }
    }
    
    if (right < heapSize) {
        await compare(right, smallest);
        if (arr[right] < arr[smallest]) {
            smallest = right;
        }
    }
    
    if (smallest !== i) {
        await swap(arr, i, smallest);
        await minHeapify(arr, smallest, heapSize);
    }
}

// Heap Sort with statistics tracking
async function heapSortWithStats(arr) {
    const n = arr.length;
    let totalComparisons = 0;
    let totalSwaps = 0;
    let heapifyCalls = 0;
    
    const originalCompare = global.compare;
    const originalSwap = global.swap;
    
    global.compare = async (i, j) => {
        totalComparisons++;
        return await originalCompare(i, j);
    };
    
    global.swap = async (arr, i, j) => {
        totalSwaps++;
        return await originalSwap(arr, i, j);
    };
    
    async function statsMaxHeapify(arr, i, heapSize) {
        heapifyCalls++;
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        if (left < heapSize) {
            await compare(left, largest);
            if (arr[left] > arr[largest]) {
                largest = left;
            }
        }
        
        if (right < heapSize) {
            await compare(right, largest);
            if (arr[right] > arr[largest]) {
                largest = right;
            }
        }
        
        if (largest !== i) {
            await swap(arr, i, largest);
            await statsMaxHeapify(arr, largest, heapSize);
        }
    }
    
    async function statsBuildHeap(arr, n) {
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await statsMaxHeapify(arr, i, n);
        }
    }
    
    // Build heap
    await statsBuildHeap(arr, n);
    
    // Extract elements
    for (let i = n - 1; i > 0; i--) {
        await swap(arr, 0, i);
        await statsMaxHeapify(arr, 0, i);
    }
    
    // Restore original functions
    global.compare = originalCompare;
    global.swap = originalSwap;
    
    log(`Heap Sort Statistics:`);
    log(`  Total Comparisons: ${totalComparisons}`);
    log(`  Total Swaps: ${totalSwaps}`);
    log(`  Heapify Calls: ${heapifyCalls}`);
    log(`  Comparisons per Swap: ${(totalComparisons / totalSwaps).toFixed(2)}`);
}

// Iterative Heap Sort (avoids recursion)
async function iterativeHeapSort(arr) {
    const n = arr.length;
    
    // Build heap
    await buildHeap(arr, n);
    
    // Extract elements iteratively
    for (let i = n - 1; i > 0; i--) {
        await swap(arr, 0, i);
        
        // Iterative maxHeapify
        let index = 0;
        let heapSize = i;
        
        while (true) {
            let largest = index;
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            
            if (left < heapSize) {
                await compare(left, largest);
                if (arr[left] > arr[largest]) {
                    largest = left;
                }
            }
            
            if (right < heapSize) {
                await compare(right, largest);
                if (arr[right] > arr[largest]) {
                    largest = right;
                }
            }
            
            if (largest !== index) {
                await swap(arr, index, largest);
                index = largest;
            } else {
                break;
            }
        }
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        heapSort, 
        heapSortWithLogging, 
        minHeapSort, 
        heapSortWithStats, 
        iterativeHeapSort 
    };
}
