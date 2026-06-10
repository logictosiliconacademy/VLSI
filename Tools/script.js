/**
 * Analog Layout Matching Playground - Core Control Logic & Analysis Engine
 * Architecture: Pure Vanilla JS / Functional State Management Pattern
 */

// Global Application Application State Store
const STATE = {
    numA: 4,
    numB: 4,
    colorA: '#3b82f6',
    colorB: '#f97316',
    gradientType: 'linear-thermal',
    gradientStrength: 50,
    currentPattern: 'ABBAABBA',
    activeMode: 'visual', // visual | analysis | compare | animation
    animationFrameId: null,
    animationTime: 0,
    isAnimating: false
};

// Application Initialize Hooks
document.addEventListener("DOMContentLoaded", () => {
    initDOMEventListeners();
    readURLParameters();
    syncUIVisuals();
    executeEvaluationPipeline();
});

/**
 * Configure UI Node Bindings & Signal Event Listeners
 */
function initDOMEventListeners() {
    // Top-bar Color Dynamic Target Selectors
    document.getElementById('colorA').addEventListener('input', (e) => {
        STATE.colorA = e.target.value;
        document.documentElement.style.setProperty('--color-a', STATE.colorA);
        renderSiliconArray();
    });
    document.getElementById('colorB').addEventListener('input', (e) => {
        STATE.colorB = e.target.value;
        document.documentElement.style.setProperty('--color-b', STATE.colorB);
        renderSiliconArray();
    });

    // Device Count Controls
    document.getElementById('btnGenerate').addEventListener('click', () => {
        STATE.numA = parseInt(document.getElementById('numA').value) || 4;
        STATE.numB = parseInt(document.getElementById('numB').value) || 4;
        // Auto generate optimal centroid suggestion
        STATE.currentPattern = generateOptimalCentroidPattern(STATE.numA, STATE.numB);
        document.getElementById('customPatternInput').value = STATE.currentPattern;
        executeEvaluationPipeline();
    });

    // Environment Slider Handlers
    const gradSlider = document.getElementById('gradientStrength');
    gradSlider.addEventListener('input', (e) => {
        STATE.gradientStrength = parseInt(e.target.value);
        document.getElementById('gradientVal').innerText = STATE.gradientStrength + '%';
        executeEvaluationPipeline();
    });

    document.getElementById('gradientType').addEventListener('change', (e) => {
        STATE.gradientType = e.target.value;
        executeEvaluationPipeline();
    });

    // Custom Blueprints Submission Box
    document.getElementById('btnApplyCustom').addEventListener('click', () => {
        let pattern = document.getElementById('customPatternInput').value.trim().toUpperCase();
        pattern = pattern.replace(/[^AB]/g, ''); // Sanitize input format
        if(pattern.length === 0) return;
        
        STATE.currentPattern = pattern;
        // Dynamically reverse sync configuration inputs based on input array profile
        STATE.numA = (pattern.match(/A/g) || []).length;
        STATE.numB = (pattern.match(/B/g) || []).length;
        document.getElementById('numA').value = STATE.numA;
        document.getElementById('numB').value = STATE.numB;

        executeEvaluationPipeline();
    });

    // Navigation Tab Selection Hooks
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            switchAppMode(e.target.dataset.mode);
        });
    });
}

/**
 * Handle Tab State Updates
 */
function switchAppMode(mode) {
    STATE.activeMode = mode;
    const titleNode = document.getElementById('activeModeTitle');
    const descNode = document.getElementById('activeModeDesc');
    const chartSection = document.getElementById('comparisonChartSection');

    // Deconstruct and clean running loops
    stopGradientAnimationLoop();

    if (mode === 'visual') {
        titleNode.innerText = "Visual Learning Lab Mode";
        descNode.innerText = "Interact with dynamic configurations to inspect standard structures, topological mismatch, and device sequencing layouts.";
        chartSection.style.display = "block";
    } else if (mode === 'analysis') {
        titleNode.innerText = "Engineering Analysis Mode";
        descNode.innerText = "Calculates precise centers of mass, spatial deltas, structural balancing scores, and mismatch metrics.";
        chartSection.style.display = "block";
    } else if (mode === 'compare') {
        titleNode.innerText = "Compare Patterns Mode";
        descNode.innerText = "Benchmarks the current layout blueprint directly against classic semiconductor reference geometries.";
        chartSection.style.display = "block";
    } else if (mode === 'animation') {
        titleNode.innerText = "Gradient Animation Mode";
        descNode.innerText = "Visualizes dynamic gradient oscillations across the chip surface to observe the variance filters of common centroids.";
        chartSection.style.display = "none";
        startGradientAnimationLoop();
    }
    executeEvaluationPipeline();
}

