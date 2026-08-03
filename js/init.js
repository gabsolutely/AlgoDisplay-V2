// init.js (init)
document.addEventListener('DOMContentLoaded', async () => {
  console.log("=== DOM LOADED - INITIALIZING ALGOVISUALIZER ===");
  
  try {
    // Create global visualizer instance
    window.visualizer = new AlgorithmVisualizer();
    
    // Wait for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log("✅ AlgoDisplay initialized successfully!");
    
  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
    
    // Show error to user
    const container = document.getElementById("visualizer");
    if (container) {
      container.innerHTML = `
        <div style="color: red; text-align: center; padding: 20px;">
          <h3>Initialization Error</h3>
          <p>Failed to initialize AlgoDisplay.</p>
          <p>Please refresh the page and try again.</p>
          <details style="margin-top: 10px;">
            <summary>Error Details</summary>
            <pre>${error.message}</pre>
          </details>
        </div>
      `;
    }
  }
});
