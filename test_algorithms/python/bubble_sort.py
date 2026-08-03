# Bubble Sort Algorithm for AlgoDisplay
# Time Complexity: O(n²)
# Space Complexity: O(1)

async def bubble_sort(arr):
    """Standard bubble sort implementation"""
    n = len(arr)
    
    for i in range(n - 1):
        swapped = False
        
        # Last i elements are already in place
        for j in range(n - i - 1):
            await compare(j, j + 1)
            
            if arr[j] > arr[j + 1]:
                await swap(arr, j, j + 1)
                swapped = True
        
        # If no two elements were swapped by inner loop, then break
        if not swapped:
            break

async def optimized_bubble_sort(arr):
    """Optimized bubble sort with early termination"""
    n = len(arr)
    swapped = True
    pass_count = 0
    
    while swapped:
        swapped = False
        
        for i in range(n - pass_count - 1):
            await compare(i, i + 1)
            
            if arr[i] > arr[i + 1]:
                await swap(arr, i, i + 1)
                swapped = True
        
        pass_count += 1

async def bubble_sort_with_stats(arr):
    """Bubble sort with detailed statistics tracking"""
    n = len(arr)
    total_comparisons = 0
    total_swaps = 0
    
    for i in range(n - 1):
        swapped = False
        pass_comparisons = 0
        pass_swaps = 0
        
        for j in range(n - i - 1):
            await compare(j, j + 1)
            total_comparisons += 1
            pass_comparisons += 1
            
            if arr[j] > arr[j + 1]:
                await swap(arr, j, j + 1)
                total_swaps += 1
                pass_swaps += 1
                swapped = True
        
        log(f"Pass {i + 1}: {pass_comparisons} comparisons, {pass_swaps} swaps")
        
        if not swapped:
            break
    
    log(f"Total: {total_comparisons} comparisons, {total_swaps} swaps")

# Test functions for standalone testing
def test_bubble_sort():
    """Test bubble sort implementation"""
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
            await bubble_sort(test_case)
            is_sorted = all(test_case[j] <= test_case[j + 1] for j in range(len(test_case) - 1))
            print(f"Test {i + 1}: {'PASSED' if is_sorted else 'FAILED'} - {original} -> {test_case}")
    
    asyncio.run(run_test())

if __name__ == "__main__":
    test_bubble_sort()
