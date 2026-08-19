// Radix Sort (LSD) Implementations for AlgoDisplay Test Suite

/**
 * Radix Sort (LSD - Least Significant Digit)
 */
async function radixSort(arr) {
    if (arr.length <= 1) return arr;

    const countSortByDigit = async (arr, n, exp) => {
        const out = new Array(n).fill(0);
        const count = new Array(10).fill(0);

        for (let i = 0; i < n; i++) {
            count[Math.floor(arr[i] / exp) % 10]++;
        }

        for (let i = 1; i < 10; i++) {
            count[i] += count[i - 1];
        }

        for (let i = n - 1; i >= 0; i--) {
            const d = Math.floor(arr[i] / exp) % 10;
            out[count[d] - 1] = arr[i];
            count[d]--;
            await compare(i, i);
        }

        for (let i = 0; i < n; i++) {
            arr[i] = out[i];
        }
        await renderArray(arr);
    };

    const n = arr.length;
    const maxVal = Math.max(...arr);

    for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
        await countSortByDigit(arr, n, exp);
    }

    return arr;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        radixSort
    };
}
