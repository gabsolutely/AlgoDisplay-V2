// core.js (main class)
class AlgorithmVisualizer {
  constructor() {
    // Core state
    this.array = [];
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
      categorySelect: document.getElementById("category-select"),
      languageSelect: document.getElementById("language-select"),
      algorithmSelect: document.getElementById("algorithm-select"),
      presetSelect: document.getElementById("preset-select"),
      arraySizeInput: document.getElementById("array-size"),
      targetInput: document.getElementById("target-input"),
      searchSortToggle: document.getElementById("search-sort-toggle"),
      soundToggle: document.getElementById("sound-toggle"),
      musicalToggle: document.getElementById("musical-toggle"),
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
      helpBtn: document.getElementById("help-btn"),
      helpPanel: document.getElementById("help-panel"),
      searchOnlyGroups: Array.from(document.querySelectorAll(".search-only"))
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
      this.refreshAlgorithmOptions();
      this.setExampleCode();
    };

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
      ],
      search: [
        ["linear", "Linear Search"],
        ["binary", "Binary Search"],
        ["interpolation", "Interpolation Search"],
        ["exponential", "Exponential Search"],
        ["ternary", "Ternary Search"],
      ],
    };
    const list = opts[this.currentCategory] || opts.sort;
    select.innerHTML = "";
    list.forEach(([v, l]) => {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = l;
      select.appendChild(o);
    });
    this.currentAlgorithm = list[0][0];
    if (this.elements.searchOnlyGroups) {
      const show = this.currentCategory === "search";
      this.elements.searchOnlyGroups.forEach(el => {
        el.style.display = show ? "" : "none";
      });
    }
  }
  
  setExampleCode() {
    const language = this.currentLanguage;
    const category = this.currentCategory;
    const algorithm = this.currentAlgorithm;

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
  
  generatePreset(size, preset) {
    const base = () => Math.floor(Math.random() * 180) + 30;
    switch (preset) {
      case "nearly-sorted": {
        const arr = Array.from({ length: size }, (_, i) => i * 4 + 20);
        const swaps = Math.max(3, Math.floor(size * 0.3));
        for (let k = 0; k < swaps; k++) {
          const a = Math.floor(Math.random() * size);
          const spread = Math.max(6, Math.floor(size * 0.25));
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

    this.array = this.generatePreset(size, preset);

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

    this.updateStats();
    this.log(`Generated array of size ${size} (preset: ${preset})`);
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
    this.renderer.sortedIndices.clear();
    this.renderer.foundIndices.clear();
    
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

    const sortedRequiredByAlgo =
      this.currentCategory === "search" &&
      ["binary", "interpolation", "exponential", "ternary"].includes(this.currentAlgorithm);
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

    this.renderer.sortedIndices.clear();

    this.stats.comparisons = 0;
    this.stats.swaps = 0;
    this.stats.steps = 0;
    this.updateStats();

    this.elements.runBtn.style.display = "none";
    this.elements.pauseBtn.style.display = "inline-block";
    this.elements.resumeBtn.style.display = "none";

    const modeLabel =
      this.currentCategory === "search"
        ? `${this.currentAlgorithm} search`
        : `${this.currentAlgorithm} sort`;
    this.log(`Running ${this.currentLanguage} ${modeLabel}...`);

    try {
      const api = this.createVisualizationAPI();

      if (this.currentLanguage === 'javascript') {
        await this.runJavaScript(code, api, {
          category: this.currentCategory,
          target: this.searchTarget,
          searchSortedRequires: needsSortedArrayForSearch,
          sortedRequiredByAlgo: sortedRequiredByAlgo,
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

    } catch (error) {
      this.log("Error: " + error.message);
      console.error("Execution error:", error);

      if (error.message.includes("compare") || error.message.includes("swap")) {
        this.log("Tip: Make sure to use 'await' before visualization functions");
      } else if (error.message.includes("sort") || error.message.includes("search")) {
        this.log("Tip: For Python, use 'async def sort(arr):' or 'async def search(arr, target):'");
      }
    } finally {
      this.stats.endTime = Date.now();
      this.updateStats();
      this.isRunning = false;
      this.isPaused = false;

      this.elements.runBtn.style.display = "inline-block";
      this.elements.pauseBtn.style.display = "none";
      this.elements.resumeBtn.style.display = "none";
    }
  }
  
  createVisualizationAPI() {
    return {
      compare: async (i, j) => {
        if (this.shouldStop) return;
        this.stats.comparisons++;
        this.stats.steps++;
        this.updateStats();
        this.log(`Comparing indices ${i} and ${j}`);
        this.updateOperationInfo(`Comparing ${i} and ${j}`);
        this.renderer.renderWithHighlight(this.array, [i, j], 'comparing');
        const val1 = this.array[i], val2 = this.array[j];
        if (this.musicalMode) {
          this.sounds.playMusical(val1, val2, this.array);
        } else {
          this.sounds.play('compare');
        }
        await this.sleep(this.speed);
      },

      swap: async (arr, i, j) => {
        if (this.shouldStop) return;
        this.stats.swaps++;
        this.stats.steps++;
        this.updateStats();
        this.log(`Swapping indices ${i} and ${j}`);
        this.updateOperationInfo(`Swapping ${i} and ${j}`);
        await this.renderer.animatedSwap(arr, i, j, this.speed);
        this.array = [...arr];
        if (this.musicalMode) {
          this.sounds.playMusical(this.array[i], this.array[j], this.array);
        } else {
          this.sounds.play('swap');
        }
      },

      renderArray: async (arr) => {
        if (this.shouldStop) return;
        this.stats.steps++;
        this.updateStats();
        this.array = [...arr];
        this.renderer.render(this.array);
        await this.sleep(this.speed / 2);
      },

      markFound: async (i) => {
        if (this.shouldStop) return;
        this.log(`Found match at index ${i}`);
        this.updateOperationInfo(`Found at index ${i}`);
        this.renderer.markFound(i);
        this.sounds.play('complete');
        await this.sleep(this.speed);
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

  async runJavaScript(code, api, options = {}) {
    console.log("Running JavaScript code directly...");
    const category = options.category || "sort";
    const target = options.target;
    const runGen = this._runGeneration;

    let runtimeArr = [...this.array];

    if (category === "search" && options.searchSortedRequires) {
      runtimeArr.sort((a, b) => a - b);
      if (this._runGeneration === runGen && !this.shouldStop) {
        this.array = [...runtimeArr];
        this.renderer.foundIndices.clear();
        this.renderer.render(this.array);
        const forceReason = options.sortedRequiredByAlgo
          ? "Pre-sorted array (algorithm requires ordered input; Linear supports unordered)"
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
        api.markFound
      );
      if (result && Array.isArray(result)) {
        runtimeArr = result;
      }
    }

    if (this._runGeneration === runGen && !this.shouldStop) {
      this.array = [...runtimeArr];
      this.renderer.render(this.array);
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
}

// Global instance
let visualizer;