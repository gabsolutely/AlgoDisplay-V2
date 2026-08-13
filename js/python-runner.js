/**
 * python-runner.js — Pyodide wrapper so users can write sorting/searching algos in Python.
 *
 * How it works:
 *   1. `init()` downloads Pyodide WASM from the jsDelivr CDN (first-run only, ~20MB).
 *   2. `run(userCode, arr, api, …)` builds a full Python source string:
 *        - Imports `asyncio`.
 *        - Injects the user's array + target as globals.
 *        - Injects Python "bridge" async fns (compare, swap, sleep, visit_node, …)
 *          that `await` the matching JS API callbacks (passed via pyodide.globals).
 *        - Appends the user's raw code (which must define `async def sort(arr)`
 *          or `async def search(arr, target)`).
 *        - Calls the user function and captures `result`.
 *   3. Runs the assembled source via `pyodide.runPythonAsync`.
 *   4. Stops are cooperative: we write `_gen_stop[0] = True` (a mutable list, so
 *      the Python side sees the change) and every bridge fn checks `_check_stop()`.
 *
 * Python graph/grid is intentionally NOT supported (too slow, too complex a bridge).
 * The UI filters selectable algo lists accordingly in `refreshAlgorithmSelectB`.
 */

class PythonRunner {
  constructor() {
    this.pyodide          = null;       // Pyodide runtime instance after init
    this.isReady          = false;      // true once runPythonAsync is callable
    this.currentExecution = null;       // Promise handle of running py code
    this.initPromise      = null;       // Deduplicates concurrent init() calls
    this._retryCount      = 0;
  }

  /**
   * Idempotent initializer. Callers never need to guard; they just `await init()`.
   * Deduplicates concurrent callers via a shared `initPromise`.
   */
  async init() {
    if (this.pyodide && this.isReady) return;
    if (this.initPromise) { await this.initPromise; return; }

    this.initPromise = this._doInit();
    try { await this.initPromise; }
    finally { this.initPromise = null; }
  }

