# Test Runner for AlgoDisplay Python Algorithms
# This file provides a comprehensive testing framework for algorithm implementations

import asyncio
import time
from typing import List, Dict, Any, Callable, Tuple

class AlgorithmTester:
    def __init__(self):
        self.test_results = []
        self.current_test = None

    def create_mock_functions(self):
        """Create mock visualization functions for testing"""
        compare_count = 0
        swap_count = 0
        render_count = 0
        log_messages = []

        async def mock_compare(i, j):
            nonlocal compare_count
            compare_count += 1
            return

        async def mock_swap(arr, i, j):
            nonlocal swap_count
            swap_count += 1
            arr[i], arr[j] = arr[j], arr[i]
            return

        async def mock_render_array(arr):
            nonlocal render_count
            render_count += 1
            return

        async def mock_sleep(ms):
            await asyncio.sleep(ms / 1000.0)
            return

        def mock_log(message):
            nonlocal log_messages
            log_messages.append(message)

        def get_stats():
            return {
                'compares': compare_count,
                'swaps': swap_count,
                'renders': render_count,
                'logs': log_messages
            }

        def reset():
            nonlocal compare_count, swap_count, render_count, log_messages
            compare_count = 0
            swap_count = 0
            render_count = 0
            log_messages = []

        return {
            'compare': mock_compare,
            'swap': mock_swap,
            'render_array': mock_render_array,
            'sleep': mock_sleep,
            'log': mock_log,
            'get_stats': get_stats,
            'reset': reset
        }

    def is_sorted(self, arr: List[int]) -> bool:
        """Check if array is sorted"""
        for i in range(len(arr) - 1):
            if arr[i] > arr[i + 1]:
                return False
        return True

    def generate_test_arrays(self) -> List[List[int]]:
        """Generate various test cases"""
        return [
            [],  # Empty array
            [1],  # Single element
            [1, 2, 3, 4, 5],  # Already sorted
            [5, 4, 3, 2, 1],  # Reverse sorted
            [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5],  # Random with duplicates
            [10, 80, 30, 90, 40, 50, 70],  # Random
            [2, 2, 2, 2, 2],  # All elements equal
            [1, 3, 2, 4, 3, 5, 4, 6, 5, 7],  # Nearly sorted
        ]

    async def run_algorithm_test(self, algorithm_name: str, algorithm_function: Callable, test_array: List[int]) -> Dict[str, Any]:
        """Run a single algorithm test"""
        mock = self.create_mock_functions()
        original_array = test_array.copy()
        test_array_copy = test_array.copy()

        # Set up global functions for algorithm
        globals_dict = {
            'compare': mock['compare'],
            'swap': mock['swap'],
            'render_array': mock['render_array'],
            'sleep': mock['sleep'],
            'log': mock['log'],
            'arr': test_array_copy
        }

        try:
            start_time = time.perf_counter()
            
            # Execute algorithm with mock globals
            if algorithm_function.__code__.co_argcount == 1:
                await algorithm_function(test_array_copy)
            else:
                # For algorithms that expect global arr variable
                exec_globals = globals_dict.copy()
                exec_globals['__name__'] = '__main__'
                exec(algorithm_function.__code__, exec_globals)
                test_array_copy = exec_globals['arr']
            
            end_time = time.perf_counter()

            stats = mock['get_stats']()
            is_sorted = self.is_sorted(test_array_copy)

            return {
                'algorithm_name': algorithm_name,
                'input': original_array,
                'output': test_array_copy,
                'is_sorted': is_sorted,
                'execution_time': (end_time - start_time) * 1000,  # Convert to ms
                'stats': stats,
                'passed': is_sorted
            }
        except Exception as error:
            return {
                'algorithm_name': algorithm_name,
                'input': original_array,
                'output': test_array_copy,
                'error': str(error),
                'passed': False
            }

    async def run_comprehensive_test(self, algorithm_name: str, algorithm_function: Callable) -> Dict[str, Any]:
        """Run comprehensive tests for an algorithm"""
        print(f"Running tests for {algorithm_name}...")
        test_arrays = self.generate_test_arrays()
        results = []

        for i, test_array in enumerate(test_arrays):
            print(f"Test {i + 1}: [{', '.join(map(str, test_array))}]")
            
            result = await self.run_algorithm_test(algorithm_name, algorithm_function, test_array)
            results.append(result)
            
            print(f"Result: {'PASSED' if result['passed'] else 'FAILED'}")
            if not result['passed']:
                print(f"Error: {result.get('error', 'Array not sorted')}")
            print(f"Stats: {result['stats']['compares']} compares, {result['stats']['swaps']} swaps, {result['stats']['renders']} renders")
            print(f"Time: {result['execution_time']:.2f}ms")
            print('---')

        passed_tests = sum(1 for r in results if r['passed'])
        total_tests = len(results)
        
        print(f"\n{algorithm_name} Summary: {passed_tests}/{total_tests} tests passed")

        return {
            'algorithm_name': algorithm_name,
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'results': results
        }

    async def run_all_tests(self) -> List[Dict[str, Any]]:
        """Run all algorithm tests"""
        print('Starting AlgoDisplay Python Algorithm Tests...\n')

        # Import algorithm functions
        from bubble_sort import bubble_sort, optimized_bubble_sort, bubble_sort_with_stats
        from selection_sort import selection_sort, selection_sort_with_stats, selection_sort_with_min_tracking
        from insertion_sort import insertion_sort, insertion_sort_with_logging, binary_insertion_sort, insertion_sort_with_stats
        from merge_sort import merge_sort, bottom_up_merge_sort, in_place_merge_sort, merge_sort_with_logging, natural_merge_sort, merge_sort_with_stats
        from quick_sort import quick_sort, randomized_quick_sort, median_of_three_quick_sort, iterative_quick_sort, quick_sort_with_stats, three_way_quick_sort, tail_call_quick_sort, hybrid_quick_sort
        from heap_sort import heap_sort, heap_sort_with_logging, min_heap_sort, heap_sort_with_stats, iterative_heap_sort, bottom_up_heap_sort

        algorithms = [
            # Basic Sorting Algorithms
            ('Bubble Sort', bubble_sort),
            ('Optimized Bubble Sort', optimized_bubble_sort),
            ('Bubble Sort with Stats', bubble_sort_with_stats),
            ('Selection Sort', selection_sort),
            ('Selection Sort with Stats', selection_sort_with_stats),
            ('Selection Sort with Min Tracking', selection_sort_with_min_tracking),
            ('Insertion Sort', insertion_sort),
            ('Insertion Sort with Logging', insertion_sort_with_logging),
            ('Binary Insertion Sort', binary_insertion_sort),
            ('Insertion Sort with Stats', insertion_sort_with_stats),
            
            # Advanced Sorting Algorithms
            ('Merge Sort', merge_sort),
            ('Bottom-up Merge Sort', bottom_up_merge_sort),
            ('In-place Merge Sort', in_place_merge_sort),
            ('Merge Sort with Logging', merge_sort_with_logging),
            ('Natural Merge Sort', natural_merge_sort),
            ('Merge Sort with Stats', merge_sort_with_stats),
            
            ('Quick Sort', quick_sort),
            ('Randomized Quick Sort', randomized_quick_sort),
            ('Median-of-Three Quick Sort', median_of_three_quick_sort),
            ('Iterative Quick Sort', iterative_quick_sort),
            ('Quick Sort with Stats', quick_sort_with_stats),
            ('Three-Way Quick Sort', three_way_quick_sort),
            ('Tail-Call Quick Sort', tail_call_quick_sort),
            ('Hybrid Quick Sort', hybrid_quick_sort),
            
            ('Heap Sort', heap_sort),
            ('Heap Sort with Logging', heap_sort_with_logging),
            ('Min Heap Sort', min_heap_sort),
            ('Heap Sort with Stats', heap_sort_with_stats),
            ('Iterative Heap Sort', iterative_heap_sort),
            ('Bottom-up Heap Sort', bottom_up_heap_sort),
        ]

        all_results = []

        for algorithm_name, algorithm_func in algorithms:
            result = await self.run_comprehensive_test(algorithm_name, algorithm_func)
            all_results.append(result)
            print('\n' + '=' * 50 + '\n')

        # Final summary
        print('FINAL TEST SUMMARY')
        print('=' * 50)
        
        total_passed = 0
        total_tests = 0

        for result in all_results:
            print(f"{result['algorithm_name']}: {result['passed_tests']}/{result['total_tests']} tests passed")
            total_passed += result['passed_tests']
            total_tests += result['total_tests']

        print(f"\nOverall: {total_passed}/{total_tests} tests passed")
        print(f"Success Rate: {(total_passed / total_tests * 100):.1f}%")

        return all_results

