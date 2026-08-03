// array-renderer.js
class ArrayRenderer {
  constructor() {
    this.container = null;
    this.bars = [];
    this.sortedIndices = new Set();
    this.foundIndices = new Set();
  }
  
  init(container) {
    this.container = container;
    console.log("Array renderer initialized");
  }
  
  render(array) {
    if (!this.container || !array || array.length === 0) {
      if (this.container) this.container.innerHTML = "";
      return;
    }
    
    this.container.innerHTML = "";
    this.bars = [];
    
    const maxValue = Math.max(...array, 1);
    const containerHeight = 280;
    const containerWidth = this.container.offsetWidth || 800;
    const barWidth = Math.max(4, Math.floor((containerWidth - (array.length * 4)) / array.length));
    
    array.forEach((value, index) => {
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = (value / maxValue * containerHeight) + "px";
      bar.style.width = barWidth + "px";
      bar.setAttribute("data-value", value);
      bar.setAttribute("data-index", index);
      
      if (this.foundIndices.has(index)) {
        bar.classList.add('found');
      } else if (this.sortedIndices.has(index)) {
        bar.classList.add('active');
      }
      
      bar.style.transition = 'height 0.3s ease, background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease';
      bar.style.borderRadius = '4px 4px 0 0';
      bar.style.margin = '0 2px';
      bar.style.display = 'inline-block';
      bar.style.verticalAlign = 'bottom';
      bar.style.flexShrink = '0';
      
      this.container.appendChild(bar);
      this.bars.push(bar);
    });
  }
  
  renderWithHighlight(array, indices = [], type = 'comparing') {
    if (!this.container || !array || array.length === 0) {
      if (this.container) this.container.innerHTML = "";
      return;
    }
    
    this.render(array);
    
    this.bars.forEach(bar => {
      bar.classList.remove('comparing', 'swapping', 'active', 'sorted');
      const idx = parseInt(bar.getAttribute("data-index"));
      if (this.sortedIndices.has(idx)) bar.classList.add('active');
      if (this.foundIndices.has(idx)) bar.classList.add('found');
    });
    
    indices.forEach(index => {
      if (this.bars[index] && !this.foundIndices.has(index)) {
        this.bars[index].classList.add(type);
      }
    });
  }
  
  markSorted(index) {
    this.sortedIndices.add(index);
    if (this.bars[index]) {
      this.bars[index].classList.add('active');
    }
  }

  markFound(index) {
    this.foundIndices.add(index);
    if (this.bars[index]) {
      this.bars[index].classList.remove('comparing', 'swapping');
      this.bars[index].classList.add('found');
      this.bars[index].style.zIndex = '20';
      this.bars[index].style.transform = 'translateY(-6px) scale(1.08)';
    }
  }
  
  async animatedSwap(array, i, j, duration = 100) {
    if (!this.bars[i] || !this.bars[j] || i === j) return;
    
    const bar1 = this.bars[i];
    const bar2 = this.bars[j];
    
    const originalTransform1 = bar1.style.transform;
    const originalTransform2 = bar2.style.transform;
    
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
    
    bar1.style.transition = 'none';
    bar2.style.transition = 'none';
    bar1.style.transform = originalTransform1;
    bar2.style.transform = originalTransform2;
    bar1.classList.remove('swapping');
    bar2.classList.remove('swapping');
    
    const maxValue = Math.max(...array, 1);
    const containerHeight = 280;
    
    bar1.style.height = (array[i] / maxValue * containerHeight) + "px";
    bar1.setAttribute('data-value', array[i]);
    
    bar2.style.height = (array[j] / maxValue * containerHeight) + "px";
    bar2.setAttribute('data-value', array[j]);
  }

  clear() {
    if (this.container) {
      this.container.innerHTML = "";
    }
    this.bars = [];
    this.sortedIndices.clear();
    this.foundIndices.clear();
  }

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
