# Quick Sort Algorithm for AlgoDisplay
# Time Complexity: O(n log n) average, O(n²) worst case
# Space Complexity: O(log n) average, O(n) worst case

async def quick_sort(arr):
    """Standard quick sort implementation"""
    await quick_sort_helper(arr, 0, len(arr) - 1)

async def quick_sort_helper(arr, low, high):
    """Recursive quick sort helper"""
    if low < high:
        # Partition the array and get the pivot index
        pivot_index = await partition(arr, low, high)
        
        # Recursively sort elements before and after partition
        await quick_sort_helper(arr, low, pivot_index - 1)
        await quick_sort_helper(arr, pivot_index + 1, high)

async def partition(arr, low, high):
    """Standard partition using last element as pivot"""
    # Choose the rightmost element as pivot
    pivot = arr[high]
    i = low - 1  # Index of smaller element
    
    log(f"Selected pivot {pivot} at position {high}")
    
    for j in range(low, high):
        await compare(j, high)
        
        # If current element is smaller than or equal to pivot
        if arr[j] <= pivot:
            i += 1
            
            if i != j:
                await swap(arr, i, j)
                log(f"Swapped {arr[j]} with {arr[i]}")
    
    # Place pivot in the correct position
    if i + 1 != high:
        await swap(arr, i + 1, high)
        log(f"Placed pivot {pivot} at position {i + 1}")
    
    return i + 1

# Quick Sort with randomized pivot selection
async def randomized_quick_sort(arr):
    """Quick sort with randomized pivot selection"""
    await randomized_quick_sort_helper(arr, 0, len(arr) - 1)

async def randomized_quick_sort_helper(arr, low, high):
    """Helper for randomized quick sort"""
    if low < high:
        pivot_index = await randomized_partition(arr, low, high)
        await randomized_quick_sort_helper(arr, low, pivot_index - 1)
        await randomized_quick_sort_helper(arr, pivot_index + 1, high)

async def randomized_partition(arr, low, high):
    """Partition with randomized pivot selection"""
    import random
    
    # Generate a random index between low and high
    random_index = random.randint(low, high)
    
    # Swap random element with the last element
    if random_index != high:
        await swap(arr, random_index, high)
        log(f"Randomized pivot: swapped {arr[high]} with {arr[random_index]}")
    
    return await partition(arr, low, high)

# Quick Sort with median-of-three pivot selection
async def median_of_three_quick_sort(arr):
    """Quick sort with median-of-three pivot selection"""
    await median_of_three_quick_sort_helper(arr, 0, len(arr) - 1)

async def median_of_three_quick_sort_helper(arr, low, high):
    """Helper for median-of-three quick sort"""
    if low < high:
        pivot_index = await median_of_three_partition(arr, low, high)
        await median_of_three_quick_sort_helper(arr, low, pivot_index - 1)
        await median_of_three_quick_sort_helper(arr, pivot_index + 1, high)

async def median_of_three_partition(arr, low, high):
    """Partition using median-of-three pivot selection"""
    mid = (low + high) // 2
    
    # Find median of first, middle, and last elements
    await compare(low, mid)
    await compare(mid, high)
    await compare(low, high)
    
    # Order the three elements
    if arr[low] > arr[mid]:
        await swap(arr, low, mid)
    if arr[mid] > arr[high]:
        await swap(arr, mid, high)
    if arr[low] > arr[mid]:
        await swap(arr, low, mid)
    
    # Place median at the end as pivot
    if mid != high:
        await swap(arr, mid, high)
        log(f"Median-of-three pivot: selected {arr[high]} at position {high}")
    
    return await partition(arr, low, high)

# Iterative Quick Sort (stack-based)
async def iterative_quick_sort(arr):
    """Iterative quick sort using explicit stack"""
    # Create a stack for storing subarray indices
    stack = []
    
    # Push initial values
    stack.append(0)
    stack.append(len(arr) - 1)
    
    while len(stack) > 0:
        # Pop high and low
        high = stack.pop()
        low = stack.pop()
        
        if low < high:
            pivot_index = await partition(arr, low, high)
            
            # Push right side
            if pivot_index + 1 < high:
                stack.append(pivot_index + 1)
                stack.append(high)
            
            # Push left side
            if low < pivot_index - 1:
                stack.append(low)
                stack.append(pivot_index - 1)

