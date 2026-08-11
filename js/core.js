// core.js (main class)
class AlgorithmVisualizer {
  constructor() {
    // Core state
    this.array = [];
    this.arrayB = [];
    this.raceMode = false;
    this.isRunning = false;
    this.isPaused = false;
    this.stepMode = false;
    this.shouldStop = false;
    this.speed = 300;
    this.soundEnabled = true;
    this.musicalMode = false;
    this.currentLanguage = 'javascript';
    this.currentCategory = 'sort';
    this.currentAlgorithm = 'bubble';
    this.currentAlgorithmB = 'bubble';
    this.searchTarget = null;
    this.stepResolve = null;
    this._generation = 0;
    this._runGeneration = null;
    
    // Performance stats
    this.stats = {
      comparisons: 0,
      swaps: 0,
      steps: 0,
      startTime: 0,
      endTime: 0
    };
    this.statsB = {
      comparisons: 0,
      swaps: 0,
      steps: 0,
      startTime: 0,
      endTime: 0
    };
    
    // Step-back history & Pseudocode tracking
    this.history = [];
    this.currentPseudocodeLine = 0;
    
    // DOM elements cache
    this.elements = {
      container: document.getElementById("visualizer"),
      containerB: document.getElementById("visualizer-b"),
      vizSideB: document.getElementById("viz-side-b"),
      vizWrapper: document.getElementById("viz-wrapper"),
      vizLabelA: document.getElementById("viz-label-a"),
      vizLabelB: document.getElementById("viz-label-b"),
      statsCardB: document.getElementById("stats-card-b"),
      statsTitleA: document.getElementById("stats-title-a"),
      statsTitleB: document.getElementById("stats-title-b"),
      logArea: document.getElementById("logs"),
      operationInfo: document.getElementById("operation-info"),
      generateBtn: document.getElementById("gen-btn"),
      runBtn: document.getElementById("run-btn"),
      pauseBtn: document.getElementById("pause-btn"),
      resumeBtn: document.getElementById("resume-btn"),
      stepBtn: document.getElementById("step-btn"),
      clearBtn: document.getElementById("clear-btn"),
      categorySelect: document.getElementById("category-select"),
      languageSelect: document.getElementById("language-select"),
      algorithmSelect: document.getElementById("algorithm-select"),
      algorithmSelectB: document.getElementById("algorithm-select-b"),
      raceToggle: document.getElementById("race-toggle"),
      presetSelect: document.getElementById("preset-select"),
      arraySizeInput: document.getElementById("array-size"),
      targetInput: document.getElementById("target-input"),
      searchSortToggle: document.getElementById("search-sort-toggle"),
      soundToggle: document.getElementById("sound-toggle"),
      musicalToggle: document.getElementById("musical-toggle"),
      producerKitSelect: document.getElementById("producer-kit-select"),
      waveformSelect: document.getElementById("waveform-select"),
      scaleSelect: document.getElementById("scale-select"),
      octaveSelect: document.getElementById("octave-select"),
      volumeRange: document.getElementById("volume-range"),
      volumeVal: document.getElementById("volume-val"),
      producerJamBtn: document.getElementById("producer-jam-btn"),
      themeToggle: document.getElementById("theme-toggle"),
      paletteToggle: document.getElementById("palette-toggle"),
      editor: document.getElementById("code-editor"),
      actionControls: document.getElementById("action-controls"),
      speedSlider: document.getElementById("speed-range"),
      speedValue: document.getElementById("speed-val"),
      statSize: document.getElementById("stat-size"),
      statComparisons: document.getElementById("stat-comparisons"),
      statSwaps: document.getElementById("stat-swaps"),
      statSteps: document.getElementById("stat-steps"),
      statTime: document.getElementById("stat-time"),
      statSizeB: document.getElementById("stat-size-b"),
      statComparisonsB: document.getElementById("stat-comparisons-b"),
      statSwapsB: document.getElementById("stat-swaps-b"),
      statStepsB: document.getElementById("stat-steps-b"),
      statTimeB: document.getElementById("stat-time-b"),
      helpBtn: document.getElementById("help-btn"),
      helpPanel: document.getElementById("help-panel"),
      searchOnlyGroups: Array.from(document.querySelectorAll(".search-only")),
      nearlySortedGroups: Array.from(document.querySelectorAll(".nearly-sorted-only")),
      customOnlyGroups: Array.from(document.querySelectorAll(".custom-only")),
      raceOnlyGroups: Array.from(document.querySelectorAll(".race-only")),
      customArrayInput: document.getElementById("custom-array"),
      nearlySwapsSlider: document.getElementById("nearly-swaps"),
      nearlySwapsVal: document.getElementById("nearly-swaps-val"),
      nearlySpreadSlider: document.getElementById("nearly-spread"),
      nearlySpreadVal: document.getElementById("nearly-spread-val"),
      shareBtn: document.getElementById("share-btn"),
      complexityBtn: document.getElementById("complexity-btn"),
      stepBackBtn: document.getElementById("step-back-btn"),
      pseudocodePanel: document.getElementById("pseudocode-panel"),
      pseudocodeTitle: document.getElementById("pseudocode-algo-title"),
      pseudocodeBody: document.getElementById("pseudocode-body"),
      pseudocodePanelB: document.getElementById("pseudocode-panel-b"),
      pseudocodeTitleB: document.getElementById("pseudocode-algo-title-b"),
      pseudocodeBodyB: document.getElementById("pseudocode-body-b"),
      graphOnlyGroups: Array.from(document.querySelectorAll(".graph-only")),
      gridOnlyGroups: Array.from(document.querySelectorAll(".grid-only")),
      graphPresetSelect: document.getElementById("graph-preset-select"),
      directedToggle: document.getElementById("directed-toggle"),
      mazeGenBtn: document.getElementById("maze-gen-btn"),
      clearWallsBtn: document.getElementById("clear-walls-btn"),
    };
    
    console.log("Elements found:", this.validateElements());
    
    // Initialize subsystems
    this.pseudocodeManager = new PseudocodeManager();
    this.graphEngine = new GraphEngine();
    this.graphRenderer = new GraphRenderer();
    this.gridRenderer = new GridRenderer();

    this.renderer = new ArrayRenderer();
    this.renderer.init(this.elements.container);
    this.rendererB = new ArrayRenderer();
    if (this.elements.containerB) {
      this.rendererB.init(this.elements.containerB);
    }
    this.sounds = new SoundManager();
    this.sounds.setScale("pentatonic");
    this.sounds.setWaveform("triangle");
    this.pythonRunner = new PythonRunner();
    this.pythonRunnerB = new PythonRunner();
    
    this.init();
  }
  
  async init() {
    console.log("AlgoDisplay initializing...");
    this.setupEventListeners();
    const loadedFromURL = this.loadFromURL();
    if (!loadedFromURL) {
      this.setExampleCode();
      this.generateArray();
    }
    this.initComplexityOverlay();

    if (window.utils && window.utils.makeDraggable) {
      if (this.elements.pseudocodePanel) {
        window.utils.makeDraggable(this.elements.pseudocodePanel, this.elements.pseudocodePanel.querySelector('.pseudocode-header'));
      }
      if (this.elements.pseudocodePanelB) {
        window.utils.makeDraggable(this.elements.pseudocodePanelB, this.elements.pseudocodePanelB.querySelector('.pseudocode-header'));
      }
    }
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
    this.elements.generateBtn.onclick = () => this.generateArray();

    this.elements.runBtn.onclick = () => this.runVisualization();
    this.elements.pauseBtn.onclick = () => this.pauseExecution();
    this.elements.resumeBtn.onclick = () => this.resumeExecution();
    this.elements.stepBtn.onclick = () => this.toggleStepMode();
    this.elements.clearBtn.onclick = () => this.clearAll();

    if (this.elements.helpBtn && this.elements.helpPanel) {
      this.elements.helpBtn.onclick = () => {
        const isVisible = this.elements.helpPanel.style.display !== "none";
        this.elements.helpPanel.style.display = isVisible ? "none" : "block";
        this.elements.helpBtn.textContent = isVisible ? "?" : "✕";
        this.elements.helpBtn.classList.toggle("btn-danger");
        this.elements.helpBtn.classList.toggle("btn-secondary");
      };
    }

    const updateSpeed = () => {
      this.speed = parseInt(this.elements.speedSlider.value);
      if (isNaN(this.speed)) this.speed = 300;
      this.elements.speedValue.textContent = this.speed + "ms";
    };

    this.elements.speedSlider.addEventListener('input', updateSpeed);
    this.elements.speedSlider.addEventListener('change', updateSpeed);
    updateSpeed();

    this.elements.categorySelect.onchange = () => {
      this.currentCategory = this.elements.categorySelect.value;
      this.onCategoryChange();
    };

    if (this.elements.graphPresetSelect) {
      this.elements.graphPresetSelect.onchange = () => {
        const p = this.elements.graphPresetSelect.value;
        this.graphEngine.generatePreset(p);
        this.graphRenderer.render();
      };
    }

    if (this.elements.directedToggle) {
      this.elements.directedToggle.onchange = () => {
        this.graphEngine.setDirected(this.elements.directedToggle.checked);
        this.graphRenderer.render();
      };
    }

    if (this.elements.mazeGenBtn) {
      this.elements.mazeGenBtn.onclick = () => {
        this.graphEngine.generateRecursiveMaze();
        this.gridRenderer.render();
        this.log("⚡ Generated Recursive Backtracking Maze!");
      };
    }

    if (this.elements.clearWallsBtn) {
      this.elements.clearWallsBtn.onclick = () => {
        this.graphEngine.clearGridWalls();
        this.gridRenderer.render();
        this.log("🧹 Cleared all grid walls.");
      };
    }

    this.elements.languageSelect.onchange = () => {
      this.currentLanguage = this.elements.languageSelect.value;
      this.setExampleCode();
    };

    this.elements.algorithmSelect.onchange = () => {
      this.currentAlgorithm = this.elements.algorithmSelect.value;
      this.setExampleCode();
    };

    this.elements.soundToggle.onchange = () => {
      this.soundEnabled = this.elements.soundToggle.checked;
      this.sounds.setEnabled(this.soundEnabled);
    };

    if (this.elements.musicalToggle) {
      this.elements.musicalToggle.onchange = () => {
        this.musicalMode = this.elements.musicalToggle.checked;
        this.sounds.setMusicalMode(this.musicalMode);
        this.log("Musical mode: " + (this.musicalMode ? "ON" : "OFF"));
      };
    }

    if (this.elements.producerKitSelect) {
      this.elements.producerKitSelect.onchange = () => {
        const kitName = this.elements.producerKitSelect.value;
        const kit = this.sounds.setProducerKit(kitName);
        if (kit) {
          if (this.elements.waveformSelect) this.elements.waveformSelect.value = kit.wave;
          if (this.elements.scaleSelect) this.elements.scaleSelect.value = kit.scale;
          if (this.elements.octaveSelect) this.elements.octaveSelect.value = kit.octave;
          this.log("Producer Kit Loaded: " + kitName.toUpperCase());
          this.sounds.playProducerDemo();
        }
      };
    }

    if (this.elements.waveformSelect) {
      this.elements.waveformSelect.onchange = () => {
        this.sounds.setWaveform(this.elements.waveformSelect.value);
        if (this.elements.producerKitSelect) this.elements.producerKitSelect.value = "default";
        this.log("Synth Sound: " + this.elements.waveformSelect.value);
      };
    }

    if (this.elements.scaleSelect) {
      this.elements.scaleSelect.onchange = () => {
        this.sounds.setScale(this.elements.scaleSelect.value);
        if (this.elements.producerKitSelect) this.elements.producerKitSelect.value = "default";
        this.log("Scale: " + this.elements.scaleSelect.value);
      };
    }

    if (this.elements.octaveSelect) {
      this.elements.octaveSelect.onchange = () => {
        this.sounds.setOctave(this.elements.octaveSelect.value);
        if (this.elements.producerKitSelect) this.elements.producerKitSelect.value = "default";
        this.log("Pitch Transpose: " + this.elements.octaveSelect.value);
      };
    }

    if (this.elements.volumeRange) {
      const updateVolume = () => {
        const volVal = parseInt(this.elements.volumeRange.value) || 0;
        if (this.elements.volumeVal) this.elements.volumeVal.textContent = volVal + "%";
        this.sounds.setVolume(volVal / 100);
      };
      this.elements.volumeRange.addEventListener('input', updateVolume);
      this.elements.volumeRange.addEventListener('change', updateVolume);
      updateVolume();
    }

    if (this.elements.producerJamBtn) {
      this.elements.producerJamBtn.onclick = () => {
        this.sounds.playProducerDemo();
      };
    }

    if (this.elements.raceToggle) {
      this.elements.raceToggle.onchange = () => {
        this.raceMode = this.elements.raceToggle.checked;
        if (this.elements.vizSideB) {
          this.elements.vizSideB.style.display = this.raceMode ? "" : "none";
        }
        if (this.elements.vizWrapper) {
          if (this.raceMode) this.elements.vizWrapper.classList.add("race-mode");
          else this.elements.vizWrapper.classList.remove("race-mode");
        }
        if (this.elements.statsCardB) {
          this.elements.statsCardB.style.display = this.raceMode ? "" : "none";
        }
        if (this.elements.raceOnlyGroups) {
          this.elements.raceOnlyGroups.forEach(el => {
            el.style.display = this.raceMode ? "" : "none";
          });
        }
        this.refreshAlgorithmSelectB();
        this.generateArray();
        this.log("Race mode: " + (this.raceMode ? "ON" : "OFF"));
      };
    }

    if (this.elements.algorithmSelectB) {
      this.elements.algorithmSelectB.onchange = () => {
        this.currentAlgorithmB = this.elements.algorithmSelectB.value;
      };
    }

    if (this.elements.presetSelect) {
      this.elements.presetSelect.onchange = () => {
        const preset = this.elements.presetSelect.value;
        if (this.elements.nearlySortedGroups) {
          const showNearly = preset === "nearly-sorted";
          this.elements.nearlySortedGroups.forEach(el => {
            el.style.display = showNearly ? "" : "none";
          });
        }
        if (this.elements.customOnlyGroups) {
          const showCustom = preset === "custom";
          this.elements.customOnlyGroups.forEach(el => {
            el.style.display = showCustom ? "" : "none";
          });
        }
      };
    }

    if (this.elements.nearlySwapsSlider) {
      const updateSwapsLabel = () => {
        if (this.elements.nearlySwapsVal) {
          this.elements.nearlySwapsVal.textContent = this.elements.nearlySwapsSlider.value + "%";
        }
      };
      this.elements.nearlySwapsSlider.addEventListener('input', updateSwapsLabel);
      this.elements.nearlySwapsSlider.addEventListener('change', updateSwapsLabel);
      updateSwapsLabel();
    }

    if (this.elements.nearlySpreadSlider) {
      const updateSpreadLabel = () => {
        if (this.elements.nearlySpreadVal) {
          this.elements.nearlySpreadVal.textContent = this.elements.nearlySpreadSlider.value + "%";
        }
      };
      this.elements.nearlySpreadSlider.addEventListener('input', updateSpreadLabel);
      this.elements.nearlySpreadSlider.addEventListener('change', updateSpreadLabel);
      updateSpreadLabel();
    }

    if (this.elements.themeToggle) {
      this.elements.themeToggle.onchange = (e) => {
        if (e.target.checked) {
          document.documentElement.setAttribute("data-theme", "light");
        } else {
          document.documentElement.removeAttribute("data-theme");
        }
      };
    }

    if (this.elements.paletteToggle) {
      this.elements.paletteToggle.onchange = (e) => {
        if (e.target.checked) {
          document.documentElement.setAttribute("data-palette", "colorblind");
        } else {
          document.documentElement.removeAttribute("data-palette");
        }
      };
    }

    if (this.elements.targetInput) {
      this.elements.targetInput.addEventListener('input', () => {
        const v = parseInt(this.elements.targetInput.value);
        this.searchTarget = isNaN(v) ? null : v;
      });
    }

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

    if (this.elements.shareBtn) {
      this.elements.shareBtn.onclick = () => this.shareState();
    }

    if (this.elements.complexityBtn) {
      this.elements.complexityBtn.onclick = () => {
        if (!this.complexityOverlay) this.initComplexityOverlay();
        const willShow = !this.complexityOverlay.classList.contains('visible');
        this.complexityOverlay.classList.toggle('visible');
        if (willShow) this.renderComplexityChart();
      };
    }

    if (this.elements.stepBackBtn) {
      this.elements.stepBackBtn.onclick = () => this.stepBack();
    }
  }

