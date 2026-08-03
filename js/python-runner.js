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
  
  async run(code, array, api, shouldStopFlag, options = {}) {
    if (!this.isReady) {
      throw new Error("Python not ready");
    }

    this.stopExecution();

    try {
      const category = options.category || "sort";
      const target = options.target ?? null;
      const searchSortedRequires = options.searchSortedRequires === true;

      const callLine = category === "search"
        ? `result = await search(arr, target)`
        : `result = await sort(arr)`;

      const targetLine = category === "search"
        ? `target = ${JSON.stringify(target)}`
        : `# no target needed`;

      const preSort = (category === "search" && searchSortedRequires)
        ? `arr.sort()
await _renderArray(list(arr))`
        : `# no pre-sort`;

      const fullCode = `
import asyncio

# Global array
arr = ${JSON.stringify(array)}
${targetLine}

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

async def mark_found(index):
    if _check_stop():
        return
    await _markFound(index)

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
    ${preSort}
    ${callLine}
    await _renderArray(list(arr))
else:
    result = arr

arr
`;

      if (api.markFound) this.pyodide.globals.set("_markFound", api.markFound);
      this.pyodide.globals.set("_compare", api.compare);
      this.pyodide.globals.set("_renderArray", api.renderArray);
      this.pyodide.globals.set("_swap", api.swap);
      this.pyodide.globals.set("_log", api.log);
      this.pyodide.globals.set("_shouldStop", shouldStopFlag);

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
