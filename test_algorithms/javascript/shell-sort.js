// Shell Sort Implementations for AlgoDisplay Test Suite

/**
 * Standard Shell Sort
 */
async function shellSort(arr) {
    const n = arr.length;
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; i++) {
            const temp = arr[i];
            let j = i;
            while (j >= gap) {
                await compare(j - gap, i);
                if (arr[j - gap] > temp) {
                    await swap(arr, j - gap, j);
                    j -= gap;
                } else {
                    break;
                }
            }
            arr[j] = temp;
            await renderArray(arr);
        }
    }
    return arr;
}

/**
 * Shell Sort with Knuth Gap Sequence (3k + 1)
 */
async function knuthShellSort(arr) {
    const n = arr.length;
    let gap = 1;
    while (gap < Math.floor(n / 3)) {
        gap = 3 * gap + 1;
    }

    while (gap >= 1) {
        for (let i = gap; i < n; i++) {
            const temp = arr[i];
            let j = i;
            while (j >= gap) {
                await compare(j - gap, i);
                if (arr[j - gap] > temp) {
                    await swap(arr, j - gap, j);
                    j -= gap;
                } else {
                    break;
                }
            }
            arr[j] = temp;
            await renderArray(arr);
        }
        gap = Math.floor(gap / 3);
    }
    return arr;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        shellSort,
        knuthShellSort
    };
}
