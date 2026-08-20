/**
 * core.js — Main AlgorithmVisualizer controller class.
 *
 * Orchestrates EVERYTHING: algorithm execution (JS + Python via Pyodide),
 * rendering (array bars, SVG graphs, Canvas grids), step-back snapshot replay,
 * complexity chart overlay, pseudocode line highlighting, sound synthesis,
 * shareable URL state, and all DOM event wiring.
 *
 * Side-system classes (GraphEngine, *Renderer, SoundManager, PseudocodeManager,
 * PythonRunner) are instantiated here and exposed as properties for debugging.
 */
class AlgorithmVisualizer {
  constructor() {
    // ── Execution & Lifecycle State ─────────────────────────────────
    this.array = [];                // Primary dataset (sort/search arrays)
    this.arrayB = [];               // Race-mode side-B dataset (clone of array at start)
    this.raceMode = false;          // Dual-algorithm head-to-head comparison
    this.isRunning = false;         // True while user code is executing
    this.isPaused = false;          // User-initiated pause (sleep() blocks)
    this.stepMode = false;          // Manual click-to-advance stepping
    this.shouldStop = false;        // Cooperative abort flag (checked in every sleep + API call)
    this.speed = 300;               // Base animation delay in ms (slider-driven)
    this.soundEnabled = true;       // SFX master gate
    this.musicalMode = false;       // When on: compare/swap play scale dyads instead of blips
    this.currentLanguage = 'javascript';   // 'javascript' | 'python'
    this.currentCategory = 'sort';          // 'sort' | 'search' | 'graph' | 'grid'
    this.currentAlgorithm = 'bubble';       // User-picked algorithm (side A)
    this.currentAlgorithmB = 'bubble';      // Race-mode opponent (side B)
    this.searchTarget = null;               // Numeric target for search algorithms
    this.stepResolve = null;                // Promise resolver — set by sleep() in step mode, fired by step-forward click
    this._generation = 0;                   // Increments on every generate/clear — lets running code detect stale arrays
    this._runGeneration = null;             // Snapshot of _generation at run start — guards against mid-run regeneration

    // ── Performance Stats ───────────────────────────────────────────────
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

    // ── Step-Back History & Pseudocode Tracking ─────────────────────────
    this.history = [];  // Undo stack (snapshots)
    this.future = [];   // Redo stack
    this.currentPseudocodeLine = 0;

    // ── DOM Element Cache ────────────────────────────────────────────
    // Queried ONCE at startup — avoids repeated getElementById calls.
    // Missing elements are flagged by validateElements() below for debugging.
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
      producerBeatBtn: document.getElementById("producer-beat-btn"),
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
      stepForwardBtn: document.getElementById("step-forward-btn"),
      editorExpandBtn: document.getElementById("editor-expand-btn"),
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
      graphNodeCountInput: document.getElementById("graph-node-count"),
      gridSizeSelect: document.getElementById("grid-size-select"),
      contributeBtn: document.getElementById("contribute-btn"),
      contributePanel: document.getElementById("contribute-panel"),
      contributeClose: document.getElementById("contribute-close"),
    };

    console.log("Elements found:", this.validateElements());

    // ── Instantiate Subsystem Singletons ────────────────────────────
    this.pseudocodeManager = new PseudocodeManager();   // Holds + renders canonical pseudocode text per algo
    this.graphEngine     = new GraphEngine();           // Pure data layer: nodes/edges + grid/maze cells
    this.graphRenderer   = new GraphRenderer();         // SVG renderer for GraphEngine nodes/edges
    this.gridRenderer    = new GridRenderer();          // Canvas2D renderer for GraphEngine grid cells

    // Array bar renderers: primary (A) + secondary race-mode (B)
    this.renderer = new ArrayRenderer();
    this.renderer.init(this.elements.container);
    this.rendererB = new ArrayRenderer();
    if (this.elements.containerB) this.rendererB.init(this.elements.containerB);

    // Sound synthesis (Web Audio API, no audio files)
    this.sounds = new SoundManager();
    this.sounds.setScale("pentatonic");
    this.sounds.setWaveform("triangle");

    // Two Pyodide runners so A and B algos execute in isolated sandboxes during race
    this.pythonRunner  = new PythonRunner();
    this.pythonRunnerB = new PythonRunner();

