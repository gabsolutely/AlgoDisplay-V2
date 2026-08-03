// Selection Sort Algorithm for AlgoDisplay
// Time Complexity: O(n²)
// Space Complexity: O(1)

async function selectionSort(arr) {
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        
        // Find the minimum element in unsorted array
        for (let j = i + 1; j < n; j++) {
            await compare(minIdx, j);
            
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        
        // Swap the found minimum element with the first element
        if (minIdx !== i) {
            await swap(arr, i, minIdx);
        }
    }
}

// Selection Sort with tracking of comparisons
async function selectionSortWithStats(arr) {
    const n = arr.length;
    let comparisons = 0;
    
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        
        for (let j = i + 1; j < n; j++) {
            await compare(minIdx, j);
            comparisons++;
            
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        
        if (minIdx !== i) {
            await swap(arr, i, minIdx);
            log(`Swapped ${arr[i]} with ${arr[minIdx]}`);
        }
        
        log(`Pass ${i + 1}: ${comparisons} comparisons made`);
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { selectionSort, selectionSortWithStats };
}
