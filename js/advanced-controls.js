// Advanced Controls for DimensionalAV
document.addEventListener('DOMContentLoaded', function() {
  // Initialize advanced controls
  initAdvancedControls();
});

function initAdvancedControls() {
  // Toggle advanced controls panel
  const toggleButton = document.getElementById('toggle-advanced-controls');
  const advancedPanel = document.getElementById('advanced-controls-panel');
  
  toggleButton.addEventListener('click', function() {
    advancedPanel.classList.toggle('hidden');
    toggleButton.textContent = advancedPanel.classList.contains('hidden') ? 
      'Advanced Controls ▼' : 'Advanced Controls ▲';
  });
  
  // Rotation speed control
  const rotationSpeed = document.getElementById('rotation-speed');
  rotationSpeed.addEventListener('input', function() {
    if (window.updateRotationSpeed) {
      window.updateRotationSpeed(parseFloat(this.value) / 5);
    }
  });
  
  // Color scheme control
  const colorScheme = document.getElementById('color-scheme');
  colorScheme.addEventListener('change', function() {
    if (window.updateColorScheme) {
      window.updateColorScheme(this.value);
    }
  });
  
  // Point size control
  const pointSize = document.getElementById('point-size');
  pointSize.addEventListener('input', function() {
    if (window.updatePointSize) {
      window.updatePointSize(parseFloat(this.value) / 250);
    }
  });
  
  // Expose these functions to the visualizer
  window.updateRotationSpeed = function(speedFactor) {
    // This function will be implemented in visualizer.js
    console.log('Rotation speed updated:', speedFactor);
  };
  
  window.updateColorScheme = function(scheme) {
    // This function will be implemented in visualizer.js
    console.log('Color scheme updated:', scheme);
  };
  
  window.updatePointSize = function(size) {
    // This function will be implemented in visualizer.js
    console.log('Point size updated:', size);
  };
  
  // Add stop button functionality
  const stopBtn = document.getElementById('stop-btn');
  if (stopBtn) {
    stopBtn.addEventListener('click', function() {
      if (window.stopAudio) {
        window.stopAudio();
      }
    });
  }
}
