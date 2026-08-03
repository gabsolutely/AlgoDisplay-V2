// core.js (main class)
class AlgorithmVisualizer {
  constructor() {
    // Core state
    this.array = [];
    this.isRunning = false;
    this.isPaused = false;
    this.stepMode = false;
    this.shouldStop = false;
    this.speed = 800;
    this.soundEnabled = true;
    this.currentLanguage = 'javascript';
    this.stepResolve = null;
    
    // Performance stats
    this.stats = {
      comparisons: 0,
      swaps: 0,
      steps: 0,
      startTime: 0,
      endTime: 0
    };
    
    // DOM elements cache
    this.elements = {
      container: document.getElementById("visualizer"),
      logArea: document.getElementById("logs"),
      operationInfo: document.getElementById("operation-info"),
      generateBtn: document.getElementById("gen-btn"),
      runBtn: document.getElementById("run-btn"),
      pauseBtn: document.getElementById("pause-btn"),
      resumeBtn: document.getElementById("resume-btn"),
      stepBtn: document.getElementById("step-btn"),
      clearBtn: document.getElementById("clear-btn"),
      languageSelect: document.getElementById("language-select"),
      algorithmSelect: document.getElementById("algorithm-select"),
      arraySizeInput: document.getElementById("array-size"),
      soundToggle: document.getElementById("sound-toggle"),
      editor: document.getElementById("code-editor"),
      actionControls: document.getElementById("action-controls"),
      speedSlider: document.getElementById("speed-range"),
      speedValue: document.getElementById("speed-val"),
      statSize: document.getElementById("stat-size"),
      statComparisons: document.getElementById("stat-comparisons"),
      statSwaps: document.getElementById("stat-swaps"),
      statSteps: document.getElementById("stat-steps"),
      statTime: document.getElementById("stat-time"),
      helpBtn: document.getElementById("help-btn"),
      helpPanel: document.getElementById("help-panel")
    };
    
    console.log("Elements found:", this.validateElements());
    
    // Initialize subsystems
    this.renderer = new ArrayRenderer();
    this.renderer.init(this.elements.container);
    this.sounds = new SoundManager();
    this.pythonRunner = new PythonRunner();
    
    this.init();
  }
  
  async init() {
    console.log("AlgoDisplay initializing...");
    this.setExampleCode();
    this.generateArray();
    this.setupEventListeners();
    console.log("AlgoDisplay ready");
  }
  
  validateElements() {
    const found = {};
    Object.entries(this.elements).forEach(([key, element]) => {
      found[key] = !!element;
      if (!element) console.error(`Missing element: ${key}`);
    });
    return found;
  }
  
