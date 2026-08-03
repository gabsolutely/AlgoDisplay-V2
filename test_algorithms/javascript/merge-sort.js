// Merge Sort Algorithm for AlgoDisplay
// Time Complexity: O(n log n)
// Space Complexity: O(n)

async function mergeSort(arr) {
    await mergeSortHelper(arr, 0, arr.length - 1);
}

async function mergeSortHelper(arr, left, right) {
    if (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        // Recursively sort both halves
        await mergeSortHelper(arr, left, mid);
        await mergeSortHelper(arr, mid + 1, right);
        
        // Merge the sorted halves
        await merge(arr, left, mid, right);
    }
}

async function merge(arr, left, mid, right) {
    // Create temporary arrays
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;
    
    // Merge the temporary arrays back into arr
    while (i < leftArr.length && j < rightArr.length) {
        await compare(left + i, mid + 1 + j);
        
        if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            i++;
        } else {
            arr[k] = rightArr[j];
            j++;
        }
        
        await renderArray(arr);
        k++;
    }
    
    // Copy remaining elements of leftArr
    while (i < leftArr.length) {
        arr[k] = leftArr[i];
        await renderArray(arr);
        i++;
        k++;
    }
    
    // Copy remaining elements of rightArr
    while (j < rightArr.length) {
        arr[k] = rightArr[j];
        await renderArray(arr);
        j++;
        k++;
    }
}

// Bottom-up Merge Sort (iterative version)
async function bottomUpMergeSort(arr) {
    const n = arr.length;
    
    for (let size = 1; size < n; size *= 2) {
        for (let left = 0; left < n - 1; left += 2 * size) {
            const mid = Math.min(left + size - 1, n - 1);
            const right = Math.min(left + 2 * size - 1, n - 1);
            
            if (mid < right) {
                await merge(arr, left, mid, right);
            }
        }
    }
}

// In-place Merge Sort (more complex but saves space)
async function inPlaceMergeSort(arr) {
    await inPlaceMergeSortHelper(arr, 0, arr.length - 1);
}

async function inPlaceMergeSortHelper(arr, left, right) {
    if (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        await inPlaceMergeSortHelper(arr, left, mid);
        await inPlaceMergeSortHelper(arr, mid + 1, right);
        
        await inPlaceMerge(arr, left, mid, right);
    }
}

async function inPlaceMerge(arr, left, mid, right) {
    let i = left;
    let j = mid + 1;
    
    while (i <= mid && j <= right) {
        await compare(i, j);
        
        if (arr[i] <= arr[j]) {
            i++;
        } else {
            // Rotate the subarray
            const value = arr[j];
            let k = j;
            
            while (k > i) {
                arr[k] = arr[k - 1];
                await renderArray(arr);
                k--;
            }
            
            arr[i] = value;
            await renderArray(arr);
            
            i++;
            mid++;
            j++;
        }
    }
}

// Merge Sort with detailed logging
async function mergeSortWithLogging(arr) {
    log("Starting Merge Sort");
    await mergeSortHelperWithLogging(arr, 0, arr.length - 1);
    log("Merge Sort completed");
}

async function mergeSortHelperWithLogging(arr, left, right) {
    if (left < right) {
        const mid = Math.floor((left + right) / 2);
        
        log(`Splitting array [${left}:${right}] at midpoint ${mid}`);
        
        await mergeSortHelperWithLogging(arr, left, mid);
        await mergeSortHelperWithLogging(arr, mid + 1, right);
        
        log(`Merging subarrays [${left}:${mid}] and [${mid + 1}:${right}]`);
        await mergeWithLogging(arr, left, mid, right);
    }
}

async function mergeWithLogging(arr, left, mid, right) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;
    let mergeCount = 0;
    
    while (i < leftArr.length && j < rightArr.length) {
        await compare(left + i, mid + 1 + j);
        mergeCount++;
        
        if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            i++;
            log(`Placed ${arr[k]} from left subarray at position ${k}`);
        } else {
            arr[k] = rightArr[j];
            j++;
            log(`Placed ${arr[k]} from right subarray at position ${k}`);
        }
        
        await renderArray(arr);
        k++;
    }
    
    while (i < leftArr.length) {
        arr[k] = leftArr[i];
        await renderArray(arr);
        log(`Placed remaining ${arr[k]} from left subarray at position ${k}`);
        i++;
        k++;
    }
    
    while (j < rightArr.length) {
        arr[k] = rightArr[j];
        await renderArray(arr);
        log(`Placed remaining ${arr[k]} from right subarray at position ${k}`);
        j++;
        k++;
    }
    
    log(`Merge completed with ${mergeCount} comparisons`);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        mergeSort, 
        bottomUpMergeSort, 
        inPlaceMergeSort, 
        mergeSortWithLogging 
    };
}
