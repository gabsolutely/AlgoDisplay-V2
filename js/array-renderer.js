/**
 * array-renderer.js — DOM bar-graph renderer for sort + search visualizations.
 *
 * No framework: just creates `.bar` divs with inline styles. Owns two sticky
 * state sets (sortedIndices / foundIndices) so an algorithm can call `markSorted`
 * or `markFound` once and subsequent `render()` calls preserve the styling.
 */

class ArrayRenderer {
  constructor() {
    this.container = null;          // parent HTMLElement that holds bars
    this.bars = [];                 // parallel array of bar HTMLElements (1:1 with data array)
    this.sortedIndices = new Set(); // indices permanently styled as sorted (green)
    this.foundIndices  = new Set(); // indices permanently styled as found (pulsing red)
  }

  /**
   * Attach the renderer to a DOM container. Called once from the visualizer
   * constructor / onCategoryChange.
   * @param {HTMLElement} container
   */
  init(container) {
    this.container = container;
    console.log("Array renderer initialized");
  }

  /**
   * Full redraw: delete all existing bars and rebuild from `array`.
   * Preserves sorted/found highlight state via the sticky sets.
   * @param {number[]} array
   */
  render(array) {
    if (!this.container || !array || array.length === 0) {
      if (this.container) this.container.innerHTML = "";
      return;
    }

    this.container.innerHTML = "";
    this.bars = [];

    const maxValue = Math.max(...array, 1);                       // guard against empty/zero
    const containerHeight = 280;                                  // fixed inner height (matches CSS)
    const containerWidth  = this.container.offsetWidth || 800;
    const barWidth = Math.max(4, Math.floor((containerWidth - (array.length * 4)) / array.length));

    array.forEach((value, index) => {
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = (value / maxValue * containerHeight) + "px";
      bar.style.width  = barWidth + "px";
      bar.setAttribute("data-value", value);
      bar.setAttribute("data-index", index);

      // Sticky state overrides default bar color.
      if      (this.foundIndices.has(index))  bar.classList.add('found');
      else if (this.sortedIndices.has(index)) bar.classList.add('active');

      bar.style.transition = 'height 0.3s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease';
      bar.style.borderRadius = '4px 4px 0 0';
      bar.style.margin        = '0 2px';
      bar.style.display       = 'inline-block';
      bar.style.verticalAlign = 'bottom';
      bar.style.flexShrink    = '0';

      this.container.appendChild(bar);
      this.bars.push(bar);
    });
  }

  /**
   * Redraw then add per-index ephemeral highlighting (comparing/swapping).
   * Used from the viz API on every compare/swap step.
   *
   * @param {number[]} array
   * @param {number[]} indices   - indices to highlight
   * @param {string}   type      - 'comparing' | 'swapping'
   */
  renderWithHighlight(array, indices = [], type = 'comparing') {
    if (!this.container || !array || array.length === 0) {
      if (this.container) this.container.innerHTML = "";
      return;
    }

    this.render(array);

    // Clear ephemeral classes but keep sticky sorted/found state.
    this.bars.forEach(bar => {
      bar.classList.remove('comparing', 'swapping', 'active', 'sorted');
      const idx = parseInt(bar.getAttribute("data-index"));
      if (this.sortedIndices.has(idx)) bar.classList.add('active');
      if (this.foundIndices.has(idx))  bar.classList.add('found');
    });

    indices.forEach(index => {
      if (this.bars[index] && !this.foundIndices.has(index)) {
        this.bars[index].classList.add(type);
      }
    });
  }

  /**
   * Permanently mark index `i` as part of the sorted result.
   * Called post-completion sweep or during in-place sort algorithms.
   */
  markSorted(index) {
    this.sortedIndices.add(index);
    if (this.bars[index]) {
      this.bars[index].classList.add('active');
    }
  }

  /**
   * Permanently mark index `i` as the found target (search algos).
   * Adds a subtle lift + scale so it visually pops from the bar chart.
   */
  markFound(index) {
    this.foundIndices.add(index);
    if (this.bars[index]) {
      this.bars[index].classList.remove('comparing', 'swapping');
      this.bars[index].classList.add('found');
      this.bars[index].style.zIndex    = '20';
      this.bars[index].style.transform = 'translateY(-6px) scale(1.08)';
    }
  }

  /**
   * Animate a swap using `getBoundingClientRect` translation.
   * Order of operations is critical:
   *   1. Swap VALUES in the data array FIRST (so indices map correctly).
   *   2. Measure the VISUAL distance between the two current bar rects.
   *   3. Apply translateX transform to create the "slide" illusion.
   *   4. After the animation: clear transforms, re-assign heights from data.
   *
   * @param {number[]} array    - MUTATED: values at [i] and [j] are swapped.
   * @param {number}   i
   * @param {number}   j
   * @param {number}   duration - ms
   */
  async animatedSwap(array, i, j, duration = 100) {
    if (!this.bars[i] || !this.bars[j] || i === j) return;

    const bar1 = this.bars[i];
    const bar2 = this.bars[j];

    const originalTransform1 = bar1.style.transform;
    const originalTransform2 = bar2.style.transform;

    // Swap the data values first so the rest of the algorithm sees them.
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;

    bar1.classList.add('swapping');
    bar2.classList.add('swapping');

    const bar1Rect = bar1.getBoundingClientRect();
    const bar2Rect = bar2.getBoundingClientRect();

    bar1.style.transition = `transform ${duration}ms ease`;
    bar2.style.transition = `transform ${duration}ms ease`;

    const distance1 = bar2Rect.left - bar1Rect.left;
    const distance2 = bar1Rect.left - bar2Rect.left;

    bar1.style.transform = `translateX(${distance1}px)`;
    bar2.style.transform = `translateX(${distance2}px)`;

    await new Promise(resolve => setTimeout(resolve, duration));

    // Reset transforms + heights to match the NEW (swapped) data order.
    bar1.style.transition = 'none';
    bar2.style.transition = 'none';
    bar1.style.transform  = originalTransform1;
    bar2.style.transform  = originalTransform2;
    bar1.classList.remove('swapping');
    bar2.classList.remove('swapping');

    const maxValue = Math.max(...array, 1);
    const containerHeight = 280;

    bar1.style.height = (array[i] / maxValue * containerHeight) + "px";
    bar1.setAttribute('data-value', array[i]);

    bar2.style.height = (array[j] / maxValue * containerHeight) + "px";
    bar2.setAttribute('data-value', array[j]);
  }

  /** Wipe everything back to a blank container. */
  clear() {
    if (this.container) {
      this.container.innerHTML = "";
    }
    this.bars = [];
    this.sortedIndices.clear();
    this.foundIndices.clear();
  }

  /**
   * In-place update of a single bar's height + (optionally) background color.
   * Used by algorithms that mutate one element at a time (e.g. counting sort).
   */
  updateBar(index, value, color = null) {
    if (this.bars[index]) {
      const maxValue = Math.max(...this.bars.map(bar => parseInt(bar.getAttribute('data-value'))), value);
      const containerHeight = 280;

      this.bars[index].style.height = (value / maxValue * containerHeight) + "px";
      this.bars[index].setAttribute('data-value', value);

      if (color) {
        this.bars[index].style.background = color;
      }
    }
  }
}
