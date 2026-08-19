# Shell Sort Implementations for AlgoDisplay Python Test Suite

async def shell_sort(arr):
    """
    Standard Shell Sort
    """
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap:
                await compare(j - gap, i)
                if arr[j - gap] > temp:
                    await swap(arr, j - gap, j)
                    j -= gap
                else:
                    break
            arr[j] = temp
            await render_array(arr)
        gap //= 2
    return arr


async def knuth_shell_sort(arr):
    """
    Shell Sort with Knuth Gap Sequence (3k + 1)
    """
    n = len(arr)
    gap = 1
    while gap < n // 3:
        gap = 3 * gap + 1

    while gap >= 1:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap:
                await compare(j - gap, i)
                if arr[j - gap] > temp:
                    await swap(arr, j - gap, j)
                    j -= gap
                else:
                    break
            arr[j] = temp
            await render_array(arr)
        gap //= 3
    return arr
