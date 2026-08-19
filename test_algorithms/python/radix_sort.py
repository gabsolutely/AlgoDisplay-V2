# Radix Sort (LSD) Implementations for AlgoDisplay Python Test Suite

async def _count_sort_by_digit(arr, n, exp):
    out = [0] * n
    cnt = [0] * 10

    for i in range(n):
        cnt[(arr[i] // exp) % 10] += 1

    for i in range(1, 10):
        cnt[i] += cnt[i - 1]

    for i in range(n - 1, -1, -1):
        d = (arr[i] // exp) % 10
        out[cnt[d] - 1] = arr[i]
        cnt[d] -= 1
        await compare(i, i)

    for i in range(n):
        arr[i] = out[i]

    await render_array(arr)


async def radix_sort(arr):
    """
    Radix Sort (LSD - Least Significant Digit)
    """
    if len(arr) <= 1:
        return arr

    n = len(arr)
    m = max(arr)
    exp = 1

    while m // exp > 0:
        await _count_sort_by_digit(arr, n, exp)
        exp *= 10

    return arr