  setupEventListeners() {
    // Array generation
    this.elements.generateBtn.onclick = () => this.generateArray();
    
    // Execution controls
    this.elements.runBtn.onclick = () => this.runVisualization();
    this.elements.pauseBtn.onclick = () => this.pauseExecution();
    this.elements.resumeBtn.onclick = () => this.resumeExecution();
    this.elements.stepBtn.onclick = () => this.toggleStepMode();
    this.elements.clearBtn.onclick = () => this.clearAll();
    
    // Help panel toggle
    if (this.elements.helpBtn && this.elements.helpPanel) {
      this.elements.helpBtn.onclick = () => {
        const isVisible = this.elements.helpPanel.style.display !== "none";
        this.elements.helpPanel.style.display = isVisible ? "none" : "block";
        this.elements.helpBtn.textContent = isVisible ? "?" : "✕";
        this.elements.helpBtn.classList.toggle("btn-danger");
        this.elements.helpBtn.classList.toggle("btn-secondary");
      };
    }
    
    // Speed control
    const updateSpeed = () => {
      const baseSpeed = parseInt(this.elements.speedSlider.value);
      const arraySize = this.array.length || 20;
      
      // Adaptive speed for larger arrays
      let adaptiveSpeed = baseSpeed;
      if (arraySize > 20) {
        adaptiveSpeed = Math.max(50, baseSpeed - (arraySize - 20) * 10);
      } else if (arraySize > 10) {
        adaptiveSpeed = Math.max(50, baseSpeed - (arraySize - 10) * 5);
      }
      
      this.speed = adaptiveSpeed;
      this.elements.speedValue.textContent = this.speed + "ms";
    };
    
    this.elements.speedSlider.addEventListener('input', updateSpeed);
    this.elements.speedSlider.addEventListener('change', updateSpeed);
    
    // Language and algorithm selection
    this.elements.languageSelect.onchange = () => {
      this.currentLanguage = this.elements.languageSelect.value;
      this.setExampleCode();
    };
    
    this.elements.algorithmSelect.onchange = () => this.setExampleCode();
    
    // Sound toggle
    this.elements.soundToggle.onchange = () => {
      this.soundEnabled = this.elements.soundToggle.checked;
      this.sounds.setEnabled(this.soundEnabled);
    };
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            this.runVisualization();
            break;
          case 'r':
            e.preventDefault();
            this.generateArray();
            break;
          case 'l':
            e.preventDefault();
            this.clearAll();
            break;
        }
      }
    });
  }
  
  setExampleCode() {
    const language = this.currentLanguage;
    const algorithm = this.elements.algorithmSelect.value;
    
    const templates = {
      javascript: {
        bubble: `// Bubble Sort
for (let i = 0; i < arr.length - 1; i++) {
  for (let j = 0; j < arr.length - i - 1; j++) {
    await compare(j, j + 1);
    if (arr[j] > arr[j + 1]) {
      await swap(arr, j, j + 1);
    }
  }
}`,
        selection: `// Selection Sort
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
}`,
        insertion: `// Insertion Sort
for (let i = 1; i < arr.length; i++) {
  let key = arr[i];
  let j = i - 1;
  while (j >= 0 && arr[j] > key) {
    await compare(j, i);
    await swap(arr, j, j + 1);
    j--;
  }
  arr[j + 1] = key;
  await renderArray(arr);
}`
      },
      python: {
        bubble: `# Bubble Sort
async def sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            await compare(j, j + 1)
            if arr[j] > arr[j + 1]:
                await swap(arr, j, j + 1)`,
        selection: `# Selection Sort
async def sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            await compare(min_idx, j)
            if arr[j] < arr[min_idx]:
                min_idx = j
        if min_idx != i:
            await swap(arr, i, min_idx)`,
        insertion: `# Insertion Sort
async def sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            await compare(j, i)
            await swap(arr, j, j + 1)
            j -= 1
        arr[j + 1] = key
        await render_array(arr)`
      }
    };
    
    this.elements.editor.value = templates[language][algorithm] || templates.javascript.bubble;
  }
  
  generateArray() {
    // Get array size
    let size = 20;
    if (this.elements.arraySizeInput) {
      size = parseInt(this.elements.arraySizeInput.value);
    }
    if (isNaN(size) || size < 5 || size > 50) size = 20;
    
    // Stop any running algorithm
    this.shouldStop = true;
    this.isRunning = false;
    this.isPaused = false;
    this.stepMode = false;
    this.pythonRunner.stopExecution();
    
    // Resolve any pending step
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
    
    // Reset UI
    this.elements.runBtn.style.display = "inline-block";
    this.elements.pauseBtn.style.display = "none";
    this.elements.resumeBtn.style.display = "none";
    this.elements.stepBtn.textContent = "Step Mode";
    this.elements.actionControls.innerHTML = "";
    
    // Generate new array
    this.array = Array.from({ length: size }, () => 
      Math.floor(Math.random() * 200) + 20
    );
    
    // Clear and render
    this.renderer.sortedIndices.clear();
    this.elements.container.innerHTML = '';
    this.renderer.render(this.array);
    
    this.updateStats();
    this.log("Generated array of size " + size);
    this.sounds.play('generate');
  }
  
  updateStats() {
    this.elements.statSize.textContent = this.array.length;
    this.elements.statComparisons.textContent = this.stats.comparisons;
    this.elements.statSwaps.textContent = this.stats.swaps;
    this.elements.statSteps.textContent = this.stats.steps;
    
    if (this.stats.endTime > 0) {
      const elapsed = this.stats.endTime - this.stats.startTime;
      this.elements.statTime.textContent = elapsed + "ms";
    }
  }
  
  log(msg) {
    // Clear log if it's getting too long
    if (this.elements.logArea.textContent.length > 5000) {
      this.elements.logArea.textContent = "";
    }
    
    this.elements.logArea.textContent += msg + "\n";
    this.elements.logArea.scrollTop = this.elements.logArea.scrollHeight;
    console.log("Log:", msg);
  }
  
  updateOperationInfo(operation) {
    this.elements.operationInfo.textContent = operation;
  }
  
  clearAll() {
    // Stop execution
    this.shouldStop = true;
    this.isRunning = false;
    this.isPaused = false;
    this.stepMode = false;
    
    // Stop Python execution if running
    this.pythonRunner.stopExecution();
    
    // Resolve any pending step
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
    
    // Clear displays
    this.elements.logArea.textContent = "";
    this.elements.operationInfo.textContent = "";
    this.renderer.clear();
    this.elements.actionControls.innerHTML = "";
    
    // Reset buttons
    this.elements.runBtn.style.display = "inline-block";
    this.elements.pauseBtn.style.display = "none";
    this.elements.resumeBtn.style.display = "none";
    this.elements.stepBtn.textContent = "Step Mode";
    
    // Reset array and stats
    this.array = [];
    this.stats = {
      comparisons: 0,
      swaps: 0,
      steps: 0,
      startTime: 0,
      endTime: 0
    };
    this.updateStats();
    
    console.log("All cleared");
  }
  
  toggleStepMode() {
    this.stepMode = !this.stepMode;
    this.elements.stepBtn.textContent = this.stepMode ? "Stop Step Mode" : "Step Mode";
    this.log("Step mode: " + (this.stepMode ? "ON" : "OFF"));
  }
  
  pauseExecution() {
    console.log("PAUSE EXECUTION CALLED - isRunning:", this.isRunning, "isPaused:", this.isPaused);
    this.isPaused = true;
    this.elements.pauseBtn.style.display = "none";
    this.elements.resumeBtn.style.display = "inline-block";
    this.log("Execution paused");
  }
  
  resumeExecution() {
    this.isPaused = false;
    this.elements.resumeBtn.style.display = "none";
    this.elements.pauseBtn.style.display = "inline-block";
    this.log("Execution resumed");
  }
  
  validateCode(code, language) {
    if (!code || !code.trim()) {
      return "Code cannot be empty";
    }
    
    if (language === 'python') {
      // Check for required function definition
      if (!code.includes('def sort(') && !code.includes('async def sort(')) {
        return "Python code must include 'async def sort(arr):' function";
      }
      
      // Check for async in function definition
      if (code.includes('def sort(') && !code.includes('async def sort(')) {
        return "Python sort function must be async (use 'async def sort(arr):')";
      }
      
      // Check for await usage with visualization functions
      const visualizationFunctions = ['compare', 'swap', 'render_array'];
      for (const func of visualizationFunctions) {
        const regex = new RegExp(`\\b${func}\\s*\\(`, 'g');
        const matches = code.match(regex);
        if (matches) {
          const awaitRegex = new RegExp(`await\\s+${func}\\s*\\(`, 'g');
          const awaitMatches = code.match(awaitRegex);
          if (!awaitMatches || awaitMatches.length < matches.length) {
            return `Missing 'await' before ${func}() calls in Python`;
          }
        }
      }
      
    } else if (language === 'javascript') {
      // Check for await usage with visualization functions
      const visualizationFunctions = ['compare', 'swap', 'renderArray'];
      for (const func of visualizationFunctions) {
        const regex = new RegExp(`\\b${func}\\s*\\(`, 'g');
        const matches = code.match(regex);
        if (matches) {
          const awaitRegex = new RegExp(`await\\s+${func}\\s*\\(`, 'g');
          const awaitMatches = code.match(awaitRegex);
          if (!awaitMatches || awaitMatches.length < matches.length) {
            return `Missing 'await' before ${func}() calls in JavaScript`;
          }
        }
      }
      
      // Check for potential blocking operations
      if (code.includes('while (true)') || code.includes('for (;;')) {
        return "Infinite loops detected! Make sure your algorithm will terminate.";
      }
    }
    
    return null; // No validation errors
  }
  
  async runVisualization() {
    console.log("=== RUN VISUALIZATION START ===");
    console.log("isRunning:", this.isRunning, "isPaused:", this.isPaused);
    
    // If already running, don't do anything
    if (this.isRunning) {
      console.log("Already running, ignoring...");
      return;
    }
    
    const code = this.elements.editor.value;
    if (!code.trim()) {
      this.log("Error: No code provided!");
      return;
    }
    
    // Validate code based on language
    const validationError = this.validateCode(code, this.currentLanguage);
    if (validationError) {
      this.log(`Error: ${validationError}`);
      return;
    }
    
    // Clear log before starting new run
    this.elements.logArea.textContent = "";
    
    this.isRunning = true;
    this.isPaused = false;
    this.shouldStop = false;
    this.stats.startTime = Date.now();
    this.stats.endTime = 0;
    
    // Clear sorted indices for new run
    this.renderer.sortedIndices.clear();
    
    // Reset stats
    this.stats.comparisons = 0;
    this.stats.swaps = 0;
    this.stats.steps = 0;
    this.updateStats();
    
    // Update UI - show pause button, hide run button
    console.log("Updating UI - showing pause button");
    this.elements.runBtn.style.display = "none";
    this.elements.pauseBtn.style.display = "inline-block";
    this.elements.resumeBtn.style.display = "none";
    
    this.log(`Running ${this.currentLanguage} algorithm...`);
    
    try {
      // Create visualization API
      const api = this.createVisualizationAPI();
      
      if (this.currentLanguage === 'javascript') {
        await this.runJavaScript(code, api);
      } else if (this.currentLanguage === 'python') {
        // Ensure Python is ready
        if (!this.pythonRunner.isSupported()) {
          await this.pythonRunner.init();
        }
        // Pass the shouldStop flag as a function that Python can call
        const result = await this.pythonRunner.run(code, this.array, api, () => this.shouldStop);
        
        // Update with final result
        if (result && Array.isArray(result)) {
          this.array = result;
          this.renderer.render(this.array);
        }
      }
      
      if (!this.shouldStop) {
        this.log("Algorithm completed!");
        this.updateOperationInfo("Completed!");
        this.sounds.play('complete');
        
        // Mark all elements as sorted (green) when complete - immediately
        for (let i = 0; i < this.array.length; i++) {
          this.renderer.markSorted(i);
        }
      }
      
    } catch (error) {
      this.log("Error: " + error.message);
      console.error("Execution error:", error);
      
      // Provide more helpful error messages
      if (error.message.includes("compare") || error.message.includes("swap")) {
        this.log("Tip: Make sure to use 'await' before visualization functions");
      } else if (error.message.includes("sort")) {
        this.log("Tip: For Python, ensure you defined 'async def sort(arr):'");
      }
    } finally {
      this.stats.endTime = Date.now();
      this.updateStats();
      this.isRunning = false;
      this.isPaused = false;
      
      // Reset UI - show run button, hide pause/resume
      console.log("Resetting UI - showing run button");
      this.elements.runBtn.style.display = "inline-block";
      this.elements.pauseBtn.style.display = "none";
      this.elements.resumeBtn.style.display = "none";
    }
  }
  
  createVisualizationAPI() {
    return {
      // Core visualization functions
      compare: async (i, j) => {
        if (this.shouldStop) return;
        
        this.stats.comparisons++;
        this.stats.steps++;
        this.updateStats();
        
        this.log(`Comparing indices ${i} and ${j}`);
        this.updateOperationInfo(`Comparing ${i} and ${j}`);
        
        // Color: Red for comparing
        this.renderer.renderWithHighlight(this.array, [i, j], 'comparing');
        this.sounds.play('compare');
        
        await this.sleep(this.speed);
        
        // Don't reset colors here - let the natural flow handle it
      },
      
      swap: async (arr, i, j) => {
        if (this.shouldStop) return;
        
        this.stats.swaps++;
        this.stats.steps++;
        this.updateStats();
        
        this.log(`Swapping indices ${i} and ${j}`);
        this.updateOperationInfo(`Swapping ${i} and ${j}`);
        
        // Use smooth animated swap
        await this.renderer.animatedSwap(arr, i, j, this.speed);
        
        // Update the visualizer array
        this.array = [...arr];
        
        this.sounds.play('swap');
      },
      
      renderArray: async (arr) => {
        if (this.shouldStop) return;
        
        this.stats.steps++;
        this.updateStats();
        
        // Update the visualizer array
        this.array = [...arr];
        
        // Re-render the entire array
        this.renderer.render(this.array);
        
        await this.sleep(this.speed / 2); // Shorter delay for render
      },
      
      sleep: async (ms) => {
        await this.sleep(ms);
      },
      
      log: (msg) => {
        this.log(msg);
      },
      
      markSorted: (i) => {
        this.renderer.markSorted(i);
      }
    };
  }
  
  async runJavaScript(code, api) {
    // Simple direct execution - no wrapping needed
    console.log("Running JavaScript code directly...");
    
    // Create an async function with the user's code
    const asyncFunction = new Function(
      'arr', 'compare', 'swap', 'renderArray', 'sleep', 'log',
      `
      return (async () => {
        ${code}
        return arr;
      })();
      `
    );
    
    // Execute with our array copy and API
    const result = await asyncFunction(
      [...this.array],
      api.compare,
      api.swap,
      api.renderArray,
      api.sleep,
      api.log
    );
    
    // Update with final result
    if (result && Array.isArray(result)) {
      this.array = result;
      this.renderer.render(this.array);
    }
  }
  
  async sleep(ms) {
    return new Promise(resolve => {
      if (this.shouldStop) {
        resolve();
        return;
      }
      
      if (this.stepMode) {
        this.stepResolve = resolve;
        this.showNextStepButton();
      } else {
        const startTime = Date.now();
        const checkState = setInterval(() => {
          if (this.shouldStop) {
            clearInterval(checkState);
            resolve();
            return;
          }
          
          if (!this.isPaused) {
            const elapsed = Date.now() - startTime;
            if (elapsed >= ms) {
              clearInterval(checkState);
              resolve();
            }
          }
        }, 10);
      }
    });
  }
  
  showNextStepButton() {
    this.elements.actionControls.innerHTML = '';
    const nextBtn = document.createElement("button");
    nextBtn.className = "step-next-btn";
    nextBtn.textContent = "Next Step →";
    nextBtn.onclick = () => {
      this.elements.actionControls.innerHTML = '';
      if (this.stepResolve) {
        this.stepResolve();
        this.stepResolve = null;
      }
    };
    this.elements.actionControls.appendChild(nextBtn);
  }
}

// Global instance
let visualizer;