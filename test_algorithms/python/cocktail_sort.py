# Cocktail Shaker Sort Implementations for AlgoDisplay Python Test Suite

async def cocktail_sort(arr):
    """
    Standard Cocktail Shaker Sort
    """
    start = 0
    end = len(arr) - 1
    swapped = True

    while swapped:
        swapped = False

        # Forward pass
        for i in range(start, end):
            await compare(i, i + 1)
            if arr[i] > arr[i + 1]:
                await swap(arr, i, i + 1)
                swapped = True

        if not swapped:
            break

        end -= 1
        swapped = False

        # Backward pass
        for i in range(end - 1, start - 1, -1):
            await compare(i, i + 1)
            if arr[i] > arr[i + 1]:
                await swap(arr, i, i + 1)
                swapped = True

        start += 1

    return arr