  /**
   * Real init logic: wait for CDN <script> to expose `loadPyodide`, then invoke
   * the loader with 1 retry on network flake.
   */
  async _doInit() {
    if (typeof loadPyodide === 'undefined') {
      const waitStart = Date.now();
      while (typeof loadPyodide === 'undefined' && Date.now() - waitStart < 10000) {
        await new Promise(r => setTimeout(r, 100));
      }
      if (typeof loadPyodide === 'undefined') {
        throw new Error("Pyodide failed to load. Check your internet connection and refresh.");
      }
    }

    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        this.pyodide = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
          stdout: (text) => console.log("[Py stdout]", text),
          stderr: (text) => console.warn("[Py stderr]", text),
        });
        this.isReady = true;
        return;
      } catch (error) {
        lastError = error;
        await new Promise(r => setTimeout(r, 500));
      }
    }
    throw new Error(`Python init failed: ${lastError ? lastError.message : 'unknown'}`);
  }

  /**
   * Execute user Python code against the current dataset.
   *
   * @param {string}   code               - Raw user code (must define async sort/search).
   * @param {number[]} array              - Input data.
   * @param {object}   api                - Viz API callbacks (compare, swap, renderArray, …).
   * @param {Function} shouldStopFlag     - JS-side predicate (checked in every bridge fn).
   * @param {object}   [options={}]       - {category, target, searchSortedRequires, sortedRequiredByAlgo}.
   * @returns {Promise<*>}                - Whatever the user fn returned (bigint → Number coerced).
   */
  async run(code, array, api, shouldStopFlag, options = {}) {
    if (!this.isReady) await this.init();
    if (!this.isReady || !this.pyodide) {
      throw new Error("Python runner not available. Try refreshing.");
    }

    this.stopExecution();   // Cancel any prior run before starting new one.

    try {
      const category            = options.category || "sort";
      const target              = options.target ?? null;
      const searchSortedRequires = options.searchSortedRequires === true;
      const sortedRequiredByAlgo  = options.sortedRequiredByAlgo === true;

      // Pick the right invocation line based on category.
      const callLine = category === "search"
        ? `result = await search(arr, target)`
        : `result = await sort(arr)`;

      const targetLine = category === "search"
        ? `target = ${JSON.stringify(target)}`
        : `target = None`;

      const preSortMsg = sortedRequiredByAlgo
        ? "Pre-sorted array (algorithm requires ordered input; Linear supports unordered)"
        : "Pre-sorted array (Pre-Sort toggle enabled)";

      // For sorted-required search algos: sort the array server-side in Python first,
      // render the intermediate state, then run the user's search.
      const preSort = (category === "search" && searchSortedRequires)
        ? `arr.sort()
log("${preSortMsg}")
await _renderArray(list(arr))
await sleep(max(100, _base_speed))`
        : `pass`;

      // ==== Full Python source assembly ====
      // Every bridge fn checks _check_stop() BEFORE delegating to the JS callback,
      // which makes stop/pause cooperative. Python's `sleep` is chunked into 10ms
      // intervals so a 30s pause + 1s stop-check granularity doesn't lag.
      const fullCode = `
import asyncio

arr = ${JSON.stringify(array)}
${targetLine}
_base_speed = ${JSON.stringify(Math.max(100, (globalThis?.visualizer?.speed ?? 300)))}
_gen_stop = [False]

def _check_stop():
    if _gen_stop[0]:
        return True
    try:
        return bool(_shouldStop())
    except Exception:
        return True

async def compare(i, j):
    if _check_stop(): return
    await _compare(int(i), int(j))

async def render_array(arr):
    if _check_stop(): return
    await _renderArray(list(arr))

async def swap(arr, i, j):
    if _check_stop(): return
    i = int(i); j = int(j)
    js_arr = list(arr)
    await _swap(js_arr, i, j)
    for idx, val in enumerate(js_arr):
        arr[idx] = val

async def mark_found(index):
    if _check_stop(): return
    await _markFound(int(index))

async def visit_node(node_id, color="visiting"):
    if _check_stop(): return
    if "_visitNode" in globals():
        await _visitNode(int(node_id) if str(node_id).isdigit() else str(node_id), str(color))

async def visit_edge(u, v, color="exploring"):
    if _check_stop(): return
    if "_visitEdge" in globals():
        await _visitEdge(str(u), str(v), str(color))

async def update_distance(node_id, dist):
    if _check_stop(): return
    if "_updateDistance" in globals():
        await _updateDistance(str(node_id), float(dist))

async def mark_path(path_nodes):
    if _check_stop(): return
    if "_markPath" in globals():
        await _markPath(list(path_nodes))

def log(msg):
    if not _check_stop():
        try: _log(str(msg))
        except Exception: pass

async def sleep(ms):
    if _check_stop(): return
    ms = max(0, int(ms))
    iters = max(1, int(ms / 10))
    for _ in range(iters):
        if _check_stop(): return
        await asyncio.sleep(0.01)

${code}

if not _check_stop():
    ${preSort}
if not _check_stop():
    ${callLine}

`;

      // ---- Inject bridge callbacks into Pyodide globals. ----
      // Graph/grid bridges are conditional because sort/search templates don't use them.
      if (api.markFound)       this.pyodide.globals.set("_markFound",       api.markFound);
      if (api.visitNode)       this.pyodide.globals.set("_visitNode",       api.visitNode);
      if (api.visitEdge)       this.pyodide.globals.set("_visitEdge",       api.visitEdge);
      if (api.updateDistance)  this.pyodide.globals.set("_updateDistance",  api.updateDistance);
      if (api.markPath)        this.pyodide.globals.set("_markPath",        api.markPath);

      this.pyodide.globals.set("_compare",     api.compare);
      this.pyodide.globals.set("_renderArray", api.renderArray);
      this.pyodide.globals.set("_swap",        api.swap);
      this.pyodide.globals.set("_log",         api.log);
      this.pyodide.globals.set("_shouldStop",  shouldStopFlag);

      this.currentExecution = this.pyodide.runPythonAsync(fullCode);
      const result = await this.currentExecution;
      this.currentExecution = null;

      // Pyodide may return bigint for numeric Python ints; coerce to JS Number for display.
      if (result && typeof result.toJs === 'function') {
        const js = result.toJs();
        return Array.isArray(js) ? js.map(x => (typeof x === 'bigint' ? Number(x) : x)) : js;
      }
      if (Array.isArray(result)) {
        return result.map(x => (typeof x === 'bigint' ? Number(x) : x));
      }
      return result;

    } catch (error) {
      this.currentExecution = null;
      let msg = error && error.message ? error.message : String(error);
      if (msg.includes("Pyodide")) msg = "Python execution issue - refresh page if this persists";
      throw new Error(`Python error: ${msg}`);
    }
  }

  /**
   * Cooperative stop: flip the Python-side `_gen_stop[0]` sentinel.
   * Runs a tiny Python snippet (wrapped in try/except because the runtime
   * might not even have `_gen_stop` if we're stopping mid-init).
   */
  stopExecution() {
    if (this.pyodide && this.pyodide.globals) {
      try {
        this.pyodide.runPython(`
try:
    if '_gen_stop' in globals():
        _gen_stop[0] = True
except Exception:
    pass
`);
      } catch (_) { /* ignore */ }
    }
    this.currentExecution = null;
  }

  isSupported() { return this.isReady; }
}
