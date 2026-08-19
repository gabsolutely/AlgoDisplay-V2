// Counting Sort Implementations for AlgoDisplay Test Suite

/**
 * Counting Sort (Non-comparison sorting)
 */
async function countingSort(arr) {
    if (arr.length <= 1) return arr;

    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min + 1;
    const count = new Array(range).fill(0);

    for (let i = 0; i < arr.length; i++) {
        await compare(i, i);
        count[arr[i] - min]++;
    }

    const out = new Array(arr.length);
    let idx = 0;

    for (let b = 0; b < range; b++) {
        while (count[b] > 0) {
            out[idx] = min + b;
            count[b]--;
            idx++;
            if (idx < arr.length) await compare(idx, idx);
        }
    }

    for (let i = 0; i < arr.length; i++) {
        arr[i] = out[i];
    }
    await renderArray(arr);
    return arr;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        countingSort
    };
}
