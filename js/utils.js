// utils.js
window.utils = {
  // Debounce function
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
  
  // Generate random array
  generateRandomArray: function(size, min = 20, max = 220) {
    return Array.from({ length: size }, () => 
      Math.floor(Math.random() * (max - min)) + min
    );
  },
  
  // Get array statistics
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
      avg: (sum / arr.length).toFixed(1),
      range: max - min
    };
  },
  
  // Safe execution
  safeExecute: function(fn) {
    try {
      return fn();
    } catch (error) {
      console.error("Safe execution error:", error);
      return null;
    }
  },
  
  // Browser support check
  checkBrowserSupport: function() {
    const features = {
      webAudio: !!(window.AudioContext || window.webkitAudioContext),
      promises: typeof Promise !== 'undefined',
      asyncAwait: (async () => {})() instanceof Promise,
      pyodide: typeof loadPyodide !== 'undefined'
    };
    
    const unsupported = Object.keys(features)
      .filter(key => !features[key])
      .map(key => key.replace(/([A-Z])/g, ' $1').toLowerCase());
    
    return {
      supported: unsupported.length === 0,
      unsupported: unsupported,
      features: features
    };
  },
  
  // Drag helper for floating elements
  makeDraggable: function(elmnt, dragHandle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const handle = dragHandle || elmnt;
    handle.style.cursor = "move";

    handle.onmousedown = dragMouseDown;
    handle.ontouchstart = dragTouchStart;

    function dragMouseDown(e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      elmnt.style.position = "absolute";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }

    function dragTouchStart(e) {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      document.ontouchend = closeTouchDrag;
      document.ontouchmove = touchDrag;
    }

    function touchDrag(e) {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      pos1 = pos3 - touch.clientX;
      pos2 = pos4 - touch.clientY;
      pos3 = touch.clientX;
      pos4 = touch.clientY;
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      elmnt.style.position = "absolute";
    }

    function closeTouchDrag() {
      document.ontouchend = null;
      document.ontouchmove = null;
    }
  },

  // Logger
  logger: {
    info: function(msg) {
      console.log(`%cℹ️ ${msg}`, 'color: #17a2b8; font-weight: bold;');
    },
    success: function(msg) {
      console.log(`%c✅ ${msg}`, 'color: #28a745; font-weight: bold;');
    },
    error: function(msg) {
      console.log(`%c❌ ${msg}`, 'color: #dc3545; font-weight: bold;');
    },
    warn: function(msg) {
      console.log(`%c⚠️ ${msg}`, 'color: #ffc107; font-weight: bold;');
    }
  }
};

console.log("Utils loaded");