/**
 * Main Architectural Calculations Core
 */
function executeEvaluationPipeline() {
    const pattern = STATE.currentPattern;
    const len = pattern.length;
    
    let sumPositionsA = 0;
    let countA = 0;
    let sumPositionsB = 0;
    let countB = 0;

    // Calculate Spatial Centroids (Normalized to array space 0 to 1)
    for (let i = 0; i < len; i++) {
        const normalizedPos = len > 1 ? i / (len - 1) : 0.5;
        if (pattern[i] === 'A') {
            sumPositionsA += normalizedPos;
            countA++;
        } else {
            sumPositionsB += normalizedPos;
            countB++;
        }
    }

    const centroidA = countA > 0 ? sumPositionsA / countA : 0;
    const centroidB = countB > 0 ? sumPositionsB / countB : 0;
    const deltaX = Math.abs(centroidA - centroidB);

    // Mismatch calculation under standard processing gradient vector rules
    let totalInducedError = 0;
    const strengthMultiplier = STATE.gradientStrength / 100;

    for (let i = 0; i < len; i++) {
        const normalizedPos = len > 1 ? i / (len - 1) : 0.5;
        // Standard first order linear gradient function simulation
        const localGradientValue = normalizedPos * strengthMultiplier;
        
        if (pattern[i] === 'A') {
            totalInducedError += localGradientValue;
        } else {
            totalInducedError -= localGradientValue;
        }
    }

    // Process Symmetry Metric Checklist
    let isSymmetric = true;
    for(let i = 0; i < Math.floor(len/2); i++) {
        if(pattern[i] !== pattern[len - 1 - i]) {
            isSymmetric = false;
            break;
        }
    }

    // Compute Overall Scoring Factor
    let baseScore = 100;
    baseScore -= (deltaX * 70); // High penalty for structural layout center drift
    if (!isSymmetric) baseScore -= 15; // Penalty for lack of axial mirror symmetry
    if (len % 2 !== 0) baseScore -= 10;
    
    const matchingScore = Math.max(0, Math.min(100, Math.round(baseScore)));

    // Update Global Visual Readout
    updateTelemetryUI(centroidA, centroidB, deltaX, totalInducedError, isSymmetric, matchingScore);
    renderSiliconArray();
    renderPerformanceChart(deltaX, isSymmetric);
}

/**
 * Refresh Readouts in the DOM Telemetry Gauges
 */
function updateTelemetryUI(cA, cB, delta, error, symmetry, score) {
    document.getElementById('telemetryCentroidA').innerText = cA.toFixed(3);
    document.getElementById('telemetryCentroidB').innerText = cB.toFixed(3);
    document.getElementById('telemetryDelta').innerText = delta.toFixed(3);
    document.getElementById('telemetryError').innerText = (error * 10).toFixed(2) + ' mV';
    document.getElementById('telemetrySymmetry').innerText = symmetry ? "Balanced (Axial)" : "Asymmetric Mismatch";
    document.getElementById('telemetrySymmetry').style.color = symmetry ? "var(--accent-success)" : "var(--accent-warn)";

    document.getElementById('scoreValue').innerText = score;
    
    // Refresh Rating Badges
    const badge = document.getElementById('scoreRating');
    badge.className = "rating-badge"; 
    if (score >= 90) {
        badge.innerText = "Excellent"; badge.classList.add('rating-excellent');
    } else if (score >= 75) {
        badge.innerText = "Good"; badge.classList.add('rating-good');
    } else if (score >= 50) {
        badge.innerText = "Moderate"; badge.classList.add('rating-moderate');
    } else {
        badge.innerText = "Poor"; badge.classList.add('rating-poor');
    }

    // Position Markers along Centroid Alignment Track
    document.getElementById('markerA').style.left = `${(cA * 96) + 2}%`;
    document.getElementById('markerB').style.left = `${(cB * 96) + 2}%`;
}