  onCategoryChange() {
    const isSearch = this.currentCategory === "search";
    const isGraph = this.currentCategory === "graph";
    const isGrid = this.currentCategory === "grid";

    if (this.elements.searchOnlyGroups) {
      this.elements.searchOnlyGroups.forEach(el => el.style.display = isSearch ? "" : "none");
    }
    if (this.elements.graphOnlyGroups) {
      this.elements.graphOnlyGroups.forEach(el => el.style.display = isGraph ? "" : "none");
    }
    if (this.elements.gridOnlyGroups) {
      this.elements.gridOnlyGroups.forEach(el => el.style.display = isGrid ? "" : "none");
    }

    if (isGraph) {
      this.graphEngine.generatePreset(this.elements.graphPresetSelect?.value || "random");
      this.graphRenderer.init(this.elements.container, this.graphEngine);
    } else if (isGrid) {
      this.graphEngine.initGrid();
      this.gridRenderer.init(this.elements.container, this.graphEngine);
    } else {
      this.renderer = new ArrayRenderer();
      this.renderer.init(this.elements.container);
      this.generateArray();
    }

    this.refreshAlgorithmOptions();
    this.refreshAlgorithmSelectB();
    this.setExampleCode();
  }

  refreshAlgorithmOptions() {
    const select = this.elements.algorithmSelect;
    const opts = {
      sort: [
        ["bubble", "Bubble Sort"],
        ["selection", "Selection Sort"],
        ["insertion", "Insertion Sort"],
        ["merge", "Merge Sort"],
        ["quick", "Quick Sort"],
        ["heap", "Heap Sort"],
        ["shell", "Shell Sort"],
        ["cocktail", "Cocktail Shaker"],
        ["counting", "Counting Sort"],
        ["radix", "Radix Sort (LSD)"],
      ],
      search: [
        ["linear", "Linear Search"],
        ["binary", "Binary Search"],
        ["interpolation", "Interpolation Search"],
        ["exponential", "Exponential Search"],
        ["ternary", "Ternary Search"],
      ],
      graph: [
        ["bfs", "BFS (Breadth-First Search)"],
        ["dfs", "DFS (Depth-First Search)"],
        ["dijkstra", "Dijkstra's Shortest Path"],
        ["astar", "A* Search Algorithm"],
        ["bellman_ford", "Bellman-Ford Algorithm"],
        ["prim", "Prim's MST"],
        ["kruskal", "Kruskal's MST"],
        ["toposort", "Topological Sort"],
      ],
      grid: [
        ["bfs", "Grid BFS Pathfinding"],
        ["dfs", "Grid DFS Pathfinding"],
        ["dijkstra", "Grid Dijkstra Pathfinding"],
        ["astar", "Grid A* Pathfinding"],
      ],
    };
    const list = opts[this.currentCategory] || opts.sort;
    const prev = this.currentAlgorithm;
    select.innerHTML = "";
    list.forEach(([v, l]) => {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = l;
      select.appendChild(o);
    });
    const values = list.map(([v]) => v);
    const keep = prev && values.includes(prev);
    this.currentAlgorithm = keep ? prev : list[0][0];
    select.value = this.currentAlgorithm;
  }

  refreshAlgorithmSelectB() {
    if (!this.elements.algorithmSelectB) return;
    const opts = {
      sort: [
        ["bubble", "Bubble Sort"],
        ["selection", "Selection Sort"],
        ["insertion", "Insertion Sort"],
        ["merge", "Merge Sort"],
        ["quick", "Quick Sort"],
        ["heap", "Heap Sort"],
        ["shell", "Shell Sort"],
        ["cocktail", "Cocktail Shaker"],
        ["counting", "Counting Sort"],
        ["radix", "Radix Sort (LSD)"],
      ],
      search: [
        ["linear", "Linear Search"],
        ["binary", "Binary Search"],
        ["interpolation", "Interpolation Search"],
        ["exponential", "Exponential Search"],
        ["ternary", "Ternary Search"],
      ],
      graph: [
        ["bfs", "BFS"],
        ["dfs", "DFS"],
        ["dijkstra", "Dijkstra"],
        ["astar", "A* Search"],
      ],
      grid: [
        ["bfs", "Grid BFS"],
        ["dfs", "Grid DFS"],
        ["dijkstra", "Grid Dijkstra"],
        ["astar", "Grid A*"],
      ],
    };
    const list = opts[this.currentCategory] || opts.sort;
    const prev = this.currentAlgorithmB;
    this.elements.algorithmSelectB.innerHTML = "";
    list.forEach(([v, l]) => {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = l;
      this.elements.algorithmSelectB.appendChild(o);
    });
    const values = list.map(([v]) => v);
    const keep = prev && values.includes(prev);
    this.currentAlgorithmB = keep ? prev : list[0][0];
    this.elements.algorithmSelectB.value = this.currentAlgorithmB;
  }
  
