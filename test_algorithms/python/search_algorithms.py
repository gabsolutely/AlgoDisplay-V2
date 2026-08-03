# Search Algorithms for AlgoDisplay
# These algorithms demonstrate searching techniques with visualization

# Linear Search
async def linear_search(arr, target):
    """Linear search implementation"""
    log(f"Starting linear search for target: {target}")
    
    for i in range(len(arr)):
        await compare(i, -1)  # Compare with target (using -1 for target)
        
        log(f"Checking element {arr[i]} at position {i}")
        
        if arr[i] == target:
            log(f"Found target {target} at position {i}")
            return i  # Return index of found element
        
        await sleep(0.1)  # Small delay for visualization
    
    log(f"Target {target} not found in array")
    return -1  # Target not found

# Binary Search (requires sorted array)
async def binary_search(arr, target):
    """Binary search implementation"""
    log(f"Starting binary search for target: {target}")
    
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        await compare(mid, -1)  # Compare middle element with target
        log(f"Checking middle element {arr[mid]} at position {mid}")
        
        if arr[mid] == target:
            log(f"Found target {target} at position {mid}")
            return mid
        elif arr[mid] < target:
            log(f"{arr[mid]} < {target}, searching right half")
            left = mid + 1
        else:
            log(f"{arr[mid]} > {target}, searching left half")
            right = mid - 1
        
        await sleep(0.2)  # Delay for visualization
    
    log(f"Target {target} not found in array")
    return -1

# Jump Search (requires sorted array)
async def jump_search(arr, target):
    """Jump search implementation"""
    log(f"Starting jump search for target: {target}")
    
    import math
    n = len(arr)
    step = int(math.sqrt(n))
    prev = 0
    
    # Find the block where element could be present
    while arr[min(step, n) - 1] < target:
        await compare(min(step, n) - 1, -1)
        log(f"Jumping to next block, current element: {arr[min(step, n) - 1]}")
        
        prev = step
        step += int(math.sqrt(n))
        
        if prev >= n:
            log(f"Target {target} not found in array")
            return -1
        
        await sleep(0.3)
    
    # Linear search in the identified block
    while arr[prev] < target:
        await compare(prev, -1)
        log(f"Linear search in block, checking element: {arr[prev]}")
        
        prev += 1
        
        if prev == min(step, n):
            log(f"Target {target} not found in array")
            return -1
        
        await sleep(0.15)
    
    # Check if element is found
    if arr[prev] == target:
        log(f"Found target {target} at position {prev}")
        return prev
    
    log(f"Target {target} not found in array")
    return -1

# Interpolation Search (requires sorted array, works best on uniformly distributed data)
async def interpolation_search(arr, target):
    """Interpolation search implementation"""
    log(f"Starting interpolation search for target: {target}")
    
    left = 0
    right = len(arr) - 1
    
    while left <= right and target >= arr[left] and target <= arr[right]:
        if left == right:
            if arr[left] == target:
                log(f"Found target {target} at position {left}")
                return left
            break
        
        # Estimate position using interpolation formula
        pos = left + int(((target - arr[left]) * (right - left)) / (arr[right] - arr[left]))
        
        await compare(pos, -1)
        log(f"Interpolated position {pos}, element: {arr[pos]}")
        
        if arr[pos] == target:
            log(f"Found target {target} at position {pos}")
            return pos
        elif arr[pos] < target:
            log(f"{arr[pos]} < {target}, searching right half")
            left = pos + 1
        else:
            log(f"{arr[pos]} > {target}, searching left half")
            right = pos - 1
        
        await sleep(0.25)
    
    log(f"Target {target} not found in array")
    return -1

