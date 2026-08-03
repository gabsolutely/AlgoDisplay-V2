// Search Algorithms for AlgoDisplay
// These algorithms demonstrate searching techniques with visualization

// Linear Search
async function linearSearch(arr, target) {
    log(`Starting linear search for target: ${target}`);
    
    for (let i = 0; i < arr.length; i++) {
        await compare(i, -1); // Compare with target (using -1 for target)
        
        log(`Checking element ${arr[i]} at position ${i}`);
        
        if (arr[i] === target) {
            log(`Found target ${target} at position ${i}`);
            return i; // Return index of found element
        }
        
        await sleep(100); // Small delay for visualization
    }
    
    log(`Target ${target} not found in array`);
    return -1; // Target not found
}

// Binary Search (requires sorted array)
async function binarySearch(arr, target) {
    log(`Starting binary search for target: ${target}`);
    
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        await compare(mid, -1); // Compare middle element with target
        log(`Checking middle element ${arr[mid]} at position ${mid}`);
        
        if (arr[mid] === target) {
            log(`Found target ${target} at position ${mid}`);
            return mid;
        } else if (arr[mid] < target) {
            log(`${arr[mid]} < ${target}, searching right half`);
            left = mid + 1;
        } else {
            log(`${arr[mid]} > ${target}, searching left half`);
            right = mid - 1;
        }
        
        await sleep(200); // Delay for visualization
    }
    
    log(`Target ${target} not found in array`);
    return -1;
}

// Jump Search (requires sorted array)
async function jumpSearch(arr, target) {
    log(`Starting jump search for target: ${target}`);
    
    const n = arr.length;
    const step = Math.sqrt(n);
    let prev = 0;
    
    // Find the block where element could be present
    while (arr[Math.min(step, n) - 1] < target) {
        await compare(Math.min(step, n) - 1, -1);
        log(`Jumping to next block, current element: ${arr[Math.min(step, n) - 1]}`);
        
        prev = step;
        step += Math.sqrt(n);
        
        if (prev >= n) {
            log(`Target ${target} not found in array`);
            return -1;
        }
        
        await sleep(300);
    }
    
    // Linear search in the identified block
    while (arr[prev] < target) {
        await compare(prev, -1);
        log(`Linear search in block, checking element: ${arr[prev]}`);
        
        prev++;
        
        if (prev === Math.min(step, n)) {
            log(`Target ${target} not found in array`);
            return -1;
        }
        
        await sleep(150);
    }
    
    // Check if element is found
    if (arr[prev] === target) {
        log(`Found target ${target} at position ${prev}`);
        return prev;
    }
    
    log(`Target ${target} not found in array`);
    return -1;
}

// Interpolation Search (requires sorted array, works best on uniformly distributed data)
async function interpolationSearch(arr, target) {
    log(`Starting interpolation search for target: ${target}`);
    
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right && target >= arr[left] && target <= arr[right]) {
        if (left === right) {
            if (arr[left] === target) {
                log(`Found target ${target} at position ${left}`);
                return left;
            }
            break;
        }
        
        // Estimate position using interpolation formula
        const pos = left + Math.floor(((target - arr[left]) * (right - left)) / (arr[right] - arr[left]));
        
        await compare(pos, -1);
        log(`Interpolated position ${pos}, element: ${arr[pos]}`);
        
        if (arr[pos] === target) {
            log(`Found target ${target} at position ${pos}`);
            return pos;
        } else if (arr[pos] < target) {
            log(`${arr[pos]} < ${target}, searching right half`);
            left = pos + 1;
        } else {
            log(`${arr[pos]} > ${target}, searching left half`);
            right = pos - 1;
        }
        
        await sleep(250);
    }
    
    log(`Target ${target} not found in array`);
    return -1;
}

// Exponential Search (requires sorted array)
async function exponentialSearch(arr, target) {
    log(`Starting exponential search for target: ${target}`);
    
    const n = arr.length;
    
    if (arr[0] === target) {
        log(`Found target ${target} at position 0`);
        return 0;
    }
    
    // Find range for binary search by repeated doubling
    let i = 1;
    while (i < n && arr[i] <= target) {
        await compare(i, -1);
        log(`Checking element ${arr[i]} at position ${i} (range expansion)`);
        
        i = i * 2;
        await sleep(200);
    }
    
    // Perform binary search on the found range
    const left = i / 2;
    const right = Math.min(i, n - 1);
    
    log(`Performing binary search in range [${left}, ${right}]`);
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        await compare(mid, -1);
        log(`Binary search - checking element ${arr[mid]} at position ${mid}`);
        
        if (arr[mid] === target) {
            log(`Found target ${target} at position ${mid}`);
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
        
        await sleep(200);
    }
    
    log(`Target ${target} not found in array`);
    return -1;
}

