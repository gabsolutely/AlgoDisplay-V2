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
    let elStartX = 0, elStartY = 0;
    const handle = dragHandle || elmnt;
    handle.style.cursor = "move";

    function getEffectivePos() {
      const s = window.getComputedStyle(elmnt).position;
      if (s === 'fixed') return 'fixed';
      if (elmnt.style.position === 'fixed') return 'fixed';
      return s || 'absolute';
    }

    function dragMouseDown(e) {
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
        const maxX = window.innerWidth - elmnt.offsetWidth;
        const maxY = window.innerHeight - elmnt.offsetHeight;
        newLeft = Math.max(0, Math.min(newLeft, maxX));
        newTop = Math.max(0, Math.min(newTop, maxY));
        elmnt.style.left = newLeft + "px";
        elmnt.style.top = newTop + "px";
      } else {
        newTop = (elmnt.offsetTop - pos2);
        newLeft = (elmnt.offsetLeft - pos1);
        elmnt.style.left = newLeft + "px";
        elmnt.style.top = newTop + "px";
      }
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }

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
