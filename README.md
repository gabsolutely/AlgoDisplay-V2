# AlgoDisplay V2 — Interactive Algorithm Visualizer

A fully browser-based algorithm visualizer. No installation, no server, no dependencies. Write custom **JavaScript or Python** algorithms and watch them animate in real time across 4 visualization modes.


 - Dual-language support (JavaScript & Python)
 - Real-time visual feedback
 - Step-by-step execution
 - Performance analytics
 - Audio feedback system
 - Custom algorithm editor
> This is an educational platform designed to help users understand sorting algorithms through interactive visualization and hands-on coding experience.

## Table Of Contents // ############################################
 - System Overview
 - Architecture
 - Features
 - Project Structure
 - Setup & Installation
 - Algorithm Templates
 - Visualization API
 - Performance Metrics
 - Keyboard Shortcuts
 - Troubleshooting
 - Possible Extensions
 - Technical Notes

## System Overview // ############################################
 ### Supported Languages:
 - JavaScript — Native execution for all categories (Sorting, Searching, Graph, Grid)
 - Python — Pyodide WebAssembly runtime (Sorting & Searching)
 ### Built-in Algorithms:
 - Bubble Sort — Classic comparison-based sorting
 - Selection Sort — In-place comparison algorithm  
 - Insertion Sort — Efficient for small datasets
 ### Visualization Elements:
 - Array bars with height representing values
 - Color coding for operations (comparing, swapping, sorted)
 - Real-time statistics display
 - Operation log with timestamps

## Architecture // ##########################################
### Execution Flow:
```
 User Input (Code Editor)
   v
 Language Parser
   v
 Algorithm Engine (JS/Python)
   v
 Visualization API
   v
 Renderer + Audio System
```

### Component Structure:
```
AlgorithmVisualizer (Main Controller)
├── PythonRunner (Pyodide Integration)
├── ArrayRenderer (Visual Output)
├── SoundManager (Audio Feedback)
└── Statistics Tracker (Performance)
```

## Features // #####################################################
 ### Visualization:
 - Real-time array manipulation
 - Smooth animations for swaps
 - Color-coded operations
 - Responsive design for all screen sizes
 - Step-by-step execution mode

 ### Code Execution:
 - JavaScript native execution
 - Python via Pyodide WebAssembly
 - Syntax-aware validation
 - Error handling with helpful messages
 - Stop/resume functionality

 ### Analytics:
 - Comparison counter
 - Swap counter
 - Step counter
 - Execution time tracking
 - Real-time statistics updates

 ### User Experience:
 - Interactive code editor
 - Algorithm template library
 - Adjustable animation speed
 - Audio feedback toggle
 - Keyboard shortcuts
 - Help system

## Project Structure // ############################################
```bash
AlgoDisplay/                    # Main project directory
├── js/                         # JavaScript modules
│   ├── core.js                 # Main application controller
│   ├── python-runner.js        # Python execution engine
│   ├── array-renderer.js       # Visualization renderer
│   ├── init.js                 # Application entry point
│   └── sound-manager.js        # Audio feedback system
├── index.html                  # Main HTML page
├── style.css                   # Styling and animations
├── README.md                   # This documentation
└── USER_GUIDE.md               # Detailed user guide
```

## Setup & Installation // ############################################
### Requirements:
 - Modern web browser with ES6+ support
 - Internet connection (for Pyodide loading)
 - Local web server (optional, for development)
### Quick Start:
1. Clone or download the project
2. Open `index.html` in a web browser
3. Select algorithm and language
4. Click "Generate Array" then "Run"
### Development Setup:
```bash
# Using Python's built-in server
python -m http.server 8000

# Or using Node.js
npx serve .

# Then open http://localhost:8000
```

## Algorithm Templates // ###########################################
### JavaScript Format:
```javascript
// Use async/await for visualization functions
for (let i = 0; i < arr.length - 1; i++) {
  for (let j = 0; j < arr.length - i - 1; j++) {
    await compare(j, j + 1);
    if (arr[j] > arr[j + 1]) {
      await swap(arr, j, j + 1);
    }
  }
}
```

### Python Format:
```python
# Must define async sort(arr) function
async def sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            await compare(j, j + 1)
            if arr[j] > arr[j + 1]:
                await swap(arr, j, j + 1)
```

## Visualization API // ############################################
 ### Core Functions:
 - `await compare(i, j)` — Highlight and compare two indices
 - `await swap(arr, i, j)` — Animate swap between two positions
 - `await renderArray(arr)` — Re-render the entire array
 - `await sleep(ms)` — Pause execution for specified time
 - `log(message)` — Add message to operation log

 ### Return Values:
 - All functions are async and must be awaited
 - Array modifications should use the swap function for proper animation
 - Direct array assignments won't be visualized

## Performance Metrics // #########################################
 ### Tracked Statistics:
 - **Comparisons** — Number of element comparisons performed
 - **Swaps** — Number of element exchanges executed
 - **Steps** — Total operations (comparisons + swaps + renders)
 - **Time** — Algorithm execution duration in milliseconds

 ### Optimization Features:
 - Adaptive speed scaling based on array size
 - Efficient DOM updates
 - Minimal memory allocation during execution
 - Early termination on stop conditions

## Keyboard Shortcuts // ############################################
- `Ctrl/Cmd + Enter` — Run current algorithm
- `Ctrl/Cmd + R` — Generate new random array
- `Ctrl/Cmd + L` — Clear all data and reset

## Troubleshooting // ############################################
 ### Common Issues:
 - **Python not loading**: Check internet connection for Pyodide
 - **Algorithm not stopping**: Ensure proper await usage in Python
 - **No animations**: Verify swap function usage instead of direct assignment
 - **Performance issues**: Reduce array size or increase animation speed

 ### Error Messages:
 - "Code cannot be empty" — Enter algorithm code before running
 - "Missing 'await'" — Add await before visualization function calls
 - "Python not ready" — Wait for Pyodide to load completely
 - "Infinite loops detected" — Check algorithm termination conditions

## Possible Extensions // ##########################################
 ### Algorithm Support:
 - More sorting algorithms (merge, quick, heap, radix)
 - Search algorithms (binary, linear, interpolation)
 - Graph algorithms (DFS, BFS, Dijkstra, A*)
 - Data structure visualizations (trees, linked lists, stacks)

 ### Advanced Features:
 - Algorithm complexity analysis (Big O notation)
 - Multi-threading visualization
 - Custom comparison functions
 - Algorithm racing/comparison mode
 - Export animations as video/GIF

 ### Platform Integration:
 - Learning management system integration
 - Progress tracking and analytics
 - Collaborative coding features
 - Mobile application version
 - Classroom management tools

## Technical Notes // #############################################
 ### Performance Considerations:
 - JavaScript algorithms execute natively in the browser
 - Python algorithms run in WebAssembly with ~10-20% overhead
 - Large arrays (>100 elements) may cause performance issues
 - Animation speed automatically scales with array size
 - Python may take a moment to load initially (Pyodide loading)

 ### Browser Compatibility:
 - Requires modern browser with ES6+ support
 - Pyodide requires WebAssembly support
 - Tested on Chrome 90+, Firefox 88+, Safari 14+
 - Mobile browsers supported with touch controls

 ### Memory Management:
 - Automatic cleanup on algorithm termination
 - Event listener cleanup on page unload
 - Pyodide instance reuse across multiple executions
 - Garbage collection optimization for frequent operations

> - **For detailed usage instructions and examples, see USER_GUIDE.md**
> - **Contributions and bug reports welcome on GitHub Issues**