// Main JavaScript for DimensionalAV
document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI elements
  initUI();
  
  // Start the visualizer
  initVisualizer();
});

// UI Initialization
function initUI() {
  // Setup sample audio dropdown
  const sampleAudioBtn = document.getElementById('sample-audio-btn');
  const sampleAudioDropdown = document.getElementById('sample-audio-dropdown');
  
  sampleAudioBtn.addEventListener('click', function() {
    sampleAudioDropdown.classList.toggle('show');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(event) {
    if (!event.target.matches('#sample-audio-btn') && !event.target.closest('#sample-audio-dropdown')) {
      sampleAudioDropdown.classList.remove('show');
    }
  });
  
  // Setup visualization buttons
  const visualizationButtons = document.querySelectorAll('.key-button');
  visualizationButtons.forEach(button => {
    button.addEventListener('click', function() {
      const key = this.getAttribute('data-key');
      // Simulate keyboard press
      handleVisualizationChange(key);
      
      // Update active button
      visualizationButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Show loading indicator
  const loading = document.getElementById('loading');
  window.addEventListener('load', function() {
    loading.style.display = 'none';
  });
  
  // Initialize tooltips
  const tooltips = document.querySelectorAll('[data-tooltip]');
  tooltips.forEach(tooltip => {
    tooltip.addEventListener('mouseover', function() {
      const tooltipText = this.getAttribute('data-tooltip');
      const tooltipEl = document.createElement('div');
      tooltipEl.className = 'tooltip';
      tooltipEl.textContent = tooltipText;
      document.body.appendChild(tooltipEl);
      
      const rect = this.getBoundingClientRect();
      tooltipEl.style.top = rect.bottom + 5 + 'px';
      tooltipEl.style.left = rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2) + 'px';
    });
    
    tooltip.addEventListener('mouseout', function() {
      const tooltips = document.querySelectorAll('.tooltip');
      tooltips.forEach(t => t.remove());
    });
  });
}

// Handle visualization change
function handleVisualizationChange(key) {
  // Create and dispatch a keyboard event
  const event = new KeyboardEvent('keydown', {
    key: key,
    bubbles: true
  });
  document.dispatchEvent(event);
}

// Load sample audio
function loadSampleAudio(url) {
  const audioFile = document.getElementById('audio-file');
  // Create a fetch request to get the audio file
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      // Create a File object from the blob
      const file = new File([blob], url.split('/').pop(), { type: 'audio/mp3' });
      
      // Create a DataTransfer object to create a file list
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      // Set the file input's files property
      audioFile.files = dataTransfer.files;
      
      // Dispatch a change event to trigger the file handler
      const event = new Event('change', { bubbles: true });
      audioFile.dispatchEvent(event);
    })
    .catch(error => {
      console.error('Error loading sample audio:', error);
    });
}