    this.init();
  }

  // ── Initialization Boot Sequence ──────────────────────────────────────
  async init() {
    console.log("AlgoStudio initializing...");
    this.setupEventListeners();                     // Wire every button/slider/toggle/shortcut
    const loadedFromURL = this.loadFromURL();       // Restore state from ?state= share URL (if any)
    if (!loadedFromURL) {
      this.setExampleCode();                        // Populate code editor with built-in algo template
      this.generateArray();                         // Create first dataset (or graph/grid layout)
    }
    this.initComplexityOverlay();                   // Create complexity chart DOM (hidden until user clicks complexity button)

    console.log("AlgoStudio ready");
  }

  /**
   * Verify every cached DOM element was found. Called once after caching.
   * Logs any missing IDs so developers can fix HTML/JS ID mismatches quickly.
   */
  validateElements() {
    const found = {};
    Object.entries(this.elements).forEach(([key, element]) => {
      found[key] = !!element;
      if (!element) console.error(`Missing element: ${key}`);
    });
    return found;
  }

  /**
   * Wire ALL UI event handlers. Keep this list synchronized with index.html.
   * Grouped by concern for readability (main controls, sound, race, edit shortcuts, etc.).
   */
  setupEventListeners() {
    // ── Primary action buttons ──────────────────────────────────────
    this.elements.generateBtn.onclick = () => this.generateArray();
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
        this.elements.helpBtn.textContent = isVisible ? "?" : "X";
        this.elements.helpBtn.classList.toggle("btn-danger");
        this.elements.helpBtn.classList.toggle("btn-secondary");
      };
    }

    // Speed slider (animation delay)
    const updateSpeed = () => {
      this.speed = parseInt(this.elements.speedSlider.value);
      if (isNaN(this.speed)) this.speed = 300;
      this.elements.speedValue.textContent = this.speed + "ms";
    };
    this.elements.speedSlider.addEventListener('input', updateSpeed);
    this.elements.speedSlider.addEventListener('change', updateSpeed);
    updateSpeed();

    // ── Category (sort/search/graph/grid) + per-category sub-controls ──
    this.elements.categorySelect.onchange = () => {
      this.currentCategory = this.elements.categorySelect.value;
      this.onCategoryChange();       // Swaps renderers, refills algorithm dropdowns, regenerates data
    };

    // Graph tab: preset rebuild (random/tree/DAG/negative) + directed toggle
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
    // Grid tab: recursive-backtracking maze generator + wall eraser
    // Maze button: stop any running algo, then generate grid + apply maze
    if (this.elements.mazeGenBtn) {
      this.elements.mazeGenBtn.onclick = () => {
        // Stop any running algo cleanly
        this.shouldStop = true;
        this.isRunning = false;
        this.isPaused = false;
        this._generation += 1;
        if (this.stepResolve) { this.stepResolve(); this.stepResolve = null; }
        this.pythonRunner.stopExecution();
        this.elements.runBtn.style.display = 'inline-block';
        this.elements.pauseBtn.style.display = 'none';
        this.elements.resumeBtn.style.display = 'none';
        // Apply size from selector if present
        const [rows, cols] = this._getGridSize();
        this.graphEngine.generateRecursiveMaze();
        this.gridRenderer.init(this.elements.container, this.graphEngine);
        this.gridRenderer.render();
        this.history = [];
        this.future = [];
        this.saveSnapshot('init_grid');
        this.log('🌀 Generated Recursive Backtracking Maze.');
        this.sounds.play('generate');
      };
    }
    if (this.elements.clearWallsBtn) {
      this.elements.clearWallsBtn.onclick = () => {
        this.graphEngine.clearGridWalls();
        this.gridRenderer.render();
        this.log('Cleared all grid walls.');
      };
    }

    // Help panel tab switching
    const helpPanel = this.elements.helpPanel;
    if (helpPanel) {
      helpPanel.addEventListener('click', (e) => {
        if (e.target.matches('.help-tab')) {
          const tab = e.target.dataset.tab;
          helpPanel.querySelectorAll('.help-tab').forEach(t => t.classList.remove('active'));
          helpPanel.querySelectorAll('.help-tab-content').forEach(c => c.style.display = 'none');
          e.target.classList.add('active');
          const content = document.getElementById('help-tab-' + tab);
          if (content) content.style.display = '';
        }
      });
    }

    // Language + algorithm dropdowns — both refill the editor textarea
    this.elements.languageSelect.onchange = () => {
      this.currentLanguage = this.elements.languageSelect.value;
      this.setExampleCode();
    };
    this.elements.algorithmSelect.onchange = () => {
      this.currentAlgorithm = this.elements.algorithmSelect.value;
      this.setExampleCode();
    };

    // ── Sound Studio controls ───────────────────────────────────────
    // Master gate + musical dyads
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

    // Producer kit presets (pre-configured sound profiles)
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

    // Individual sound controls (waveform, scale, octave)
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

    // Volume control
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
    // Beat button (audition current sound)
    if (this.elements.producerBeatBtn) {
      this.elements.producerBeatBtn.onclick = () => {
        this.sounds.playProducerDemo();
      };
    }

    // Race mode toggle (dual-algorithm comparison)
    // Note: Race mode is only supported for sort/search categories.
    // Graph and grid use shared singleton renderers, so concurrent dual-algo
    // visualization is not possible without a major renderer refactor.
    if (this.elements.raceToggle) {
      this.elements.raceToggle.onchange = () => {
        const cat = this.currentCategory;
        // Block race mode for graph and grid categories
        if (this.elements.raceToggle.checked && (cat === "graph" || cat === "grid")) {
          this.elements.raceToggle.checked = false;
          this.log("Race mode is not available for Graph / Grid categories (shared renderer).");
          return;
        }
        this.raceMode = this.elements.raceToggle.checked;
        // Show/hide side B visualization and stats
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
        this.renderPseudocode(this.currentAlgorithm);
        this.generateArray();
        this.log("Race mode: " + (this.raceMode ? "ON" : "OFF"));
      };
    }

    // Algorithm B selector (for race mode)
    if (this.elements.algorithmSelectB) {
      this.elements.algorithmSelectB.onchange = () => {
        this.currentAlgorithmB = this.elements.algorithmSelectB.value;
        this.renderPseudocode(this.currentAlgorithm);
      };
    }

    // Preset selector (show/hide conditional controls)
    if (this.elements.presetSelect) {
      this.elements.presetSelect.onchange = () => {
        const preset = this.elements.presetSelect.value;
        // Show nearly-sorted sliders only when that preset is selected
        if (this.elements.nearlySortedGroups) {
          const showNearly = preset === "nearly-sorted";
          this.elements.nearlySortedGroups.forEach(el => {
            el.style.display = showNearly ? "" : "none";
          });
        }
        // Show custom array textarea only when custom preset is selected
        if (this.elements.customOnlyGroups) {
          const showCustom = preset === "custom";
          this.elements.customOnlyGroups.forEach(el => {
            el.style.display = showCustom ? "" : "none";
          });
        }
      };
    }

    // Nearly-sorted preset sliders
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

    // Theme toggle (light/dark mode)
    if (this.elements.themeToggle) {
      this.elements.themeToggle.onchange = (e) => {
        if (e.target.checked) {
          document.documentElement.setAttribute("data-theme", "light");
        } else {
          document.documentElement.removeAttribute("data-theme");
        }
      };
    }
    // Colorblind palette toggle
    if (this.elements.paletteToggle) {
      this.elements.paletteToggle.onchange = (e) => {
        if (e.target.checked) {
          document.documentElement.setAttribute("data-palette", "colorblind");
        } else {
          document.documentElement.removeAttribute("data-palette");
        }
      };
    }

    // Search target input
    if (this.elements.targetInput) {
      this.elements.targetInput.addEventListener('input', () => {
        const v = parseInt(this.elements.targetInput.value);
        this.searchTarget = isNaN(v) ? null : v;
      });
    }

    // Keyboard shortcuts (Ctrl/Cmd + Enter/R/L)
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

    // Share button (copy URL with state)
    if (this.elements.shareBtn) {
      this.elements.shareBtn.onclick = () => this.shareState();
    }
    // Complexity overlay toggle
    if (this.elements.complexityBtn) {
      this.elements.complexityBtn.onclick = () => {
        if (!this.complexityOverlay) this.initComplexityOverlay();
        const willShow = !this.complexityOverlay.classList.contains('visible');
        this.complexityOverlay.classList.toggle('visible');
        if (willShow) this.renderComplexityChart();
      };
    }
    // Step navigation buttons
    if (this.elements.stepBackBtn) {
      this.elements.stepBackBtn.onclick = () => this.stepBack();
    }
    if (this.elements.stepForwardBtn) {
      this.elements.stepForwardBtn.onclick = () => this.stepForward();
    }
    // Editor expand/collapse
    if (this.elements.editorExpandBtn) {
      this.elements.editorExpandBtn.onclick = () => {
        const isExpanded = this.elements.editor.classList.toggle('expanded');
        this.elements.editorExpandBtn.textContent = isExpanded ? "[-] Collapse Editor" : "[+] Expand Editor";
      };
    }

    // Contribute panel toggle
    if (this.elements.contributeBtn && this.elements.contributePanel) {
      this.elements.contributeBtn.onclick = () => {
        const isVisible = this.elements.contributePanel.style.display !== "none";
        this.elements.contributePanel.style.display = isVisible ? "none" : "block";
        if (!isVisible) {
          this.elements.contributePanel.scrollIntoView({ behavior: 'smooth' });
        }
      };
    }
    if (this.elements.contributeClose && this.elements.contributePanel) {
      this.elements.contributeClose.onclick = () => {
        this.elements.contributePanel.style.display = "none";
      };
    }

    // Window resize handler for complexity overlay chart
    window.addEventListener('resize', window.utils?.debounce(() => {
      if (this.complexityCanvas && this.complexityOverlay?.classList.contains('visible')) {
        this.renderComplexityChart();
      }
    }, 150));
  }

  // ── Category & Algorithm Management ───────────────────────────────────
  onCategoryChange() {
    // Always sync this.currentCategory from the DOM first so every subsequent
    // call (refreshAlgorithmOptions, setExampleCode, renderPseudocode) sees
    // the correct category before any rendering happens.
    this.currentCategory = this.elements.categorySelect.value;

    const isSearch = this.currentCategory === "search";
    const isGraph  = this.currentCategory === "graph";
    const isGrid   = this.currentCategory === "grid";

    // ── Bug 1: Auto-disable race mode when switching to graph/grid ─────────
    // Graph and grid share singleton renderers — concurrent dual-algo
    // visualization would corrupt shared engine state.
    if ((isGraph || isGrid) && this.raceMode) {
      this.raceMode = false;
      if (this.elements.raceToggle) this.elements.raceToggle.checked = false;
      if (this.elements.vizSideB) this.elements.vizSideB.style.display = "none";
      if (this.elements.vizWrapper) this.elements.vizWrapper.classList.remove("race-mode");
      if (this.elements.statsCardB) this.elements.statsCardB.style.display = "none";
      if (this.elements.raceOnlyGroups) this.elements.raceOnlyGroups.forEach(el => el.style.display = "none");
      this.log("Race mode disabled — not supported for Graph / Grid categories.");
    }

    // ── Hide race toggle for graph/grid; show it again for sort/search ─────
    const raceControl = this.elements.raceToggle?.closest(".control-group");
    if (raceControl) raceControl.style.display = (isGraph || isGrid) ? "none" : "";

    // Disable Python for Graph & Grid modes
    if (this.elements.languageSelect) {
      Array.from(this.elements.languageSelect.options).forEach(opt => {
        if (opt.value === "python") {
          opt.disabled = isGraph || isGrid;
        }
      });
      if ((isGraph || isGrid) && this.currentLanguage === "python") {
        this.elements.languageSelect.value = "javascript";
        this.currentLanguage = "javascript";
      }
    }

    // Show/hide category-specific controls
    if (this.elements.searchOnlyGroups) {
      this.elements.searchOnlyGroups.forEach(el => el.style.display = isSearch ? "" : "none");
    }
    if (this.elements.graphOnlyGroups) {
      this.elements.graphOnlyGroups.forEach(el => el.style.display = isGraph ? "" : "none");
    }
    if (this.elements.gridOnlyGroups) {
      this.elements.gridOnlyGroups.forEach(el => el.style.display = isGrid ? "" : "none");
    }

    // Update generate button text based on category
    if (this.elements.generateBtn) {
      if (isGraph) {
        this.elements.generateBtn.textContent = 'New Graph';
      } else if (isGrid) {
        this.elements.generateBtn.textContent = 'New Grid';
      } else {
        this.elements.generateBtn.textContent = 'Generate Array';
      }
    }

    // ── Bug 2: Refresh algorithm dropdowns BEFORE generating data ──────────
    // generateArray() doesn't depend on the algorithm for graph/grid, but
    // setExampleCode() → renderPseudocode() does.  Doing options first means
    // this.currentAlgorithm is already set to the new category's first algo
    // before any pseudocode rendering occurs.
    this.refreshAlgorithmOptions();
    this.refreshAlgorithmSelectB();

    // Initialize appropriate renderer for category and generate
    if (this.currentCategory === "sort" || this.currentCategory === "search") {
      this.renderer = new ArrayRenderer();
      this.renderer.init(this.elements.container);
    }
    this.generateArray();

    this.setExampleCode();   // calls renderPseudocode(this.currentAlgorithm) internally

    if (this.raceMode) {
      if (this.elements.vizSideB) this.elements.vizSideB.style.display = "";
      if (this.elements.vizWrapper) this.elements.vizWrapper.classList.add("race-mode");
      if (this.elements.statsCardB) this.elements.statsCardB.style.display = "";
      if (this.elements.raceOnlyGroups) {
        this.elements.raceOnlyGroups.forEach(el => el.style.display = "");
      }
      this.renderPseudocode(this.currentAlgorithm);
    }

    // Auto-switch help panel tab to match category
    if (this.elements.helpPanel) {
      const targetTab = isGraph ? 'graph' : isGrid ? 'grid' : 'sort-search';
      const allTabs = this.elements.helpPanel.querySelectorAll('.help-tab');
      const allContents = this.elements.helpPanel.querySelectorAll('.help-tab-content');
      allTabs.forEach(t => t.classList.remove('active'));
      allContents.forEach(c => c.style.display = 'none');
      const activeTab = this.elements.helpPanel.querySelector(`[data-tab="${targetTab}"]`);
      if (activeTab) activeTab.classList.add('active');
      const activeContent = document.getElementById('help-tab-' + targetTab);
      if (activeContent) activeContent.style.display = '';
    }
  }

  // Refresh algorithm dropdown based on current category
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

  // Refresh algorithm B dropdown (for race mode)
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

  // ── Code Templates ─────────────────────────────────────────────────────
  // Populate editor with example code for selected algorithm/language
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
const startNode = getStartNode();
const targetNode = getTargetNode();
const startId = startNode.id;
const targetId = targetNode.id;
const queue = [startId];
const visited = new Set([startId]);
const parent = {};

while (queue.length > 0) {
  const current = queue.shift();
  await visitNode(current, "visiting");
  if (current === targetId) {
    log("Target reached! Reconstructing path...");
    const path = [];
    let c = current;
    while (c !== undefined) { path.unshift(c); c = parent[c]; }
    await markPath(path);
    return;
  }
  const neighbors = getNeighbors(current);
  for (const n of neighbors) {
    if (!visited.has(n.id)) {
      visited.add(n.id);
      parent[n.id] = current;
      queue.push(n.id);
    }
  }
}
log("Target not reachable from start!");`,
          dfs: `// Graph / Tree DFS (Depth-First Search)
const nodes = getNodes();
if (nodes.length === 0) return;
const startNode = getStartNode();
const targetNode = getTargetNode();
const visited = new Set();
const parent = {};

async function dfs(u) {
  visited.add(u);
  await visitNode(u, "visiting");
  if (u === targetNode.id) {
    log("Target reached! Reconstructing path...");
    const path = [];
    let c = u;
    while (c !== undefined) { path.unshift(c); c = parent[c]; }
    await markPath(path);
    return true;
  }
  const neighbors = getNeighbors(u);
  for (const n of neighbors) {
    if (!visited.has(n.id)) {
      parent[n.id] = u;
      if (await dfs(n.id)) return true;
    }
  }
  return false;
}
await dfs(startNode.id);`,
          dijkstra: `// Graph Dijkstra Shortest Path
