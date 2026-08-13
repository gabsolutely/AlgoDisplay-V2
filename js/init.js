/**
 * init.js — Application bootstrap entry point.
 *
 * Waits for the DOM to be fully loaded, then instantiates the singleton
 * AlgorithmVisualizer and attaches it globally as `window.visualizer` so it
 * can be inspected / debugged from DevTools. Any catastrophic init failure
 * is caught and rendered inline in the #visualizer container so the user
 * isn't staring at a blank page.
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log("=== DOM LOADED - INITIALIZING ALGOVISUALIZER ===");

  try {
    // Singleton app instance — exposed on window for debugging (visualizer.runVisualization(), etc.)
    window.visualizer = new AlgorithmVisualizer();

    // Let renderers, sound manager, and DOM queries settle before we declare ready.
    // 500ms is conservative but ensures no race with browser layout.
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log("✅ AlgoDisplay initialized successfully!");

  } catch (error) {
    console.error("❌ Failed to initialize application:", error);

    // Render a friendly (and debuggable) error surface instead of a blank UI.
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
