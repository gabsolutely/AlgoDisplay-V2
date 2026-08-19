// Cocktail Shaker Sort Implementations for AlgoDisplay Test Suite

/**
 * Standard Cocktail Shaker Sort (Bidirectional Bubble Sort)
 */
async function cocktailSort(arr) {
    let start = 0;
    let end = arr.length - 1;
    let swapped = true;

    while (swapped) {
        swapped = false;

        // Forward pass
        for (let i = start; i < end; i++) {
            await compare(i, i + 1);
            if (arr[i] > arr[i + 1]) {
                await swap(arr, i, i + 1);
                swapped = true;
            }
        }

        if (!swapped) break;

        end--;
        swapped = false;

        // Backward pass
        for (let i = end - 1; i >= start; i--) {
            await compare(i, i + 1);
            if (arr[i] > arr[i + 1]) {
                await swap(arr, i, i + 1);
                swapped = true;
            }
        }

        start++;
    }
    return arr;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        cocktailSort
    };
}