# Quick Sort with detailed logging and statistics
async def quick_sort_with_stats(arr):
    """Quick sort with detailed statistics tracking"""
    total_comparisons = 0
    total_swaps = 0
    recursion_depth = 0
    max_recursion_depth = 0
    
    # Override global functions to track statistics
    original_compare = globals().get('compare')
    original_swap = globals().get('swap')
    original_log = globals().get('log')
    
    async def stats_compare(i, j):
        nonlocal total_comparisons
        total_comparisons += 1
        return await original_compare(i, j)
    
    async def stats_swap(arr, i, j):
        nonlocal total_swaps
        total_swaps += 1
        return await original_swap(arr, i, j)
    
    def stats_log(message):
        return original_log(message)
    
    # Set up tracking functions
    globals()['compare'] = stats_compare
    globals()['swap'] = stats_swap
    globals()['log'] = stats_log
    
    async def stats_quick_sort_helper(arr, low, high, depth):
        nonlocal recursion_depth, max_recursion_depth
        recursion_depth += 1
        max_recursion_depth = max(max_recursion_depth, recursion_depth)
        
        log(f"Recursion depth: {depth}, sorting [{low}:{high}]")
        
        if low < high:
            pivot_index = await partition(arr, low, high)
            
            await stats_quick_sort_helper(arr, low, pivot_index - 1, depth + 1)
            await stats_quick_sort_helper(arr, pivot_index + 1, high, depth + 1)
        
        recursion_depth -= 1
    
    await stats_quick_sort_helper(arr, 0, len(arr) - 1, 1)
    
    # Restore original functions
    globals()['compare'] = original_compare
    globals()['swap'] = original_swap
    globals()['log'] = original_log
    
    log(f"Quick Sort Statistics:")
    log(f"  Total Comparisons: {total_comparisons}")
    log(f"  Total Swaps: {total_swaps}")
    log(f"  Max Recursion Depth: {max_recursion_depth}")
    log(f"  Efficiency Ratio: {(total_comparisons / total_swaps):.2f}")

# Quick Sort with three-way partitioning (Dutch National Flag)
async def three_way_quick_sort(arr):
    """Quick sort with three-way partitioning"""
    await three_way_quick_sort_helper(arr, 0, len(arr) - 1)

async def three_way_quick_sort_helper(arr, low, high):
    """Helper for three-way quick sort"""
    if low >= high:
        return
    
    # Three-way partition
    lt = low      # Elements < pivot
    gt = high     # Elements > pivot
    i = low       # Current element
    pivot = arr[low]
    
    log(f"Three-way partition with pivot {pivot}")
    
    while i <= gt:
        await compare(i, low)
        
        if arr[i] < pivot:
            if i != lt:
                await swap(arr, i, lt)
            i += 1
            lt += 1
        elif arr[i] > pivot:
            await swap(arr, i, gt)
            gt -= 1
        else:
            i += 1
    
    # Recursively sort the < and > partitions
    await three_way_quick_sort_helper(arr, low, lt - 1)
    await three_way_quick_sort_helper(arr, gt + 1, high)

# Tail-call optimized Quick Sort
async def tail_call_quick_sort(arr):
    """Tail-call optimized quick sort"""
    await tail_call_quick_sort_helper(arr, 0, len(arr) - 1)

async def tail_call_quick_sort_helper(arr, low, high):
    """Helper for tail-call optimized quick sort"""
    while low < high:
        pivot_index = await partition(arr, low, high)
        
        # Recursively sort the smaller subarray first
        if pivot_index - low < high - pivot_index:
            await tail_call_quick_sort_helper(arr, low, pivot_index - 1)
            low = pivot_index + 1
        else:
            await tail_call_quick_sort_helper(arr, pivot_index + 1, high)
            high = pivot_index - 1

# Quick Sort with insertion sort for small arrays
async def hybrid_quick_sort(arr):
    """Hybrid quick sort that uses insertion sort for small arrays"""
    await hybrid_quick_sort_helper(arr, 0, len(arr) - 1)

async def hybrid_quick_sort_helper(arr, low, high):
    """Helper for hybrid quick sort"""
    # Use insertion sort for small subarrays
    if high - low <= 10:
        await insertion_sort_subarray(arr, low, high)
        return
    
    if low < high:
        pivot_index = await partition(arr, low, high)
        await hybrid_quick_sort_helper(arr, low, pivot_index - 1)
        await hybrid_quick_sort_helper(arr, pivot_index + 1, high)

async def insertion_sort_subarray(arr, low, high):
    """Insertion sort for a subarray"""
    for i in range(low + 1, high + 1):
        key = arr[i]
        j = i - 1
        
        while j >= low:
            await compare(j, i)
            
            if arr[j] > key:
                arr[j + 1] = arr[j]
                await render_array(arr)
                j -= 1
            else:
                break
        
        arr[j + 1] = key
        await render_array(arr)

# Test functions for standalone testing
def test_quick_sort():
    """Test quick sort implementation"""
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
            ("Quick Sort", quick_sort),
            ("Randomized Quick Sort", randomized_quick_sort),
            ("Median-of-Three Quick Sort", median_of_three_quick_sort),
            ("Iterative Quick Sort", iterative_quick_sort),
            ("Three-Way Quick Sort", three_way_quick_sort),
            ("Tail-Call Quick Sort", tail_call_quick_sort),
            ("Hybrid Quick Sort", hybrid_quick_sort),
            ("Quick Sort with Stats", quick_sort_with_stats),
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
    test_quick_sort()