/**
 * Draw Transistor Elements inside Layout Canvas Container Node
 */
function renderSiliconArray() {
    const sandbox = document.getElementById('layoutSandbox');
    sandbox.innerHTML = '';
    
    const pattern = STATE.currentPattern;
    const len = pattern.length;
    const strengthMultiplier = STATE.gradientStrength / 100;

    // Track dynamic oscillations if animation runtime is active
    const oscillationOffset = STATE.isAnimating ? Math.sin(STATE.animationTime) * 0.25 : 0;

    for (let i = 0; i < len; i++) {
        const normalizedPos = len > 1 ? i / (len - 1) : 0.5;
        
        // Calculate gradient spatial map value
        let localGradient = (normalizedPos * strengthMultiplier) + oscillationOffset;
        localGradient = Math.max(0, Math.min(1, localGradient)); // Clamp boundary rules

        const elementFinger = document.createElement('div');
        elementFinger.className = 'device-finger';
        
        // Apply distinct theme colors based on device assignment type
        const type = pattern[i];
        if (type === 'A') {
            elementFinger.style.backgroundColor = STATE.colorA;
            elementFinger.style.borderColor = 'rgba(255,255,255,0.2)';
        } else {
            elementFinger.style.backgroundColor = STATE.colorB;
            elementFinger.style.borderColor = 'rgba(255,255,255,0.2)';
        }

        // Overlay dynamic gradient processing tint effects
        const gradientOverlayIntensity = Math.floor(localGradient * 130); 
        elementFinger.style.boxShadow = `inset 0 -25px 30px rgba(${gradientOverlayIntensity}, 30, 40, 0.85), 0 4px 6px rgba(0,0,0,0.4)`;

        // Label matching instances counters
        const currentSlice = pattern.substring(0, i + 1);
        const instancesIndex = (currentSlice.match(new RegExp(type, 'g')) || []).length;

        elementFinger.innerHTML = `
            <span class="finger-type">DEV ${type}</span>
            <span class="finger-id">${type}${instancesIndex}</span>
            <span class="finger-pos">X:${normalizedPos.toFixed(2)}</span>
        `;
        
        sandbox.appendChild(elementFinger);
    }
}

/**
 * Generate Inline SVG Coordinate Charts for Multi-Pattern Analysis Sweep
 */
function renderPerformanceChart(activeDelta, activeSymmetry) {
    const svg = document.getElementById('performanceChart');
    svg.innerHTML = '';

    // Render Basic Structural Axis Framework Infrastructure 
    svg.innerHTML += `
        <line x1="50" y1="200" x2="550" y2="200" class="chart-axis" />
        <line x1="50" y1="20" x2="50" y2="200" class="chart-axis" />
        <line x1="50" y1="140" x2="550" y2="140" class="chart-grid" />
        <line x1="50" y1="80" x2="550" y2="80" class="chart-grid" />
        <line x1="50" y1="20" x2="550" y2="20" class="chart-grid" />
        <text x="260" y="232" class="chart-text" text-anchor="middle">Processing Gradient Profile Sweep Strength (0% → 100%)</text>
        <text x="15" y="110" class="chart-text" transform="rotate(-90 15 110)" text-anchor="middle">Induced Mismatch Delta</text>
        <text x="45" y="215" class="chart-text">0%</text>
        <text x="540" y="215" class="chart-text">100%</text>
    `;

    // Mathematical formula presets representing archetypes lines
    const evaluateErrorCurve = (patternString, strength) => {
        let err = 0;
        const l = patternString.length;
        for(let i=0; i<l; i++) {
            const p = l > 1 ? i / (l - 1) : 0.5;
            if(patternString[i] === 'A') err += (p * strength);
            else err -= (p * strength);
        }
        return Math.abs(err) * 12; // Scaled value for optimal canvas fit
    };

    const drawCurvePath = (pattern, className) => {
        let points = [];
        for (let xStep = 0; xStep <= 10; xStep++) {
            const pct = xStep / 10;
            const xCord = 50 + (pct * 500);
            const yCord = 200 - evaluateErrorCurve(pattern, pct);
            points.push(`${xCord},${yCord}`);
        }
        svg.innerHTML += `<path d="M ${points.join(' L ')}" class="${className}" />`;
    };

    // Plot Reference Blueprints Arrays
    drawCurvePath("AAAABBBB", "path-p1");
    drawCurvePath("ABABABAB", "path-p2");
    drawCurvePath("ABBAABBA", "path-p3");

    // Plot Custom Interactive Selection Track Overlay
    let customPoints = [];
    for(let xStep = 0; xStep <= 10; xStep++) {
        const pct = xStep / 10;
        const xCord = 50 + (pct * 500);
        const yCord = 200 - evaluateErrorCurve(STATE.currentPattern, pct);
        customPoints.push(`${xCord},${yCord}`);
    }
    svg.innerHTML += `<path d="M ${customPoints.join(' L ')}" class="path-custom" />`;
}