# Performance benchmarking
class PerformanceBenchmark:
    def __init__(self):
        self.sizes = [5, 10, 20, 50, 100]
        self.algorithms = []

    def add_algorithm(self, name: str, func: Callable):
        """Add an algorithm to benchmark"""
        self.algorithms.append((name, func))

    async def benchmark_algorithm(self, name: str, func: Callable, size: int) -> Dict[str, Any]:
        """Benchmark a single algorithm with a specific array size"""
        import random
        test_array = [random.randint(1, 100) for _ in range(size)]
        
        tester = AlgorithmTester()
        result = await tester.run_algorithm_test(name, func, test_array)
        
        return {
            'size': size,
            'time': result['execution_time'],
            'compares': result['stats']['compares'],
            'swaps': result['stats']['swaps'],
            'passed': result['passed']
        }

    async def run_benchmarks(self) -> Dict[str, List[Dict[str, Any]]]:
        """Run all benchmarks"""
        print("Running Performance Benchmarks...")
        print("=" * 50)
        
        results = {}
        
        for name, func in self.algorithms:
            print(f"Benchmarking {name}...")
            results[name] = []
            
            for size in self.sizes:
                result = await self.benchmark_algorithm(name, func, size)
                results[name].append(result)
                print(f"  Size {size:3d}: {result['time']:6.2f}ms, {result['compares']:4d} compares, {result['swaps']:4d} swaps")
            
            print()
        
        return results

# Main execution
async def main():
    """Main test execution function"""
    tester = AlgorithmTester()
    
    # Run functional tests
    await tester.run_all_tests()
    
    print("\n" + "=" * 50)
    print("Running Performance Benchmarks...")
    print("=" * 50)
    
    # Run performance benchmarks
    benchmark = PerformanceBenchmark()
    
    # Add algorithms for benchmarking (only the basic versions)
    from bubble_sort import bubble_sort
    from selection_sort import selection_sort
    from insertion_sort import insertion_sort
    
    benchmark.add_algorithm('Bubble Sort', bubble_sort)
    benchmark.add_algorithm('Selection Sort', selection_sort)
    benchmark.add_algorithm('Insertion Sort', insertion_sort)
    
    await benchmark.run_benchmarks()

if __name__ == "__main__":
    asyncio.run(main())
