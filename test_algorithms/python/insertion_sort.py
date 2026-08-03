# Insertion Sort Algorithm for AlgoDisplay
# Time Complexity: O(n²) average, O(n) best case
# Space Complexity: O(1)

async def insertion_sort(arr):
    """Standard insertion sort implementation"""
    n = len(arr)
    
    for i in range(1, n):
        key = arr[i]
        j = i - 1
        
        # Move elements of arr[0..i-1] that are greater than key
        # to one position ahead of their current position
        while j >= 0:
            await compare(j, i)
            
            if arr[j] > key:
                arr[j + 1] = arr[j]
                await render_array(arr)
                j -= 1
            else:
                break
        
        arr[j + 1] = key
        await render_array(arr)

async def insertion_sort_with_logging(arr):
    """Insertion sort with detailed logging"""
    n = len(arr)
    
    for i in range(1, n):
        key = arr[i]
        j = i - 1
        
        log(f"Inserting element {key} at position {i}")
        
        while j >= 0:
            await compare(j, i)
            
            if arr[j] > key:
                arr[j + 1] = arr[j]
                await render_array(arr)
                log(f"Moved {arr[j + 1]} to position {j + 2}")
                j -= 1
            else:
                break
        
        arr[j + 1] = key
        await render_array(arr)
        log(f"Placed {key} at position {j + 1}")

async def binary_insertion_sort(arr):
    """Binary insertion sort (optimized version)"""
    n = len(arr)
    
    for i in range(1, n):
        key = arr[i]
        left = 0
        right = i - 1
        
        # Binary search to find insertion position
        while left <= right:
            mid = (left + right) // 2
            await compare(mid, i)
            
            if arr[mid] > key:
                right = mid - 1
            else:
                left = mid + 1
        
        # Shift elements to make space for key
        for j in range(i - 1, left - 1, -1):
            arr[j + 1] = arr[j]
            await render_array(arr)
        
        arr[left] = key
        await render_array(arr)
        log(f"Inserted {key} at position {left} using binary search")

async def insertion_sort_with_stats(arr):
    """Insertion sort with performance statistics"""
    n = len(arr)
    total_comparisons = 0
    total_shifts = 0
    
    for i in range(1, n):
        key = arr[i]
        j = i - 1
        pass_comparisons = 0
        pass_shifts = 0
        
        log(f"Processing element {key} at index {i}")
        
        while j >= 0:
            await compare(j, i)
            total_comparisons += 1
            pass_comparisons += 1
            
            if arr[j] > key:
                arr[j + 1] = arr[j]
                await render_array(arr)
                total_shifts += 1
                pass_shifts += 1
                j -= 1
            else:
                break
        
        arr[j + 1] = key
        await render_array(arr)
        
        log(f"Pass {i}: {pass_comparisons} comparisons, {pass_shifts} shifts")
    
    log(f"Total: {total_comparisons} comparisons, {total_shifts} shifts")

# Test functions for standalone testing
def test_insertion_sort():
    """Test insertion sort implementation"""
    import asyncio
    
    async def mock_compare(i, j):
        pass
    
    async def mock_swap(arr, i, j):
        arr[i], arr[j] = arr[j], arr[i]
    
    async def mock_render_array(arr):
        pass
    
    async def mock_log(message):
        print(message)
    
    # Mock the global functions
    global compare, swap, render_array, log
    compare = mock_compare
    swap = mock_swap
    render_array = mock_render_array
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
        
        algorithms = [
            ("Insertion Sort", insertion_sort),
            ("Insertion Sort with Logging", insertion_sort_with_logging),
            ("Binary Insertion Sort", binary_insertion_sort),
            ("Insertion Sort with Stats", insertion_sort_with_stats),
        ]
        
        for algo_name, algo_func in algorithms:
            print(f"\nTesting {algo_name}:")
            print("-" * 40)
            
            for i, test_case in enumerate(test_cases):
                original = test_case.copy()
                await algo_func(test_case)
                is_sorted = all(test_case[j] <= test_case[j + 1] for j in range(len(test_case) - 1))
                print(f"Test {i + 1}: {'PASSED' if is_sorted else 'FAILED'} - {original} -> {test_case}")
    
    asyncio.run(run_test())

if __name__ == "__main__":
    test_insertion_sort()
