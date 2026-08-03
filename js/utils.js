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