const nodes = getNodes();
if (nodes.length === 0) return;
const startNode = getStartNode();
const targetNode = getTargetNode();
const dist = {};
const parent = {};
const visited = new Set();
nodes.forEach(n => dist[n.id] = Infinity);
dist[startNode.id] = 0;

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
  if (minNode === targetNode.id) {
    log("Target reached! dist=" + dist[minNode]);
    const path = [];
    let c = minNode;
    while (c !== undefined) { path.unshift(c); c = parent[c]; }
    await markPath(path);
    return;
  }
  const neighbors = getNeighbors(minNode);
  for (const n of neighbors) {
    if (dist[minNode] + n.weight < dist[n.id]) {
      dist[n.id] = dist[minNode] + n.weight;
      parent[n.id] = minNode;
    }
  }
}`,
          astar: `// A* Graph Search with heuristic
const nodes = getNodes();
if (nodes.length < 2) return;
const startNode = getStartNode();
const targetNode = getTargetNode();
const startId = startNode.id;
const targetId = targetNode.id;
const h = (nid) => {
  const n = nodes.find(x => x.id === nid);
  if (!n || !targetNode) return 0;
  return Math.sqrt((n.x - targetNode.x) ** 2 + (n.y - targetNode.y) ** 2) / 20;
};
const openSet = new Set([startId]);
const cameFrom = {};
const gScore = {};
const fScore = {};
nodes.forEach(n => { gScore[n.id] = Infinity; fScore[n.id] = Infinity; });
gScore[startId] = 0;
fScore[startId] = h(startId);

while (openSet.size > 0) {
  let current = null, currentF = Infinity;
  for (const id of openSet) {
    if ((fScore[id] ?? Infinity) < currentF) { currentF = fScore[id]; current = id; }
  }
  if (current === null) break;
  await visitNode(current, "visiting");
  if (current === targetId) {
    log("Target reached!");
    const path = [];
    let c = current;
    while (c !== undefined) { path.unshift(c); c = cameFrom[c]; }
    await markPath(path);
    return;
  }
  openSet.delete(current);
  const neighbors = getNeighbors(current);
  for (const n of neighbors) {
    const tentative = (gScore[current] ?? Infinity) + n.weight;
    if (tentative < (gScore[n.id] ?? Infinity)) {
      cameFrom[n.id] = current;
      gScore[n.id] = tentative;
      fScore[n.id] = tentative + h(n.id);
      openSet.add(n.id);
    }
  }
}
log("Target not reachable!");`,
          bellman_ford: `// Bellman-Ford Shortest Path (handles negative weights)
const nodes = getNodes();
if (nodes.length === 0) return;
const startNode = getStartNode();
const targetNode = getTargetNode();
const dist = {};
const parent = {};
nodes.forEach(n => dist[n.id] = Infinity);
dist[startNode.id] = 0;

for (let i = 0; i < nodes.length - 1; i++) {
  let updated = false;
  for (const u of nodes) {
    await visitNode(u.id, "visiting");
    const neighbors = getNeighbors(u.id);
    for (const n of neighbors) {
      if (dist[u.id] !== Infinity && dist[u.id] + n.weight < dist[n.id]) {
        dist[n.id] = dist[u.id] + n.weight;
        parent[n.id] = u.id;
        updated = true;
      }
    }
  }
  if (!updated) break;
}
const path = [];
let c = targetNode.id;
while (c !== undefined) { path.unshift(c); c = parent[c]; }
if (path[0] === startNode.id) {
  log("Path: " + path.join(" → ") + "  dist=" + dist[targetNode.id]);
  await markPath(path);
} else {
  log("No path to target (possible negative cycle).");
}`,
          prim: `// Prim's MST (Minimum Spanning Tree)
const nodes = getNodes();
if (nodes.length === 0) return;
const startNode = getStartNode();
const inMST = new Set();
const key = {};
nodes.forEach(n => key[n.id] = Infinity);
key[startNode.id] = 0;
let mstCost = 0;

for (let count = 0; count < nodes.length; count++) {
  let u = null, minKey = Infinity;
  nodes.forEach(n => {
    if (!inMST.has(n.id) && key[n.id] < minKey) {
      minKey = key[n.id];
      u = n.id;
    }
  });
  if (u === null) break;
  inMST.add(u);
  if (minKey !== Infinity) mstCost += minKey;
  await visitNode(u, "visiting");
  const neighbors = getNeighbors(u);
  for (const n of neighbors) {
    if (!inMST.has(n.id) && n.weight < key[n.id]) {
      key[n.id] = n.weight;
    }
  }
}
log("MST complete! Total cost: " + mstCost);
await markPath([...inMST]);`,
          kruskal: `// Kruskal's MST (Minimum Spanning Tree) via edge sorting
const nodes = getNodes();
if (nodes.length === 0) return;
const parent = {};
nodes.forEach(n => parent[n.id] = n.id);
const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; };

const edgesAll = [];
for (const u of nodes) {
  const neighbors = getNeighbors(u.id);
  for (const n of neighbors) {
    if (u.id < n.id) edgesAll.push({ a: u.id, b: n.id, w: n.weight });
  }
}
edgesAll.sort((x, y) => x.w - y.w);

let mstEdges = 0, mstCost = 0;
const mstNodes = new Set();
for (const e of edgesAll) {
  if (find(e.a) !== find(e.b)) {
    union(e.a, e.b);
    await visitNode(e.a, "visiting");
    await visitNode(e.b, "visiting");
    mstNodes.add(e.a);
    mstNodes.add(e.b);
    mstCost += e.w;
    mstEdges++;
    if (mstEdges >= nodes.length - 1) break;
  }
}
log("MST complete! Edges: " + mstEdges + ", Total cost: " + mstCost);
await markPath([...mstNodes]);`,
          toposort: `// Topological Sort (Kahn's Algorithm) - DAG
const nodes = getNodes();
if (nodes.length === 0) return;
const inDeg = {};
nodes.forEach(n => inDeg[n.id] = 0);
for (const u of nodes) {
  const neighbors = getNeighbors(u.id);
  for (const n of neighbors) inDeg[n.id] = (inDeg[n.id] ?? 0) + 1;
}
const queue = nodes.filter(n => (inDeg[n.id] ?? 0) === 0).map(n => n.id);
const order = [];

while (queue.length > 0) {
  const u = queue.shift();
  order.push(u);
  await visitNode(u, "visiting");
  const neighbors = getNeighbors(u);
  for (const n of neighbors) {
    inDeg[n.id]--;
    if (inDeg[n.id] === 0) queue.push(n.id);
  }
}
if (order.length === nodes.length) log("Topo order: " + order.join(","));
else log("Cycle detected in graph");`
        },
        grid: {
          bfs: `// Grid BFS Pathfinding
