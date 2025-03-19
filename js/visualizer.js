// Main Visualizer JavaScript for DimensionalAV
(() => {
  //====================================================
  //=== Global Variables
  //====================================================
  let scene, camera, renderer, controls;
  let clock;
  let tesseractGroup, sphereGroup, cube3d3tGroup, sphere3d3tGroup;
  let audioContext, audioSource, analyser, audioData, audioElement;
  let isPlaying = false;
  let sensitivity = 5;
  let audioValues = [0, 0, 0, 0];
  let audioUpdateInterval = 1000 / 30;
  let lastAudioUpdate = 0;
  let fpsCounter;
  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 60;

  // Initialize the visualizer
  function initVisualizer() {
    // Setup performance monitoring
    setupPerformanceMonitoring();
    
    // Setup Three.js scene
    setupScene();
    
    // Create visualization groups
    createVisualizationGroups();
    
    // Setup 4D visualizations
    setup4DTesseract();
    setup4DSphere();
    
    // Setup 3D+3T visualizations
    setup3D3TCube();
    setup3D3TSphere();
    
    // Initialize audio
    initAudio();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start animation loop
    animate();
  }

  //====================================================
  //=== Performance Monitoring
  //====================================================
  function setupPerformanceMonitoring() {
    fpsCounter = document.getElementById('fps-counter');
  }
  
  function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;
    
    if (elapsed >= 1000) {
      fps = Math.round((frameCount * 1000) / elapsed);
      fpsCounter.textContent = `FPS: ${fps}`;
      frameCount = 0;
      lastTime = currentTime;
    }
  }

  //====================================================
  //=== Scene Setup
  //====================================================
  function setupScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 6);

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    clock = new THREE.Clock();
  }

  //====================================================
  //=== Visualization Groups
  //====================================================
  function createVisualizationGroups() {
    tesseractGroup = new THREE.Group();
    sphereGroup = new THREE.Group();
    cube3d3tGroup = new THREE.Group();
    sphere3d3tGroup = new THREE.Group();
    
    scene.add(tesseractGroup);
    scene.add(sphereGroup);
    scene.add(cube3d3tGroup);
    scene.add(sphere3d3tGroup);
    
    // Set initial visibility
    tesseractGroup.visible = true;
    sphereGroup.visible = false;
    cube3d3tGroup.visible = false;
    sphere3d3tGroup.visible = false;
  }

  //====================================================
  //=== 4D Tesseract Setup
  //====================================================
  let tesseractVertices4D = [];
  let tEdges = [];
  let tesseractEdges = [];
  let tesseractMaterial;
  let rotatedVertices = [];

  function setup4DTesseract() {
    // Build vertices in 4D
    for (let w = -1; w <= 1; w += 2) {
      for (let x = -1; x <= 1; x += 2) {
        for (let y = -1; y <= 1; y += 2) {
          for (let z = -1; z <= 1; z += 2) {
            tesseractVertices4D.push([w, x, y, z]);
          }
        }
      }
    }
    
    // Build edges: differ in exactly one coordinate
    for (let i = 0; i < tesseractVertices4D.length; i++) {
      for (let j = i + 1; j < tesseractVertices4D.length; j++) {
        const vA = tesseractVertices4D[i];
        const vB = tesseractVertices4D[j];
        let diffCount = 0;
        for (let k = 0; k < 4; k++) {
          if (vA[k] !== vB[k]) diffCount++;
        }
        if (diffCount === 1) {
          tEdges.push([i, j]);
        }
      }
    }

    // Use a single material for all edges
    tesseractMaterial = new THREE.LineBasicMaterial({color: 0xffffff});

    // Initialize edges with placeholder geometry
    tEdges.forEach(() => {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      const line = new THREE.Line(geom, tesseractMaterial);
      tesseractGroup.add(line);
      tesseractEdges.push(line);
    });
    
    // Pre-allocate rotated vertices array
    rotatedVertices = new Array(tesseractVertices4D.length);
    for (let i = 0; i < rotatedVertices.length; i++) {
      rotatedVertices[i] = [0, 0, 0, 0];
    }
  }

  //====================================================
  //=== 4D Sphere Setup
  //====================================================
  const NUM_SPHERE_POINTS = 2000;
  let spherePoints4D = [];
  let spherePositions, sphereColors, sphereGeom, sphereMat, spherePointsObj;

  function setup4DSphere() {
    // Generate random points on 4D sphere
    for (let i = 0; i < NUM_SPHERE_POINTS; i++) {
      spherePoints4D.push(random4DSpherePoint());
    }

    // Setup geometry and material
    spherePositions = new Float32Array(NUM_SPHERE_POINTS * 3);
    sphereColors = new Float32Array(NUM_SPHERE_POINTS * 3);

    sphereGeom = new THREE.BufferGeometry();
    sphereGeom.setAttribute('position', new THREE.BufferAttribute(spherePositions, 3));
    sphereGeom.setAttribute('color', new THREE.BufferAttribute(sphereColors, 3));

    sphereMat = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 1.0
    });

    spherePointsObj = new THREE.Points(sphereGeom, sphereMat);
    sphereGroup.add(spherePointsObj);
  }

  function random4DSpherePoint() {
    let w, x, y, z;
    do {
      w = Math.random()*2 - 1;
      x = Math.random()*2 - 1;
      y = Math.random()*2 - 1;
      z = Math.random()*2 - 1;
    } while (w*w + x*x + y*y + z*z === 0);

    const len = Math.sqrt(w*w + x*x + y*y + z*z);
    return [w/len, x/len, y/len, z/len];
  }

  //====================================================
  //=== 3D+3T Cube Setup
  //====================================================
  let cubeVerts3D = [];
  let cubeEdges = [];
  let cubeLines = [];
  let cubeVerts6D = [];
  let cubeMaterial;

  function setup3D3TCube() {
    // Define 3D cube vertices
    cubeVerts3D = [
      [-1,-1,-1],
      [-1,-1, 1],
      [-1, 1,-1],
      [-1, 1, 1],
      [ 1,-1,-1],
      [ 1,-1, 1],
      [ 1, 1,-1],
      [ 1, 1, 1],
    ];
    
    // Find edges
    for (let i = 0; i < cubeVerts3D.length; i++) {
      for (let j = i + 1; j < cubeVerts3D.length; j++) {
        const [x1, y1, z1] = cubeVerts3D[i];
        const [x2, y2, z2] = cubeVerts3D[j];
        let diffCount = 0;
        if (x1 !== x2) diffCount++;
        if (y1 !== y2) diffCount++;
        if (z1 !== z2) diffCount++;
        if (diffCount === 1) {
          cubeEdges.push([i, j]);
        }
      }
    }

    // Create lines for edges
    cubeMaterial = new THREE.LineBasicMaterial({color: 0xffffff});
    
    cubeEdges.forEach(() => {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
      const line = new THREE.Line(geom, cubeMaterial);
      cube3d3tGroup.add(line);
      cubeLines.push(line);
    });

    // Initialize 6D vertices (t1,t2,t3,x,y,z)
    cubeVerts6D = cubeVerts3D.map(([x, y, z]) => [0, 0, 0, x, y, z]);
  }

  //====================================================
  //=== 3D+3T Sphere Setup
  //====================================================
  const NUM_SPHERE_3D3T_POINTS = 2000;
  let sphereVerts6D = [];
  let sphere3d3tPositions, sphere3d3tColors, sphere3d3tGeom, sphere3d3tMat, sphere3d3tPoints;

  function setup3D3TSphere() {
    // Generate random points on 3D sphere
    for (let i = 0; i < NUM_SPHERE_3D3T_POINTS; i++) {
      const [x, y, z] = randomPointOn3DSphere();
      sphereVerts6D.push([0, 0, 0, x, y, z]);
    }

    // Setup geometry and material
    sphere3d3tPositions = new Float32Array(NUM_SPHERE_3D3T_POINTS * 3);
    sphere3d3tColors = new Float32Array(NUM_SPHERE_3D3T_POINTS * 3);

    sphere3d3tGeom = new THREE.BufferGeometry();
    sphere3d3tGeom.setAttribute('position', new THREE.BufferAttribute(sphere3d3tPositions, 3));
    sphere3d3tGeom.setAttribute('color', new THREE.BufferAttribute(sphere3d3tColors, 3));

    sphere3d3tMat = new THREE.PointsMaterial({
      size: 0.02,
      vertexColors: true,
      transparent: true,
      opacity: 1.0
    });
    
    sphere3d3tPoints = new THREE.Points(sphere3d3tGeom, sphere3d3tMat);
    sphere3d3tGroup.add(sphere3d3tPoints);
  }

  function randomPointOn3DSphere() {
    let x, y, z;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 2 - 1;
      z = Math.random() * 2 - 1;
    } while (x * x + y * y + z * z === 0);
    const len = Math.sqrt(x * x + y * y + z * z);
    return [x / len, y / len, z / len];
  }

  //====================================================
  //=== Audio Setup
  //====================================================
  function initAudio() {
    // Create audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create audio element
    audioElement = new Audio();
    audioElement.crossOrigin = "anonymous";
    
    // Create analyzer
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    audioData = new Uint8Array(bufferLength);
    
    // Setup event listeners
    document.getElementById('audio-file').addEventListener('change', handleFileSelect);
    document.getElementById('play-btn').addEventListener('click', playAudio);
    document.getElementById('pause-btn').addEventListener('click', pauseAudio);
    document.getElementById('sensitivity').addEventListener('input', (e) => {
      sensitivity = parseInt(e.target.value);
    });
  }
  
  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      const objectURL = URL.createObjectURL(file);
      loadAudio(objectURL);
    }
  }
  
  function loadAudio(url) {
    if (audioSource) {
      audioSource.disconnect();
    }
    
    audioElement.src = url;
    audioElement.load();
    
    // Connect audio element to analyzer
    audioSource = audioContext.createMediaElementSource(audioElement);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // Enable play button
    document.getElementById('play-btn').disabled = false;
  }
  
  function playAudio() {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    audioElement.play();
    isPlaying = true;
  }
  
  function pauseAudio() {
    audioElement.pause();
    isPlaying = false;
  }
  
  function updateAudioValues(time) {
    // Only update audio data at specified interval
    if (!isPlaying || !audioData || time - lastAudioUpdate < audioUpdateInterval) {
      return audioValues;
    }
    
    lastAudioUpdate = time;
    analyser.getByteFrequencyData(audioData);
    
    // Define frequency ranges
    const bassRange = [0, 30];
    const midRange = [30, 120];
    const highMidRange = [120, 250];
    const trebleRange = [250, 255];
    
    // Calculate average values for each range
    function getAverage(start, end) {
      let sum = 0;
      const rangeSize = end - start;
      
      for (let i = start; i < end; i++) {
        sum += audioData[i];
      }
      
      return sum / rangeSize / 255;
    }
    
    // Get normalized values for each dimension
    audioValues[0] = getAverage(bassRange[0], bassRange[1]) * (sensitivity / 5);
    audioValues[1] = getAverage(midRange[0], midRange[1]) * (sensitivity / 5);
    audioValues[2] = getAverage(highMidRange[0], highMidRange[1]) * (sensitivity / 5);
    audioValues[3] = getAverage(trebleRange[0], trebleRange[1]) * (sensitivity / 5);
    
    return audioValues;
  }

  //====================================================
  //=== Rotation and Projection Functions
  //====================================================
  // Caching for sin/cos values
  const cosCache = {};
  const sinCache = {};
  
  function getCos(angle) {
    const key = Math.round(angle * 100) / 100;
    if (cosCache[key] === undefined) {
      cosCache[key] = Math.cos(key);
    }
    return cosCache[key];
  }
  
  function getSin(angle) {
    const key = Math.round(angle * 100) / 100;
    if (sinCache[key] === undefined) {
      sinCache[key] = Math.sin(key);
    }
    return sinCache[key];
  }
  
  // 4D Rotation Functions
  function rotateWX(v, angle) {
    const [w, x, y, z] = v;
    const cw = getCos(angle);
    const sw = getSin(angle);
    return [
      w*cw - x*sw,
      w*sw + x*cw,
      y,
      z
    ];
  }
  
  function rotateYZ(v, angle) {
    const [w, x, y, z] = v;
    const cy = getCos(angle);
    const sy = getSin(angle);
    return [
      w,
      x,
      y*cy - z*sy,
      y*sy + z*cy
    ];
  }
  
  function rotateWY(v, angle) {
    const [w, x, y, z] = v;
    const c = getCos(angle);
    const s = getSin(angle);
    return [
      w*c - y*s,
      x,
      w*s + y*c,
      z
    ];
  }
  
  function rotateXZ(v, angle) {
    const [w, x, y, z] = v;
    const c = getCos(angle);
    const s = getSin(angle);
    return [
      w,
      x*c - z*s,
      y,
      x*s + z*c
    ];
  }

  // 3D+3T Rotation Functions
  function rotateT1T2(v6, angle) {
    const [t1, t2, t3, x, y, z] = v6;
    const c = getCos(angle);
    const s = getSin(angle);
    return [t1*c - t2*s, t1*s + t2*c, t3, x, y, z];
  }
  
  function rotateT2T3(v6, angle) {
    const [t1, t2, t3, x, y, z] = v6;
    const c = getCos(angle);
    const s = getSin(angle);
    return [t1, t2*c - t3*s, t2*s + t3*c, x, y, z];
  }
  
  function rotateT3T1(v6, angle) {
    const [t1, t2, t3, x, y, z] = v6;
    const c = getCos(angle);
    const s = getSin(angle);
    return [t1*c - t3*s, t2, t1*s + t3*c, x, y, z];
  }
  
  function rotateXY_3d3t(v6, angle) {
    const [t1, t2, t3, x, y, z] = v6;
    const c = getCos(angle);
    const s = getSin(angle);
    return [t1, t2, t3, x*c - y*s, x*s + y*c, z];
  }
  
  function rotateYZ_3d3t(v6, angle) {
    const [t1, t2, t3, x, y, z] = v6;
    const c = getCos(angle);
    const s = getSin(angle);
    return [t1, t2, t3, x, y*c - z*s, y*s + z*c];
  }
  
  function rotateZX_3d3t(v6, angle) {
    const [t1, t2, t3, x, y, z] = v6;
    const c = getCos(angle);
    const s = getSin(angle);
    return [t1, t2, t3, x*c - z*s, y, x*s + z*c];
  }

  // Projection Functions
  function project4DTo3D(v, cameraW) {
    const w = v[0];
    const denom = (cameraW - w);
    if (denom <= 0.001) return null;
    const scale = 1.0 / denom;
    return [v[1]*scale, v[2]*scale, v[3]*scale];
  }
  
  function project6Dto3D(v6, cameraT1) {
    const [t1, t2, t3, x, y, z] = v6;
    const denom = cameraT1 - t1;
    if (denom <= 0.001) {
      return null;
    }
    const scale = 1.0 / denom;
    return [x*scale, y*scale, z*scale];
  }

  //====================================================
  //=== Utility Functions
  //====================================================
  // 4D Lighting
  const light4D = [0.577, 0.577, 0.577, 0.0];
  
  function dot4(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2] + a[3]*b[3];
  }
  
  // HSV to RGB Conversion
  function hsvToRgb(h, s, v) {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
      case 0: return [v, t, p];
      case 1: return [q, v, p];
      case 2: return [p, v, t];
      case 3: return [p, q, v];
      case 4: return [t, p, v];
      case 5: return [v, p, q];
    }
  }

  //====================================================
  //=== Animation Loop
  //====================================================
  function animate() {
    requestAnimationFrame(animate);
    const currentTime = performance.now();
    const elapsed = clock.getElapsedTime();

    // Update FPS counter
    updateFPS();
    
    // Get audio data
    updateAudioValues(currentTime);
    
    // Base rotation angles
    let angle1 = 0.5 * elapsed; 
    let angle2 = 0.7 * elapsed;
    
    // Modify rotation angles based on audio
    if (isPlaying) {
      const bassEffect = audioValues[0] * 0.5;
      const midEffect = audioValues[1] * 0.3;
      
      angle1 += bassEffect;
      angle2 += midEffect;
    }

    // Update visualizations based on which is visible
    if (tesseractGroup.visible) {
      updateTesseract(angle1, angle2);
    }
    
    if (sphereGroup.visible) {
      update4DSphere(angle1, angle2);
    }
    
    if (cube3d3tGroup.visible) {
      update3D3TCube(elapsed);
    }
    
    if (sphere3d3tGroup.visible) {
      update3D3TSphere(elapsed);
    }

    controls.update();
    renderer.render(scene, camera);
  }

  //====================================================
  //=== Visualization Update Functions
  //====================================================
  function updateTesseract(angle1, angle2) {
    // Make camera position responsive to bass
    const cameraW = isPlaying ? 4.0 + audioValues[0] * 2.0 : 4.0;
    
    // Pre-rotate all vertices once
    for (let i = 0; i < tesseractVertices4D.length; i++) {
      let v4 = tesseractVertices4D[i];
      
      // Rotate with audio-reactive angles
      v4 = rotateWX(v4, angle1);
      v4 = rotateYZ(v4, angle2);
      
      // Add additional rotations based on audio
      if (isPlaying) {
        v4 = rotateWY(v4, audioValues[2] * 0.2);
        v4 = rotateXZ(v4, audioValues[3] * 0.1);
      }
      
      // Store rotated vertex
      rotatedVertices[i] = v4;
    }
    
    // Update all edges using pre-rotated vertices
    for (let e = 0; e < tEdges.length; e++) {
      const [i, j] = tEdges[e];
      const vA4 = rotatedVertices[i];
      const vB4 = rotatedVertices[j];
      
      // Project
      const A3 = project4DTo3D(vA4, cameraW);
      const B3 = project4DTo3D(vB4, cameraW);

      const line = tesseractEdges[e];
      const posAttr = line.geometry.getAttribute('position');

      if (!A3 || !B3) {
        // If either endpoint is behind camera, hide line
        posAttr.setXYZ(0, 9999, 9999, 9999);
        posAttr.setXYZ(1, 9999, 9999, 9999);
      } else {
        posAttr.setXYZ(0, A3[0], A3[1], A3[2]);
        posAttr.setXYZ(1, B3[0], B3[1], B3[2]);
      }
      posAttr.needsUpdate = true;
    }
    
    // Audio-reactive coloring
    if (isPlaying) {
      // Depth fade color: measure 4D "distance" from camera
      const midW = rotatedVertices[0][0]; // Use first vertex as reference
      const dist4D = cameraW - midW; 
      const shade = THREE.MathUtils.clamp(dist4D / cameraW, 0, 1);
      
      // Audio-reactive coloring
      let hue = 0.6; // Default blue hue
      let saturation = 1.0;
      let lightness = 0.5 * shade;
      
      // Shift hue based on mid frequencies
      hue = (0.6 + audioValues[1] * 0.4) % 1.0;
      
      // Increase saturation with high frequencies
      saturation = 1.0 - audioValues[3] * 0.5;
      
      // Pulse lightness with bass
      lightness = (0.5 + audioValues[0] * 0.5) * shade;
      
      tesseractMaterial.color.setHSL(hue, saturation, lightness);
    }
  }

  function update4DSphere(angle1, angle2) {
    // Make camera position responsive to bass
    const cameraW = isPlaying ? 3.5 + audioValues[0] * 1.5 : 3.5;
    
    const posAttr = sphereGeom.getAttribute('position');
    const colAttr = sphereGeom.getAttribute('color');

    let idxPos = 0;
    let idxCol = 0;

    // Process points in batches
    const batchSize = 100;
    const totalBatches = Math.ceil(NUM_SPHERE_POINTS / batchSize);
    
    for (let batch = 0; batch < totalBatches; batch++) {
      const startIdx = batch * batchSize;
      const endIdx = Math.min(startIdx + batchSize, NUM_SPHERE_POINTS);
      
      for (let i = startIdx; i < endIdx; i++) {
        let v4 = spherePoints4D[i];
        
        // Rotate in 4D with audio-reactive angles
        v4 = rotateWX(v4, angle1);
        v4 = rotateYZ(v4, angle2);
        
        // Add additional rotations based on audio
        if (isPlaying) {
          v4 = rotateWY(v4, audioValues[2] * 0.2);
          v4 = rotateXZ(v4, audioValues[3] * 0.1);
        }

        // Project to 3D
        const p3 = project4DTo3D(v4, cameraW);
        if (p3) {
          // 4D Lambert shading
          let brightness = Math.max(dot4(v4, light4D), 0);
          
          // Audio-reactive brightness pulsing
          if (isPlaying) {
            // Increase brightness with bass
            brightness = brightness * (1 + audioValues[0] * 0.5);
          }
          
          // Audio-reactive coloring
          let r, g, b;
          
          if (isPlaying) {
            // Create spectrum coloring based on audio frequencies
            const hue = (v4[0] + 1) * 0.5 + audioValues[1] * 0.2; // Base hue on w-coordinate + mid frequencies
            const sat = 0.8 + audioValues[2] * 0.2; // Saturation affected by high-mids
            const val = brightness * (0.8 + audioValues[0] * 0.2); // Value affected by bass
            
            // HSV to RGB conversion
            [r, g, b] = hsvToRgb(hue, sat, val);
          } else {
            // Default grayscale when no audio
            r = brightness;
            g = brightness;
            b = brightness;
          }

          posAttr.setXYZ(idxPos, p3[0], p3[1], p3[2]);
          colAttr.setXYZ(idxCol, r, g, b);
          idxPos++;
          idxCol++;
        } else {
          // behind camera: skip it by placing far away
          posAttr.setXYZ(idxPos, 9999, 9999, 9999);
          colAttr.setXYZ(idxCol, 0, 0, 0);
          idxPos++;
          idxCol++;
        }
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    
    // Audio-reactive point size
    if (isPlaying) {
      sphereMat.size = 0.02 + audioValues[0] * 0.03;
      sphereMat.needsUpdate = true;
    }
  }

  function update3D3TCube(elapsed) {
    // We'll spin each plane at a different speed, modified by audio if playing
    let angleT12 = 0.5 * elapsed;
    let angleT23 = 0.4 * elapsed;
    let angleT31 = 0.6 * elapsed;
    let angleXY = 0.7 * elapsed;
    let angleYZ = 0.3 * elapsed;
    let angleZX = 0.5 * elapsed;
    
    // Audio reactivity for 3D+3T rotations
    if (isPlaying) {
      // Bass affects time dimensions
      angleT12 += audioValues[0] * 0.4;
      angleT23 += audioValues[0] * 0.3;
      angleT31 += audioValues[0] * 0.5;
      
      // Mids and highs affect space dimensions
      angleXY += audioValues[1] * 0.3;
      angleYZ += audioValues[2] * 0.2;
      angleZX += audioValues[3] * 0.1;
    }

    // Camera position in time dimension, can be affected by audio
    const cameraT1 = isPlaying ? 3.0 + audioValues[0] * 1.5 : 3.0;

    // Update each edge
    cubeEdges.forEach((edge, eIndex) => {
      const [i, j] = edge;
      let vA = cubeVerts6D[i];
      let vB = cubeVerts6D[j];
      
      // Apply all 6 planes of rotation in sequence:
      vA = rotateT1T2(vA, angleT12);
      vA = rotateT2T3(vA, angleT23);
      vA = rotateT3T1(vA, angleT31);
      vA = rotateXY_3d3t(vA, angleXY);
      vA = rotateYZ_3d3t(vA, angleYZ);
      vA = rotateZX_3d3t(vA, angleZX);

      vB = rotateT1T2(vB, angleT12);
      vB = rotateT2T3(vB, angleT23);
      vB = rotateT3T1(vB, angleT31);
      vB = rotateXY_3d3t(vB, angleXY);
      vB = rotateYZ_3d3t(vB, angleYZ);
      vB = rotateZX_3d3t(vB, angleZX);

      const A3 = project6Dto3D(vA, cameraT1);
      const B3 = project6Dto3D(vB, cameraT1);

      const line = cubeLines[eIndex];
      const posAttr = line.geometry.getAttribute('position');
      
      if (!A3 || !B3) {
        posAttr.setXYZ(0, 9999, 9999, 9999);
        posAttr.setXYZ(1, 9999, 9999, 9999);
      } else {
        posAttr.setXYZ(0, A3[0], A3[1], A3[2]);
        posAttr.setXYZ(1, B3[0], B3[1], B3[2]);
      }
      posAttr.needsUpdate = true;

      // Audio-reactive coloring
      if (isPlaying) {
        // Color based on time position and audio
        const midT1 = 0.5 * (vA[0] + vB[0]);
        const dist = cameraT1 - midT1;
        const shade = THREE.MathUtils.clamp(dist / cameraT1, 0, 1);
        
        // Use audio to affect color
        const hue = (0.55 + audioValues[1] * 0.3) % 1.0; // Shift hue with mids
        const sat = 1.0 - audioValues[3] * 0.3; // Reduce saturation with highs
        const light = (0.4 + 0.4 * shade) * (1 + audioValues[0] * 0.5); // Pulse with bass
        
        line.material.color.setHSL(hue, sat, light);
      } else {
        // Default color when no audio
        const midT1 = 0.5 * (vA[0] + vB[0]);
        const dist = cameraT1 - midT1;
        const shade = THREE.MathUtils.clamp(dist / cameraT1, 0, 1);
        line.material.color.setHSL(0.55, 1.0, 0.4 + 0.4 * shade);
      }
    });
  }

  function update3D3TSphere(elapsed) {
    // We'll spin each plane at a different speed, modified by audio if playing
    let angleT12 = 0.5 * elapsed;
    let angleT23 = 0.4 * elapsed;
    let angleT31 = 0.6 * elapsed;
    let angleXY = 0.7 * elapsed;
    let angleYZ = 0.3 * elapsed;
    let angleZX = 0.5 * elapsed;
    
    // Audio reactivity for 3D+3T rotations
    if (isPlaying) {
      // Bass affects time dimensions
      angleT12 += audioValues[0] * 0.4;
      angleT23 += audioValues[0] * 0.3;
      angleT31 += audioValues[0] * 0.5;
      
      // Mids and highs affect space dimensions
      angleXY += audioValues[1] * 0.3;
      angleYZ += audioValues[2] * 0.2;
      angleZX += audioValues[3] * 0.1;
    }

    // Camera position in time dimension, can be affected by audio
    const cameraT1 = isPlaying ? 3.0 + audioValues[0] * 1.5 : 3.0;
    
    const posAttr = sphere3d3tGeom.getAttribute('position');
    const colAttr = sphere3d3tGeom.getAttribute('color');
    
    // Process points in batches
    const batchSize = 100;
    const totalBatches = Math.ceil(NUM_SPHERE_3D3T_POINTS / batchSize);
    
    for (let batch = 0; batch < totalBatches; batch++) {
      const startIdx = batch * batchSize;
      const endIdx = Math.min(startIdx + batchSize, NUM_SPHERE_3D3T_POINTS);
      
      for (let i = startIdx; i < endIdx; i++) {
        let v6 = sphereVerts6D[i];
        
        // Apply all 6 planes of rotation in sequence:
        v6 = rotateT1T2(v6, angleT12);
        v6 = rotateT2T3(v6, angleT23);
        v6 = rotateT3T1(v6, angleT31);
        v6 = rotateXY_3d3t(v6, angleXY);
        v6 = rotateYZ_3d3t(v6, angleYZ);
        v6 = rotateZX_3d3t(v6, angleZX);

        const p3 = project6Dto3D(v6, cameraT1);
        
        if (!p3) {
          // behind camera
          posAttr.setXYZ(i, 9999, 9999, 9999);
          colAttr.setXYZ(i, 0, 0, 0);
        } else {
          posAttr.setXYZ(i, p3[0], p3[1], p3[2]);

          // Audio-reactive coloring
          if (isPlaying) {
            // Use time position and audio for coloring
            const t1 = v6[0];
            const t2 = v6[1];
            const t3 = v6[2];
            
            // Base brightness on time position
            let brightness = Math.max(0, (cameraT1 - t1) / cameraT1);
            
            // Enhance brightness with bass
            brightness *= (1 + audioValues[0] * 0.5);
            
            // Create color based on time coordinates and audio
            const hue = (t2 + t3 + 2) / 4 + audioValues[1] * 0.2; // Hue from t2, t3 + mids
            const sat = 0.7 + audioValues[2] * 0.3; // Saturation from high-mids
            const val = brightness * (0.8 + audioValues[0] * 0.2); // Value from brightness + bass
            
            // Convert HSV to RGB
            const [r, g, b] = hsvToRgb(hue, sat, val);
            colAttr.setXYZ(i, r, g, b);
          } else {
            // Default grayscale when no audio
            const t1 = v6[0];
            const brightness = Math.max(0, (cameraT1 - t1) / cameraT1);
            colAttr.setXYZ(i, brightness, brightness, brightness);
          }
        }
      }
    }
    
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    
    // Audio-reactive point size
    if (isPlaying) {
      sphere3d3tMat.size = 0.02 + audioValues[0] * 0.03;
      sphere3d3tMat.needsUpdate = true;
    }
  }

  //====================================================
  //=== Event Listeners
  //====================================================
  function setupEventListeners() {
    // Toggle visualizations with keyboard
    document.addEventListener("keydown", (ev) => {
      // Hide all visualizations first
      tesseractGroup.visible = false;
      sphereGroup.visible = false;
      cube3d3tGroup.visible = false;
      sphere3d3tGroup.visible = false;
      
      // Then show the selected one
      switch (ev.key.toLowerCase()) {
        case 't': // 4D Tesseract
          tesseractGroup.visible = true;
          // Update UI buttons
          updateActiveButton('t');
          break;
        case 's': // 4D Sphere
          sphereGroup.visible = true;
          updateActiveButton('s');
          break;
        case 'c': // 3D+3T Cube
          cube3d3tGroup.visible = true;
          updateActiveButton('c');
          break;
        case 'u': // 3D+3T Sphere
          sphere3d3tGroup.visible = true;
          updateActiveButton('u');
          break;
      }
    });
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
  }
  
  function updateActiveButton(key) {
    const buttons = document.querySelectorAll('.key-button');
    buttons.forEach(btn => {
      if (btn.getAttribute('data-key') === key) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Expose the initialization function
  window.initVisualizer = initVisualizer;
})();
