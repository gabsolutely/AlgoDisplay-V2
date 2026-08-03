# Performance Benchmark Suite for AlgoDisplay Python Algorithms
# This file provides comprehensive performance testing and analysis

import asyncio
import time
from typing import List, Dict, Any, Callable, Tuple
from test_data import (
    generate_random_array, generate_sorted_array, PERFORMANCE_SIZES,
    analyze_complexity
)

class PerformanceBenchmark:
    def __init__(self):
        self.results = {}
        self.algorithms = []

    def add_algorithm(self, name: str, func: Callable):
        """Add an algorithm to benchmark"""
        self.algorithms.append((name, func))

    async def benchmark_algorithm(self, name: str, func: Callable, size: int, test_array: List[int] = None) -> Dict[str, Any]:
        """Benchmark a single algorithm"""
        # Generate test array if not provided
        arr = test_array or generate_random_array(size)
        
        # Create mock functions for performance tracking
        compare_count = 0
        swap_count = 0
        render_count = 0

        async def mock_compare(i: int, j: int):
            nonlocal compare_count
            compare_count += 1

        async def mock_swap(arr: List[int], i: int, j: int):
            nonlocal swap_count
            swap_count += 1
            arr[i], arr[j] = arr[j], arr[i]

        async def mock_render_array(arr: List[int]):
            nonlocal render_count
            render_count += 1

        async def mock_sleep(ms: int):
            return

        def mock_log(message: str):
            pass  # Silent during benchmarking

        try:
            start_time = time.perf_counter()
            
            # Set up global functions and run algorithm
            globals_dict = {
                'compare': mock_compare,
                'swap': mock_swap,
                'render_array': mock_render_array,
                'sleep': mock_sleep,
                'log': mock_log,
                'arr': arr.copy()
            }
            
            if func.__code__.co_argcount == 1:
                await func(arr.copy())
            else:
                # For algorithms that expect global arr variable
                exec_globals = globals_dict.copy()
                exec_globals['__name__'] = '__main__'
                exec(func.__code__, exec_globals)
            
            end_time = time.perf_counter()

            return {
                'algorithm': name,
                'size': size,
                'time': (end_time - start_time) * 1000,  # Convert to ms
                'compares': compare_count,
                'swaps': swap_count,
                'renders': render_count,
                'success': True
            }
        except Exception as error:
            return {
                'algorithm': name,
                'size': size,
                'error': str(error),
                'success': False
            }

    async def run_benchmark_suite(self, sizes: List[int] = PERFORMANCE_SIZES) -> Dict[str, List[Dict[str, Any]]]:
        """Run comprehensive benchmark suite"""
        print('Running Performance Benchmarks...')
        print('=' * 80)
        
        results = {}

        for name, func in self.algorithms:
            print(f'\nBenchmarking {name}...')
            results[name] = []
            
            for size in sizes:
                result = await self.benchmark_algorithm(name, func, size)
                results[name].append(result)
                
                if result['success']:
                    print(f'  Size {size:3d}: {result["time"]:8.2f}ms, {result["compares"]:6d} compares, {result["swaps"]:5d} swaps')
                else:
                    print(f'  Size {size:3d}: FAILED - {result["error"]}')

        return results

    def analyze_results(self, results: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Dict[str, Any]]:
        """Analyze benchmark results"""
        print('\n' + '=' * 80)
        print('PERFORMANCE ANALYSIS')
        print('=' * 80)

        analysis = {}

        for algorithm_name, algorithm_results in results.items():
            successful_results = [r for r in algorithm_results if r['success']]
            
            if len(successful_results) == 0:
                print(f'\n{algorithm_name}: No successful benchmarks')
                continue

            times = [r['time'] for r in successful_results]
            compares = [r['compares'] for r in successful_results]
            swaps = [r['swaps'] for r in successful_results]
            sizes = [r['size'] for r in successful_results]

            # Calculate statistics
            avg_time = sum(times) / len(times)
            avg_compares = sum(compares) / len(compares)
            avg_swaps = sum(swaps) / len(swaps)

            # Estimate complexity
            complexity = self.estimate_complexity(sizes, times)

            analysis[algorithm_name] = {
                'avg_time': round(avg_time, 2),
                'avg_compares': round(avg_compares),
                'avg_swaps': round(avg_swaps),
                'complexity': complexity,
                'scalability': self.calculate_scalability(sizes, times)
            }

            print(f'\n{algorithm_name}:')
            print(f'  Average Time: {avg_time:.2f}ms')
            print(f'  Average Comparisons: {round(avg_compares)}')
            print(f'  Average Swaps: {round(avg_swaps)}')
            print(f'  Estimated Complexity: {complexity}')
            print(f'  Scalability Score: {self.calculate_scalability(sizes, times):.2f}')

        return analysis

    def estimate_complexity(self, sizes: List[int], times: List[float]) -> str:
        """Estimate time complexity based on growth rate"""
        if len(sizes) < 2:
            return 'Unknown'

        # Simple complexity estimation based on growth rate
        size_ratio = sizes[-1] / sizes[0]
        time_ratio = times[-1] / times[0]

        if time_ratio < size_ratio * 2:
            return 'O(n)'
        elif time_ratio < size_ratio * 10:
            return 'O(n log n)'
        elif time_ratio < size_ratio ** 2 * 2:
            return 'O(n²)'
        else:
            return 'O(n³) or worse'

    def calculate_scalability(self, sizes: List[int], times: List[float]) -> float:
        """Calculate how well the algorithm scales (lower is better)"""
        if len(sizes) < 2:
            return 0

        size_growth = sizes[-1] / sizes[0]
        time_growth = times[-1] / times[0]

        return time_growth / size_growth

    def generate_comparison_table(self, results: Dict[str, List[Dict[str, Any]]]):
        """Generate comparison table of all algorithms"""
        print('\n' + '=' * 80)
        print('ALGORITHM COMPARISON TABLE')
        print('=' * 80)

        algorithms = list(results.keys())
        sizes = PERFORMANCE_SIZES

        # Header
        header = 'Algorithm'.ljust(20)
        for size in sizes:
            header += f' | Size {size}'.ljust(12)
        header += ' | Avg Time'
        print(header)
        print('-' * len(header))

        # Rows
        for algorithm in algorithms:
            row = algorithm.ljust(20)
            algorithm_results = results[algorithm]
            total_time = 0
            valid_results = 0

            for size in sizes:
                result = next((r for r in algorithm_results if r['size'] == size), None)
                if result and result['success']:
                    row += f' | {result["time"]:6.1f}ms'.ljust(12)
                    total_time += result['time']
                    valid_results += 1
                else:
                    row += ' | FAILED    '.ljust(12)

            avg_time = total_time / valid_results if valid_results > 0 else 0
            row += f' | {avg_time:6.1f}ms'
            print(row)

    async def run_full_benchmark(self) -> Dict[str, Any]:
        """Run complete benchmark suite with analysis"""
        results = await self.run_benchmark_suite()
        analysis = self.analyze_results(results)
        self.generate_comparison_table(results)

        return {'results': results, 'analysis': analysis}