# Exponential Search (requires sorted array)
async def exponential_search(arr, target):
    """Exponential search implementation"""
    log(f"Starting exponential search for target: {target}")
    
    n = len(arr)
    
    if arr[0] == target:
        log(f"Found target {target} at position 0")
        return 0
    
    # Find range for binary search by repeated doubling
    i = 1
    while i < n and arr[i] <= target:
        await compare(i, -1)
        log(f"Checking element {arr[i]} at position {i} (range expansion)")
        
        i = i * 2
        await sleep(0.2)
    
    # Perform binary search on the found range
    left = i // 2
    right = min(i, n - 1)
    
    log(f"Performing binary search in range [{left}, {right}]")
    
    while left <= right:
        mid = (left + right) // 2
        
        await compare(mid, -1)
        log(f"Binary search - checking element {arr[mid]} at position {mid}")
        
        if arr[mid] == target:
            log(f"Found target {target} at position {mid}")
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
        
        await sleep(0.2)
    
    log(f"Target {target} not found in array")
    return -1

# Fibonacci Search (requires sorted array)
async def fibonacci_search(arr, target):
    """Fibonacci search implementation"""
    log(f"Starting Fibonacci search for target: {target}")
    
    n = len(arr)
    
    # Initialize fibonacci numbers
    fibM2 = 0  # (m-2)th Fibonacci number
    fibM1 = 1  # (m-1)th Fibonacci number
    fibM = fibM2 + fibM1  # mth Fibonacci number
    
    # Find the smallest Fibonacci number greater than or equal to n
    while fibM < n:
        fibM2 = fibM1
        fibM1 = fibM
        fibM = fibM2 + fibM1
    
    # Marks the eliminated range from front
    offset = -1
    
    while fibM > 1:
        # Check if fibM2 is a valid location
        i = min(offset + fibM2, n - 1)
        
        await compare(i, -1)
        log(f"Checking element {arr[i]} at position {i}")
        
        if arr[i] < target:
            log(f"{arr[i]} < {target}, moving to next Fibonacci range")
            fibM = fibM1
            fibM1 = fibM2
            fibM2 = fibM - fibM1
            offset = i
        elif arr[i] > target:
            log(f"{arr[i]} > {target}, reducing Fibonacci range")
            fibM = fibM2
            fibM1 = fibM1 - fibM2
            fibM2 = fibM - fibM1
        else:
            log(f"Found target {target} at position {i}")
            return i
        
        await sleep(0.25)
    
    # Compare the last element with target
    if fibM1 and offset + 1 < n and arr[offset + 1] == target:
        log(f"Found target {target} at position {offset + 1}")
        return offset + 1
    
    log(f"Target {target} not found in array")
    return -1

# Search with visualization of all steps
async def search_with_visualization(arr, target, search_function):
    """Search with comprehensive visualization"""
    log(f"=== Starting Search Visualization ===")
    log(f"Array: [{', '.join(map(str, arr))}]")
    log(f"Target: {target}")
    log(f"Algorithm: {search_function.__name__}")
    
    result = await search_function(arr, target)
    
    if result != -1:
        log(f"✓ Search successful! Found at index {result}")
    else:
        log(f"✗ Search failed! Target not found")
    
    log(f"=== Search Complete ===")
    return result

# Multiple search comparison
async def compare_search_algorithms(arr, target):
    """Compare all search algorithms on the same array and target"""
    log(f"Comparing all search algorithms for target: {target}")
    log(f"Array: [{', '.join(map(str, arr))}]")
    
    algorithms = [
        linear_search,
        binary_search,
        jump_search,
        interpolation_search,
        exponential_search,
        fibonacci_search
    ]
    
    results = {}
    
    for algorithm in algorithms:
        log(f"\n--- Testing {algorithm.__name__} ---")
        
        # Create a copy of the array for each test
        arr_copy = arr.copy()
        
        import time
        start_time = time.perf_counter()
        result = await algorithm(arr_copy, target)
        end_time = time.perf_counter()
        
        results[algorithm.__name__] = {
            'result': result,
            'time': (end_time - start_time) * 1000  # Convert to ms
        }
        
        log(f"{algorithm.__name__} result: {'Found' if result != -1 else 'Not found'} ({results[algorithm.__name__]['time']:.2f}ms)")
    
    # Summary
    log(f"\n=== Search Algorithm Comparison Summary ===")
    for name, result in results.items():
        status = f"Found at {result['result']}" if result['result'] != -1 else 'Not found'
        log(f"{name}: {status} ({result['time']:.2f}ms)")
    
    return results

