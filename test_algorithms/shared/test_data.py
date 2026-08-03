# Shared test data for AlgoDisplay algorithm testing
# This file contains common test cases and utilities

from typing import List, Dict, Any, Tuple, Optional
import random

# Test case categories
class TestCategories:
    EMPTY = 'empty'
    SINGLE = 'single'
    SORTED = 'sorted'
    REVERSE = 'reverse'
    RANDOM = 'random'
    DUPLICATES = 'duplicates'
    EQUAL = 'equal'
    NEARLY_SORTED = 'nearly_sorted'

# Comprehensive test suite
TEST_CASES = [
    {
        'name': 'Empty Array',
        'category': TestCategories.EMPTY,
        'input': [],
        'expected': [],
        'description': 'Test with empty array'
    },
    {
        'name': 'Single Element',
        'category': TestCategories.SINGLE,
        'input': [1],
        'expected': [1],
        'description': 'Test with single element array'
    },
    {
        'name': 'Already Sorted',
        'category': TestCategories.SORTED,
        'input': [1, 2, 3, 4, 5],
        'expected': [1, 2, 3, 4, 5],
        'description': 'Test with already sorted array'
    },
    {
        'name': 'Reverse Sorted',
        'category': TestCategories.REVERSE,
        'input': [5, 4, 3, 2, 1],
        'expected': [1, 2, 3, 4, 5],
        'description': 'Test with reverse sorted array'
    },
    {
        'name': 'Random with Duplicates',
        'category': TestCategories.DUPLICATES,
        'input': [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5],
        'expected': [1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9],
        'description': 'Test with random array containing duplicates'
    },
    {
        'name': 'Random Unique',
        'category': TestCategories.RANDOM,
        'input': [10, 80, 30, 90, 40, 50, 70],
        'expected': [10, 30, 40, 50, 70, 80, 90],
        'description': 'Test with random array of unique elements'
    },
    {
        'name': 'All Equal',
        'category': TestCategories.EQUAL,
        'input': [2, 2, 2, 2, 2],
        'expected': [2, 2, 2, 2, 2],
        'description': 'Test with array of equal elements'
    },
    {
        'name': 'Nearly Sorted',
        'category': TestCategories.NEARLY_SORTED,
        'input': [1, 3, 2, 4, 3, 5, 4, 6, 5, 7],
        'expected': [1, 2, 3, 3, 4, 4, 5, 5, 6, 7],
        'description': 'Test with nearly sorted array'
    },
    {
        'name': 'Small Array',
        'category': TestCategories.RANDOM,
        'input': [4, 2],
        'expected': [2, 4],
        'description': 'Test with small array (2 elements)'
    },
    {
        'name': 'Medium Array',
        'category': TestCategories.RANDOM,
        'input': [8, 3, 5, 2, 9, 1, 6, 4, 7],
        'expected': [1, 2, 3, 4, 5, 6, 7, 8, 9],
        'description': 'Test with medium array (9 elements)'
    }
]

# Performance test sizes
PERFORMANCE_SIZES = [5, 10, 20, 50, 100, 200]

def generate_random_array(size: int, min_val: int = 1, max_val: int = 100) -> List[int]:
    """Generate random array of specified size"""
    return [random.randint(min_val, max_val) for _ in range(size)]

def generate_sorted_array(size: int, ascending: bool = True) -> List[int]:
    """Generate sorted array of specified size"""
    if ascending:
        return list(range(1, size + 1))
    else:
        return list(range(size, 0, -1))

def generate_array_with_duplicates(size: int, unique_elements: int = 5) -> List[int]:
    """Generate array with duplicates"""
    unique_values = [random.randint(1, 100) for _ in range(unique_elements)]
    return [random.choice(unique_values) for _ in range(size)]

def generate_nearly_sorted_array(size: int, swap_count: int = 2) -> List[int]:
    """Generate nearly sorted array"""
    arr = generate_sorted_array(size)
    
    # Make a few random swaps
    for _ in range(swap_count):
        idx1 = random.randint(0, size - 1)
        idx2 = random.randint(0, size - 1)
        arr[idx1], arr[idx2] = arr[idx2], arr[idx1]
    
    return arr

# Utility functions for testing
def is_sorted(arr: List[int]) -> bool:
    """Check if array is sorted"""
    for i in range(len(arr) - 1):
        if arr[i] > arr[i + 1]:
            return False
    return True

def arrays_equal(arr1: List[int], arr2: List[int]) -> bool:
    """Check if two arrays are equal"""
    if len(arr1) != len(arr2):
        return False
    
    for i in range(len(arr1)):
        if arr1[i] != arr2[i]:
            return False
    
    return True

