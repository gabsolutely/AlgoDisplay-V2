// python-runner.js
class PythonRunner {
  constructor() {
    this.pyodide = null;
    this.isReady = false;
    this.currentExecution = null;
  }
  
  async init() {
    if (this.pyodide) {
      this.isReady = true;
      return;
    }
    
    if (typeof loadPyodide === 'undefined') {
      throw new Error("Pyodide not loaded. Check internet and refresh.");
    }
    
    try {
      this.pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
      });
      this.isReady = true;
    } catch (error) {
      throw new Error(`Python init failed: ${error.message}`);
    }
  }
  
  async run(code, array, api, shouldStopFlag) {
    if (!this.isReady) {
      throw new Error("Python not ready");
    }
    
    this.stopExecution();
    
    try {
      const fullCode = `
import asyncio

# Global array
arr = ${JSON.stringify(array)}

# Stop condition checker
def _check_stop():
    return _shouldStop()

# Visualization API
async def compare(i, j):
    if _check_stop():
        return
    await _compare(i, j)

async def render_array(arr):
    if _check_stop():
        return
    await _renderArray(list(arr))

async def swap(arr, i, j):
    if _check_stop():
        return
    js_arr = list(arr)
    await _swap(js_arr, i, j)
    for idx, val in enumerate(js_arr):
        arr[idx] = val

def log(msg):
    if not _check_stop():
        _log(str(msg))

async def sleep(ms):
    if _check_stop():
        return
    for _ in range(int(ms / 10)):
        if _check_stop():
            return
        await asyncio.sleep(0.01)

# User algorithm
${code}

# Execute
if not _check_stop():
    result = await sort(arr)
    # Ensure we return the final array state
    if result is not None:
        arr = result
    # Final render to ensure array is displayed
    await _renderArray(list(arr))
else:
    result = arr

# Return the final array
arr
`;
      
      // Set API functions
      this.pyodide.globals.set("_compare", api.compare);
      this.pyodide.globals.set("_renderArray", api.renderArray);
      this.pyodide.globals.set("_swap", api.swap);
      this.pyodide.globals.set("_log", api.log);
      this.pyodide.globals.set("_shouldStop", shouldStopFlag);
      
      // Execute
      this.currentExecution = this.pyodide.runPythonAsync(fullCode);
      const result = await this.currentExecution;
      this.currentExecution = null;
      
      return result.toJs ? result.toJs() : result;
      
    } catch (error) {
      this.currentExecution = null;
      throw new Error(`Python error: ${error.message}`);
    }
  }
  
  stopExecution() {
    if (this.currentExecution) {
      this.currentExecution = null;
    }
  }
  
  isSupported() {
    return this.isReady;
  }
}