class SpecializedBenchmarks(PerformanceBenchmark):
    """Specialized benchmark tests for different cases"""

    async def benchmark_best_case(self, algorithm_name: str, func: Callable, size: int) -> Dict[str, Any]:
        """Benchmark best case scenario (already sorted)"""
        sorted_array = generate_sorted_array(size)
        return await self.benchmark_algorithm(algorithm_name, func, size, sorted_array)

    async def benchmark_worst_case(self, algorithm_name: str, func: Callable, size: int) -> Dict[str, Any]:
        """Benchmark worst case scenario (reverse sorted)"""
        reverse_array = generate_sorted_array(size, False)
        return await self.benchmark_algorithm(algorithm_name, func, size, reverse_array)

    async def benchmark_average_case(self, algorithm_name: str, func: Callable, size: int) -> Dict[str, Any]:
        """Benchmark average case scenario (random array)"""
        return await self.benchmark_algorithm(algorithm_name, func, size)

    async def run_case_analysis(self, size: int = 50) -> Dict[str, Dict[str, Dict[str, Any]]]:
        """Run analysis of best, worst, and average cases"""
        print(f'\nCase Analysis for Size {size}:')
        print('-' * 50)

        case_results = {}

        for name, func in self.algorithms:
            print(f'\n{name}:')
            
            best_case = await self.benchmark_best_case(name, func, size)
            worst_case = await self.benchmark_worst_case(name, func, size)
            average_case = await self.benchmark_average_case(name, func, size)

            case_results[name] = {
                'best_case': best_case,
                'worst_case': worst_case,
                'average_case': average_case
            }

            print(f'  Best Case:   {best_case["time"]:.2f}ms')
            print(f'  Worst Case:  {worst_case["time"]:.2f}ms')
            print(f'  Average Case: {average_case["time"]:.2f}ms')
            
            ratio = worst_case["time"] / best_case["time"] if best_case["time"] > 0 else float('inf')
            print(f'  Worst/Best Ratio: {ratio:.2f}x')

        return case_results