def copy_array(arr: List[int]) -> List[int]:
    """Create a copy of the array"""
    return arr.copy()

def validate_test_result(input_arr: List[int], output_arr: List[int], expected: List[int]) -> Dict[str, Any]:
    """Validate test result"""
    is_correct = arrays_equal(output_arr, expected)
    is_sorted_correctly = is_sorted(output_arr)
    has_same_elements = arrays_equal(sorted(input_arr), sorted(output_arr))
    
    return {
        'is_correct': is_correct,
        'is_sorted_correctly': is_sorted_correctly,
        'has_same_elements': has_same_elements,
        'passed': is_correct and is_sorted_correctly
    }

def calculate_metrics(start_time: float, end_time: float, stats: Dict[str, Any]) -> Dict[str, float]:
    """Calculate performance metrics"""
    array_size = stats.get('array_size', 1)
    
    return {
        'execution_time': end_time - start_time,
        'comparisons_per_element': stats['compares'] / array_size,
        'swaps_per_element': stats['swaps'] / array_size,
        'efficiency': stats['compares'] / stats['swaps'] if stats['swaps'] > 0 else stats['compares']
    }

def generate_test_suite(categories: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """Generate test suite based on categories"""
    if not categories:
        return TEST_CASES
    
    return [test_case for test_case in TEST_CASES if test_case['category'] in categories]

def generate_performance_suite(sizes: List[int] = PERFORMANCE_SIZES) -> List[Dict[str, Any]]:
    """Generate performance test suite"""
    suite = []
    
    for size in sizes:
        suite.append({
            'name': f'Size {size}',
            'size': size,
            'input': generate_random_array(size),
            'expected': None  # Will be calculated during test
        })
    
    return suite

# Test data generator for specific scenarios
def generate_edge_cases() -> List[Dict[str, Any]]:
    """Generate edge case test scenarios"""
    return [
        {
            'name': 'Large Array',
            'category': 'large',
            'input': generate_random_array(1000),
            'description': 'Test with large array'
        },
        {
            'name': 'All Same Value',
            'category': 'edge',
            'input': [5] * 50,
            'expected': [5] * 50,
            'description': 'Test with array of identical values'
        },
        {
            'name': 'Alternating Pattern',
            'category': 'pattern',
            'input': [1, 100, 2, 99, 3, 98, 4, 97, 5],
            'expected': [1, 2, 3, 4, 5, 97, 98, 99, 100],
            'description': 'Test with alternating high-low pattern'
        },
        {
            'name': 'Binary Values',
            'category': 'binary',
            'input': [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            'expected': [0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
            'description': 'Test with binary values (0 and 1)'
        },
        {
            'name': 'Negative Numbers',
            'category': 'negative',
            'input': [-5, 2, -3, 8, -1, 0, 4, -2],
            'expected': [-5, -3, -2, -1, 0, 2, 4, 8],
            'description': 'Test with negative numbers'
        }
    ]

# Performance analysis utilities
def analyze_complexity(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze time complexity from performance results"""
    if len(results) < 2:
        return {'error': 'Insufficient data for complexity analysis'}
    
    # Extract sizes and times
    sizes = [r['size'] for r in results]
    times = [r['time'] for r in results]
    
    # Simple complexity estimation based on growth rate
    if len(sizes) >= 2:
        size_ratio = sizes[-1] / sizes[0]
        time_ratio = times[-1] / times[0] if times[0] > 0 else float('inf')
        
        if time_ratio < size_ratio * 2:
            estimated_complexity = 'O(n)'
        elif time_ratio < size_ratio * 10:
            estimated_complexity = 'O(n log n)'
        elif time_ratio < size_ratio ** 2 * 2:
            estimated_complexity = 'O(n²)'
        else:
            estimated_complexity = 'O(n³) or worse'
    else:
        estimated_complexity = 'Unknown'
    
    return {
        'estimated_complexity': estimated_complexity,
        'size_range': f'{min(sizes)} - {max(sizes)}',
        'time_range': f'{min(times):.2f}ms - {max(times):.2f}ms',
        'growth_rate': time_ratio / size_ratio if size_ratio > 0 else 0
    }

# Export functions for easy access
__all__ = [
    'TestCategories',
    'TEST_CASES',
    'PERFORMANCE_SIZES',
    'generate_random_array',
    'generate_sorted_array',
    'generate_array_with_duplicates',
    'generate_nearly_sorted_array',
    'is_sorted',
    'arrays_equal',
    'copy_array',
    'validate_test_result',
    'calculate_metrics',
    'generate_test_suite',
    'generate_performance_suite',
    'generate_edge_cases',
    'analyze_complexity'
]