const start = getStartCell();
const target = getTargetCell();
if (!start || !target) return;
const queue = [start];
const visited = new Set([\`\${start.row},\${start.col}\`]);
const parent = {};

while (queue.length > 0) {
  const current = queue.shift();
  await visitGridCell(current.row, current.col, "visiting");
  if (current.row === target.row && current.col === target.col) {
    log("Target reached!");
    let curr = target;
    while (curr) {
      await visitGridCell(curr.row, curr.col, "path");
      curr = parent[\`\${curr.row},\${curr.col}\`];
    }
    return;
  }
  const neighbors = getGridNeighbors(current.row, current.col);
  for (const n of neighbors) {
    const key = \`\${n.row},\${n.col}\`;
    if (!visited.has(key)) {
      visited.add(key);
      parent[key] = current;
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
  if (r === target.row && c === target.col) {
    log("Target reached!");
    await visitGridCell(r, c, "path");
    return true;
  }
  const neighbors = getGridNeighbors(r, c);
  for (const n of neighbors) {
    if (await dfsGrid(n.row, n.col)) {
      await visitGridCell(r, c, "path");
      return true;
    }
  }
  return false;
}
await dfsGrid(start.row, start.col);`,
          dijkstra: `// Grid Dijkstra Pathfinding (uses terrain weights: grass=2, sand=4, mud=8)
const start = getStartCell();
const target = getTargetCell();
if (!start || !target) return;
const dist = {};
const parent = {};
const pq = [{ r: start.row, c: start.col, d: 0 }];
dist[\`\${start.row},\${start.col}\`] = 0;

while (pq.length > 0) {
  pq.sort((a, b) => a.d - b.d);
  const curr = pq.shift();
  const cKey = \`\${curr.r},\${curr.c}\`;
  if (curr.d > (dist[cKey] ?? Infinity)) continue;
  await visitGridCell(curr.r, curr.c, "visiting");
  if (curr.r === target.row && curr.c === target.col) {
    log("Target reached! Cost=" + curr.d);
    let p = target;
    while (p) {
      await visitGridCell(p.row ?? p.r, p.col ?? p.c, "path");
      p = parent[\`\${p.row ?? p.r},\${p.col ?? p.c}\`];
    }
    return;
  }
  const neighbors = getGridNeighbors(curr.r, curr.c);
  for (const n of neighbors) {
    const nKey = \`\${n.row},\${n.col}\`;
    const nd = curr.d + (n.weight ?? 1);
    if (nd < (dist[nKey] ?? Infinity)) {
      dist[nKey] = nd;
      parent[nKey] = { row: curr.r, col: curr.c };
      pq.push({ r: n.row, c: n.col, d: nd });
    }
  }
}`,
          astar: `// Grid A* Pathfinding (Manhattan heuristic + terrain weights)
const start = getStartCell();
const target = getTargetCell();
if (!start || !target) return;
const h = (r, c) => Math.abs(r - target.row) + Math.abs(c - target.col);
const openSet = new Set([\`\${start.row},\${start.col}\`]);
const cameFrom = {};
const gScore = {};
const fScore = {};
const sKey = \`\${start.row},\${start.col}\`;
gScore[sKey] = 0;
fScore[sKey] = h(start.row, start.col);

while (openSet.size > 0) {
  let currKey = null, currF = Infinity;
  for (const k of openSet) {
    const f = fScore[k] ?? Infinity;
    if (f < currF) { currF = f; currKey = k; }
  }
  if (!currKey) break;
  const [rs, cs] = currKey.split(",");
  const r = parseInt(rs), c = parseInt(cs);
  await visitGridCell(r, c, "visiting");
  if (r === target.row && c === target.col) {
    log("Target reached! Cost=" + (gScore[currKey] ?? 0));
    let temp = { r, c };
    while (temp) {
      await visitGridCell(temp.r, temp.c, "path");
      const parentKey = cameFrom[\`\${temp.r},\${temp.c}\`];
      if (parentKey) {
        const [pr, pc] = parentKey.split(",");
        temp = { r: parseInt(pr), c: parseInt(pc) };
      } else {
        temp = null;
      }
    }
    return;
  }
  openSet.delete(currKey);
  const neighbors = getGridNeighbors(r, c);
  for (const n of neighbors) {
    const nKey = \`\${n.row},\${n.col}\`;
    const tentative = (gScore[currKey] ?? Infinity) + (n.weight ?? 1);
    if (tentative < (gScore[nKey] ?? Infinity)) {
      cameFrom[nKey] = currKey;
      gScore[nKey] = tentative;
      fScore[nKey] = tentative + h(n.row, n.col);
      openSet.add(nKey);
    }
  }
}`
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

  // ── Array Generation ───────────────────────────────────────────────────
  // Generate array with specific preset pattern (random, nearly-sorted, etc.)
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

  // Parse user-input custom array string (comma/space separated)
  parseCustomArray(text) {
    if (!text || !text.trim()) return null;
    const parts = text.split(/[\s,;]+/).filter(s => s.length > 0);
    const nums = parts.map(p => Number(p)).filter(n => !isNaN(n) && isFinite(n));
    if (nums.length === 0) return null;
    return nums.map(n => Math.max(1, Math.min(500, Math.round(n))));
  }

  // Generate new data (array/graph/grid) and reset visualization state
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
      const gPreset = this.elements.graphPresetSelect ? this.elements.graphPresetSelect.value : "random";
      // Read node count from the new control (graph-only input)
      let nodeCount = 8;
      if (this.elements.graphNodeCountInput) {
        const v = parseInt(this.elements.graphNodeCountInput.value);
        if (!isNaN(v) && v >= 4 && v <= 18) nodeCount = v;
      }
      this.graphEngine.generatePreset(gPreset, nodeCount);
      this.graphRenderer.init(this.elements.container, this.graphEngine);
      this.graphRenderer.render();
      this.history = [];
      this.future = [];
      this.saveSnapshot("init_graph");
      this.log(`🔄 Generated ${gPreset.toUpperCase()} graph (${nodeCount} nodes)`);
      this.sounds.play('generate');
      return;
    } else if (this.currentCategory === "grid") {
      const [rows, cols] = this._getGridSize();
      this.graphEngine.initGrid(rows, cols);
      this.gridRenderer.init(this.elements.container, this.graphEngine);
      this.gridRenderer.render();
      this.history = [];
      this.future = [];
      this.saveSnapshot("init_grid");
      this.log(`⚡ Generated new Grid layout (${rows}×${cols})`);
      this.sounds.play('generate');
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
        this.log("Custom array empty or invalid - falling back to random");
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
    this.history = [];
    this.future = [];
    this.saveSnapshot("init_array");
    const extra = preset === "nearly-sorted" ?
      ` (swaps=${this.elements.nearlySwapsSlider?.value ?? 30}%, spread=${this.elements.nearlySpreadSlider?.value ?? 25}%)` : "";
    this.log(`Generated array of ${this.array.length} items (preset: ${preset})${extra}`);
    this.sounds.play('generate');
  }

  /** Helper: read grid size from the grid-size-select dropdown. Returns [rows, cols]. */
  _getGridSize() {
    if (this.elements.gridSizeSelect) {
      const val = this.elements.gridSizeSelect.value || '15x25';
      const parts = val.split('x');
      const rows = parseInt(parts[0]) || 15;
      const cols = parseInt(parts[1]) || 25;
      return [rows, cols];
    }
    return [15, 25];
  }

  // ── Utility Functions ───────────────────────────────────────────────────
  // Update statistics display (comparisons, swaps, time, etc.)
  updateStats() {
    // For graph/grid, 'size' means node count or cell count
    const sizeVal = this.currentCategory === 'graph'
      ? this.graphEngine.nodes.length
      : this.currentCategory === 'grid'
        ? (this.graphEngine.gridRows * this.graphEngine.gridCols)
        : this.array.length;
    this.elements.statSize.textContent = sizeVal;
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

  // Append message to execution log (auto-scrolls, truncates if too long)
  log(msg) {
    // Clear log if it's getting too long
    if (this.elements.logArea.textContent.length > 5000) {
      this.elements.logArea.textContent = "";
    }
    
    this.elements.logArea.textContent += msg + "\n";
    this.elements.logArea.scrollTop = this.elements.logArea.scrollHeight;
    console.log("Log:", msg);
  }

  // Update the operation info display (shows current algorithm operation)
  updateOperationInfo(operation) {
    this.elements.operationInfo.textContent = operation;
  }

  // Reset all state: stop execution, clear displays, reset stats/history
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
    // Clear step history (undo + redo)
    this.history = [];
    this.future = [];
    this.updateStepNavButtons();
    this.resetComplexityData();
    this.updateStats();
    
    console.log("All cleared");
  }

  // ── Execution Control ───────────────────────────────────────────────────
  // Toggle manual step-through mode
  toggleStepMode() {
    this.stepMode = !this.stepMode;
    this.elements.stepBtn.textContent = this.stepMode ? "Stop Step Mode" : "Step Mode";
    this.log("Step mode: " + (this.stepMode ? "ON" : "OFF"));
  }

  // Pause the currently running algorithm
  pauseExecution() {
    console.log("PAUSE EXECUTION CALLED - isRunning:", this.isRunning, "isPaused:", this.isPaused);
    this.isPaused = true;
    this.elements.pauseBtn.style.display = "none";
    this.elements.resumeBtn.style.display = "inline-block";
    this.log("Execution paused");
  }

  // Resume a paused algorithm
  resumeExecution() {
    this.isPaused = false;
    this.elements.resumeBtn.style.display = "none";
    this.elements.pauseBtn.style.display = "inline-block";
    this.log("Execution resumed");
  }

  // Validate user code before execution (checks for async/await, function signatures)
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

  // ── Main Execution ───────────────────────────────────────────────────────
  // Run the algorithm visualization (handles step-back replay, validation, dispatch)
  async runVisualization() {
    console.log("=== RUN VISUALIZATION START ===");

    if (this.isRunning) {
      console.log("Already running, ignoring...");
      return;
    }

    // ── Step-back continuation: if we undid some steps (future stack has entries)
    //    then clicking "Run" = replay snapshots forward at current speed first.
    //    This "picks up exactly where it left off" instead of restarting from 0.
    if (this.future.length > 0) {
      this.isRunning = true;
      this.isPaused = false;
      this.shouldStop = false;
      this._runGeneration = this._generation;
      const totalToReplay = this.future.length;
      this.elements.runBtn.style.display = "none";
      this.elements.pauseBtn.style.display = "inline-block";
      this.elements.resumeBtn.style.display = "none";
      this.log(`Resuming from snapshot - replaying ${totalToReplay} operation(s) forward...`);
      let played = 0;
      try {
        while (this.future.length > 0 && !this.shouldStop) {
          const next = this.future.pop();
          const currentSnap = this._captureSnapshot('pre-replay');
          this.history.push(currentSnap);
          this._applySnapshot(next);
          this.updateStepNavButtons();
          played++;
          await this.sleep(Math.max(20, Math.floor(this.speed / 1.8)));
        }
      } finally {
        this.isRunning = false;
        if (this.isPaused && !this.shouldStop && this.future.length > 0) {
          this.elements.pauseBtn.style.display = "none";
          this.elements.resumeBtn.style.display = "inline-block";
          this.elements.runBtn.style.display = "inline-block";
        } else {
          this.elements.pauseBtn.style.display = "none";
          this.elements.resumeBtn.style.display = "none";
          this.elements.runBtn.style.display = "inline-block";
        }
      }
      if (!this.shouldStop) {
        this.log(`Replayed ${played} step(s) - now exactly where you left off.`);
        // If future exhausted itself AND user wants more, clicking Run again does a fresh algorithm run.
      } else {
        this.log(`Replay paused at ${played}/${totalToReplay}.`);
      }
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
    let modeLabel;
    if (this.currentCategory === "search") {
      modeLabel = `${algoNameA} search`;
    } else if (this.currentCategory === "graph") {
      modeLabel = `${algoNameA} graph traversal`;
    } else if (this.currentCategory === "grid") {
      modeLabel = `${algoNameA} pathfinding`;
    } else {
      modeLabel = `${algoNameA} sort`;
    }

    if (this.raceMode) {
      const algoNameB = this.elements.algorithmSelectB.options[this.elements.algorithmSelectB.selectedIndex]?.textContent || this.currentAlgorithmB;
      this.log(`RACE: ${algoNameA}  vs  ${algoNameB} - same array, may the fastest win!`);
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
          } else if (this.currentCategory === "graph") {
            this.graphRenderer.render();
          } else if (this.currentCategory === "grid") {
            this.gridRenderer.render();
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
      // Always set endTime before calling updateStats() so the timer stops
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

  // Run dual-algorithm race mode (both algorithms execute concurrently)
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

  /**
   * Minified built-in algorithm code for Race Mode side-B.
   * Side A always runs the user's editor code; side B uses these pre-minified
   * canonical implementations so "Race" is always user-code vs built-in reference.
   * Covers sort(10) + search(5) + graph(8) + grid(4) for JS; sort+search only for Python.
   * Falls back: category → sort → bubble.
   */
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
        },
        graph: {
          bfs: `const nodes = getNodes(); if (nodes.length === 0) return; const sN = getStartNode(); const tN = getTargetNode(); const queue = [sN.id]; const visited = new Set([sN.id]); const par = {}; while (queue.length > 0) { const cur = queue.shift(); await visitNode(cur, "visiting"); if (cur === tN.id) { const p = []; let c = cur; while (c !== undefined) { p.unshift(c); c = par[c]; } await markPath(p); return; } const nb = getNeighbors(cur); for (const n of nb) { if (!visited.has(n.id)) { visited.add(n.id); par[n.id] = cur; queue.push(n.id); } } }`,
          dfs: `const nodes = getNodes(); if (nodes.length === 0) return; const sN = getStartNode(); const tN = getTargetNode(); const visited = new Set(); const par = {}; async function dfs(u) { visited.add(u); await visitNode(u, "visiting"); if (u === tN.id) { const p = []; let c = u; while (c !== undefined) { p.unshift(c); c = par[c]; } await markPath(p); return true; } const nb = getNeighbors(u); for (const n of nb) { if (!visited.has(n.id)) { par[n.id] = u; if (await dfs(n.id)) return true; } } return false; } await dfs(sN.id);`,
          dijkstra: `const nodes = getNodes(); if (nodes.length === 0) return; const sN = getStartNode(); const tN = getTargetNode(); const dist = {}; const par = {}; const vis = new Set(); nodes.forEach(n => dist[n.id] = Infinity); dist[sN.id] = 0; while (vis.size < nodes.length) { let mn = null, md = Infinity; nodes.forEach(n => { if (!vis.has(n.id) && dist[n.id] < md) { md = dist[n.id]; mn = n.id; } }); if (mn === null) break; vis.add(mn); await visitNode(mn, "visiting"); if (mn === tN.id) { const p = []; let c = mn; while (c !== undefined) { p.unshift(c); c = par[c]; } await markPath(p); return; } const nb = getNeighbors(mn); for (const n of nb) { if (dist[mn] + n.weight < dist[n.id]) { dist[n.id] = dist[mn] + n.weight; par[n.id] = mn; } } }`,
          astar: `const nodes = getNodes(); if (nodes.length < 2) return; const sN = getStartNode(); const tN = getTargetNode(); const h = (nid) => { const n = nodes.find(x => x.id === nid); return n && tN ? Math.sqrt((n.x-tN.x)**2+(n.y-tN.y)**2)/20 : 0; }; const openSet = new Set([sN.id]); const came = {}; const g = {}; const f = {}; nodes.forEach(n => { g[n.id] = Infinity; f[n.id] = Infinity; }); g[sN.id] = 0; f[sN.id] = h(sN.id); while (openSet.size > 0) { let cur = null, cf = Infinity; for (const id of openSet) { if ((f[id]??Infinity) < cf) { cf = f[id]; cur = id; } } if (!cur) break; await visitNode(cur, "visiting"); if (cur === tN.id) { const p = []; let c = cur; while (c !== undefined) { p.unshift(c); c = came[c]; } await markPath(p); return; } openSet.delete(cur); for (const n of getNeighbors(cur)) { const t = (g[cur]??Infinity)+n.weight; if (t < (g[n.id]??Infinity)) { came[n.id]=cur; g[n.id]=t; f[n.id]=t+h(n.id); openSet.add(n.id); } } }`,
          bellman_ford: `const nodes = getNodes(); if (nodes.length === 0) return; const sN = getStartNode(); const tN = getTargetNode(); const dist = {}; const par = {}; nodes.forEach(n => dist[n.id] = Infinity); dist[sN.id] = 0; for (let i = 0; i < nodes.length - 1; i++) { let upd = false; for (const u of nodes) { await visitNode(u.id, "visiting"); for (const n of getNeighbors(u.id)) { if (dist[u.id] !== Infinity && dist[u.id]+n.weight < dist[n.id]) { dist[n.id]=dist[u.id]+n.weight; par[n.id]=u.id; upd=true; } } } if (!upd) break; } const p=[]; let c=tN.id; while(c!==undefined){p.unshift(c);c=par[c];} if(p[0]===sN.id){await markPath(p);}`,
          prim: `const nodes = getNodes(); if (nodes.length === 0) return; const sN = getStartNode(); const inMST = new Set(); const key = {}; nodes.forEach(n => key[n.id] = Infinity); key[sN.id] = 0; let cost=0; for (let i = 0; i < nodes.length; i++) { let u=null,mk=Infinity; nodes.forEach(n => { if(!inMST.has(n.id)&&key[n.id]<mk){mk=key[n.id];u=n.id;} }); if(u===null)break; inMST.add(u); if(mk!==Infinity)cost+=mk; await visitNode(u, "visiting"); for(const n of getNeighbors(u)){if(!inMST.has(n.id)&&n.weight<key[n.id]){key[n.id]=n.weight;}} } log("MST cost: "+cost); await markPath([...inMST]);`,
          kruskal: `const nodes = getNodes(); if (nodes.length === 0) return; const par = {}; nodes.forEach(n => par[n.id]=n.id); const find=(x)=>{while(par[x]!==x){par[x]=par[par[x]];x=par[x];}return x;}; const union=(a,b)=>{const ra=find(a),rb=find(b);if(ra!==rb)par[ra]=rb;}; const ea=[]; for(const u of nodes){for(const n of getNeighbors(u.id)){if(u.id<n.id)ea.push({a:u.id,b:n.id,w:n.weight});}} ea.sort((x,y)=>x.w-y.w); let me=0,cost=0; const mn=new Set(); for(const e of ea){if(find(e.a)!==find(e.b)){union(e.a,e.b);await visitNode(e.a,"visiting");await visitNode(e.b,"visiting");mn.add(e.a);mn.add(e.b);cost+=e.w;me++;if(me>=nodes.length-1)break;}} log("MST cost: "+cost); await markPath([...mn]);`,
          toposort: `const nodes = getNodes(); if (nodes.length === 0) return; const inDeg = {}; nodes.forEach(n => inDeg[n.id] = 0); for (const u of nodes) { const neighbors = getNeighbors(u.id); for (const n of neighbors) inDeg[n.id] = (inDeg[n.id] ?? 0) + 1; } const queue = nodes.filter(n => (inDeg[n.id] ?? 0) === 0).map(n => n.id); const order = []; while (queue.length > 0) { const u = queue.shift(); order.push(u); await visitNode(u, "visiting"); const neighbors = getNeighbors(u); for (const n of neighbors) { inDeg[n.id]--; if (inDeg[n.id] === 0) queue.push(n.id); } } if (order.length === nodes.length) log("Topo order: " + order.join(",")); else log("Cycle detected in graph");`,
        },
        grid: {
          bfs: `const start = getStartCell(); const target = getTargetCell(); if (!start || !target) return; const queue = [{ r: start.row, c: start.col }]; const visited = new Set([\`\${start.row},\${start.col}\`]); const parent = {}; while (queue.length > 0) { const curr = queue.shift(); await visitGridCell(curr.r, curr.c, "visiting"); if (curr.r === target.row && curr.c === target.col) { log("Target reached!"); let k = \`\${curr.r},\${curr.c}\`; while (parent[k]) { const [pr,pc] = parent[k].split(","); await visitGridCell(parseInt(pr), parseInt(pc), "path"); k = parent[k]; } return; } const nb = getGridNeighbors(curr.r, curr.c); for (const n of nb) { const key = \`\${n.row},\${n.col}\`; if (!visited.has(key)) { visited.add(key); parent[key] = \`\${curr.r},\${curr.c}\`; queue.push({ r: n.row, c: n.col }); } } }`,
          dfs: `const start = getStartCell(); const target = getTargetCell(); if (!start || !target) return; const visited = new Set(); const parent = {}; async function dfs(r, c) { const key = \`\${r},\${c}\`; if (visited.has(key)) return false; visited.add(key); await visitGridCell(r, c, "visiting"); if (r === target.row && c === target.col) { log("Target reached!"); let k = key; while (parent[k]) { const [pr,pc] = parent[k].split(","); await visitGridCell(parseInt(pr), parseInt(pc), "path"); k = parent[k]; } return true; } const nb = getGridNeighbors(r, c); for (const n of nb) { const nk = \`\${n.row},\${n.col}\`; if (!parent[nk]) parent[nk] = key; if (await dfs(n.row, n.col)) return true; } return false; } await dfs(start.row, start.col);`,
          dijkstra: `const start = getStartCell(); const target = getTargetCell(); if (!start || !target) return; const dist = {}; const parent = {}; const sKey = \`\${start.row},\${start.col}\`; dist[sKey] = 0; const pq = [{ r: start.row, c: start.col, d: 0 }]; while (pq.length > 0) { pq.sort((a, b) => a.d - b.d); const curr = pq.shift(); const cKey = \`\${curr.r},\${curr.c}\`; if (curr.d > (dist[cKey] ?? Infinity)) continue; await visitGridCell(curr.r, curr.c, "visiting"); if (curr.r === target.row && curr.c === target.col) { log("Target reached! cost=" + curr.d); let k = cKey; while (parent[k]) { const [pr,pc] = parent[k].split(","); await visitGridCell(parseInt(pr), parseInt(pc), "path"); k = parent[k]; } return; } const nb = getGridNeighbors(curr.r, curr.c); for (const n of nb) { const nKey = \`\${n.row},\${n.col}\`; const nd = curr.d + (n.weight ?? 1); if (nd < (dist[nKey] ?? Infinity)) { dist[nKey] = nd; parent[nKey] = cKey; pq.push({ r: n.row, c: n.col, d: nd }); } } }`,
          astar: `const start = getStartCell(); const target = getTargetCell(); if (!start || !target) return; const h = (r, c) => Math.abs(r - target.row) + Math.abs(c - target.col); const openSet = new Set([\`\${start.row},\${start.col}\`]); const cameFrom = {}; const gScore = {}; const fScore = {}; const sKey = \`\${start.row},\${start.col}\`; gScore[sKey] = 0; fScore[sKey] = h(start.row, start.col); while (openSet.size > 0) { let currKey = null, currF = Infinity; for (const k of openSet) { const f = fScore[k] ?? Infinity; if (f < currF) { currF = f; currKey = k; } } if (!currKey) break; const [rs, cs] = currKey.split(","); const r = parseInt(rs), c = parseInt(cs); await visitGridCell(r, c, "visiting"); if (r === target.row && c === target.col) { log("Target reached!"); let k = currKey; while (cameFrom[k]) { const [pr,pc] = cameFrom[k].split(","); await visitGridCell(parseInt(pr), parseInt(pc), "path"); k = cameFrom[k]; } return; } openSet.delete(currKey); const nb = getGridNeighbors(r, c); for (const n of nb) { const nKey = \`\${n.row},\${n.col}\`; const tentative = (gScore[currKey] ?? Infinity) + (n.weight ?? 1); if (tentative < (gScore[nKey] ?? Infinity)) { cameFrom[nKey] = currKey; gScore[nKey] = tentative; fScore[nKey] = tentative + h(n.row, n.col); openSet.add(nKey); } } }`,
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
        graph: {},
        grid: {},
      }
    };
    const byLang = t[language];
    if (!byLang) return '';
    const byCat = byLang[category] || byLang.sort;
    return byCat[algo] || byCat.bubble || byCat.linear || '';
  }

  // ── Visualization API ───────────────────────────────────────────────────
  // Create API object injected into user code (provides compare, swap, etc.)
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
        this.updateComplexityData();
        setArr(arrRef);
        renderer.render(getArr());
        if (isA) {
          this.saveSnapshot('render');
        }
        await this.sleep(this.speed / 2);
      },

      markFound: async (i) => {
        if (this.shouldStop) return;
        statsObj.steps++;
        this.updateStats();
        this.updateComplexityData();
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
        if (this.shouldStop || this._generation !== this._runGeneration) return;
        statsObj.steps++;
        this.updateStats();
        this.updateComplexityData();
        this.highlightPseudocode('visitNode', side);
        if (isA) this.saveSnapshot("visitNode");
        const node = this.graphEngine.nodes.find(n => n.id === nodeId || n.label === String(nodeId));
        if (node) {
          node.status = color;
          this.graphRenderer.render();
          if (this.musicalMode) {
            this.sounds.playMusical(node.id * 10, 50, [10, 20, 30, 40, 50, 60, 70, 80]);
          } else if (isA) {
            this.sounds.play('visit');  // softer blip for node traversal
          }
        }
        await this.sleep(this.speed);
        if (node && color === 'visiting' && node.status === 'visiting') {
          node.status = 'visited';
          this.graphRenderer.render();
        }
      },

      visitEdge: async (fromId, toId, color = "exploring") => {
        if (this.shouldStop) return;
        statsObj.steps++;
        this.updateStats();
        this.updateComplexityData();
        this.highlightPseudocode('visitEdge', side);
        if (isA) this.saveSnapshot("visitEdge");
        const edge = this.graphEngine.edges.find(e => 
          (e.source === fromId && e.target === toId) ||
          (!this.graphEngine.isDirected && e.source === toId && e.target === fromId)
        );
        if (edge) {
          edge.status = color;
          this.graphRenderer.render();
        }
        await this.sleep(this.speed / 2);
      },

      updateDistance: async (nodeId, distance) => {
        if (this.shouldStop) return;
        statsObj.steps++;
        this.updateStats();
        this.updateComplexityData();
        const node = this.graphEngine.nodes.find(n => n.id === nodeId || n.label === String(nodeId));
        if (node) {
          node.distance = distance;
          this.graphRenderer.render();
        }
        if (isA) this.saveSnapshot("updateDistance");
        await this.sleep(this.speed / 2);
      },

      markPath: async (pathNodes) => {
        if (this.shouldStop) return;
        statsObj.steps++;
        this.updateStats();
        this.updateComplexityData();
        this.highlightPseudocode('found', side);
        if (Array.isArray(pathNodes)) {
          // Mark path nodes
          pathNodes.forEach(id => {
            const n = this.graphEngine.nodes.find(node => node.id === id || node.label === String(id));
            if (n) n.status = "path";
          });
          // Mark path edges between consecutive nodes for a full path highlight
          for (let _pi = 0; _pi < pathNodes.length - 1; _pi++) {
            const _a = pathNodes[_pi], _b = pathNodes[_pi + 1];
            const _edge = this.graphEngine.edges.find(e =>
              (e.source === _a && e.target === _b) ||
              (!this.graphEngine.isDirected && e.source === _b && e.target === _a)
            );
            if (_edge) _edge.status = "path";
          }
          this.graphRenderer.render();
        }
        this.highlightPseudocode('markPath', side);
        if (isA) {
          this.sounds.play("complete");
          this.saveSnapshot("markPath");
        }
        await this.sleep(this.speed);
      },

      visitGridCell: async (r, c, type = "visiting") => {
        if (this.shouldStop || this._generation !== this._runGeneration) return;
        if (!this.graphEngine.grid[r] || !this.graphEngine.grid[r][c]) return;
        const cell = this.graphEngine.grid[r][c];
        if (cell.type === "wall") return;

        // Path cells light up INSTANTLY — no step count, no sleep, no per-cell sound.
        // The 'complete' sound fires once when the whole algorithm finishes (runVisualization).
        if (type === "path") {
          if (cell.type !== "start" && cell.type !== "target") cell.type = "path";
          this.gridRenderer.render();
          return;
        }

        statsObj.steps++;
        this.updateStats();
        this.updateComplexityData();
        this.highlightPseudocode('visitGridCell', side);
        if (isA) this.saveSnapshot("visitGridCell");
        if (cell.type !== "start" && cell.type !== "target") {
          cell.type = type;
        }
        this.gridRenderer.render();
        if (this.musicalMode) {
          // Map cell position to a musical note via its linearised index
          const totalCells = this.graphEngine.gridRows * this.graphEngine.gridCols;
          const cellIdx    = r * this.graphEngine.gridCols + c;
          const fakeArr    = Array.from({ length: totalCells }, (_, k) => k);
          this.sounds.playMusical(cellIdx, totalCells - 1 - cellIdx, fakeArr);
        } else if (isA) {
          this.sounds.play('visit');
        }
        await this.sleep(this.speed / 2);
      },

      getNeighbors: (nodeId) => this.graphEngine.getNeighbors(nodeId),
      getNodes: () => this.graphEngine.nodes,
      // Return the designated start node (marked green on the graph)
      getStartNode: () => {
        return this.graphEngine.nodes.find(n => n.id === this.graphEngine.startNodeId)
          || this.graphEngine.nodes[0] || null;
      },
      // Return the designated target node (marked red on the graph)
      getTargetNode: () => {
        return this.graphEngine.nodes.find(n => n.id === this.graphEngine.targetNodeId)
          || this.graphEngine.nodes[this.graphEngine.nodes.length - 1] || null;
      },
      getStartCell: () => {
        const s = this.graphEngine.startCell;
        if (!s) return s;
        return { row: s.row, col: s.col, r: s.row, c: s.col };
      },
      getTargetCell: () => {
        const t = this.graphEngine.targetCell;
        if (!t) return t;
        return { row: t.row, col: t.col, r: t.row, c: t.col };
      },
      // Returns walkable neighbors only (walls are excluded), with terrain weight.
      getGridNeighbors: (r, c) => {
        const weights = this.graphEngine.terrainWeights || { empty: 1, grass: 2, sand: 4, mud: 8 };
        return this.graphEngine.getGridNeighbors(r, c)
          .filter(cell => cell.type !== 'wall')
          .map(cell => {
            const terrain = cell.terrain || 'empty';
            const weight = weights[terrain] ?? 1;
            return {
              row: cell.row, col: cell.col, r: cell.row, c: cell.col,
              type: cell.type, distance: cell.distance,
              terrain: terrain, weight: weight
            };
          });
      },

      sleep: async (ms) => {
        await this.sleep(ms);
      },

      log: (msg) => {
        this.log(`${tag} ${msg}`);
      },

      markSorted: (i) => {
        renderer.markSorted(i);
      }
    }
  }

  // ── Execute User JavaScript Code ──────────────────────────────────────
  // Execute user JavaScript code via Function constructor (injects API functions)
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
    // Reset graph/grid visual state before each run so stale colors from
    // a previous run don't bleed through.
    if (isA) {
      if (category === 'graph') {
        this.graphEngine.resetGraphState();
        this.graphRenderer.render();
      } else if (category === 'grid') {
        this.graphEngine.resetGridState();
        this.gridRenderer.render();
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
        'visitEdge', 'updateDistance', 'getStartNode', 'getTargetNode',
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
        api.getGridNeighbors,
        api.visitEdge,
        api.updateDistance,
        api.getStartNode,
        api.getTargetNode
      );
      if (result && Array.isArray(result)) {
        runtimeArr = result;
      }
    }

    if (this._runGeneration === runGen && !this.shouldStop) {
      if (category === "sort" || category === "search") {
        if (isA) {
          this.array = [...runtimeArr];
          this.renderer.render(this.array);
          this.stats.endTime = this.stats.endTime || Date.now();
        } else {
          this.arrayB = [...runtimeArr];
          this.rendererB.render(this.arrayB);
          this.statsB.endTime = this.statsB.endTime || Date.now();
        }
      } else if (category === "graph") {
        this.graphRenderer.render();
      } else if (category === "grid") {
        this.gridRenderer.render();
      }
      this.updateStats();
    }
  }

  // ── Async Sleep Function ──────────────────────────────────────────────
  // Async sleep with pause/step-mode support (respects speed setting)
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

  // ── Shareable State ────────────────────────────────────────────────────
  // Copy shareable URL to clipboard
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

  getTheoreticalComplexity(algo) {
    const n = this.currentCategory === "graph"
      ? (this.graphEngine.nodes.length || 8)
      : this.currentCategory === "grid"
        ? (this.graphEngine.gridRows * this.graphEngine.gridCols || 375)
        : (this.array.length || 20);
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
      // Graph & Grid Algorithms
      bfs:           { best: 'O(V+E)', avg: 'O(V+E)',     worst: 'O(V+E)',     fn: x => x * 2.5 },
      dfs:           { best: 'O(V+E)', avg: 'O(V+E)',     worst: 'O(V+E)',     fn: x => x * 2.5 },
      dijkstra:      { best: 'O(E log V)', avg: 'O(E log V)', worst: 'O(E log V)', fn: x => x * Math.log2(x || 1) },
      astar:         { best: 'O(1)', avg: 'O(E)',        worst: 'O(E log V)', fn: x => x * 1.8 },
      bellman_ford:  { best: 'O(E)', avg: 'O(V·E)',     worst: 'O(V·E)',     fn: x => x * x },
      prim:          { best: 'O(E log V)', avg: 'O(E log V)', worst: 'O(E log V)', fn: x => x * Math.log2(x || 1) },
      kruskal:       { best: 'O(E log E)', avg: 'O(E log E)', worst: 'O(E log E)', fn: x => x * Math.log2(x || 1) },
      toposort:      { best: 'O(V+E)', avg: 'O(V+E)',     worst: 'O(V+E)',     fn: x => x * 2.0 },
    };
    return complexities[algo] || complexities.bubble;
  }

  encodeState() {
    const state = {
      cat: this.currentCategory,
      lang: this.currentLanguage,
      algo: this.currentAlgorithm,
      algoB: this.currentAlgorithmB,
      race: this.raceMode,
      speed: this.speed,
      size: this.elements.arraySizeInput ? parseInt(this.elements.arraySizeInput.value) : 20,
      preset: this.elements.presetSelect ? this.elements.presetSelect.value : "random",
      code: this.elements.editor ? this.elements.editor.value : '',
    };
    const json = JSON.stringify(state);
    const b64 = btoa(json);
    const url = new URL(window.location.href);
    url.searchParams.set("state", b64);
    return url.toString();
  }

  loadFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      const b64 = params.get("state");
      if (!b64) return false;
      const json = atob(b64);
      const state = JSON.parse(json);
      if (state.cat) {
        this.currentCategory = state.cat;
        if (this.elements.categorySelect) this.elements.categorySelect.value = state.cat;
      }
      if (state.lang) {
        this.currentLanguage = state.lang;
        if (this.elements.languageSelect) this.elements.languageSelect.value = state.lang;
      }
      if (state.algo) {
        this.currentAlgorithm = state.algo;
        if (this.elements.algorithmSelect) this.elements.algorithmSelect.value = state.algo;
      }
      if (state.algoB) {
        this.currentAlgorithmB = state.algoB;
        if (this.elements.algorithmSelectB) this.elements.algorithmSelectB.value = state.algoB;
      }
      if (state.race != null) {
        this.raceMode = Boolean(state.race);
        if (this.elements.raceToggle) this.elements.raceToggle.checked = this.raceMode;
      }
      if (state.speed) {
        this.speed = state.speed;
        if (this.elements.speedSlider) this.elements.speedSlider.value = state.speed;
        if (this.elements.speedValue) this.elements.speedValue.textContent = state.speed + "ms";
      }
      if (state.size && this.elements.arraySizeInput) {
        this.elements.arraySizeInput.value = state.size;
      }
      if (state.preset && this.elements.presetSelect) {
        this.elements.presetSelect.value = state.preset;
      }
      this.onCategoryChange();
      // Restore custom editor code AFTER onCategoryChange() (which may overwrite it with a template)
      if (state.code && this.elements.editor) {
        this.elements.editor.value = state.code;
      }
      return true;
    } catch (e) {
      console.warn("Failed to load state from URL:", e);
      return false;
    }
  }

  shareState() {
    const url = this.encodeState();
    navigator.clipboard.writeText(url).then(() => {
      this.showToast('Share URL copied to clipboard!');
      this.log('Shareable URL copied: ' + url);
    }).catch(() => {
      // Fallback for non-HTTPS
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this.showToast('Share URL copied to clipboard!');
      this.log('Shareable URL copied: ' + url);
    });
  }

  // ── Complexity Overlay ────────────────────────────────────────────────
  // Initialize complexity chart overlay (hidden by default)
  initComplexityOverlay() {
    const existing = document.getElementById('complexity-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'complexity-overlay';
    overlay.innerHTML = `
      <div class="complexity-header">
        <span class="complexity-title">Complexity Monitor</span>
        <button class="complexity-close" title="Close">✕</button>
      </div>
      <canvas id="complexity-canvas" width="300" height="240"></canvas>
      <div class="complexity-legend" id="complexity-legend"></div>
    `;
    
    document.body.appendChild(overlay);

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

  // Reset complexity tracking data arrays
  resetComplexityData() {
    this.complexityDataA = [];
    this.complexityDataB = [];
  }

  // Show complexity overlay and render chart
  showComplexityOverlay() {
    if (!this.complexityOverlay) this.initComplexityOverlay();
    this.complexityOverlay.classList.add('visible');
    this.renderComplexityChart();
  }

  // Hide complexity overlay
  hideComplexityOverlay() {
    if (this.complexityOverlay) this.complexityOverlay.classList.remove('visible');
  }

  updateComplexityData() {
    if (!this.complexityDataA) this.complexityDataA = [];
    if (!this.complexityDataB) this.complexityDataB = [];
    // For graph/grid, operations = steps (no comparisons/swaps in the traditional sense)
    // For sort/search, operations = comparisons + swaps
    const getOps = (s) => {
      const cat = this.currentCategory;
      return (cat === 'graph' || cat === 'grid') ? s.steps : (s.comparisons + s.swaps);
    };
    this.complexityDataA.push(getOps(this.stats));
    if (this.raceMode) {
      this.complexityDataB.push(getOps(this.statsB));
    }
    if (this.complexityCanvas && this.complexityOverlay?.classList.contains('visible')) {
      this.renderComplexityChart();
    }
  }

  // Render the complexity chart (theoretical vs actual operations)
  renderComplexityChart() {
    const ctx = this.complexityCtx;
    if (!ctx) return;
    if (!this.complexityDataA) this.complexityDataA = [];
    if (!this.complexityDataB) this.complexityDataB = [];
    const canvas = this.complexityCanvas;
    const isRace = !!this.raceMode;
    const overlayW = this.complexityOverlay ? this.complexityOverlay.clientWidth : 300;
    const baseW = Math.max(220, Math.min(isRace ? 340 : 300, overlayW || 300));
    const baseH = Math.max(180, Math.min(240, Math.round(baseW * 0.75)));

    // HiDPI / devicePixelRatio scaling
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== baseW * dpr || canvas.style.width !== baseW + 'px') {
      canvas.width = baseW * dpr;
      canvas.height = baseH * dpr;
      canvas.style.width = baseW + 'px';
      canvas.style.height = baseH + 'px';
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const W = baseW, H = baseH;
    const pad = { top: 14, right: 18, bottom: 34, left: 54 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    const n = this.currentCategory === "graph"
      ? (this.graphEngine.nodes.length || 8)
      : this.currentCategory === "grid"
        ? (this.graphEngine.gridRows * this.graphEngine.gridCols || 375)
        : (this.array.length || 20);
    const complexityA = this.getTheoreticalComplexity(this.currentAlgorithm);
    const complexityB = isRace ? this.getTheoreticalComplexity(this.currentAlgorithmB) : null;
    const theoreticalMaxA = complexityA.fn(n);
    const theoreticalMaxB = complexityB ? complexityB.fn(n) : 0;
    // For graph/grid, the meaningful metric is steps (nodes visited), not comp+swap.
    const _chartOps = (s) => (this.currentCategory === 'graph' || this.currentCategory === 'grid')
      ? s.steps : (s.comparisons + s.swaps);
    const finalOpsA = _chartOps(this.stats);
    const finalOpsB = isRace ? _chartOps(this.statsB) : 0;
    const actualMax = Math.max(
      theoreticalMaxA * 1.05,
      theoreticalMaxB * 1.05,
      ...this.complexityDataA,
      ...(this.complexityDataB || []),
      finalOpsA,
      finalOpsB,
      1
    );

    const totalSteps = Math.max(this.complexityDataA.length, this.complexityDataB?.length || 0, 1);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#60a5fa';
    const colorB = '#a78bfa';
    const muted = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#9fb0c8';

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (plotH * i / 5);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    }
    // X-axis base line
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top + plotH + 0.5);
    ctx.lineTo(W - pad.right, pad.top + plotH + 0.5);
    ctx.stroke();

    // Theoretical curve — A (dashed, A's color)
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = accent + '88';
    ctx.beginPath();
    for (let i = 0; i <= plotW; i++) {
      const progress = i / plotW;
      const curN = Math.max(1, Math.floor(progress * n));
      const val = complexityA.fn(curN);
      const x = pad.left + i;
      const y = pad.top + plotH - Math.min(1, val / actualMax) * plotH;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Theoretical curve — B (dashed, B's color, race mode)
    if (isRace && complexityB) {
      ctx.strokeStyle = colorB + '88';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i <= plotW; i++) {
        const progress = i / plotW;
        const curN = Math.max(1, Math.floor(progress * n));
        const val = complexityB.fn(curN);
        const x = pad.left + i;
        const y = pad.top + plotH - Math.min(1, val / actualMax) * plotH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Actual operations curve — Side A
    if (this.complexityDataA.length > 0) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.4;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < totalSteps; i++) {
        const dataIdx = Math.min(i, this.complexityDataA.length - 1);
        const val = this.complexityDataA[dataIdx];
        const x = pad.left + (totalSteps <= 1 ? 0 : (i / (totalSteps - 1)) * plotW);
        const y = pad.top + plotH - Math.min(1, val / actualMax) * plotH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Actual operations curve — Side B (race mode)
    if (isRace && this.complexityDataB && this.complexityDataB.length > 0) {
      ctx.strokeStyle = colorB;
      ctx.lineWidth = 2.4;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < totalSteps; i++) {
        const dataIdx = Math.min(i, this.complexityDataB.length - 1);
        const val = this.complexityDataB[dataIdx];
        const x = pad.left + (totalSteps <= 1 ? 0 : (i / (totalSteps - 1)) * plotW);
        const y = pad.top + plotH - Math.min(1, val / actualMax) * plotH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = muted;
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Progress (steps) →', pad.left + plotW / 2, H - 10);
    ctx.save();
    ctx.translate(14, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    const _yLabel = (this.currentCategory === 'graph' || this.currentCategory === 'grid')
      ? 'Steps / nodes visited' : 'Operations (comp + swap)';
    ctx.fillText(_yLabel, 0, 0);
    ctx.restore();

    // Y-axis scale marks (5 ticks)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = muted;
    ctx.font = '9px Inter, system-ui, sans-serif';
    for (let i = 0; i <= 5; i++) {
      const ratio = i / 5;
      const y = pad.top + plotH - ratio * plotH;
      const val = Math.round(ratio * actualMax);
      ctx.fillText(val.toString(), pad.left - 6, y);
      // small tick
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left - 3, y);
      ctx.lineTo(pad.left, y);
      ctx.stroke();
    }
    ctx.textBaseline = 'alphabetic';

    // Legend
    const legend = document.getElementById('complexity-legend');
    if (legend) {
      const algoName = this.elements.algorithmSelect?.selectedOptions?.[0]?.textContent || this.currentAlgorithm;

      // Row 1: dashed "Theory" indicators
      let html = `<div style="display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;">`;
      html += `<span class="legend-item"><span class="legend-line-dashed" style="border-top-color: ${accent}99"></span>Theory A</span>`;
      if (isRace) {
        html += `<span class="legend-item"><span class="legend-line-dashed" style="border-top-color: ${colorB}99"></span>Theory B</span>`;
      }
      html += `</div>`;

      // Row 2: algo name + complexity chips
      html += `<div style="display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;margin-top:4px;">`;
      html += `<span class="legend-item"><span class="legend-dot" style="background: ${accent}"></span>${algoName} <span style="opacity:.55">(${complexityA.avg})</span></span>`;
      if (isRace) {
        const algoBName = this.elements.algorithmSelectB?.selectedOptions?.[0]?.textContent || this.currentAlgorithmB;
        const cxB = complexityB ? complexityB.avg : '?';
        html += `<span class="legend-item"><span class="legend-dot" style="background: ${colorB}"></span>${algoBName} <span style="opacity:.55">(${cxB})</span></span>`;
      }
      html += `</div>`;

      // Stats summary line
      html += `<div style="margin-top:6px;padding-top:6px;border-top:1px dashed rgba(255,255,255,0.08);display:flex;flex-wrap:wrap;gap:6px 14px;font-size:10.5px;">`;
      if (isRace) {
        const stepsA = this.stats.steps, compsA = this.stats.comparisons, swapsA = this.stats.swaps;
        const stepsB = this.statsB.steps, compsB = this.statsB.comparisons, swapsB = this.statsB.swaps;
        html += `<span style="color:${accent}"><b>A</b> Steps ${stepsA} · Comp ${compsA} · Swap ${swapsA}</span>`;
        html += `<span style="color:${colorB}"><b>B</b> Steps ${stepsB} · Comp ${compsB} · Swap ${swapsB}</span>`;
        const opsA = compsA + swapsA, opsB = compsB + swapsB;
        if (opsA > 0 || opsB > 0) {
          const diff = opsB - opsA;
          let label = '';
          if (diff > 0) label = `<span style="color:var(--ok)">▲+${diff} more ops by B</span>`;
          else if (diff < 0) label = `<span style="color:var(--danger)">▼${diff} less ops by B</span>`;
          else label = `<span style="color:${muted}">Tied</span>`;
          html += `<span style="width:100%;margin-top:2px;">${label}</span>`;
        }
      } else {
        const s = this.stats;
        html += `<span style="color:${accent};font-weight:600;">Steps: ${s.steps}</span>`;
        html += `<span style="color:${muted}">Comparisons: ${s.comparisons}</span>`;
        html += `<span style="color:${muted}">Swaps: ${s.swaps}</span>`;
        html += `<span style="color:${muted};opacity:.8">Chart plots: Comp + Swap</span>`;
      }
      html += `</div>`;
      legend.innerHTML = html;
    }
  }

  // ── Pseudocode Panel Rendering & Line Highlighting ─────────────────
  // Map algo ID → array of lines (for legacy getPseudocode) — prefer PseudocodeManager
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

  /**
   * Return the 1-based pseudocode line number for a given operation type,
   * keyed on the CURRENT category + algorithm (or side-B algorithm for race).
   * Falls back to line 1 if nothing matches.
   */
  getOpLineNumber(opType, side = 'a') {
    const cat  = this.currentCategory;
    const algo = side === 'b' ? this.currentAlgorithmB : this.currentAlgorithm;
    const map = {
      sort: {
        _default:  { compare: 3, swap: 4, found: 4 },
        bubble:    { compare: 3, swap: 4, found: 4 },
        selection: { compare: 4, swap: 6, found: 6 },
        insertion: { compare: 4, swap: 5, found: 5 },
        merge:     { compare: 3, swap: 3, found: 3 },
        quick:     { compare: 2, swap: 2, found: 2 },
        heap:      { compare: 2, swap: 4, found: 4 },
        shell:     { compare: 5, swap: 6, found: 6 },
        cocktail:  { compare: 5, swap: 5, found: 5 },
        counting:  { compare: 3, swap: 6, found: 6 },
        radix:     { compare: 4, swap: 4, found: 4 },
      },
      search: {
        _default:      { compare: 2, found: 3, swap: 2 },
        linear:        { compare: 2, found: 3, swap: 2 },
        binary:        { compare: 3, found: 4, swap: 3 },
        interpolation: { compare: 3, found: 4, swap: 3 },
        exponential:   { compare: 3, found: 3, swap: 3 },
        ternary:       { compare: 5, found: 5, swap: 5 },
      },
      graph: {
        _default:     { visitNode: 4, visitEdge: 5, markPath: 4, updateDistance: 5, compare: 4, swap: 4, found: 4 },
        bfs:          { visitNode: 4, visitEdge: 5, markPath: 4, updateDistance: 5, compare: 4, swap: 4, found: 4 },
        dfs:          { visitNode: 5, visitEdge: 6, markPath: 5, updateDistance: 5, compare: 5, swap: 5, found: 5 },
        dijkstra:     { visitNode: 5, visitEdge: 6, markPath: 9, updateDistance: 8, compare: 7, swap: 5, found: 5 },
        astar:        { visitNode: 4, visitEdge: 7, markPath: 5, updateDistance: 10, compare: 7, swap: 4, found: 5 },
        bellman_ford: { visitNode: 3, visitEdge: 3, markPath: 5, updateDistance: 5, compare: 4, swap: 4, found: 4 },
        prim:         { visitNode: 6, visitEdge: 4, markPath: 6, updateDistance: 6, compare: 4, swap: 4, found: 4 },
        kruskal:      { visitNode: 4, visitEdge: 3, markPath: 6, updateDistance: 5, compare: 3, swap: 3, found: 3 },
        toposort:     { visitNode: 5, visitEdge: 6, markPath: 5, updateDistance: 7, compare: 5, swap: 5, found: 5 },
      },
      grid: {
        _default: { visitGridCell: 3, markPath: 3, compare: 3, swap: 3, found: 4 },
        bfs:      { visitGridCell: 3, markPath: 3, compare: 3, swap: 3, found: 4 },
        dfs:      { visitGridCell: 4, markPath: 3, compare: 3, swap: 3, found: 4 },
        dijkstra: { visitGridCell: 3, markPath: 3, compare: 3, swap: 3, found: 4 },
        astar:    { visitGridCell: 4, markPath: 4, compare: 4, swap: 4, found: 5 },
      }
    };
    const catMap  = map[cat]  || map.sort;
    const algoMap = catMap[algo] || catMap._default || {};
    const defMap  = catMap._default || {};
    return (algoMap[opType] ?? defMap[opType]) || 1;
  }

  highlightPseudocode(lineNumOrOpType, side = 'a') {
    const targetBody = side === 'b' ? this.elements.pseudocodeBodyB : this.elements.pseudocodeBody;
    if (!targetBody) return;

    const lineNum = typeof lineNumOrOpType === 'number'
      ? lineNumOrOpType
      : this.getOpLineNumber(lineNumOrOpType, side);

    this.pseudocodeManager.highlightLine(targetBody, lineNum);
    if (side === 'a') this.currentPseudocodeLine = lineNum;
  }

  // ── Snapshot System (Undo / Redo Step Back / Forward) ─────────────────
  // History stack (undo), Future stack (redo). Max 500 entries each.
  // Snapshots capture: arrays, stats, complexity data, sorted sets, graph/grid state, pseudocode line.

  /** Push a new live snapshot (algorithm advancing). Clears redo stack. */
  saveSnapshot(tag = 'step') {
    if (this.history.length > 500) this.history.shift();
    this.future = [];
    this.history.push(this._captureSnapshot(tag));
    this.updateStepNavButtons();
  }

  /** Serialize ALL visual state into a plain object for later restore. */
  _captureSnapshot(tag = 'step') {
    return {
      category: this.currentCategory,
      array: [...this.array],
      arrayB: [...this.arrayB],
      stats: { ...this.stats },
      statsB: { ...this.statsB },
      complexityDataA: [...(this.complexityDataA || [])],
      complexityDataB: [...(this.complexityDataB || [])],
      sortedIndices: new Set(this.renderer.sortedIndices || []),
      sortedIndicesB: this.rendererB ? new Set(this.rendererB.sortedIndices || []) : new Set(),
      graphNodes: this.currentCategory === "graph" ? JSON.parse(JSON.stringify(this.graphEngine.nodes)) : null,
      graphEdges: this.currentCategory === "graph" ? JSON.parse(JSON.stringify(this.graphEngine.edges)) : null,
      grid: this.currentCategory === "grid" ? JSON.parse(JSON.stringify(this.graphEngine.grid)) : null,
      pseudocodeLine: this.currentPseudocodeLine,
      tag: tag
    };
  }

  /** Restore all visual state from a previously captured snapshot. */
  _applySnapshot(snap) {
    if (!snap) return;
    this.array = [...snap.array];
    this.arrayB = [...snap.arrayB];
    this.stats = { ...snap.stats };
    this.statsB = { ...snap.statsB };
    this.complexityDataA = [...(snap.complexityDataA || [])];
    this.complexityDataB = [...(snap.complexityDataB || [])];
    if (this.renderer.sortedIndices) this.renderer.sortedIndices = new Set(snap.sortedIndices);
    if (this.rendererB && this.rendererB.sortedIndices) this.rendererB.sortedIndices = new Set(snap.sortedIndicesB);

    if (snap.category === "graph" && snap.graphNodes) {
      this.graphEngine.nodes = JSON.parse(JSON.stringify(snap.graphNodes));
      this.graphEngine.edges = JSON.parse(JSON.stringify(snap.graphEdges));
      this.graphRenderer.render();
    } else if (snap.category === "grid" && snap.grid) {
      this.graphEngine.grid = JSON.parse(JSON.stringify(snap.grid));
      this.gridRenderer.render();
    } else {
      this.renderer.render(this.array);
      if (this.raceMode && this.rendererB) this.rendererB.render(this.arrayB);
    }

    this.updateStats();
    if (this.complexityCanvas && this.complexityOverlay?.classList.contains('visible')) {
      this.renderComplexityChart();
    }
    if (this.elements.pseudocodeBody) {
      this.pseudocodeManager.highlightLine(this.elements.pseudocodeBody, snap.pseudocodeLine);
      this.currentPseudocodeLine = snap.pseudocodeLine;
    }
  }

  /** Pop one snapshot from history (undo). Aborts live run if active. */
  stepBack() {
    if (this.history.length <= 1) {
      this.showToast("At starting state - cannot step back further.");
      return;
    }

    if (this.isRunning) {
      this.shouldStop = true;
      this.isPaused = true;
      this._generation += 1;
      this.elements.pauseBtn.style.display = "none";
      this.elements.resumeBtn.style.display = this.stepMode ? "none" : "inline-block";
    }
    this.isRunning = false;
    this.elements.runBtn.style.display = "inline-block";

    const current = this.history.pop();
    if (current) {
      if (this.future.length > 500) this.future.shift();
      this.future.push(current);
    }
    const prev = this.history[this.history.length - 1];
    this._applySnapshot(prev);

    this.updateStepNavButtons();
    this.log("Stepped back one operation");
  }

  /** Pop one snapshot from future (redo). Aborts live run if active. */
  stepForward() {
    if (this.future.length === 0) {
      this.showToast("No redo steps available.");
      return;
    }
    if (this.isRunning) {
      this.shouldStop = true;
      this.isPaused = true;
      this._generation += 1;
      this.elements.pauseBtn.style.display = "none";
    }
    this.isRunning = false;
    this.elements.runBtn.style.display = "inline-block";

    const next = this.future.pop();
    this.history.push(next);
    this._applySnapshot(next);

    this.updateStepNavButtons();
    this.log("Stepped forward one operation");
  }

  /** Toggle visibility of Step Back / Forward buttons based on stack depths. */
  updateStepNavButtons() {
    if (this.elements.stepBackBtn) {
      const canBack = this.history.length > 1;
      this.elements.stepBackBtn.style.display = canBack ? "inline-block" : "none";
    }
    if (this.elements.stepForwardBtn) {
      const canForward = this.future.length > 0;
      this.elements.stepForwardBtn.style.display = canForward ? "inline-block" : "none";
    }
  }
}

// Global instance
let visualizer;