class MemoryBenchmark(PerformanceBenchmark):
    """Memory usage benchmarking"""

    async def benchmark_memory_usage(self, algorithm_name: str, func: Callable, size: int) -> Dict[str, Any]:
        """Benchmark memory usage of algorithm"""
        import sys
        import tracemalloc

        # Start memory tracking
        tracemalloc.start()
        
        # Generate test array
        arr = generate_random_array(size)
        
        # Get initial memory
        snapshot1 = tracemalloc.take_snapshot()
        
        try:
            # Run algorithm
            await func(arr.copy())
            
            # Get final memory
            snapshot2 = tracemalloc.take_snapshot()
            
            # Calculate memory difference
            stats = snapshot2.compare_to(snapshot1, 'lineno')
            total_memory = sum(stat.size_diff for stat in stats)
            
            return {
                'algorithm': algorithm_name,
                'size': size,
                'memory_usage': total_memory,
                'memory_kb': total_memory / 1024,
                'success': True
            }
        except Exception as error:
            return {
                'algorithm': algorithm_name,
                'size': size,
                'error': str(error),
                'success': False
            }
        finally:
            tracemalloc.stop()

    async def run_memory_benchmark(self, sizes: List[int] = [10, 50, 100]) -> Dict[str, List[Dict[str, Any]]]:
        """Run memory benchmark suite"""
        print('\n' + '=' * 80)
        print('MEMORY USAGE BENCHMARK')
        print('=' * 80)

        results = {}

        for name, func in self.algorithms:
            print(f'\nMemory Benchmarking {name}...')
            results[name] = []
            
            for size in sizes:
                result = await self.benchmark_memory_usage(name, func, size)
                results[name].append(result)
                
                if result['success']:
                    print(f'  Size {size:3d}: {result["memory_kb"]:6.2f} KB')
                else:
                    print(f'  Size {size:3d}: FAILED - {result["error"]}')

        return results

# Main execution
async def main():
    """Main benchmark execution"""
    # Import algorithms
    from bubble_sort import bubble_sort, optimized_bubble_sort
    from selection_sort import selection_sort
    from insertion_sort import insertion_sort, binary_insertion_sort
    from merge_sort import merge_sort, bottom_up_merge_sort, in_place_merge_sort
    from quick_sort import quick_sort, randomized_quick_sort, median_of_three_quick_sort, three_way_quick_sort
    from heap_sort import heap_sort, iterative_heap_sort, min_heap_sort

    # Create benchmark instance
    benchmark = PerformanceBenchmark()
    
    # Add algorithms
    benchmark.add_algorithm('Bubble Sort', bubble_sort)
    benchmark.add_algorithm('Optimized Bubble Sort', optimized_bubble_sort)
    benchmark.add_algorithm('Selection Sort', selection_sort)
    benchmark.add_algorithm('Insertion Sort', insertion_sort)
    benchmark.add_algorithm('Binary Insertion Sort', binary_insertion_sort)
    
    # Advanced algorithms
    benchmark.add_algorithm('Merge Sort', merge_sort)
    benchmark.add_algorithm('Bottom-up Merge Sort', bottom_up_merge_sort)
    benchmark.add_algorithm('In-place Merge Sort', in_place_merge_sort)
    
    benchmark.add_algorithm('Quick Sort', quick_sort)
    benchmark.add_algorithm('Randomized Quick Sort', randomized_quick_sort)
    benchmark.add_algorithm('Median-of-Three Quick Sort', median_of_three_quick_sort)
    benchmark.add_algorithm('Three-Way Quick Sort', three_way_quick_sort)
    
    benchmark.add_algorithm('Heap Sort', heap_sort)
    benchmark.add_algorithm('Iterative Heap Sort', iterative_heap_sort)
    benchmark.add_algorithm('Min Heap Sort', min_heap_sort)

    # Run full benchmark
    results = await benchmark.run_full_benchmark()

    # Run specialized case analysis
    specialized_benchmark = SpecializedBenchmarks()
    specialized_benchmark.add_algorithm('Bubble Sort', bubble_sort)
    specialized_benchmark.add_algorithm('Selection Sort', selection_sort)
    specialized_benchmark.add_algorithm('Insertion Sort', insertion_sort)
    
    await specialized_benchmark.run_case_analysis()

    # Run memory benchmark (optional, can be resource intensive)
    try:
        memory_benchmark = MemoryBenchmark()
        memory_benchmark.add_algorithm('Bubble Sort', bubble_sort)
        memory_benchmark.add_algorithm('Selection Sort', selection_sort)
        memory_benchmark.add_algorithm('Insertion Sort', insertion_sort)
        
        await memory_benchmark.run_memory_benchmark()
    except ImportError:
        print("\nMemory benchmarking requires tracemalloc (Python 3.4+)")
    except Exception as e:
        print(f"\nMemory benchmarking failed: {e}")

    return results

if __name__ == "__main__":
    asyncio.run(main())
