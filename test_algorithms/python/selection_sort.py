# Selection Sort Algorithm for AlgoDisplay
# Time Complexity: O(n²)
# Space Complexity: O(1)

async def selection_sort(arr):
    """Standard selection sort implementation"""
    n = len(arr)
    
    for i in range(n - 1):
        min_idx = i
        
        # Find the minimum element in unsorted array
        for j in range(i + 1, n):
            await compare(min_idx, j)
            
            if arr[j] < arr[min_idx]:
                min_idx = j
        
        # Swap the found minimum element with the first element
        if min_idx != i:
            await swap(arr, i, min_idx)

async def selection_sort_with_stats(arr):
    """Selection sort with detailed statistics tracking"""
    n = len(arr)
    total_comparisons = 0
    total_swaps = 0
    
    for i in range(n - 1):
        min_idx = i
        pass_comparisons = 0
        
        # Find the minimum element in unsorted array
        for j in range(i + 1, n):
            await compare(min_idx, j)
            total_comparisons += 1
            pass_comparisons += 1
            
            if arr[j] < arr[min_idx]:
                min_idx = j
        
        # Swap the found minimum element with the first element
        if min_idx != i:
            await swap(arr, i, min_idx)
            total_swaps += 1
            log(f"Swapped {arr[i]} with {arr[min_idx]}")
        
        log(f"Pass {i + 1}: {pass_comparisons} comparisons, min element at index {min_idx}")
    
    log(f"Total: {total_comparisons} comparisons, {total_swaps} swaps")

async def selection_sort_with_min_tracking(arr):
    """Selection sort with minimum element tracking visualization"""
    n = len(arr)
    
    for i in range(n - 1):
        min_idx = i
        log(f"Finding minimum in unsorted portion [{i}:{n}]")
        
        # Find the minimum element in unsorted array
        for j in range(i + 1, n):
            await compare(min_idx, j)
            
            if arr[j] < arr[min_idx]:
                min_idx = j
                log(f"New minimum found: {arr[min_idx]} at index {min_idx}")
        
        # Swap the found minimum element with the first element
        if min_idx != i:
            await swap(arr, i, min_idx)
            log(f"Placed minimum {arr[i]} at position {i}")
        else:
            log(f"Element {arr[i]} already in correct position")

# Test functions for standalone testing
def test_selection_sort():
    """Test selection sort implementation"""
    import asyncio
    
    async def mock_compare(i, j):
        pass
    
    async def mock_swap(arr, i, j):
        arr[i], arr[j] = arr[j], arr[i]
    
    async def mock_log(message):
        print(message)
    
    # Mock the global functions
    global compare, swap, log
    compare = mock_compare
    swap = mock_swap
    log = mock_log
    
    async def run_test():
        test_cases = [
            [],
            [1],
            [1, 2, 3, 4, 5],
            [5, 4, 3, 2, 1],
            [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5],
            [10, 80, 30, 90, 40, 50, 70],
            [2, 2, 2, 2, 2],
        ]
        
        for i, test_case in enumerate(test_cases):
            original = test_case.copy()
            await selection_sort(test_case)
            is_sorted = all(test_case[j] <= test_case[j + 1] for j in range(len(test_case) - 1))
            print(f"Test {i + 1}: {'PASSED' if is_sorted else 'FAILED'} - {original} -> {test_case}")
    
    asyncio.run(run_test())

if __name__ == "__main__":
    test_selection_sort()