// Fibonacci Search (requires sorted array)
async function fibonacciSearch(arr, target) {
    log(`Starting Fibonacci search for target: ${target}`);
    
    const n = arr.length;
    
    // Initialize fibonacci numbers
    let fibM2 = 0; // (m-2)th Fibonacci number
    let fibM1 = 1; // (m-1)th Fibonacci number
    let fibM = fibM2 + fibM1; // mth Fibonacci number
    
    // Find the smallest Fibonacci number greater than or equal to n
    while (fibM < n) {
        fibM2 = fibM1;
        fibM1 = fibM;
        fibM = fibM2 + fibM1;
    }
    
    // Marks the eliminated range from front
    let offset = -1;
    
    while (fibM > 1) {
        // Check if fibM2 is a valid location
        const i = Math.min(offset + fibM2, n - 1);
        
        await compare(i, -1);
        log(`Checking element ${arr[i]} at position ${i}`);
        
        if (arr[i] < target) {
            log(`${arr[i]} < ${target}, moving to next Fibonacci range`);
            fibM = fibM1;
            fibM1 = fibM2;
            fibM2 = fibM - fibM1;
            offset = i;
        } else if (arr[i] > target) {
            log(`${arr[i]} > ${target}, reducing Fibonacci range`);
            fibM = fibM2;
            fibM1 = fibM1 - fibM2;
            fibM2 = fibM - fibM1;
        } else {
            log(`Found target ${target} at position ${i}`);
            return i;
        }
        
        await sleep(250);
    }
    
    // Compare the last element with target
    if (fibM1 && offset + 1 < n && arr[offset + 1] === target) {
        log(`Found target ${target} at position ${offset + 1}`);
        return offset + 1;
    }
    
    log(`Target ${target} not found in array`);
    return -1;
}

// Search with visualization of all steps
async function searchWithVisualization(arr, target, searchFunction) {
    log(`=== Starting Search Visualization ===`);
    log(`Array: [${arr.join(', ')}]`);
    log(`Target: ${target}`);
    log(`Algorithm: ${searchFunction.name}`);
    
    const result = await searchFunction(arr, target);
    
    if (result !== -1) {
        log(`✓ Search successful! Found at index ${result}`);
    } else {
        log(`✗ Search failed! Target not found`);
    }
    
    log(`=== Search Complete ===`);
    return result;
}

// Multiple search comparison
async function compareSearchAlgorithms(arr, target) {
    log(`Comparing all search algorithms for target: ${target}`);
    log(`Array: [${arr.join(', ')}]`);
    
    const algorithms = [
        linearSearch,
        binarySearch,
        jumpSearch,
        interpolationSearch,
        exponentialSearch,
        fibonacciSearch
    ];
    
    const results = {};
    
    for (const algorithm of algorithms) {
        log(`\n--- Testing ${algorithm.name} ---`);
        
        // Create a copy of the array for each test
        const arrCopy = [...arr];
        
        const startTime = performance.now();
        const result = await algorithm(arrCopy, target);
        const endTime = performance.now();
        
        results[algorithm.name] = {
            result: result,
            time: endTime - startTime
        };
        
        log(`${algorithm.name} result: ${result !== -1 ? 'Found' : 'Not found'} (${(endTime - startTime).toFixed(2)}ms)`);
    }
    
    // Summary
    log(`\n=== Search Algorithm Comparison Summary ===`);
    for (const [name, result] of Object.entries(results)) {
        log(`${name}: ${result.result !== -1 ? `Found at ${result.result}` : 'Not found'} (${result.time.toFixed(2)}ms)`);
    }
    
    return results;
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        linearSearch,
        binarySearch,
        jumpSearch,
        interpolationSearch,
        exponentialSearch,
        fibonacciSearch,
        searchWithVisualization,
        compareSearchAlgorithms
    };
}