# Search with performance statistics
async def search_with_stats(arr, target, search_function):
    """Search with detailed performance statistics"""
    total_comparisons = 0
    total_accesses = 0
    
    # Override global functions to track statistics
    original_compare = globals().get('compare')
    original_log = globals().get('log')
    
    async def stats_compare(i, j):
        nonlocal total_comparisons, total_accesses
        total_comparisons += 1
        total_accesses += 1
        return await original_compare(i, j)
    
    def stats_log(message):
        return original_log(message)
    
    # Set up tracking functions
    globals()['compare'] = stats_compare
    globals()['log'] = stats_log
    
    import time
    start_time = time.perf_counter()
    result = await search_function(arr, target)
    end_time = time.perf_counter()
    
    # Restore original functions
    globals()['compare'] = original_compare
    globals()['log'] = original_log
    
    execution_time = (end_time - start_time) * 1000
    
    log(f"{search_function.__name__} Statistics:")
    log(f"  Execution Time: {execution_time:.2f}ms")
    log(f"  Total Comparisons: {total_comparisons}")
    log(f"  Array Accesses: {total_accesses}")
    log(f"  Comparisons per Element: {total_comparisons / len(arr):.2f}")
    log(f"  Result: {'Found at ' + str(result) if result != -1 else 'Not found'}")
    
    return {
        'result': result,
        'time': execution_time,
        'comparisons': total_comparisons,
        'accesses': total_accesses
    }

# Test functions for standalone testing
def test_search_algorithms():
    """Test search algorithms implementation"""
    import asyncio
    
    async def mock_compare(i, j):
        pass
    
    async def mock_swap(arr, i, j):
        arr[i], arr[j] = arr[j], arr[i]
    
    async def mock_render_array(arr):
        pass
    
    async def mock_sleep(seconds):
        await asyncio.sleep(seconds)
    
    async def mock_log(message):
        print(message)
    
    # Mock the global functions
    globals()['compare'] = mock_compare
    globals()['swap'] = mock_swap
    globals()['render_array'] = mock_render_array
    globals()['sleep'] = mock_sleep
    globals()['log'] = mock_log
    
    async def run_test():
        # Test arrays
        unsorted_arr = [64, 34, 25, 12, 22, 11, 90, 88, 45, 50]
        sorted_arr = sorted(unsorted_arr)
        
        # Test targets
        targets = [25, 90, 11, 99]  # Include one that doesn't exist
        
        algorithms = [
            ("Linear Search", linear_search),
            ("Binary Search", binary_search),
            ("Jump Search", jump_search),
            ("Interpolation Search", interpolation_search),
            ("Exponential Search", exponential_search),
            ("Fibonacci Search", fibonacci_search),
        ]
        
        print("Testing Search Algorithms")
        print("=" * 50)
        
        for target in targets:
            print(f"\nSearching for target: {target}")
            print("-" * 30)
            
            for algo_name, algo_func in algorithms:
                print(f"\n{algo_name}:")
                
                # Use sorted array for algorithms that require it
                test_arr = sorted_arr if algo_func != linear_search else unsorted_arr
                
                result = await algo_func(test_arr, target)
                status = "Found" if result != -1 else "Not found"
                print(f"  Result: {status} (index: {result})")
        
        # Test comparison function
        print(f"\n\nComparing all algorithms for target 25:")
        print("=" * 50)
        await compare_search_algorithms(sorted_arr, 25)
    
    asyncio.run(run_test())

if __name__ == "__main__":
    test_search_algorithms()
