# Merge Sort Algorithm for AlgoDisplay
# Time Complexity: O(n log n)
# Space Complexity: O(n)

async def merge_sort(arr):
    """Standard merge sort implementation"""
    await merge_sort_helper(arr, 0, len(arr) - 1)

async def merge_sort_helper(arr, left, right):
    """Recursive merge sort helper"""
    if left < right:
        mid = (left + right) // 2
        
        # Recursively sort both halves
        await merge_sort_helper(arr, left, mid)
        await merge_sort_helper(arr, mid + 1, right)
        
        # Merge the sorted halves
        await merge(arr, left, mid, right)

async def merge(arr, left, mid, right):
    """Merge two sorted subarrays"""
    # Create temporary arrays
    left_arr = arr[left:mid + 1]
    right_arr = arr[mid + 1:right + 1]
    
    i = j = 0
    k = left
    
    # Merge the temporary arrays back into arr
    while i < len(left_arr) and j < len(right_arr):
        await compare(left + i, mid + 1 + j)
        
        if left_arr[i] <= right_arr[j]:
            arr[k] = left_arr[i]
            i += 1
        else:
            arr[k] = right_arr[j]
            j += 1
        
        await render_array(arr)
        k += 1
    
    # Copy remaining elements of left_arr
    while i < len(left_arr):
        arr[k] = left_arr[i]
        await render_array(arr)
        i += 1
        k += 1
    
    # Copy remaining elements of right_arr
    while j < len(right_arr):
        arr[k] = right_arr[j]
        await render_array(arr)
        j += 1
        k += 1

# Bottom-up Merge Sort (iterative version)
async def bottom_up_merge_sort(arr):
    """Iterative merge sort implementation"""
    n = len(arr)
    
    size = 1
    while size < n:
        for left in range(0, n - 1, 2 * size):
            mid = min(left + size - 1, n - 1)
            right = min(left + 2 * size - 1, n - 1)
            
            if mid < right:
                await merge(arr, left, mid, right)
        
        size *= 2

# In-place Merge Sort (more complex but saves space)
async def in_place_merge_sort(arr):
    """In-place merge sort implementation"""
    await in_place_merge_sort_helper(arr, 0, len(arr) - 1)

async def in_place_merge_sort_helper(arr, left, right):
    """Helper for in-place merge sort"""
    if left < right:
        mid = (left + right) // 2
        
        await in_place_merge_sort_helper(arr, left, mid)
        await in_place_merge_sort_helper(arr, mid + 1, right)
        
        await in_place_merge(arr, left, mid, right)

async def in_place_merge(arr, left, mid, right):
    """In-place merge operation"""
    i = left
    j = mid + 1
    
    while i <= mid and j <= right:
        await compare(i, j)
        
        if arr[i] <= arr[j]:
            i += 1
        else:
            # Rotate the subarray
            value = arr[j]
            k = j
            
            while k > i:
                arr[k] = arr[k - 1]
                await render_array(arr)
                k -= 1
            
            arr[i] = value
            await render_array(arr)
            
            i += 1
            mid += 1
            j += 1

# Merge Sort with detailed logging
async def merge_sort_with_logging(arr):
    """Merge sort with detailed logging"""
    log("Starting Merge Sort")
    await merge_sort_helper_with_logging(arr, 0, len(arr) - 1)
    log("Merge Sort completed")

async def merge_sort_helper_with_logging(arr, left, right):
    """Helper with logging for merge sort"""
    if left < right:
        mid = (left + right) // 2
        
        log(f"Splitting array [{left}:{right}] at midpoint {mid}")
        
        await merge_sort_helper_with_logging(arr, left, mid)
        await merge_sort_helper_with_logging(arr, mid + 1, right)
        
        log(f"Merging subarrays [{left}:{mid}] and [{mid + 1}:{right}]")
        await merge_with_logging(arr, left, mid, right)

