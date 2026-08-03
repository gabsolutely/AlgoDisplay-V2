// Bubble Sort Algorithm for AlgoDisplay
// Time Complexity: O(n²)
// Space Complexity: O(1)

async function bubbleSort(arr) {
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        
        // Last i elements are already in place
        for (let j = 0; j < n - i - 1; j++) {
            await compare(j, j + 1);
            
            if (arr[j] > arr[j + 1]) {
                await swap(arr, j, j + 1);
                swapped = true;
            }
        }
        
        // If no two elements were swapped by inner loop, then break
        if (!swapped) {
            break;
        }
    }
}

// Optimized Bubble Sort with early termination
async function optimizedBubbleSort(arr) {
    const n = arr.length;
    let swapped = true;
    let passCount = 0;
    
    while (swapped) {
        swapped = false;
        
        for (let i = 0; i < n - passCount - 1; i++) {
            await compare(i, i + 1);
            
            if (arr[i] > arr[i + 1]) {
                await swap(arr, i, i + 1);
                swapped = true;
            }
        }
        
        passCount++;
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { bubbleSort, optimizedBubbleSort };
}