/**
 * Algorithmic Core: Common Centroid Generator Pattern Engine
 */
function generateOptimalCentroidPattern(countA, countB) {
    // Generates common centroid array suggestions matching specified target ratios
    let poolA = 'A'.repeat(countA);
    let poolB = 'B'.repeat(countB);
    
    // Return structured default options if standard balanced pair match
    if(countA === 4 && countB === 4) return "ABBAABBA";
    if(countA === 2 && countB === 2) return "BAAB";
    
    // Base Fallback: Simple structured interdigitated alternating sequences block builder
    let result = '';
    const max = Math.max(countA, countB);
    for(let i = 0; i < max; i++) {
        if(i < countA) result += 'A';
        if(i < countB) result += 'B';
    }
    return result;
}

/**
 * Animation Loops Managers (Mode 4 Context Engine)
 */
function startGradientAnimationLoop() {
    STATE.isAnimating = true;
    STATE.animationTime = 0;
    
    function updateFrame() {
        if(!STATE.isAnimating) return;
        STATE.animationTime += 0.04;
        renderSiliconArray();
        STATE.animationFrameId = requestAnimationFrame(updateFrame);
    }
    STATE.animationFrameId = requestAnimationFrame(updateFrame);
}

function stopGradientAnimationLoop() {
    STATE.isAnimating = false;
    if(STATE.animationFrameId) {
        cancelAnimationFrame(STATE.animationFrameId);
        STATE.animationFrameId = null;
    }
}

/**
 * Dynamic Collapsible Element Controls
 */
function togglePanel(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById('toggleIcon');
    if(el.classList.contains('expanded')) {
        el.classList.remove('expanded');
        icon.innerText = "▲";
    } else {
        el.classList.add('expanded');
        icon.innerText = "▼";
    }
}

/**
 * Deep Linking URL Parsers
 */
function readURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('pattern')) {
        STATE.currentPattern = urlParams.get('pattern').toUpperCase().replace(/[^AB]/g, '');
        document.getElementById('customPatternInput').value = STATE.currentPattern;
        STATE.numA = (STATE.currentPattern.match(/A/g) || []).length;
        STATE.numB = (STATE.currentPattern.match(/B/g) || []).length;
        document.getElementById('numA').value = STATE.numA;
        document.getElementById('numB').value = STATE.numB;
    }
}

function syncUIVisuals() {
    document.getElementById('numA').value = STATE.numA;
    document.getElementById('numB').value = STATE.numB;
    document.getElementById('gradientStrength').value = STATE.gradientStrength;
    document.getElementById('gradientVal').innerText = STATE.gradientStrength + '%';
}

/**
 * Data Exporter Switchboard
 */
function exportData(type) {
    if (type === 'copy') {
        navigator.clipboard.writeText(STATE.currentPattern);
        alert(`Copied pattern array configuration to clipboard: ${STATE.currentPattern}`);
    } else if (type === 'url') {
        const shareableUrl = `${window.location.origin}${window.location.pathname}?pattern=${STATE.currentPattern}`;
        navigator.clipboard.writeText(shareableUrl);
        alert(`Generated URL with layout state parameters. Copied link!`);
    } else if (type === 'svg') {
        const svgData = document.getElementById('performanceChart').outerHTML;
        const svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = `analog_matching_performance_${STATE.currentPattern}.svg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    } else if (type === 'png') {
        alert("PNG export requires canvas context mapping assets. For clean high-definition vectors, use Download SVG option.");
    }
}