async def merge_with_logging(arr, left, mid, right):
    """Merge operation with detailed logging"""
    left_arr = arr[left:mid + 1]
    right_arr = arr[mid + 1:right + 1]
    
    i = j = 0
    k = left
    merge_count = 0
    
    while i < len(left_arr) and j < len(right_arr):
        await compare(left + i, mid + 1 + j)
        merge_count += 1
        
        if left_arr[i] <= right_arr[j]:
            arr[k] = left_arr[i]
            i += 1
            log(f"Placed {arr[k]} from left subarray at position {k}")
        else:
            arr[k] = right_arr[j]
            j += 1
            log(f"Placed {arr[k]} from right subarray at position {k}")
        
        await render_array(arr)
        k += 1
    
    while i < len(left_arr):
        arr[k] = left_arr[i]
        await render_array(arr)
        log(f"Placed remaining {arr[k]} from left subarray at position {k}")
        i += 1
        k += 1
    
    while j < len(right_arr):
        arr[k] = right_arr[j]
        await render_array(arr)
        log(f"Placed remaining {arr[k]} from right subarray at position {k}")
        j += 1
        k += 1
    
    log(f"Merge completed with {merge_count} comparisons")

# Natural Merge Sort (detects already sorted runs)
async def natural_merge_sort(arr):
    """Natural merge sort that detects sorted runs"""
    runs = []
    i = 0
    
    # Find natural runs
    while i < len(arr):
        run_start = i
        
        while i < len(arr) - 1 and arr[i] <= arr[i + 1]:
            i += 1
        
        run_end = i
        runs.append((run_start, run_end))
        i += 1
    
    log(f"Found {len(runs)} natural runs")
    
    # Merge runs until only one remains
    while len(runs) > 1:
        new_runs = []
        
        for i in range(0, len(runs) - 1, 2):
            left_start, left_end = runs[i]
            right_start, right_end = runs[i + 1]
            
            await merge(arr, left_start, left_end, right_end)
            new_runs.append((left_start, right_end))
        
        if len(runs) % 2 == 1:
            new_runs.append(runs[-1])
        
        runs = new_runs
        log(f"Merged runs, now have {len(runs)} runs")

# Merge Sort with statistics
async def merge_sort_with_stats(arr):
    """Merge sort with performance statistics"""
    total_comparisons = 0
    total_merges = 0
    recursion_depth = 0
    max_recursion_depth = 0
    
    # Override global functions to track statistics
    original_compare = globals().get('compare')
    original_log = globals().get('log')
    
    async def stats_compare(i, j):
        nonlocal total_comparisons
        total_comparisons += 1
        return await original_compare(i, j)
    
    def stats_log(message):
        nonlocal total_merges
        if "Merge completed" in message:
            total_merges += 1
        return original_log(message)
    
    # Set up tracking functions
    globals()['compare'] = stats_compare
    globals()['log'] = stats_log
    
    async def stats_merge_sort_helper(arr, left, right, depth):
        nonlocal recursion_depth, max_recursion_depth
        recursion_depth += 1
        max_recursion_depth = max(max_recursion_depth, recursion_depth)
        
        if left < right:
            mid = (left + right) // 2
            await stats_merge_sort_helper(arr, left, mid, depth + 1)
            await stats_merge_sort_helper(arr, mid + 1, right, depth + 1)
            await merge(arr, left, mid, right)
        
        recursion_depth -= 1
    
    await stats_merge_sort_helper(arr, 0, len(arr) - 1, 1)
    
    # Restore original functions
    globals()['compare'] = original_compare
    globals()['log'] = original_log
    
    log(f"Merge Sort Statistics:")
    log(f"  Total Comparisons: {total_comparisons}")
    log(f"  Total Merges: {total_merges}")
    log(f"  Max Recursion Depth: {max_recursion_depth}")
    log(f"  Comparisons per Merge: {(total_comparisons / total_merges):.2f}")

# Test functions for standalone testing
def test_merge_sort():
    """Test merge sort implementation"""
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
    globals()['compare'] = mock_compare
    globals()['swap'] = mock_swap
    globals()['render_array'] = mock_render_array
    globals()['log'] = mock_log
    
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
            ("Merge Sort", merge_sort),
            ("Bottom-up Merge Sort", bottom_up_merge_sort),
            ("In-place Merge Sort", in_place_merge_sort),
            ("Natural Merge Sort", natural_merge_sort),
            ("Merge Sort with Logging", merge_sort_with_logging),
            ("Merge Sort with Stats", merge_sort_with_stats),
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
    test_merge_sort()
