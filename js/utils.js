/**
 * utils.js — Bag of reusable stateless helpers.
 *
 * All utilities are exposed on the single `window.utils` namespace so they're
 * callable from any script without module bundlers. Utilities are intentionally
 * framework-agnostic vanilla JS.
 */

window.utils = {

  /**
   * Classic trailing-edge debounce: delays invoking `func` until `wait` ms
   * have elapsed since the last call. Used for resize / slider / input handlers
   * that shouldn't fire on every single event.
   *
   * @param {Function} func  - Function to debounce.
   * @param {number}   wait  - Quiet-window delay in milliseconds.
   * @returns {Function} Debounced wrapper.
   */
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Generate a uniformly random integer array of the given size.
   * Values are in the half-open range [min, max).
   *
   * @param {number} size - Desired array length.
   * @param {number} [min=20]  - Inclusive lower bound.
   * @param {number} [max=220] - Exclusive upper bound.
   * @returns {number[]}
   */
  generateRandomArray: function(size, min = 20, max = 220) {
    return Array.from({ length: size }, () =>
      Math.floor(Math.random() * (max - min)) + min
    );
  },

  /**
   * Compute descriptive stats for a numeric array.
   *
   * @param {number[]} arr
   * @returns {({size:number, min:number, max:number, sum:number, avg:string, range:number} | null)}
   */
  getArrayStats: function(arr) {
    if (!arr || arr.length === 0) return null;

    const sum = arr.reduce((a, b) => a + b, 0);
    const min = Math.min(...arr);
    const max = Math.max(...arr);

    return {
      size: arr.length,
      min: min,
      max: max,
      sum: sum,
      avg: (sum / arr.length).toFixed(1),  // formatted to 1 decimal for display
      range: max - min
    };
  },

  /**
   * Wrap a function call in try/catch and return `null` on exception.
   * Good for non-critical paths where a throw would only surface noise.
   *
   * @param {Function} fn
   * @returns {*} fn() or null if thrown.
   */
  safeExecute: function(fn) {
    try {
      return fn();
    } catch (error) {
      console.error("Safe execution error:", error);
      return null;
    }
  },

  /**
   * Feature-detect modern browser APIs that AlgoDisplay uses.
   * Called once on startup to warn users on older browsers.
   *
   * @returns {{ supported: boolean, unsupported: string[], features: object }}
   */
  checkBrowserSupport: function() {
    const features = {
      webAudio:  !!(window.AudioContext || window.webkitAudioContext),
      promises:  typeof Promise !== 'undefined',
      asyncAwait: (async () => {})() instanceof Promise,
      pyodide:   typeof loadPyodide !== 'undefined'
    };

    // Convert missing keys like "webAudio" → human-readable "web audio".
    const unsupported = Object.keys(features)
      .filter(key => !features[key])
      .map(key => key.replace(/([A-Z])/g, ' $1').toLowerCase());

    return {
      supported: unsupported.length === 0,
      unsupported: unsupported,
      features: features
    };
  },

  /**
   * Attach drag-to-move behaviour to a floating UI element (e.g. the
   * complexity chart overlay). Works with both mouse and touch. The drag
   * handle can be a sub-element (e.g. just the title bar); if omitted, the
   * whole element becomes the handle.
   *
   * Supports both `position: absolute` (relative to offset parent) and
   * `position: fixed` (relative to viewport), detected per-drag start.
   *
   * @param {HTMLElement} elmnt       - Element to move.
   * @param {HTMLElement} [dragHandle] - Sub-element to grab (defaults to elmnt).
   */
  makeDraggable: function(elmnt, dragHandle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let elStartX = 0, elStartY = 0;
    const handle = dragHandle || elmnt;
    handle.style.cursor = "move";

    /** Detect effective CSS position (important for coordinate systems). */
    function getEffectivePos() {
      const s = window.getComputedStyle(elmnt).position;
      if (s === 'fixed') return 'fixed';
      if (elmnt.style.position === 'fixed') return 'fixed';
      return s || 'absolute';
    }

    /** Mouse press: capture start position and hook move/up listeners. */
    function dragMouseDown(e) {
      // Don't hijack clicks on actual controls (buttons/inputs/selects).
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      e.preventDefault();
      const mode = getEffectivePos();
      pos3 = e.clientX;
      pos4 = e.clientY;
      const rect = elmnt.getBoundingClientRect();
      elStartX = rect.left;
      elStartY = rect.top;
      if (mode !== 'fixed') {
        elmnt.style.position = 'absolute';
        elStartX = elmnt.offsetLeft;
        elStartY = elmnt.offsetTop;
      }
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    /** Mouse move: compute delta and apply translation, clamped to viewport. */
    function elementDrag(e) {
      e.preventDefault();
      const mode = getEffectivePos();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      let newTop, newLeft;
      if (mode === 'fixed') {
        newTop = (elStartY - pos2);
        newLeft = (elStartX - pos1);
        // Clamp so the element can't be dragged off-screen.
        const maxX = window.innerWidth - elmnt.offsetWidth;
        const maxY = window.innerHeight - elmnt.offsetHeight;
        newLeft = Math.max(0, Math.min(newLeft, maxX));
        newTop = Math.max(0, Math.min(newTop, maxY));
        elmnt.style.left = newLeft + "px";
        elmnt.style.top = newTop + "px";
        elStartX = newLeft;
        elStartY = newTop;
      } else {
        newTop = (elmnt.offsetTop - pos2);
        newLeft = (elmnt.offsetLeft - pos1);
        elmnt.style.left = newLeft + "px";
        elmnt.style.top = newTop + "px";
      }
    }

    /** Mouse up: release drag hooks. */
    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }

    // --- Touch analogues of the mouse path above ---
    function dragTouchStart(e) {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const mode = getEffectivePos();
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      const rect = elmnt.getBoundingClientRect();
      elStartX = rect.left;
      elStartY = rect.top;
      if (mode !== 'fixed') {
        elmnt.style.position = 'absolute';
        elStartX = elmnt.offsetLeft;
        elStartY = elmnt.offsetTop;
      }
      document.ontouchend = closeTouchDrag;
      document.ontouchmove = touchDrag;
    }

    function touchDrag(e) {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const mode = getEffectivePos();
      pos1 = pos3 - touch.clientX;
      pos2 = pos4 - touch.clientY;
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      let newTop, newLeft;
      if (mode === 'fixed') {
        newTop = (elStartY - pos2);
        newLeft = (elStartX - pos1);
        const maxX = window.innerWidth - elmnt.offsetWidth;
        const maxY = window.innerHeight - elmnt.offsetHeight;
        newLeft = Math.max(0, Math.min(newLeft, maxX));
        newTop = Math.max(0, Math.min(newTop, maxY));
        elmnt.style.left = newLeft + "px";
        elmnt.style.top = newTop + "px";
        elStartX = newLeft;
        elStartY = newTop;
      } else {
        newTop = (elmnt.offsetTop - pos2);
        newLeft = (elmnt.offsetLeft - pos1);
        elmnt.style.left = newLeft + "px";
        elmnt.style.top = newTop + "px";
      }
    }

    function closeTouchDrag() {
      document.ontouchend = null;
      document.ontouchmove = null;
    }

    handle.onmousedown = dragMouseDown;
    handle.ontouchstart = dragTouchStart;
  },

  /**
   * Small styled console logger — wraps messages with emoji + CSS color.
   * Intended for human-facing dev feedback, not structured logging.
   */
  logger: {
    info:    function(msg) { console.log(`%cℹ️ ${msg}`, 'color: #17a2b8; font-weight: bold;'); },
    success: function(msg) { console.log(`%c✅ ${msg}`, 'color: #28a745; font-weight: bold;'); },
    error:   function(msg) { console.log(`%c❌ ${msg}`, 'color: #dc3545; font-weight: bold;'); },
    warn:    function(msg) { console.log(`%c⚠️ ${msg}`, 'color: #ffc107; font-weight: bold;'); }
  }
};

console.log("Utils loaded");
