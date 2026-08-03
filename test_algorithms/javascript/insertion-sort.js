// Insertion Sort Algorithm for AlgoDisplay
// Time Complexity: O(n²) average, O(n) best case
// Space Complexity: O(1)

async function insertionSort(arr) {
    const n = arr.length;
    
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        
        // Move elements of arr[0..i-1] that are greater than key
        // to one position ahead of their current position
        while (j >= 0) {
            await compare(j, i);
            
            if (arr[j] > key) {
                arr[j + 1] = arr[j];
                await renderArray(arr);
                j--;
            } else {
                break;
            }
        }
        
        arr[j + 1] = key;
        await renderArray(arr);
    }
}

// Insertion Sort with detailed logging
async function insertionSortWithLogging(arr) {
    const n = arr.length;
    
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        
        log(`Inserting element ${key} at position ${i}`);
        
        while (j >= 0) {
            await compare(j, i);
            
            if (arr[j] > key) {
                arr[j + 1] = arr[j];
                await renderArray(arr);
                log(`Moved ${arr[j + 1]} to position ${j + 2}`);
                j--;
            } else {
                break;
            }
        }
        
        arr[j + 1] = key;
        await renderArray(arr);
        log(`Placed ${key} at position ${j + 1}`);
    }
}

// Binary Insertion Sort (optimized version)
async function binaryInsertionSort(arr) {
    const n = arr.length;
    
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let left = 0;
        let right = i - 1;
        
        // Binary search to find insertion position
        while (left <= right) {
            let mid = Math.floor((left + right) / 2);
            await compare(mid, i);
            
            if (arr[mid] > key) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        
        // Shift elements to make space for key
        for (let j = i - 1; j >= left; j--) {
            arr[j + 1] = arr[j];
            await renderArray(arr);
        }
        
        arr[left] = key;
        await renderArray(arr);
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { insertionSort, insertionSortWithLogging, binaryInsertionSort };
}
