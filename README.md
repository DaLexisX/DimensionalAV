# DimensionalAV - 4D & 3D+3T Audio Visualizer

An interactive audio visualizer that responds to music in multiple dimensions, combining 4D and 3D+3T visualizations.

## Features

- **4D Visualizations**: Experience tesseract and 4D sphere visualizations that react to audio
- **3D+3T Visualizations**: Explore cube and sphere visualizations that rotate in 3 space and 3 time dimensions
- **Audio Reactivity**: All visualizations respond to different frequency ranges of your audio
- **Interactive Controls**: Switch between visualizations with keyboard controls
- **Customizable**: Adjust sensitivity to control how responsive the visualizations are to audio

## How to Use

1. Visit the [live demo](https://dalexisx.github.io/DimensionalAV/)
2. Upload an MP3 file using the file input at the bottom of the page
3. Press Play to start the audio and see the visualizations react
4. Use the keyboard controls to switch between visualizations:
   - **T**: 4D Tesseract (wireframe)
   - **S**: 4D Sphere with Lambertian shading
   - **C**: 3D+3T Cube
   - **U**: 3D+3T Sphere
5. Use your mouse to orbit, zoom, and pan the 3D scene

## Technical Details

The visualizer uses:
- Three.js for 3D rendering
- Web Audio API for audio analysis
- Custom 4D and 3D+3T rotation and projection algorithms

## License

MIT License
