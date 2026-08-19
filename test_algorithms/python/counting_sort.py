# Counting Sort Implementations for AlgoDisplay Python Test Suite

async def counting_sort(arr):
    """
    Counting Sort (Integer Non-comparison sort)
    """
    if len(arr) <= 1:
        return arr

    mn = min(arr)
    mx = max(arr)
    rng = mx - mn + 1
    count = [0] * rng

    for i in range(len(arr)):
        await compare(i, i)
        count[arr[i] - mn] += 1

    out = [0] * len(arr)
    idx = 0

    for b in range(rng):
        while count[b] > 0:
            out[idx] = mn + b
            count[b] -= 1
            idx += 1
            if idx < len(arr):
                await compare(idx, idx)

    for i in range(len(arr)):
        arr[i] = out[i]

    await render_array(arr)
    return arr
