# Heap Sort Algorithm for AlgoDisplay
# Time Complexity: O(n log n)
# Space Complexity: O(1)

async def heap_sort(arr):
    """Standard heap sort implementation"""
    n = len(arr)
    
    # Build heap (rearrange array)
    await build_heap(arr, n)
    
    # One by one extract an element from heap
    for i in range(n - 1, 0, -1):
        # Move current root to end
        await swap(arr, 0, i)
        log(f"Swapped root {arr[i]} to position {i}")
        
        # Call maxHeapify on the reduced heap
        await max_heapify(arr, 0, i)

async def build_heap(arr, n):
    """Build max heap from array"""
    # Build max heap from last non-leaf node
    for i in range(n // 2 - 1, -1, -1):
        await max_heapify(arr, i, n)

async def max_heapify(arr, i, heap_size):
    """Maintain max heap property"""
    largest = i        # Initialize largest as root
    left = 2 * i + 1   # left child
    right = 2 * i + 2  # right child
    
    # If left child is larger than root
    if left < heap_size:
        await compare(left, largest)
        if arr[left] > arr[largest]:
            largest = left
    
    # If right child is larger than largest so far
    if right < heap_size:
        await compare(right, largest)
        if arr[right] > arr[largest]:
            largest = right
    
    # If largest is not root
    if largest != i:
        await swap(arr, i, largest)
        log(f"Swapped {arr[largest]} with {arr[i]} to maintain heap property")
        
        # Recursively heapify the affected sub-tree
        await max_heapify(arr, largest, heap_size)

# Heap Sort with detailed logging
async def heap_sort_with_logging(arr):
    """Heap sort with detailed logging"""
    n = len(arr)
    
    log("Building initial max heap")
    await build_heap_with_logging(arr, n)
    log("Max heap built")
    
    for i in range(n - 1, 0, -1):
        log(f"Extracting max element {arr[0]} to position {i}")
        await swap(arr, 0, i)
        
        log(f"Rebuilding heap for remaining {i} elements")
        await max_heapify_with_logging(arr, 0, i)
        log(f"Heap rebuilt for positions 0 to {i - 1}")
    
    log("Heap sort completed")

async def build_heap_with_logging(arr, n):
    """Build heap with logging"""
    for i in range(n // 2 - 1, -1, -1):
        log(f"Heapifying node {i} with value {arr[i]}")
        await max_heapify_with_logging(arr, i, n)

async def max_heapify_with_logging(arr, i, heap_size):
    """Max heapify with detailed logging"""
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    
    if left < heap_size:
        await compare(left, largest)
        if arr[left] > arr[largest]:
            largest = left
            log(f"Left child {arr[left]} is larger than parent {arr[i]}")
    
    if right < heap_size:
        await compare(right, largest)
        if arr[right] > arr[largest]:
            largest = right
            log(f"Right child {arr[right]} is larger than current largest {arr[largest]}")
    
    if largest != i:
        await swap(arr, i, largest)
        log(f"Swapped parent {arr[largest]} with child {arr[i]}")
        await max_heapify_with_logging(arr, largest, heap_size)

# Min Heap Sort (sorts in descending order)
async def min_heap_sort(arr):
    """Min heap sort (results in descending order)"""
    n = len(arr)
    
    # Build min heap
    await build_min_heap(arr, n)
    
    # Extract elements one by one
    for i in range(n - 1, 0, -1):
        # Move current root to end
        await swap(arr, 0, i)
        log(f"Swapped min element {arr[i]} to position {i}")
        
        # Call minHeapify on the reduced heap
        await min_heapify(arr, 0, i)

async def build_min_heap(arr, n):
    """Build min heap from array"""
    for i in range(n // 2 - 1, -1, -1):
        await min_heapify(arr, i, n)

async def min_heapify(arr, i, heap_size):
    """Maintain min heap property"""
    smallest = i
    left = 2 * i + 1
    right = 2 * i + 2
    
    if left < heap_size:
        await compare(left, smallest)
        if arr[left] < arr[smallest]:
            smallest = left
    
    if right < heap_size:
        await compare(right, smallest)
        if arr[right] < arr[smallest]:
            smallest = right
    
    if smallest != i:
        await swap(arr, i, smallest)
        await min_heapify(arr, smallest, heap_size)

# Heap Sort with statistics tracking
async def heap_sort_with_stats(arr):
    """Heap sort with performance statistics"""
    n = len(arr)
    total_comparisons = 0
    total_swaps = 0
    heapify_calls = 0
    
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
    
    async def stats_max_heapify(arr, i, heap_size):
        nonlocal heapify_calls
        heapify_calls += 1
        largest = i
        left = 2 * i + 1
        right = 2 * i + 2
        
        if left < heap_size:
            await compare(left, largest)
            if arr[left] > arr[largest]:
                largest = left
        
        if right < heap_size:
            await compare(right, largest)
            if arr[right] > arr[largest]:
                largest = right
        
        if largest != i:
            await swap(arr, i, largest)
            await stats_max_heapify(arr, largest, heap_size)
    
    async def stats_build_heap(arr, n):
        for i in range(n // 2 - 1, -1, -1):
            await stats_max_heapify(arr, i, n)
    
    # Build heap
    await stats_build_heap(arr, n)
    
    # Extract elements
    for i in range(n - 1, 0, -1):
        await swap(arr, 0, i)
        await stats_max_heapify(arr, 0, i)
    
    # Restore original functions
    globals()['compare'] = original_compare
    globals()['swap'] = original_swap
    globals()['log'] = original_log
    
    log(f"Heap Sort Statistics:")
    log(f"  Total Comparisons: {total_comparisons}")
    log(f"  Total Swaps: {total_swaps}")
    log(f"  Heapify Calls: {heapify_calls}")
    log(f"  Comparisons per Swap: {(total_comparisons / total_swaps):.2f}")

# Iterative Heap Sort (avoids recursion)
async def iterative_heap_sort(arr):
    """Iterative heap sort implementation"""
    n = len(arr)
    
    # Build heap
    await build_heap(arr, n)
    
    # Extract elements iteratively
    for i in range(n - 1, 0, -1):
        await swap(arr, 0, i)
        
        # Iterative maxHeapify
        index = 0
        heap_size = i
        
        while True:
            largest = index
            left = 2 * index + 1
            right = 2 * index + 2
            
            if left < heap_size:
                await compare(left, largest)
                if arr[left] > arr[largest]:
                    largest = left
            
            if right < heap_size:
                await compare(right, largest)
                if arr[right] > arr[largest]:
                    largest = right
            
            if largest != index:
                await swap(arr, index, largest)
                index = largest
            else:
                break

# Bottom-up Heap Sort (more efficient heap building)
async def bottom_up_heap_sort(arr):
    """Bottom-up heap sort implementation"""
    n = len(arr)
    
    # Build heap using bottom-up approach
    await bottom_up_build_heap(arr, n)
    
    # Extract elements
    for i in range(n - 1, 0, -1):
        await swap(arr, 0, i)
        await max_heapify(arr, 0, i)

async def bottom_up_build_heap(arr, n):
    """Build heap using bottom-up approach"""
    # Start from the last non-leaf node
    for i in range(n // 2 - 1, -1, -1):
        # Sift down the element at index i
        await sift_down(arr, i, n)

async def sift_down(arr, i, heap_size):
    """Sift down operation for heap building"""
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    
    if left < heap_size:
        await compare(left, largest)
        if arr[left] > arr[largest]:
            largest = left
    
    if right < heap_size:
        await compare(right, largest)
        if arr[right] > arr[largest]:
            largest = right
    
    if largest != i:
        await swap(arr, i, largest)
        await sift_down(arr, largest, heap_size)

# Test functions for standalone testing
def test_heap_sort():
    """Test heap sort implementation"""
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
            ("Heap Sort", heap_sort),
            ("Heap Sort with Logging", heap_sort_with_logging),
            ("Min Heap Sort", min_heap_sort),
            ("Heap Sort with Stats", heap_sort_with_stats),
            ("Iterative Heap Sort", iterative_heap_sort),
            ("Bottom-up Heap Sort", bottom_up_heap_sort),
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
    test_heap_sort()