  setExampleCode() {
    const language = this.currentLanguage;
    const category = this.currentCategory;
    const algorithm = this.currentAlgorithm;

    this.renderPseudocode(algorithm);

    const templates = {
      javascript: {
        sort: {
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
}`,
          merge: `// Merge Sort
async function mergeSortHelper(arr, left, right) {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    await mergeSortHelper(arr, left, mid);
    await mergeSortHelper(arr, mid + 1, right);
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    while (i < leftArr.length && j < rightArr.length) {
      await compare(left + i, mid + 1 + j);
      if (leftArr[i] <= rightArr[j]) arr[k++] = leftArr[i++];
      else arr[k++] = rightArr[j++];
      await renderArray(arr);
    }
    while (i < leftArr.length) { arr[k++] = leftArr[i++]; await renderArray(arr); }
    while (j < rightArr.length) { arr[k++] = rightArr[j++]; await renderArray(arr); }
  }
}
await mergeSortHelper(arr, 0, arr.length - 1);`,
          quick: `// Quick Sort (last element pivot)
async function qs(arr, low, high) {
  if (low < high) {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      await compare(j, high);
      if (arr[j] <= pivot) {
        i++;
        if (i !== j) await swap(arr, i, j);
      }
    }
    if (i + 1 !== high) await swap(arr, i + 1, high);
    const pi = i + 1;
    await qs(arr, low, pi - 1);
    await qs(arr, pi + 1, high);
  }
}
await qs(arr, 0, arr.length - 1);`,
          heap: `// Heap Sort
const n = arr.length;
async function heapify(arr, heapSize, i) {
  let largest = i;
  const left = 2 * i + 1, right = 2 * i + 2;
  if (left < heapSize) { await compare(left, largest); if (arr[left] > arr[largest]) largest = left; }
  if (right < heapSize) { await compare(right, largest); if (arr[right] > arr[largest]) largest = right; }
  if (largest !== i) {
    await swap(arr, i, largest);
    await heapify(arr, heapSize, largest);
  }
}
for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(arr, n, i);
for (let i = n - 1; i > 0; i--) {
  await swap(arr, 0, i);
  await heapify(arr, i, 0);
}`,
          shell: `// Shell Sort
const n = arr.length;
for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
  for (let i = gap; i < n; i++) {
    const temp = arr[i];
    let j = i;
    while (j >= gap) {
      await compare(j - gap, i);
      if (arr[j - gap] > temp) {
        await swap(arr, j - gap, j);
        j -= gap;
      } else break;
    }
    arr[j] = temp;
    await renderArray(arr);
  }
}`,
          cocktail: `// Cocktail Shaker Sort
let start = 0, end = arr.length - 1, swapped = true;
while (swapped) {
  swapped = false;
  for (let i = start; i < end; i++) {
    await compare(i, i + 1);
    if (arr[i] > arr[i + 1]) { await swap(arr, i, i + 1); swapped = true; }
  }
  if (!swapped) break;
  end--;
  swapped = false;
  for (let i = end - 1; i >= start; i--) {
    await compare(i, i + 1);
    if (arr[i] > arr[i + 1]) { await swap(arr, i, i + 1); swapped = true; }
  }
  start++;
}`,
          counting: `// Counting Sort O(n + k) — non-comparison integer sort
if (arr.length <= 1) return;
const min = Math.min(...arr), max = Math.max(...arr);
const range = max - min + 1;
const count = new Array(range).fill(0);
log("Range " + min + " → " + max + "  |  buckets = " + range);
for (let i = 0; i < arr.length; i++) {
  await compare(i, i);
  count[arr[i] - min]++;
}
// Render bucket phase as a visual "swap-free" pass
const out = new Array(arr.length);
let idx = 0;
for (let b = 0; b < range; b++) {
  while (count[b] > 0) {
    out[idx] = min + b;
    count[b]--;
    idx++;
    if (idx < arr.length) await compare(idx, idx);
  }
}
for (let i = 0; i < arr.length; i++) arr[i] = out[i];
await renderArray(arr);`,
          radix: `// Radix Sort (LSD) — repeated Counting Sort by digit
const countingByDigit = async (arr, n, exp) => {
  const out = new Array(n).fill(0);
  const count = new Array(10).fill(0);
  for (let i = 0; i < n; i++) count[Math.floor(arr[i] / exp) % 10]++;
  for (let i = 1; i < 10; i++) count[i] += count[i - 1];
  for (let i = n - 1; i >= 0; i--) {
    const d = Math.floor(arr[i] / exp) % 10;
    out[count[d] - 1] = arr[i];
    count[d]--;
    await compare(i, i);
  }
  for (let i = 0; i < n; i++) arr[i] = out[i];
  await renderArray(arr);
};
const n = arr.length;
const m = Math.max(...arr);
for (let exp = 1; Math.floor(m / exp) > 0; exp *= 10) {
  log("Sorting digit " + exp);
  await countingByDigit(arr, n, exp);
}`,
        },
        search: {
          linear: `// Linear Search - find target in arr
for (let i = 0; i < arr.length; i++) {
  await compare(i, i);
  if (arr[i] === target) {
    await markFound(i);
    log("Found at index " + i);
    return i;
  }
}
log("Target not found");
return -1;`,
          binary: `// Binary Search (array will be auto-sorted first)
let left = 0, right = arr.length - 1;
while (left <= right) {
  const mid = Math.floor((left + right) / 2);
  await compare(mid, mid);
  if (arr[mid] === target) { await markFound(mid); log("Found at " + mid); return mid; }
  if (arr[mid] < target) left = mid + 1;
  else right = mid - 1;
}
log("Target not found");
return -1;`,
          interpolation: `// Interpolation Search (uniformly distributed, sorted)
let left = 0, right = arr.length - 1;
while (left <= right && target >= arr[left] && target <= arr[right]) {
  if (left === right) {
    await compare(left, left);
    if (arr[left] === target) { await markFound(left); return left; }
    return -1;
  }
  const pos = left + Math.floor(((target - arr[left]) * (right - left)) / (arr[right] - arr[left]));
  await compare(pos, pos);
  if (arr[pos] === target) { await markFound(pos); log("Found at " + pos); return pos; }
  if (arr[pos] < target) left = pos + 1;
  else right = pos - 1;
}
log("Target not found");
return -1;`,
          exponential: `// Exponential Search (sorted)
if (arr[0] === target) { await compare(0, 0); await markFound(0); return 0; }
let i = 1;
while (i < arr.length && arr[i] <= target) {
  await compare(i, i);
  i = i * 2;
}
let left = Math.floor(i / 2), right = Math.min(i, arr.length - 1);
while (left <= right) {
  const mid = Math.floor((left + right) / 2);
  await compare(mid, mid);
  if (arr[mid] === target) { await markFound(mid); log("Found at " + mid); return mid; }
  if (arr[mid] < target) left = mid + 1;
  else right = mid - 1;
}
log("Target not found");
return -1;`,
          ternary: `// Ternary Search (sorted array)
let left = 0, right = arr.length - 1;
while (left <= right) {
  if (right - left < 3) {
    for (let k = left; k <= right; k++) {
      await compare(k, k);
      if (arr[k] === target) { await markFound(k); log("Found at " + k); return k; }
    }
    break;
  }
  const m1 = left + Math.floor((right - left) / 3);
  const m2 = right - Math.floor((right - left) / 3);
  await compare(m1, m1);
  await compare(m2, m2);
  if (arr[m1] === target) { await markFound(m1); log("Found at " + m1); return m1; }
  if (arr[m2] === target) { await markFound(m2); log("Found at " + m2); return m2; }
  if (target < arr[m1]) right = m1 - 1;
  else if (target > arr[m2]) left = m2 + 1;
  else { left = m1 + 1; right = m2 - 1; }
}
log("Target not found");
return -1;`,
        },
        graph: {
          bfs: `// Graph / Tree BFS (Breadth-First Search)
const nodes = getNodes();
if (nodes.length === 0) return;
const startId = nodes[0].id;
const queue = [startId];
const visited = new Set([startId]);

while (queue.length > 0) {
  const current = queue.shift();
  await visitNode(current, "visiting");
  const neighbors = getNeighbors(current);
  for (const n of neighbors) {
    if (!visited.has(n.id)) {
      visited.add(n.id);
      queue.push(n.id);
    }
  }
}`,
          dfs: `// Graph / Tree DFS (Depth-First Search)
const nodes = getNodes();
if (nodes.length === 0) return;
const visited = new Set();
async function dfs(u) {
  visited.add(u);
  await visitNode(u, "visiting");
  const neighbors = getNeighbors(u);
  for (const n of neighbors) {
    if (!visited.has(n.id)) {
      await dfs(n.id);
    }
  }
}
await dfs(nodes[0].id);`,
          dijkstra: `// Graph Dijkstra Shortest Path
const nodes = getNodes();
if (nodes.length === 0) return;
const dist = {};
const visited = new Set();
nodes.forEach(n => dist[n.id] = Infinity);
dist[nodes[0].id] = 0;

while (visited.size < nodes.length) {
  let minNode = null, minDist = Infinity;
  nodes.forEach(n => {
    if (!visited.has(n.id) && dist[n.id] < minDist) {
      minDist = dist[n.id];
      minNode = n.id;
    }
  });
  if (minNode === null) break;
  visited.add(minNode);
  await visitNode(minNode, "visiting");
  const neighbors = getNeighbors(minNode);
  for (const n of neighbors) {
    if (dist[minNode] + n.weight < dist[n.id]) {
      dist[n.id] = dist[minNode] + n.weight;
    }
  }
}`,
          astar: `// A* Graph Search
const nodes = getNodes();
if (nodes.length === 0) return;
for (const n of nodes) {
  await visitNode(n.id, "visiting");
}`
        },
        grid: {
          bfs: `// Grid BFS Pathfinding
const start = getStartCell();
const target = getTargetCell();
if (!start || !target) return;
const queue = [start];
const visited = new Set([\`\${start.r},\${start.c}\`]);

while (queue.length > 0) {
  const current = queue.shift();
  await visitGridCell(current.r, current.c, "visiting");
  if (current.r === target.r && current.c === target.c) {
    log("Target reached!");
    return;
  }
  const neighbors = getGridNeighbors(current.r, current.c);
  for (const n of neighbors) {
    const key = \`\${n.r},\${n.c}\`;
    if (!visited.has(key)) {
      visited.add(key);
      queue.push(n);
    }
  }
}`,
          dfs: `// Grid DFS Pathfinding
const start = getStartCell();
const target = getTargetCell();
if (!start || !target) return;
const visited = new Set();

async function dfsGrid(r, c) {
  const key = \`\${r},\${c}\`;
  if (visited.has(key)) return false;
  visited.add(key);
  await visitGridCell(r, c, "visiting");
  if (r === target.r && c === target.c) return true;
  const neighbors = getGridNeighbors(r, c);
  for (const n of neighbors) {
    if (await dfsGrid(n.r, n.c)) return true;
  }
  return false;
}
await dfsGrid(start.r, start.c);`
        }
      },
      python: {
        sort: {
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
        await render_array(arr)`,
          merge: `# Merge Sort
async def merge_sort(arr, l, r):
    if l < r:
        mid = (l + r) // 2
        await merge_sort(arr, l, mid)
        await merge_sort(arr, mid + 1, r)
        left_arr = arr[l:mid + 1]
        right_arr = arr[mid + 1:r + 1]
        i = j = 0
        k = l
        while i < len(left_arr) and j < len(right_arr):
            await compare(l + i, mid + 1 + j)
            if left_arr[i] <= right_arr[j]:
                arr[k] = left_arr[i]; i += 1
            else:
                arr[k] = right_arr[j]; j += 1
            k += 1
            await render_array(arr)
        while i < len(left_arr):
            arr[k] = left_arr[i]; i += 1; k += 1
            await render_array(arr)
        while j < len(right_arr):
            arr[k] = right_arr[j]; j += 1; k += 1
            await render_array(arr)

async def sort(arr):
    await merge_sort(arr, 0, len(arr) - 1)`,
          quick: `# Quick Sort (last pivot)
async def qs(arr, low, high):
    if low < high:
        pivot = arr[high]
        i = low - 1
        for j in range(low, high):
            await compare(j, high)
            if arr[j] <= pivot:
                i += 1
                if i != j:
                    await swap(arr, i, j)
        if i + 1 != high:
            await swap(arr, i + 1, high)
        pi = i + 1
        await qs(arr, low, pi - 1)
        await qs(arr, pi + 1, high)

async def sort(arr):
    await qs(arr, 0, len(arr) - 1)`,
          heap: `# Heap Sort
async def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    if left < n:
        await compare(left, largest)
        if arr[left] > arr[largest]:
            largest = left
    if right < n:
        await compare(right, largest)
        if arr[right] > arr[largest]:
            largest = right
    if largest != i:
        await swap(arr, i, largest)
        await heapify(arr, n, largest)

async def sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        await heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        await swap(arr, 0, i)
        await heapify(arr, i, 0)`,
          shell: `# Shell Sort
async def sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap:
                await compare(j - gap, i)
                if arr[j - gap] > temp:
                    await swap(arr, j - gap, j)
                    j -= gap
                else:
                    break
            arr[j] = temp
            await render_array(arr)
        gap //= 2`,
          cocktail: `# Cocktail Shaker Sort
async def sort(arr):
    n = len(arr)
    start = 0
    end = n - 1
    swapped = True
    while swapped:
        swapped = False
        for i in range(start, end):
            await compare(i, i + 1)
            if arr[i] > arr[i + 1]:
                await swap(arr, i, i + 1)
                swapped = True
        if not swapped:
            break
        end -= 1
        swapped = False
        for i in range(end - 1, start - 1, -1):
            await compare(i, i + 1)
            if arr[i] > arr[i + 1]:
                await swap(arr, i, i + 1)
                swapped = True
        start += 1`,
          counting: `# Counting Sort O(n + k) — non-comparison integer sort
async def sort(arr):
    if len(arr) <= 1:
        return
    mn = min(arr)
    mx = max(arr)
    rng = mx - mn + 1
    count = [0] * rng
    log("Range " + str(mn) + " -> " + str(mx) + "  |  buckets = " + str(rng))
    for i in range(len(arr)):
        await compare(i, i)
        count[arr[i] - mn] += 1
    out = [0] * len(arr)
    idx = 0
    for b in range(rng):
        while count[b] > 0:
            out[idx] = mn + b
            count[b] -= 1
            idx += 1
            if idx < len(arr):
                await compare(idx, idx)
    for i in range(len(arr)):
        arr[i] = out[i]
    await render_array(arr)`,
          radix: `# Radix Sort (LSD) — Counting Sort per digit
async def _counting_by_digit(arr, n, exp):
    out = [0] * n
    count = [0] * 10
    for i in range(n):
        count[(arr[i] // exp) % 10] += 1
    for i in range(1, 10):
        count[i] += count[i - 1]
    for i in range(n - 1, -1, -1):
        d = (arr[i] // exp) % 10
        out[count[d] - 1] = arr[i]
        count[d] -= 1
        await compare(i, i)
    for i in range(n):
        arr[i] = out[i]
    await render_array(arr)

async def sort(arr):
    n = len(arr)
    m = max(arr)
    exp = 1
    while m // exp > 0:
        log("Sorting digit " + str(exp))
        await _counting_by_digit(arr, n, exp)
        exp *= 10`,
        },
        search: {
          linear: `# Linear Search
async def search(arr, target):
    for i in range(len(arr)):
        await compare(i, i)
        if arr[i] == target:
            await mark_found(i)
            log("Found at index " + str(i))
            return i
    log("Target not found")
    return -1`,
          binary: `# Binary Search (array auto-sorted)
async def search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        await compare(mid, mid)
        if arr[mid] == target:
            await mark_found(mid)
            log("Found at " + str(mid))
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    log("Target not found")
    return -1`,
          interpolation: `# Interpolation Search (sorted, uniform data)
async def search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right and arr[left] <= target <= arr[right]:
        if left == right:
            await compare(left, left)
            if arr[left] == target:
                await mark_found(left)
                return left
            return -1
        pos = left + (((target - arr[left]) * (right - left)) //
                      (arr[right] - arr[left]))
        await compare(pos, pos)
        if arr[pos] == target:
            await mark_found(pos)
            log("Found at " + str(pos))
            return pos
        if arr[pos] < target:
            left = pos + 1
        else:
            right = pos - 1
    log("Target not found")
    return -1`,
          exponential: `# Exponential Search (sorted)
async def search(arr, target):
    n = len(arr)
    if n == 0:
        return -1
    if arr[0] == target:
        await compare(0, 0)
        await mark_found(0)
        return 0
    i = 1
    while i < n and arr[i] <= target:
        await compare(i, i)
        i *= 2
    left = i // 2
    right = min(i, n - 1)
    while left <= right:
        mid = (left + right) // 2
        await compare(mid, mid)
        if arr[mid] == target:
            await mark_found(mid)
            log("Found at " + str(mid))
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    log("Target not found")
    return -1`,
          ternary: `# Ternary Search (sorted)
async def search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        if right - left < 3:
            for k in range(left, right + 1):
                await compare(k, k)
                if arr[k] == target:
                    await mark_found(k)
                    log("Found at " + str(k))
                    return k
            break
        m1 = left + (right - left) // 3
        m2 = right - (right - left) // 3
        await compare(m1, m1)
        await compare(m2, m2)
        if arr[m1] == target:
            await mark_found(m1)
            return m1
        if arr[m2] == target:
            await mark_found(m2)
            return m2
        if target < arr[m1]:
            right = m1 - 1
        elif target > arr[m2]:
            left = m2 + 1
        else:
            left = m1 + 1
            right = m2 - 1
    log("Target not found")
    return -1`,
        },
      },
    };

    let fallback = templates.javascript.sort.bubble;
    let t = templates[language] && templates[language][category] && templates[language][category][algorithm];
    if (!t) {
      const catMap = templates[language] && templates[language][category];
      if (catMap) {
        const firstKey = Object.keys(catMap)[0];
        fallback = catMap[firstKey];
      }
    }
    this.elements.editor.value = t || fallback;
  }
  
  generatePreset(size, preset, options = {}) {
    const base = () => Math.floor(Math.random() * 180) + 30;
    switch (preset) {
      case "nearly-sorted": {
        const swapPct = options.swapPct != null ? options.swapPct / 100 : 0.3;
        const spreadPct = options.spreadPct != null ? options.spreadPct / 100 : 0.25;
        const arr = Array.from({ length: size }, (_, i) => i * 4 + 20);
        const swaps = Math.max(3, Math.floor(size * swapPct));
        for (let k = 0; k < swaps; k++) {
          const a = Math.floor(Math.random() * size);
          const spread = Math.max(2, Math.floor(size * spreadPct));
          const offset = Math.floor(Math.random() * (spread * 2 + 1)) - spread;
          const b = Math.max(0, Math.min(size - 1, a + offset));
          [arr[a], arr[b]] = [arr[b], arr[a]];
        }
        return arr;
      }
      case "reversed":
        return Array.from({ length: size }, (_, i) => (size - i) * 4 + 10);
      case "few-unique": {
        const uniques = [30, 75, 120, 165, 200];
        return Array.from({ length: size }, () => uniques[Math.floor(Math.random() * uniques.length)]);
      }
      case "all-same": {
        const v = base();
        return Array.from({ length: size }, () => v);
      }
      default:
        return Array.from({ length: size }, () => base());
    }
  }

  parseCustomArray(text) {
    if (!text || !text.trim()) return null;
    const parts = text.split(/[\s,;]+/).filter(s => s.length > 0);
    const nums = parts.map(p => Number(p)).filter(n => !isNaN(n) && isFinite(n));
    if (nums.length === 0) return null;
    return nums.map(n => Math.max(1, Math.min(500, Math.round(n))));
  }

  generateArray() {
    let size = 20;
    if (this.elements.arraySizeInput) {
      size = parseInt(this.elements.arraySizeInput.value);
    }
    if (isNaN(size) || size < 5 || size > 50) size = 20;

    const preset = this.elements.presetSelect ? this.elements.presetSelect.value : "random";

    this.shouldStop = true;
    this.isRunning = false;
    this.isPaused = false;
    this.stepMode = false;
    this._generation += 1;
    this.pythonRunner.stopExecution();

    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }

    this.elements.runBtn.style.display = "inline-block";
    this.elements.pauseBtn.style.display = "none";
    this.elements.resumeBtn.style.display = "none";
    this.elements.stepBtn.textContent = "Step Mode";
    this.elements.actionControls.innerHTML = "";

    if (this.currentCategory === "graph") {
      const gPreset = this.elements.graphPresetSelect ? this.elements.graphPresetSelect.value : "tree";
      this.graphEngine.generatePreset(gPreset);
      this.graphRenderer.init(this.elements.container, this.graphEngine);
      this.graphRenderer.render();
      this.history = [];
      this.saveSnapshot("init_graph");
      this.log(`⚡ Generated ${gPreset.toUpperCase()} graph preset`);
      return;
    } else if (this.currentCategory === "grid") {
      this.graphEngine.initGrid();
      this.gridRenderer.init(this.elements.container, this.graphEngine);
      this.gridRenderer.render();
      this.history = [];
      this.saveSnapshot("init_grid");
      this.log(`⚡ Generated Grid`);
      return;
    }

    this.renderer = new ArrayRenderer();
    this.renderer.init(this.elements.container);

    if (preset === "custom" && this.elements.customArrayInput) {
      const parsed = this.parseCustomArray(this.elements.customArrayInput.value);
      if (parsed && parsed.length > 0) {
        this.array = parsed;
        if (this.elements.arraySizeInput) {
          this.elements.arraySizeInput.value = parsed.length;
        }
      } else {
        this.log("⚠️ Custom array empty or invalid — falling back to random");
        this.array = this.generatePreset(size, "random");
      }
    } else {
      const opts = {};
      if (preset === "nearly-sorted") {
        if (this.elements.nearlySwapsSlider) {
          const v = parseInt(this.elements.nearlySwapsSlider.value);
          if (!isNaN(v)) opts.swapPct = v;
        }
        if (this.elements.nearlySpreadSlider) {
          const v = parseInt(this.elements.nearlySpreadSlider.value);
          if (!isNaN(v)) opts.spreadPct = v;
        }
      }
      this.array = this.generatePreset(size, preset, opts);
    }

    if (this.currentCategory === "search") {
      const shouldPreSort = this.elements.searchSortToggle ? this.elements.searchSortToggle.checked : true;
      if (shouldPreSort) {
        this.array.sort((a, b) => a - b);
      }
    }

    if (this.currentCategory === "search" && this.elements.targetInput) {
      const pickRandomFromArr = Math.random() < 0.7 && this.array.length > 0;
      this.searchTarget = pickRandomFromArr
        ? this.array[Math.floor(Math.random() * this.array.length)]
        : this.array.length > 0 ? this.array[0] + Math.floor(Math.random() * 50) : 50;
      this.elements.targetInput.value = this.searchTarget;
    }

    this.renderer.sortedIndices.clear();
    this.renderer.foundIndices.clear();
    this.elements.container.innerHTML = '';
    this.renderer.render(this.array, this._generation);

    if (this.raceMode) {
      this.arrayB = [...this.array];
      if (this.rendererB && this.elements.containerB) {
        this.rendererB.sortedIndices.clear();
        this.rendererB.foundIndices.clear();
        this.elements.containerB.innerHTML = '';
        this.rendererB.render(this.arrayB, this._generation);
      }
    }

    if (this.raceMode) {
      const algoOpts = this.elements.algorithmSelect.options;
      const algoNameA = algoOpts[this.elements.algorithmSelect.selectedIndex]?.textContent || this.currentAlgorithm;
      if (this.elements.vizLabelA) this.elements.vizLabelA.textContent = "A: " + algoNameA;
      if (this.elements.statsTitleA) this.elements.statsTitleA.textContent = algoNameA;
      if (this.elements.algorithmSelectB) {
        const algoNameB = this.elements.algorithmSelectB.options[this.elements.algorithmSelectB.selectedIndex]?.textContent || this.currentAlgorithmB;
        if (this.elements.vizLabelB) this.elements.vizLabelB.textContent = "B: " + algoNameB;
        if (this.elements.statsTitleB) this.elements.statsTitleB.textContent = algoNameB;
      }
    } else {
      if (this.elements.vizLabelA) this.elements.vizLabelA.textContent = "Visualization";
      if (this.elements.statsTitleA) this.elements.statsTitleA.textContent = "Statistics";
    }

    this.updateStats();
    const extra = preset === "nearly-sorted" ?
      ` (swaps=${this.elements.nearlySwapsSlider?.value ?? 30}%, spread=${this.elements.nearlySpreadSlider?.value ?? 25}%)` : "";
    this.log(`Generated array of size ${this.array.length} (preset: ${preset})${extra}`);
    this.sounds.play('generate');
  }
  
  updateStats() {
    this.elements.statSize.textContent = this.array.length;
    this.elements.statComparisons.textContent = this.stats.comparisons;
    this.elements.statSwaps.textContent = this.stats.swaps;
    this.elements.statSteps.textContent = this.stats.steps;
    
    if (this.stats.startTime > 0) {
      const elapsed = (this.stats.endTime > 0 ? this.stats.endTime : Date.now()) - this.stats.startTime;
      this.elements.statTime.textContent = Math.max(0, elapsed) + "ms";
    }

    if (this.raceMode && this.elements.statSizeB) {
      this.elements.statSizeB.textContent = this.arrayB.length;
      this.elements.statComparisonsB.textContent = this.statsB.comparisons;
      this.elements.statSwapsB.textContent = this.statsB.swaps;
      this.elements.statStepsB.textContent = this.statsB.steps;
      if (this.statsB.startTime > 0) {
        const elapsed = (this.statsB.endTime > 0 ? this.statsB.endTime : Date.now()) - this.statsB.startTime;
        this.elements.statTimeB.textContent = Math.max(0, elapsed) + "ms";
      }
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
    this.pythonRunnerB.stopExecution();
    
    // Resolve any pending step
    if (this.stepResolve) {
      this.stepResolve();
      this.stepResolve = null;
    }
    
    // Clear displays
    this.elements.logArea.textContent = "";
    this.elements.operationInfo.textContent = "";
    this.renderer.clear();
    if (this.rendererB) this.rendererB.clear();
    this.elements.actionControls.innerHTML = "";
    this.renderer.sortedIndices.clear();
    this.renderer.foundIndices.clear();
    if (this.rendererB) {
      this.rendererB.sortedIndices.clear();
      this.rendererB.foundIndices.clear();
    }
    
    // Reset buttons
    this.elements.runBtn.style.display = "inline-block";
    this.elements.pauseBtn.style.display = "none";
    this.elements.resumeBtn.style.display = "none";
    this.elements.stepBtn.textContent = "Step Mode";
    
    // Reset arrays and stats
    this.array = [];
    this.arrayB = [];
    this.stats = {
      comparisons: 0,
      swaps: 0,
      steps: 0,
      startTime: 0,
      endTime: 0
    };
    this.statsB = {
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

    const category = this.currentCategory;

    if (language === 'python') {
      const fnName = category === 'search' ? 'search' : 'sort';
      const fnSig = `def ${fnName}(`;
      const asyncSig = `async def ${fnName}(`;
      if (!code.includes(fnSig)) {
        return category === 'search'
          ? `Python code must include 'async def search(arr, target):' function`
          : `Python code must include 'async def sort(arr):' function`;
      }
      if (code.includes(fnSig) && !code.includes(asyncSig)) {
        return `Python ${fnName} function must be async (use '${asyncSig}')`;
      }
      const visualizationFunctions = ['compare', 'swap', 'render_array', 'mark_found'];
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
      const visualizationFunctions = ['compare', 'swap', 'renderArray', 'markFound'];
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
      if (code.includes('while (true)') || code.includes('for (;;')) {
        return "Infinite loops detected! Make sure your algorithm will terminate.";
      }
    }

    return null;
  }
  
  async runVisualization() {
    console.log("=== RUN VISUALIZATION START ===");

    if (this.isRunning) {
      console.log("Already running, ignoring...");
      return;
    }

    const code = this.elements.editor.value;
    if (!code.trim()) {
      this.log("Error: No code provided!");
      return;
    }

    this.currentAlgorithm = this.elements.algorithmSelect.value;
    this.currentCategory = this.elements.categorySelect.value;

    const validationError = this.validateCode(code, this.currentLanguage);
    if (validationError) {
      this.log(`Error: ${validationError}`);
      return;
    }

    const sortedAlgorithms = ["binary", "interpolation", "exponential", "ternary"];
    const sortedRequiredByAlgoA =
      this.currentCategory === "search" &&
      sortedAlgorithms.includes(this.currentAlgorithm);
    const sortedRequiredByAlgoB =
      this.raceMode && this.currentCategory === "search" &&
      sortedAlgorithms.includes(this.currentAlgorithmB);
    const sortedRequiredByAlgo = sortedRequiredByAlgoA || sortedRequiredByAlgoB;
    const userWantsPreSort =
      this.currentCategory === "search" &&
      this.elements.searchSortToggle &&
      this.elements.searchSortToggle.checked;
    const needsSortedArrayForSearch = sortedRequiredByAlgo || userWantsPreSort;

    if (this.currentCategory === "search") {
      if (this.searchTarget == null && this.elements.targetInput) {
        const parsed = parseInt(this.elements.targetInput.value);
        this.searchTarget = isNaN(parsed) ? null : parsed;
      }
      if (this.searchTarget == null) {
        this.log("Error: Search target not set");
        return;
      }
      this.log(`Search target: ${this.searchTarget}`);
    }

    this.elements.logArea.textContent = "";

    this.isRunning = true;
    this.isPaused = false;
    this.shouldStop = false;
    this._runGeneration = this._generation;
    this.stats.startTime = Date.now();
    this.stats.endTime = 0;
    this.statsB.startTime = Date.now();
    this.statsB.endTime = 0;

    this.renderer.sortedIndices.clear();
    if (this.rendererB) this.rendererB.sortedIndices.clear();

    this.stats.comparisons = 0;
    this.stats.swaps = 0;
    this.stats.steps = 0;
    this.statsB.comparisons = 0;
    this.statsB.swaps = 0;
    this.statsB.steps = 0;
    this.updateStats();
    this.resetComplexityData();

    this.elements.runBtn.style.display = "none";
    this.elements.pauseBtn.style.display = "inline-block";
    this.elements.resumeBtn.style.display = "none";

    const algoOpts = this.elements.algorithmSelect.options;
    const algoNameA = algoOpts[this.elements.algorithmSelect.selectedIndex]?.textContent || this.currentAlgorithm;
    const modeLabel =
      this.currentCategory === "search"
        ? `${algoNameA} search`
        : `${algoNameA} sort`;

    if (this.raceMode) {
      const algoNameB = this.elements.algorithmSelectB.options[this.elements.algorithmSelectB.selectedIndex]?.textContent || this.currentAlgorithmB;
      this.log(`🏁 RACE: ${algoNameA}  vs  ${algoNameB} — same array, may the fastest win!`);
    } else {
      this.log(`Running ${this.currentLanguage} ${modeLabel}...`);
    }

    try {
      if (this.raceMode) {
        await this.runRace(code, {
          category: this.currentCategory,
          target: this.searchTarget,
          searchSortedRequires: needsSortedArrayForSearch,
          sortedRequiredByAlgo: sortedRequiredByAlgo,
          sortedRequiredByAlgoA: sortedRequiredByAlgoA,
        });
      } else {
        const api = this.createVisualizationAPI('a');
        if (this.currentLanguage === 'javascript') {
          await this.runJavaScript(code, api, {
            category: this.currentCategory,
            target: this.searchTarget,
            searchSortedRequires: needsSortedArrayForSearch,
            sortedRequiredByAlgo: sortedRequiredByAlgo,
            side: 'a',
          });
        } else if (this.currentLanguage === 'python') {
          const runGen = this._runGeneration;
          if (!this.pythonRunner.isSupported()) {
            await this.pythonRunner.init();
          }
          const result = await this.pythonRunner.run(
            code, this.array, api, () => this.shouldStop,
            {
              category: this.currentCategory,
              target: this.searchTarget,
              searchSortedRequires: needsSortedArrayForSearch,
              sortedRequiredByAlgo: sortedRequiredByAlgo,
            }
          );
          if (this._runGeneration === runGen && !this.shouldStop && result && Array.isArray(result)) {
            this.array = result;
            this.renderer.render(this.array);
          }
        }

        if (!this.shouldStop) {
          this.log("Algorithm completed!");
          this.updateOperationInfo("Completed!");
          this.sounds.play('complete');
          if (this.currentCategory === "sort") {
            for (let i = 0; i < this.array.length; i++) {
              this.renderer.markSorted(i);
            }
          }
        }
      }
    } catch (error) {
      this.log("Error: " + error.message);
      console.error("Execution error:", error);

      if (error.message.includes("compare") || error.message.includes("swap")) {
        this.log("Tip: Make sure to use 'await' before visualization functions");
      } else if (error.message.includes("sort") || error.message.includes("search")) {
        this.log("Tip: For Python, use 'async def sort(arr):' or 'async def search(arr, target):'");
      }
    } finally {
      if (!this.stats.endTime && this.stats.startTime) this.stats.endTime = Date.now();
      if (!this.statsB.endTime && this.statsB.startTime) this.statsB.endTime = Date.now();
      this.updateStats();
      this.isRunning = false;
      this.isPaused = false;

      this.elements.runBtn.style.display = "inline-block";
      this.elements.pauseBtn.style.display = "none";
      this.elements.resumeBtn.style.display = "none";
    }
  }

  async runRace(codeA, sharedOpts) {
    const language = this.currentLanguage;
    const category = this.currentCategory;
    const runGen = this._runGeneration;
    const arraySeedA = [...this.array];
    const arraySeedB = [...this.array];

    const apiA = this.createVisualizationAPI('a');
    const apiB = this.createVisualizationAPI('b');

    const sortedRequiredByAlgoB =
      category === "search" &&
      ["binary", "interpolation", "exponential", "ternary"].includes(this.currentAlgorithmB);

    const runAlgo = (code, api, seedArr, which, sortedRequired) => {
      if (language === 'javascript') {
        return this.runJavaScript(code, api, {
          category: category,
          target: this.searchTarget,
          searchSortedRequires: sharedOpts.searchSortedRequires,
          sortedRequiredByAlgo: sortedRequired,
          side: which,
          initialSeed: seedArr,
        });
      } else {
        const runner = which === 'a' ? this.pythonRunner : this.pythonRunnerB;
        return runner.run(code, seedArr, api, () => this.shouldStop, {
          category: category,
          target: this.searchTarget,
          searchSortedRequires: sharedOpts.searchSortedRequires,
          sortedRequiredByAlgo: sortedRequired,
          side: which,
        }).then(result => {
          if (this._runGeneration === runGen && !this.shouldStop && result && Array.isArray(result)) {
            if (which === 'a') { this.array = result; this.renderer.render(this.array); }
            else { this.arrayB = result; this.rendererB.render(this.arrayB); }
          }
        });
      }
    };

    const codeB = this.getBuiltinCode(this.currentAlgorithmB, category, language);

    let winnerA = false, winnerB = false;
    const pA = (async () => {
      await runAlgo(codeA, apiA, [...arraySeedA], 'a', sharedOpts.sortedRequiredByAlgoA ?? sharedOpts.sortedRequiredByAlgo);
      if (this._runGeneration === runGen && !this.shouldStop) {
        this.stats.endTime = this.stats.endTime || Date.now();
        const tA = this.stats.endTime - this.stats.startTime;
        if (!winnerA && !winnerB) {
          winnerA = true;
          this.log(`🏆 [A] finished first in ${tA}ms  (comparisons: ${this.stats.comparisons}, swaps: ${this.stats.swaps})`);
        }
        this.updateStats();
        if (category === "sort") {
          for (let i = 0; i < this.array.length; i++) this.renderer.markSorted(i);
        }
      }
    })();
    const pB = (async () => {
      await runAlgo(codeB, apiB, [...arraySeedB], 'b', sortedRequiredByAlgoB);
      if (this._runGeneration === runGen && !this.shouldStop) {
        this.statsB.endTime = this.statsB.endTime || Date.now();
        const tB = this.statsB.endTime - this.statsB.startTime;
        if (!winnerA && !winnerB) {
          winnerB = true;
          this.log(`🏆 [B] finished first in ${tB}ms  (comparisons: ${this.statsB.comparisons}, swaps: ${this.statsB.swaps})`);
        }
        this.updateStats();
        if (category === "sort") {
          for (let i = 0; i < this.arrayB.length; i++) this.rendererB.markSorted(i);
        }
      }
    })();

    await Promise.all([pA, pB]);

    if (this._runGeneration === runGen && !this.shouldStop) {
      this.sounds.play('complete');
      this.updateOperationInfo("Race finished!");
      const tA = (this.stats.endTime || Date.now()) - this.stats.startTime;
      const tB = (this.statsB.endTime || Date.now()) - this.statsB.startTime;
      this.log(`--- Race Result: [A] ${tA}ms  vs  [B] ${tB}ms ---`);
    }
  }

  getBuiltinCode(algo, category, language) {
    const t = {
      javascript: {
        sort: {
          bubble: `for (let i = 0; i < arr.length - 1; i++) { for (let j = 0; j < arr.length - i - 1; j++) { await compare(j, j + 1); if (arr[j] > arr[j + 1]) await swap(arr, j, j + 1); } }`,
          selection: `for (let i = 0; i < arr.length - 1; i++) { let mi = i; for (let j = i + 1; j < arr.length; j++) { await compare(mi, j); if (arr[j] < arr[mi]) mi = j; } if (mi !== i) await swap(arr, i, mi); }`,
          insertion: `for (let i = 1; i < arr.length; i++) { let k = arr[i], j = i - 1; while (j >= 0 && arr[j] > k) { await compare(j, i); await swap(arr, j, j + 1); j--; } arr[j + 1] = k; await renderArray(arr); }`,
          merge: `async function mergeSortHelper(arr, left, right) { if (left < right) { const mid = Math.floor((left + right) / 2); await mergeSortHelper(arr, left, mid); await mergeSortHelper(arr, mid + 1, right); const L = arr.slice(left, mid + 1), R = arr.slice(mid + 1, right + 1); let i = 0, j = 0, k = left; while (i < L.length && j < R.length) { await compare(left + i, mid + 1 + j); if (L[i] <= R[j]) arr[k++] = L[i++]; else arr[k++] = R[j++]; await renderArray(arr); } while (i < L.length) { arr[k++] = L[i++]; await renderArray(arr); } while (j < R.length) { arr[k++] = R[j++]; await renderArray(arr); } } } await mergeSortHelper(arr, 0, arr.length - 1);`,
          quick: `async function qs(arr, low, high) { if (low < high) { const pivot = arr[high]; let i = low - 1; for (let j = low; j < high; j++) { await compare(j, high); if (arr[j] <= pivot) { i++; if (i !== j) await swap(arr, i, j); } } if (i + 1 !== high) await swap(arr, i + 1, high); await qs(arr, low, i); await qs(arr, i + 2, high); } } await qs(arr, 0, arr.length - 1);`,
          heap: `const n = arr.length; async function heapify(arr, hs, i) { let l = i; const lc = 2 * i + 1, rc = 2 * i + 2; if (lc < hs) { await compare(lc, l); if (arr[lc] > arr[l]) l = lc; } if (rc < hs) { await compare(rc, l); if (arr[rc] > arr[l]) l = rc; } if (l !== i) { await swap(arr, i, l); await heapify(arr, hs, l); } } for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(arr, n, i); for (let i = n - 1; i > 0; i--) { await swap(arr, 0, i); await heapify(arr, i, 0); }`,
          shell: `const n = arr.length; for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) { for (let i = gap; i < n; i++) { const tmp = arr[i]; let j = i; while (j >= gap) { await compare(j - gap, i); if (arr[j - gap] > tmp) { await swap(arr, j - gap, j); j -= gap; } else break; } arr[j] = tmp; await renderArray(arr); } }`,
          cocktail: `let start = 0, end = arr.length - 1, swapped = true; while (swapped) { swapped = false; for (let i = start; i < end; i++) { await compare(i, i + 1); if (arr[i] > arr[i + 1]) { await swap(arr, i, i + 1); swapped = true; } } if (!swapped) break; end--; swapped = false; for (let i = end - 1; i >= start; i--) { await compare(i, i + 1); if (arr[i] > arr[i + 1]) { await swap(arr, i, i + 1); swapped = true; } } start++; }`,
          counting: `if (arr.length <= 1) return; const min = Math.min(...arr), max = Math.max(...arr); const range = max - min + 1; const count = new Array(range).fill(0); for (let i = 0; i < arr.length; i++) { await compare(i, i); count[arr[i] - min]++; } const out = new Array(arr.length); let idx = 0; for (let b = 0; b < range; b++) { while (count[b] > 0) { out[idx] = min + b; count[b]--; idx++; if (idx < arr.length) await compare(idx, idx); } } for (let i = 0; i < arr.length; i++) arr[i] = out[i]; await renderArray(arr);`,
          radix: `const c = async (arr, n, exp) => { const out = new Array(n).fill(0); const cnt = new Array(10).fill(0); for (let i = 0; i < n; i++) cnt[Math.floor(arr[i] / exp) % 10]++; for (let i = 1; i < 10; i++) cnt[i] += cnt[i - 1]; for (let i = n - 1; i >= 0; i--) { const d = Math.floor(arr[i] / exp) % 10; out[cnt[d] - 1] = arr[i]; cnt[d]--; await compare(i, i); } for (let i = 0; i < n; i++) arr[i] = out[i]; await renderArray(arr); }; const n = arr.length, m = Math.max(...arr); for (let exp = 1; Math.floor(m / exp) > 0; exp *= 10) await c(arr, n, exp);`,
        },
        search: {
          linear: `for (let i = 0; i < arr.length; i++) { await compare(i, i); if (arr[i] === target) { await markFound(i); return i; } } return -1;`,
          binary: `let left = 0, right = arr.length - 1; while (left <= right) { const mid = Math.floor((left + right) / 2); await compare(mid, mid); if (arr[mid] === target) { await markFound(mid); return mid; } if (arr[mid] < target) left = mid + 1; else right = mid - 1; } return -1;`,
          interpolation: `let left = 0, right = arr.length - 1; while (left <= right && target >= arr[left] && target <= arr[right]) { if (left === right) { await compare(left, left); if (arr[left] === target) { await markFound(left); return left; } return -1; } const pos = left + Math.floor(((target - arr[left]) * (right - left)) / (arr[right] - arr[left])); await compare(pos, pos); if (arr[pos] === target) { await markFound(pos); return pos; } if (arr[pos] < target) left = pos + 1; else right = pos - 1; } return -1;`,
          exponential: `if (arr[0] === target) { await compare(0, 0); await markFound(0); return 0; } let i = 1; while (i < arr.length && arr[i] <= target) { await compare(i, i); i = i * 2; } let left = Math.floor(i / 2), right = Math.min(i, arr.length - 1); while (left <= right) { const mid = Math.floor((left + right) / 2); await compare(mid, mid); if (arr[mid] === target) { await markFound(mid); return mid; } if (arr[mid] < target) left = mid + 1; else right = mid - 1; } return -1;`,
          ternary: `let left = 0, right = arr.length - 1; while (left <= right) { if (right - left < 3) { for (let k = left; k <= right; k++) { await compare(k, k); if (arr[k] === target) { await markFound(k); return k; } } break; } const m1 = left + Math.floor((right - left) / 3); const m2 = right - Math.floor((right - left) / 3); await compare(m1, m1); await compare(m2, m2); if (arr[m1] === target) { await markFound(m1); return m1; } if (arr[m2] === target) { await markFound(m2); return m2; } if (target < arr[m1]) right = m1 - 1; else if (target > arr[m2]) left = m2 + 1; else { left = m1 + 1; right = m2 - 1; } } return -1;`,
        }
      },
      python: {
        sort: {
          bubble: `async def sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(n - i - 1):\n            await compare(j, j + 1)\n            if arr[j] > arr[j + 1]:\n                await swap(arr, j, j + 1)`,
          selection: `async def sort(arr):\n    n = len(arr)\n    for i in range(n - 1):\n        mi = i\n        for j in range(i + 1, n):\n            await compare(mi, j)\n            if arr[j] < arr[mi]: mi = j\n        if mi != i: await swap(arr, i, mi)`,
          insertion: `async def sort(arr):\n    for i in range(1, len(arr)):\n        k = arr[i]\n        j = i - 1\n        while j >= 0 and arr[j] > k:\n            await compare(j, i)\n            await swap(arr, j, j + 1)\n            j -= 1\n        arr[j + 1] = k\n        await render_array(arr)`,
          merge: `async def merge_sort(arr, l, r):\n    if l < r:\n        mid = (l + r) // 2\n        await merge_sort(arr, l, mid)\n        await merge_sort(arr, mid + 1, r)\n        L = arr[l:mid + 1]; R = arr[mid + 1:r + 1]\n        i = j = 0; k = l\n        while i < len(L) and j < len(R):\n            await compare(l + i, mid + 1 + j)\n            if L[i] <= R[j]: arr[k] = L[i]; i += 1\n            else: arr[k] = R[j]; j += 1\n            k += 1\n            await render_array(arr)\n        while i < len(L):\n            arr[k] = L[i]; i += 1; k += 1\n            await render_array(arr)\n        while j < len(R):\n            arr[k] = R[j]; j += 1; k += 1\n            await render_array(arr)\nasync def sort(arr):\n    await merge_sort(arr, 0, len(arr) - 1)`,
          quick: `async def qs(arr, low, high):\n    if low < high:\n        pivot = arr[high]\n        i = low - 1\n        for j in range(low, high):\n            await compare(j, high)\n            if arr[j] <= pivot:\n                i += 1\n                if i != j: await swap(arr, i, j)\n        if i + 1 != high: await swap(arr, i + 1, high)\n        await qs(arr, low, i)\n        await qs(arr, i + 2, high)\nasync def sort(arr):\n    await qs(arr, 0, len(arr) - 1)`,
          heap: `async def heapify(arr, n, i):\n    l = i\n    lc = 2 * i + 1; rc = 2 * i + 2\n    if lc < n:\n        await compare(lc, l)\n        if arr[lc] > arr[l]: l = lc\n    if rc < n:\n        await compare(rc, l)\n        if arr[rc] > arr[l]: l = rc\n    if l != i:\n        await swap(arr, i, l)\n        await heapify(arr, n, l)\nasync def sort(arr):\n    n = len(arr)\n    for i in range(n // 2 - 1, -1, -1): await heapify(arr, n, i)\n    for i in range(n - 1, 0, -1):\n        await swap(arr, 0, i)\n        await heapify(arr, i, 0)`,
          shell: `async def sort(arr):\n    n = len(arr)\n    gap = n // 2\n    while gap > 0:\n        for i in range(gap, n):\n            tmp = arr[i]\n            j = i\n            while j >= gap:\n                await compare(j - gap, i)\n                if arr[j - gap] > tmp:\n                    await swap(arr, j - gap, j)\n                    j -= gap\n                else: break\n            arr[j] = tmp\n            await render_array(arr)\n        gap //= 2`,
          cocktail: `async def sort(arr):\n    n = len(arr)\n    start = 0; end = n - 1; swapped = True\n    while swapped:\n        swapped = False\n        for i in range(start, end):\n            await compare(i, i + 1)\n            if arr[i] > arr[i + 1]:\n                await swap(arr, i, i + 1); swapped = True\n        if not swapped: break\n        end -= 1; swapped = False\n        for i in range(end - 1, start - 1, -1):\n            await compare(i, i + 1)\n            if arr[i] > arr[i + 1]:\n                await swap(arr, i, i + 1); swapped = True\n        start += 1`,
          counting: `async def sort(arr):\n    if len(arr) <= 1: return\n    mn = min(arr); mx = max(arr)\n    rng = mx - mn + 1\n    count = [0] * rng\n    for i in range(len(arr)):\n        await compare(i, i)\n        count[arr[i] - mn] += 1\n    out = [0] * len(arr); idx = 0\n    for b in range(rng):\n        while count[b] > 0:\n            out[idx] = mn + b; count[b] -= 1; idx += 1\n            if idx < len(arr): await compare(idx, idx)\n    for i in range(len(arr)): arr[i] = out[i]\n    await render_array(arr)`,
          radix: `async def _c(arr, n, exp):\n    out = [0] * n; cnt = [0] * 10\n    for i in range(n): cnt[(arr[i] // exp) % 10] += 1\n    for i in range(1, 10): cnt[i] += cnt[i - 1]\n    for i in range(n - 1, -1, -1):\n        d = (arr[i] // exp) % 10\n        out[cnt[d] - 1] = arr[i]\n        cnt[d] -= 1\n        await compare(i, i)\n    for i in range(n): arr[i] = out[i]\n    await render_array(arr)\nasync def sort(arr):\n    n = len(arr); m = max(arr); exp = 1\n    while m // exp > 0:\n        await _c(arr, n, exp)\n        exp *= 10`,
        },
        search: {
          linear: `async def search(arr, target):\n    for i in range(len(arr)):\n        await compare(i, i)\n        if arr[i] == target:\n            await mark_found(i)\n            return i\n    return -1`,
          binary: `async def search(arr, target):\n    left = 0\n    right = len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        await compare(mid, mid)\n        if arr[mid] == target:\n            await mark_found(mid)\n            return mid\n        if arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1`,
          interpolation: `async def search(arr, target):\n    left = 0\n    right = len(arr) - 1\n    while left <= right and arr[left] <= target <= arr[right]:\n        if left == right:\n            await compare(left, left)\n            if arr[left] == target:\n                await mark_found(left)\n                return left\n            return -1\n        pos = left + (((target - arr[left]) * (right - left)) //\n                      (arr[right] - arr[left]))\n        await compare(pos, pos)\n        if arr[pos] == target:\n            await mark_found(pos)\n            return pos\n        if arr[pos] < target:\n            left = pos + 1\n        else:\n            right = pos - 1\n    return -1`,
          exponential: `async def search(arr, target):\n    n = len(arr)\n    if n == 0:\n        return -1\n    if arr[0] == target:\n        await compare(0, 0)\n        await mark_found(0)\n        return 0\n    i = 1\n    while i < n and arr[i] <= target:\n        await compare(i, i)\n        i *= 2\n    left = i // 2\n    right = min(i, n - 1)\n    while left <= right:\n        mid = (left + right) // 2\n        await compare(mid, mid)\n        if arr[mid] == target:\n            await mark_found(mid)\n            return mid\n        if arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1`,
          ternary: `async def search(arr, target):\n    left = 0\n    right = len(arr) - 1\n    while left <= right:\n        if right - left < 3:\n            for k in range(left, right + 1):\n                await compare(k, k)\n                if arr[k] == target:\n                    await mark_found(k)\n                    return k\n            break\n        m1 = left + (right - left) // 3\n        m2 = right - (right - left) // 3\n        await compare(m1, m1)\n        await compare(m2, m2)\n        if arr[m1] == target:\n            await mark_found(m1)\n            return m1\n        if arr[m2] == target:\n            await mark_found(m2)\n            return m2\n        if target < arr[m1]:\n            right = m1 - 1\n        elif target > arr[m2]:\n            left = m2 + 1\n        else:\n            left = m1 + 1\n            right = m2 - 1\n    return -1`,
        },
      }
    };
    const byLang = t[language];
    if (!byLang) return '';
    const byCat = byLang[category] || byLang.sort;
    return byCat[algo] || byCat.bubble || byCat.linear || '';
  }
  
  createVisualizationAPI(side = 'a') {
    const isA = side === 'a';
    const renderer = isA ? this.renderer : this.rendererB;
    const statsObj = isA ? this.stats : this.statsB;
    const getArr = () => isA ? this.array : this.arrayB;
    const setArr = (arr) => { if (isA) this.array = [...arr]; else this.arrayB = [...arr]; };
    const tag = isA ? "[A]" : "[B]";

    return {
      compare: async (i, j) => {
        if (this.shouldStop) return;
        statsObj.comparisons++;
        statsObj.steps++;
        this.updateStats();
        this.updateComplexityData();
        this.highlightPseudocode('compare', side);
        if (isA) {
          this.saveSnapshot('compare');
        }
        this.log(`${tag} Comparing indices ${i} and ${j}`);
        if (isA) this.updateOperationInfo(`A: Comparing ${i},${j}`);
        const arr = getArr();
        renderer.renderWithHighlight(arr, [i, j], 'comparing');
        const v1 = arr[i], v2 = arr[j];
        if (this.musicalMode) {
          this.sounds.playMusical(v1, v2, arr);
        } else if (isA) {
          this.sounds.play('compare');
        }
        await this.sleep(this.speed);
      },

      swap: async (arrRef, i, j) => {
        if (this.shouldStop) return;
        statsObj.swaps++;
        statsObj.steps++;
        this.updateStats();
        this.updateComplexityData();
        this.highlightPseudocode('swap', side);
        if (isA) {
          this.saveSnapshot('swap');
        }
        this.log(`${tag} Swapping indices ${i} and ${j}`);
        if (isA) this.updateOperationInfo(`${tag} Swapping ${i},${j}`);
        await renderer.animatedSwap(arrRef, i, j, this.speed);
        setArr(arrRef);
        const arr = getArr();
        if (this.musicalMode) {
          this.sounds.playMusical(arr[i], arr[j], arr);
        } else if (isA) {
          this.sounds.play('swap');
        }
      },

      renderArray: async (arrRef) => {
        if (this.shouldStop) return;
        statsObj.steps++;
        this.updateStats();
        setArr(arrRef);
        renderer.render(getArr());
        if (isA) {
          this.saveSnapshot('render');
        }
        await this.sleep(this.speed / 2);
      },

      markFound: async (i) => {
        if (this.shouldStop) return;
        this.highlightPseudocode('found', side);
        if (isA) {
          this.saveSnapshot('found');
        }
        this.log(`${tag} Found match at index ${i}`);
        if (isA) this.updateOperationInfo(`${tag} Found at ${i}`);
        renderer.markFound(i);
        if (isA) this.sounds.play('complete');
        await this.sleep(this.speed);
      },

      visitNode: async (nodeId, color = "visiting") => {
        if (this.shouldStop) return;
        statsObj.steps++;
        this.updateStats();
        const node = this.graphEngine.nodes.find(n => n.id === nodeId || n.label === String(nodeId));
        if (node) {
          node.status = color;
          this.graphRenderer.render();
          if (this.musicalMode) {
            this.sounds.playMusical(node.id * 10, 50, [10, 20, 30, 40, 50, 60, 70, 80]);
          } else {
            this.sounds.play("compare");
          }
        }
        if (isA) {
          this.highlightPseudocode(4);
          this.saveSnapshot("visitNode");
        }
        await this.sleep(this.speed);
      },

      visitEdge: async (fromId, toId, color = "exploring") => {
        if (this.shouldStop) return;
        statsObj.steps++;
        this.updateStats();
        const edge = this.graphEngine.edges.find(e => 
          (e.source === fromId && e.target === toId) ||
          (!this.graphEngine.isDirected && e.source === toId && e.target === fromId)
        );
        if (edge) {
          edge.status = color;
          this.graphRenderer.render();
        }
        if (isA) {
          this.highlightPseudocode(5);
          this.saveSnapshot("visitEdge");
        }
        await this.sleep(this.speed / 2);
      },

      updateDistance: async (nodeId, distance) => {
        if (this.shouldStop) return;
        const node = this.graphEngine.nodes.find(n => n.id === nodeId || n.label === String(nodeId));
        if (node) {
          node.distance = distance;
          this.graphRenderer.render();
        }
        if (isA) {
          this.saveSnapshot("updateDistance");
        }
        await this.sleep(this.speed / 2);
      },

      markPath: async (pathNodes) => {
        if (this.shouldStop) return;
        if (Array.isArray(pathNodes)) {
          pathNodes.forEach(id => {
            const n = this.graphEngine.nodes.find(node => node.id === id || node.label === String(id));
            if (n) n.status = "path";
          });
          this.graphRenderer.render();
        }
        if (isA) {
          this.sounds.play("complete");
          this.saveSnapshot("markPath");
        }
        await this.sleep(this.speed);
      },

      visitGridCell: async (r, c, type = "visiting") => {
        if (this.shouldStop) return;
        statsObj.steps++;
        this.updateStats();
        if (this.graphEngine.grid[r] && this.graphEngine.grid[r][c]) {
          const cell = this.graphEngine.grid[r][c];
          if (cell.type !== "start" && cell.type !== "target") {
            cell.type = type;
          }
          this.gridRenderer.render();
        }
        if (isA) {
          this.highlightPseudocode(4);
          this.saveSnapshot("visitGridCell");
        }
        await this.sleep(this.speed / 2);
      },

      getNeighbors: (nodeId) => this.graphEngine.getNeighbors(nodeId),
      getNodes: () => this.graphEngine.nodes,
      getStartCell: () => this.graphEngine.startCell,
      getTargetCell: () => this.graphEngine.targetCell,
      getGridNeighbors: (r, c) => this.graphEngine.getGridNeighbors(r, c),

      sleep: async (ms) => {
        await this.sleep(ms);
      },

      log: (msg) => {
        this.log(`${tag} ${msg}`);
      },

      markSorted: (i) => {
        renderer.markSorted(i);
      }
    };
  }

  async runJavaScript(code, api, options = {}) {
    console.log("Running JavaScript code directly...");
    const category = options.category || "sort";
    const target = options.target;
    const runGen = this._runGeneration;
    const side = options.side || 'a';
    const isA = side === 'a';

    let runtimeArr = options.initialSeed ? [...options.initialSeed] : [...this.array];

    if (category === "search" && options.searchSortedRequires) {
      runtimeArr.sort((a, b) => a - b);
      if (this._runGeneration === runGen && !this.shouldStop) {
        if (isA) {
          this.array = [...runtimeArr];
          this.renderer.foundIndices.clear();
          this.renderer.render(this.array);
        } else {
          this.arrayB = [...runtimeArr];
          this.rendererB.foundIndices.clear();
          this.rendererB.render(this.arrayB);
        }
        const forceReason = options.sortedRequiredByAlgo
          ? "Pre-sorted array (algorithm requires ordered input)"
          : "Pre-sorted array (Pre-Sort toggle enabled)";
        this.log(forceReason);
        await this.sleep(Math.max(100, this.speed));
      }
    }

    if (category === "search") {
      const asyncFunction = new Function(
        'arr', 'target', 'compare', 'swap', 'renderArray', 'sleep', 'log', 'markFound',
        `
        return (async () => {
          ${code}
        })();
        `
      );
      await asyncFunction(
        runtimeArr,
        target,
        api.compare,
        api.swap,
        api.renderArray,
        api.sleep,
        api.log,
        api.markFound
      );
    } else {
      const asyncFunction = new Function(
        'arr', 'compare', 'swap', 'renderArray', 'sleep', 'log', 'markFound',
        'visitNode', 'getNeighbors', 'getNodes', 'markPath',
        'visitGridCell', 'getStartCell', 'getTargetCell', 'getGridNeighbors',
        `
        return (async () => {
          ${code}
          return arr;
        })();
        `
      );
      const result = await asyncFunction(
        runtimeArr,
        api.compare,
        api.swap,
        api.renderArray,
        api.sleep,
        api.log,
        api.markFound,
        api.visitNode,
        api.getNeighbors,
        api.getNodes,
        api.markPath,
        api.visitGridCell,
        api.getStartCell,
        api.getTargetCell,
        api.getGridNeighbors
      );
      if (result && Array.isArray(result)) {
        runtimeArr = result;
      }
    }

    if (this._runGeneration === runGen && !this.shouldStop) {
      if (isA) {
        this.array = [...runtimeArr];
        this.renderer.render(this.array);
        this.stats.endTime = this.stats.endTime || Date.now();
      } else {
        this.arrayB = [...runtimeArr];
        this.rendererB.render(this.arrayB);
        this.statsB.endTime = this.statsB.endTime || Date.now();
      }
      this.updateStats();
    }
  }
  
  async sleep(ms) {
    const sleepGeneration = this._runGeneration;
    return new Promise(resolve => {
      if (this.shouldStop || this._generation !== sleepGeneration) {
        resolve();
        return;
      }
      
      if (this.stepMode) {
        this.stepResolve = resolve;
        this.showNextStepButton();
      } else {
        const startTime = Date.now();
        const checkState = setInterval(() => {
          if (this.shouldStop || this._generation !== sleepGeneration) {
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

  // ─── Shareable Run State ───────────────────────────────────
  encodeState() {
    const params = new URLSearchParams();
    params.set('cat', this.currentCategory);
    params.set('algo', this.currentAlgorithm);
    params.set('lang', this.currentLanguage);
    params.set('speed', this.speed);
    if (this.elements.arraySizeInput) params.set('size', this.elements.arraySizeInput.value);
    if (this.elements.presetSelect) params.set('preset', this.elements.presetSelect.value);
    if (this.raceMode) {
      params.set('race', '1');
      params.set('algoB', this.currentAlgorithmB);
    }
    if (this.currentCategory === 'search' && this.searchTarget != null) {
      params.set('target', this.searchTarget);
    }
    if (this.elements.themeToggle && this.elements.themeToggle.checked) params.set('theme', 'light');
    if (this.elements.paletteToggle && this.elements.paletteToggle.checked) params.set('cb', '1');
    return window.location.origin + window.location.pathname + '?' + params.toString();
  }

  loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.size === 0) return false;

    // Category
    if (params.has('cat')) {
      this.currentCategory = params.get('cat');
      if (this.elements.categorySelect) this.elements.categorySelect.value = this.currentCategory;
      this.refreshAlgorithmOptions();
    }
    // Algorithm
    if (params.has('algo')) {
      this.currentAlgorithm = params.get('algo');
      if (this.elements.algorithmSelect) this.elements.algorithmSelect.value = this.currentAlgorithm;
    }
    // Language
    if (params.has('lang')) {
      this.currentLanguage = params.get('lang');
      if (this.elements.languageSelect) this.elements.languageSelect.value = this.currentLanguage;
    }
    // Speed
    if (params.has('speed')) {
      this.speed = parseInt(params.get('speed')) || 300;
      if (this.elements.speedSlider) this.elements.speedSlider.value = this.speed;
      if (this.elements.speedValue) this.elements.speedValue.textContent = this.speed + 'ms';
    }
    // Array size
    if (params.has('size') && this.elements.arraySizeInput) {
      this.elements.arraySizeInput.value = params.get('size');
    }
    // Preset
    if (params.has('preset') && this.elements.presetSelect) {
      this.elements.presetSelect.value = params.get('preset');
      this.elements.presetSelect.dispatchEvent(new Event('change'));
    }
    // Race mode
    if (params.get('race') === '1') {
      this.raceMode = true;
      if (this.elements.raceToggle) {
        this.elements.raceToggle.checked = true;
        this.elements.raceToggle.dispatchEvent(new Event('change'));
      }
      if (params.has('algoB') && this.elements.algorithmSelectB) {
        this.currentAlgorithmB = params.get('algoB');
        this.elements.algorithmSelectB.value = this.currentAlgorithmB;
      }
    }
    // Search target
    if (params.has('target')) {
      this.searchTarget = parseInt(params.get('target'));
      if (this.elements.targetInput) this.elements.targetInput.value = this.searchTarget;
    }
    // Theme
    if (params.get('theme') === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (this.elements.themeToggle) this.elements.themeToggle.checked = true;
    }
    // Colorblind
    if (params.get('cb') === '1') {
      document.documentElement.setAttribute('data-palette', 'colorblind');
      if (this.elements.paletteToggle) this.elements.paletteToggle.checked = true;
    }

    this.setExampleCode();
    this.generateArray();
    this.log('📎 State loaded from shared URL');
    return true;
  }

  shareState() {
    const url = this.encodeState();
    navigator.clipboard.writeText(url).then(() => {
      this.showToast('🔗 Share URL copied to clipboard!');
      this.log('Shareable URL copied: ' + url);
    }).catch(() => {
      // Fallback for non-HTTPS
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.showToast('🔗 Share URL copied to clipboard!');
      this.log('Shareable URL copied: ' + url);
    });
  }

  showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ─── Complexity Overlay ────────────────────────────────────
  getTheoreticalComplexity(algo) {
    const n = this.array.length;
    const complexities = {
      // Sorting
      bubble:    { best: 'O(n)',      avg: 'O(n²)',     worst: 'O(n²)',     fn: x => x * x },
      selection: { best: 'O(n²)',     avg: 'O(n²)',     worst: 'O(n²)',     fn: x => x * x },
      insertion: { best: 'O(n)',      avg: 'O(n²)',     worst: 'O(n²)',     fn: x => x * x },
      merge:     { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', fn: x => x * Math.log2(x) },
      quick:     { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)',     fn: x => x * Math.log2(x) },
      heap:      { best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', fn: x => x * Math.log2(x) },
      shell:     { best: 'O(n log n)', avg: 'O(n^1.3)',  worst: 'O(n²)',     fn: x => x * Math.pow(Math.log2(x), 2) },
      cocktail:  { best: 'O(n)',      avg: 'O(n²)',     worst: 'O(n²)',     fn: x => x * x },
      counting:  { best: 'O(n+k)',    avg: 'O(n+k)',    worst: 'O(n+k)',    fn: x => x * 2 },
      radix:     { best: 'O(nk)',     avg: 'O(nk)',     worst: 'O(nk)',     fn: x => x * 3 },
      // Searching
      linear:        { best: 'O(1)', avg: 'O(n)',       worst: 'O(n)',       fn: x => x },
      binary:        { best: 'O(1)', avg: 'O(log n)',   worst: 'O(log n)',   fn: x => Math.log2(x) },
      interpolation: { best: 'O(1)', avg: 'O(log log n)', worst: 'O(n)',    fn: x => Math.log2(Math.log2(x) || 1) || 1 },
      exponential:   { best: 'O(1)', avg: 'O(log n)',   worst: 'O(log n)',   fn: x => Math.log2(x) },
      ternary:       { best: 'O(1)', avg: 'O(log n)',   worst: 'O(log n)',   fn: x => Math.log2(x) },
    };
    return complexities[algo] || complexities.bubble;
  }

  initComplexityOverlay() {
    const existing = document.getElementById('complexity-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'complexity-overlay';
    overlay.innerHTML = `
      <div class="complexity-header">
        <span class="complexity-title">📊 Complexity</span>
        <button class="complexity-close" title="Close">✕</button>
      </div>
      <canvas id="complexity-canvas" width="280" height="160"></canvas>
      <div class="complexity-legend" id="complexity-legend"></div>
    `;
    
    const vizSection = document.querySelector('.visualization-section');
    if (vizSection) vizSection.appendChild(overlay);

    overlay.querySelector('.complexity-close').onclick = () => {
      overlay.classList.remove('visible');
    };

    if (window.utils && window.utils.makeDraggable) {
      window.utils.makeDraggable(overlay, overlay.querySelector('.complexity-header'));
    }

    this.complexityCanvas = document.getElementById('complexity-canvas');
    this.complexityCtx = this.complexityCanvas ? this.complexityCanvas.getContext('2d') : null;
    this.complexityOverlay = overlay;
  }

  resetComplexityData() {
    this.complexityDataA = [];
    this.complexityDataB = [];
  }

  showComplexityOverlay() {
    if (!this.complexityOverlay) this.initComplexityOverlay();
    this.complexityOverlay.classList.add('visible');
    this.renderComplexityChart();
  }

  hideComplexityOverlay() {
    if (this.complexityOverlay) this.complexityOverlay.classList.remove('visible');
  }

  updateComplexityData() {
    if (!this.complexityDataA) this.complexityDataA = [];
    if (!this.complexityDataB) this.complexityDataB = [];
    this.complexityDataA.push(this.stats.comparisons + this.stats.swaps);
    if (this.raceMode) {
      this.complexityDataB.push(this.statsB.comparisons + this.statsB.swaps);
    }
    if (this.complexityCanvas && this.complexityOverlay?.classList.contains('visible')) {
      this.renderComplexityChart();
    }
  }

  renderComplexityChart() {
    const ctx = this.complexityCtx;
    if (!ctx) return;
    if (!this.complexityDataA) this.complexityDataA = [];
    if (!this.complexityDataB) this.complexityDataB = [];
    const canvas = this.complexityCanvas;
    const isRace = !!this.raceMode;
    const canvasW = isRace ? 320 : 280;
    if (canvas.width !== canvasW) canvas.width = canvasW;
    const W = canvas.width, H = canvas.height;
    const pad = { top: 8, right: 8, bottom: 20, left: 40 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    const n = this.array.length || 20;
    const complexityA = this.getTheoreticalComplexity(this.currentAlgorithm);
    const complexityB = isRace ? this.getTheoreticalComplexity(this.currentAlgorithmB) : null;
    const theoreticalMaxA = complexityA.fn(n);
    const theoreticalMaxB = complexityB ? complexityB.fn(n) : 0;
    const actualMax = Math.max(
      theoreticalMaxA,
      theoreticalMaxB,
      ...this.complexityDataA,
      ...(this.complexityDataB || []),
      1
    );

    const totalSteps = Math.max(this.complexityDataA.length, this.complexityDataB?.length || 0, 1);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#60a5fa';
    const colorB = '#a78bfa';

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH * i / 4);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    }

    // Theoretical curve — A (dashed, A's color)
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = accent + '99';
    ctx.beginPath();
    for (let i = 0; i <= plotW; i++) {
      const progress = i / plotW;
      const curN = Math.max(1, Math.floor(progress * n));
      const val = complexityA.fn(curN);
      const x = pad.left + i;
      const y = pad.top + plotH - (val / actualMax) * plotH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Theoretical curve — B (dashed, B's color, race mode)
    if (isRace && complexityB) {
      ctx.strokeStyle = colorB + '99';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i <= plotW; i++) {
        const progress = i / plotW;
        const curN = Math.max(1, Math.floor(progress * n));
        const val = complexityB.fn(curN);
        const x = pad.left + i;
        const y = pad.top + plotH - (val / actualMax) * plotH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Actual operations curve — Side A
    if (this.complexityDataA.length > 1) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < this.complexityDataA.length; i++) {
        const x = pad.left + (i / (totalSteps - 1 || 1)) * plotW;
        const y = pad.top + plotH - (this.complexityDataA[i] / actualMax) * plotH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Actual operations curve — Side B (race mode)
    if (isRace && this.complexityDataB && this.complexityDataB.length > 1) {
      ctx.strokeStyle = colorB;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < this.complexityDataB.length; i++) {
        const x = pad.left + (i / (totalSteps - 1 || 1)) * plotW;
        const y = pad.top + plotH - (this.complexityDataB[i] / actualMax) * plotH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Steps →', pad.left + plotW / 2, H - 2);
    ctx.save();
    ctx.translate(10, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Ops', 0, 0);
    ctx.restore();

    // Y-axis scale
    ctx.textAlign = 'right';
    ctx.fillText(Math.round(actualMax).toString(), pad.left - 4, pad.top + 8);
    ctx.fillText('0', pad.left - 4, pad.top + plotH + 4);

    // Legend
    const legend = document.getElementById('complexity-legend');
    if (legend) {
      const algoName = this.elements.algorithmSelect?.selectedOptions?.[0]?.textContent || this.currentAlgorithm;
      let html = `<span class="legend-item"><span class="legend-dot" style="background: ${accent}"></span>${algoName} <span style="opacity:.5">(${complexityA.avg})</span></span>`;
      html += `<span class="legend-item"><span class="legend-line-dashed" style="border-top-color: ${accent}99"></span>Theory A</span>`;
      if (isRace) {
        const algoBName = this.elements.algorithmSelectB?.selectedOptions?.[0]?.textContent || this.currentAlgorithmB;
        const cxB = complexityB ? complexityB.avg : '?';
        html += `<span class="legend-item"><span class="legend-dot" style="background: ${colorB}"></span>${algoBName} <span style="opacity:.5">(${cxB})</span></span>`;
        html += `<span class="legend-item"><span class="legend-line-dashed" style="border-top-color: ${colorB}99"></span>Theory B</span>`;
      }
      // Final summary stats in race mode
      if (isRace && this.stats && this.statsB) {
        const opsA = this.stats.comparisons + this.stats.swaps;
        const opsB = this.statsB.comparisons + this.statsB.swaps;
        if (opsA > 0 || opsB > 0) {
          const diff = opsB - opsA;
          let label = '';
          if (diff > 0) label = `▲+${diff}`;
          else if (diff < 0) label = `▼${diff}`;
          html += `<span class="legend-item" style="margin-top:4px;width:100%;justify-content:space-between;border-top:1px dashed rgba(255,255,255,0.08);padding-top:5px;"><span style="color:${accent}">A: ${opsA}</span><span style="opacity:.6">${label}</span><span style="color:${colorB}">B: ${opsB}</span></span>`;
        }
      }
      legend.innerHTML = html;
    }
  }

  // ─── Pseudocode & History (Step Back) ────────────────────────
  getPseudocode(algo) {
    const codeMap = {
      bubble: [
        "for i = 0 to n-1:",
        "  for j = 0 to n-i-2:",
        "    if arr[j] > arr[j+1]:",
        "      swap(arr[j], arr[j+1])"
      ],
      selection: [
        "for i = 0 to n-1:",
        "  minIdx = i",
        "  for j = i+1 to n-1:",
        "    if arr[j] < arr[minIdx]: minIdx = j",
        "  if minIdx != i:",
        "    swap(arr[i], arr[minIdx])"
      ],
      insertion: [
        "for i = 1 to n-1:",
        "  key = arr[i]",
        "  j = i - 1",
        "  while j >= 0 and arr[j] > key:",
        "    arr[j+1] = arr[j]",
        "  arr[j+1] = key"
      ],
      merge: [
        "function mergeSort(arr, l, r):",
        "  if l >= r: return",
        "  mid = (l + r) / 2",
        "  mergeSort(arr, l, mid)",
        "  mergeSort(arr, mid+1, r)",
        "  merge(arr, l, mid, r)"
      ],
      quick: [
        "function quickSort(arr, low, high):",
        "  if low < high:",
        "    p = partition(arr, low, high)",
        "    quickSort(arr, low, p-1)",
        "    quickSort(arr, p+1, high)"
      ],
      heap: [
        "buildMaxHeap(arr)",
        "for i = n-1 down to 1:",
        "  swap(arr[0], arr[i])",
        "  maxHeapify(arr, 0, i)"
      ],
      shell: [
        "for gap = n/2 down to 1:",
        "  for i = gap to n-1:",
        "    temp = arr[i]",
        "    compare(j - gap, i)",
        "    swap(j - gap, j)"
      ],
      cocktail: [
        "do:",
        "  for i = start to end-1: compare & swap(i, i+1)",
        "  for i = end-1 down to start: compare & swap(i, i+1)",
        "while swapped"
      ],
      counting: [
        "count = array of size range",
        "for each x in arr: count[x]++",
        "reconstruct arr from frequency count"
      ],
      radix: [
        "maxVal = getMax(arr)",
        "for exp = 1; maxVal/exp > 0; exp *= 10:",
        "  countSortByDigit(arr, exp)"
      ],
      linear: [
        "for i = 0 to n-1:",
        "  if arr[i] == target:",
        "    return i (found!)",
        "return -1 (not found)"
      ],
      binary: [
        "low = 0, high = n-1",
        "while low <= high:",
        "  mid = (low + high) / 2",
        "  if arr[mid] == target: return mid",
        "  else if arr[mid] < target: low = mid + 1",
        "  else: high = mid - 1"
      ],
      interpolation: [
        "low = 0, high = n-1",
        "pos = low + (target - arr[low]) * (high-low)/(arr[high]-arr[low])",
        "if arr[pos] == target: return pos"
      ],
      exponential: [
        "if arr[0] == target: return 0",
        "i = 1",
        "while i < n and arr[i] <= target: i *= 2",
        "return binarySearch(arr, i/2, min(i, n-1))"
      ],
      ternary: [
        "mid1 = l + (r-l)/3, mid2 = r - (r-l)/3",
        "if arr[mid1] == target: return mid1",
        "if arr[mid2] == target: return mid2"
      ]
    };
    return codeMap[algo] || codeMap.bubble;
  }

  renderPseudocode(algo) {
    if (!this.elements.pseudocodeBody) return;
    const opts = this.elements.algorithmSelect?.options;
    const titleA = opts ? opts[this.elements.algorithmSelect.selectedIndex]?.textContent : algo;
    this.pseudocodeManager.renderPseudocode(this.elements.pseudocodeBody, this.currentCategory, algo, titleA || algo, this.elements.pseudocodeTitle);

    if (this.raceMode && this.elements.pseudocodeBodyB) {
      if (this.elements.pseudocodePanelB) this.elements.pseudocodePanelB.style.display = "";
      const optsB = this.elements.algorithmSelectB?.options;
      const titleB = optsB ? optsB[this.elements.algorithmSelectB.selectedIndex]?.textContent : this.currentAlgorithmB;
      this.pseudocodeManager.renderPseudocode(this.elements.pseudocodeBodyB, this.currentCategory, this.currentAlgorithmB, titleB || this.currentAlgorithmB, this.elements.pseudocodeTitleB);
    } else if (this.elements.pseudocodePanelB) {
      this.elements.pseudocodePanelB.style.display = "none";
    }
  }

  highlightPseudocode(lineNumOrOpType, side = 'a') {
    const targetBody = side === 'b' ? this.elements.pseudocodeBodyB : this.elements.pseudocodeBody;
    if (!targetBody) return;

    if (typeof lineNumOrOpType === "number") {
      this.pseudocodeManager.highlightLine(targetBody, lineNumOrOpType);
      if (side === 'a') this.currentPseudocodeLine = lineNumOrOpType;
    } else {
      const lines = targetBody.querySelectorAll('.pseudocode-line');
      if (!lines.length) return;
      lines.forEach(el => el.classList.remove('active'));
      let targetIdx = 0;
      if (lineNumOrOpType === 'compare') targetIdx = 2;
      else if (lineNumOrOpType === 'swap') targetIdx = 3;
      else if (lineNumOrOpType === 'found') targetIdx = 3;
      else targetIdx = (this.currentPseudocodeLine + 1) % lines.length;

      const lineEl = lines[targetIdx];
      if (lineEl) {
        lineEl.classList.add('active');
        if (side === 'a') this.currentPseudocodeLine = targetIdx;
        targetBody.scrollTop = lineEl.offsetTop - targetBody.clientHeight / 2 + lineEl.clientHeight / 2;
      }
    }
  }

  saveSnapshot(tag = 'step') {
    if (this.history.length > 500) this.history.shift();
    this.history.push({
      category: this.currentCategory,
      array: [...this.array],
      arrayB: [...this.arrayB],
      stats: { ...this.stats },
      statsB: { ...this.statsB },
      sortedIndices: new Set(this.renderer.sortedIndices || []),
      sortedIndicesB: this.rendererB ? new Set(this.rendererB.sortedIndices || []) : new Set(),
      graphNodes: this.currentCategory === "graph" ? JSON.parse(JSON.stringify(this.graphEngine.nodes)) : null,
      graphEdges: this.currentCategory === "graph" ? JSON.parse(JSON.stringify(this.graphEngine.edges)) : null,
      grid: this.currentCategory === "grid" ? JSON.parse(JSON.stringify(this.graphEngine.grid)) : null,
      pseudocodeLine: this.currentPseudocodeLine,
      tag: tag
    });
    this.updateStepBackBtn();
  }

  stepBack() {
    if (this.history.length <= 1) {
      this.showToast("ℹ️ At starting state — cannot step back further.");
      return;
    }
    this.shouldStop = true;
    this.isRunning = false;
    this.isPaused = true;
    this._generation += 1;

    this.elements.runBtn.style.display = "inline-block";
    this.elements.pauseBtn.style.display = "none";
    this.elements.resumeBtn.style.display = "none";

    this.history.pop();
    const prev = this.history[this.history.length - 1];
    if (!prev) return;

    this.array = [...prev.array];
    this.arrayB = [...prev.arrayB];
    this.stats = { ...prev.stats };
    this.statsB = { ...prev.statsB };
    if (this.renderer.sortedIndices) this.renderer.sortedIndices = new Set(prev.sortedIndices);
    if (this.rendererB && this.rendererB.sortedIndices) this.rendererB.sortedIndices = new Set(prev.sortedIndicesB);

    if (prev.category === "graph" && prev.graphNodes) {
      this.graphEngine.nodes = JSON.parse(JSON.stringify(prev.graphNodes));
      this.graphEngine.edges = JSON.parse(JSON.stringify(prev.graphEdges));
      this.graphRenderer.render();
    } else if (prev.category === "grid" && prev.grid) {
      this.graphEngine.grid = JSON.parse(JSON.stringify(prev.grid));
      this.gridRenderer.render();
    } else {
      this.renderer.render(this.array);
      if (this.raceMode && this.rendererB) this.rendererB.render(this.arrayB);
    }

    this.updateStats();
    this.updateComplexityData();

    if (this.elements.pseudocodeBody) {
      this.pseudocodeManager.highlightLine(this.elements.pseudocodeBody, prev.pseudocodeLine);
    }

    this.updateStepBackBtn();
    this.log("⬅️ Stepped back one operation (state saved for re-run)");
  }

  updateStepBackBtn() {
    if (this.elements.stepBackBtn) {
      const canBack = this.history.length > 1;
      this.elements.stepBackBtn.style.display = canBack ? "inline-block" : "none";
    }
  }
}

// Global instance
let visualizer;