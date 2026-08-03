# AlgoDisplay User Guide

## Overview
AlgoDisplay is an interactive web application that allows you to write, test, and visualize sorting algorithms in real-time. You can write code in JavaScript or Python and watch as your algorithm sorts an array step by step.

## Getting Started

### 1. Basic Usage
1. Open `index.html` in your web browser
2. Choose your preferred programming language (JavaScript or Python)
3. Select an example algorithm or write your own
4. Click "Generate Array" to create a random array
5. Click "Run" to execute your algorithm with visualization

### 2. Controls
- **Generate Array**: Creates a new random array of the specified size
- **Run**: Executes your algorithm with visualization
- **Pause/Resume**: Pause and resume algorithm execution
- **Step Mode**: Execute one step at a time
- **Clear**: Reset everything and start fresh
- **Speed Slider**: Adjust animation speed (50ms - 1000ms)
- **Sound Toggle**: Enable/disable sound effects

## Writing Your Own Algorithms

### JavaScript Algorithms

#### Function Structure
Your JavaScript code should work directly with the provided `arr` array and use the visualization functions:

```javascript
// Example: Bubble Sort
for (let i = 0; i < arr.length - 1; i++) {
  for (let j = 0; j < arr.length - i - 1; j++) {
    await compare(j, j + 1);
    
    if (arr[j] > arr[j + 1]) {
      await swap(arr, j, j + 1);
    }
  }
}
```

#### Available Functions
- `await compare(i, j)`: Highlight elements at indices i and j for comparison
- `await swap(arr, i, j)`: Swap elements at indices i and j with animation
- `await renderArray(arr)`: Re-render the entire array
- `await sleep(ms)`: Pause execution for specified milliseconds
- `log(message)`: Log a message to the execution log

#### Important Notes
- Always use `await` before visualization functions
- Your code should be async-friendly
- The `arr` variable contains the array to be sorted
- No need to return anything - modify `arr` in place

### Python Algorithms

#### Function Structure
Your Python code must define an `async def sort(arr):` function:

```python
# Example: Bubble Sort
async def sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            await compare(j, j + 1)
            
            if arr[j] > arr[j + 1]:
                await swap(arr, j, j + 1)
```

#### Available Functions
- `await compare(i, j)`: Highlight elements at indices i and j for comparison
- `await swap(arr, i, j)`: Swap elements at indices i and j with animation
- `await render_array(arr)`: Re-render the entire array
- `await sleep(ms)`: Pause execution for specified milliseconds
- `log(message)`: Log a message to the execution log

#### Important Notes
- You must define an `async def sort(arr):` function
- Always use `await` before visualization functions
- The `arr` parameter contains the array to be sorted
- No need to return anything - modify `arr` in place

## Algorithm Examples

### Bubble Sort (JavaScript)
```javascript
for (let i = 0; i < arr.length - 1; i++) {
  for (let j = 0; j < arr.length - i - 1; j++) {
    await compare(j, j + 1);
    
    if (arr[j] > arr[j + 1]) {
      await swap(arr, j, j + 1);
    }
  }
}
```

### Bubble Sort (Python)
```python
async def sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            await compare(j, j + 1)
            
            if arr[j] > arr[j + 1]:
                await swap(arr, j, j + 1)
```

### Selection Sort (JavaScript)
```javascript
for (let i = 0; i < arr.length - 1; i++) {
  let minIdx = i;
  for (let j = i + 1; j < arr.length; j++) {
    await compare(minIdx, j);
    if (arr[j] < arr[minIdx]) {
      minIdx = j;
    }
  }
  if (minIdx !== i) {
    await swap(arr, i, minIdx);
  }
}
```

### Insertion Sort (Python)
```python
async def sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        
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
```

## Best Practices

### Performance
- Use `await compare()` and `await swap()` sparingly to avoid slowing down visualization
- For large arrays, consider increasing the speed slider
- Use `renderArray()` only when necessary, as it re-renders the entire array

### Code Structure
- Keep your code clean and well-commented
- Use meaningful variable names
- Test with small arrays first
- Use the log function to debug complex algorithms

### Common Pitfalls
- **JavaScript**: Forgetting to use `await` before visualization functions
- **Python**: Not defining the `async def sort(arr):` function
- **Both**: Modifying the array without using visualization functions
- **Both**: Using blocking operations instead of `await sleep()`

## Troubleshooting

### Common Issues

#### "Python execution error"
- Make sure you defined `async def sort(arr):`
- Check for syntax errors in your Python code
- Ensure all visualization functions use `await`

#### "No code provided!"
- Make sure the code editor is not empty
- Check that your code doesn't contain only comments

#### Algorithm doesn't visualize properly
- Ensure you're using `await` before visualization functions
- Check that you're using the correct function names (`compare`, `swap`, `renderArray`/`render_array`)
- Make sure you're passing the correct parameters

#### Performance issues
- Increase the speed slider for faster execution
- Reduce the number of visualization calls
- Use smaller arrays for testing

### Browser Compatibility
- **Recommended**: Chrome, Firefox, Safari, Edge (latest versions)
- **Required**: JavaScript must be enabled
- **Python support**: Requires modern browser with WebAssembly support

### Console Errors
Open the browser's developer console (F12) to see detailed error messages. Common console errors include:
- Pyodide loading issues (for Python)
- JavaScript syntax errors
- DOM manipulation errors

## Advanced Features

### Step Mode
Use Step Mode to execute your algorithm one operation at a time. This is useful for:
- Debugging complex algorithms
- Understanding exactly what happens at each step
- Educational purposes

### Custom Array Sizes
You can adjust the array size from 5 to 50 elements. Larger arrays:
- Show algorithm efficiency better
- May require higher speed settings
- Provide better visualization of algorithm behavior

### Sound Effects
Toggle sound effects to get audio feedback for:
- Comparisons (high pitch)
- Swaps (medium pitch)
- Algorithm completion (ascending tone)

## File Structure

If you want to modify or extend the application:

```
AlgoDisplay/
├── index.html          # Main HTML file
├── style.css          # Styling
├── js/
│   ├── init.js         # Entry point
│   ├── core.js         # Main application logic
│   ├── array-renderer.js  # Array visualization
│   ├── python-runner.js    # Python execution
│   ├── sound-manager.js    # Audio effects
│   └── utils.js            # Utility functions
└── USER_GUIDE.md      # This file
```

## Contributing

To add new features:
1. Modify the appropriate JavaScript file in the `js/` directory
2. Update this user guide if adding new functionality
3. Test with both JavaScript and Python algorithms
4. Ensure browser compatibility

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your code follows the guidelines above
3. Try with simpler algorithms first
4. Ensure your browser supports WebAssembly (for Python)

