/* =============================================================================
   Crochet Poop Generator - Main JavaScript
   Handles SVG generation, UI interactions, and audio playback
   ============================================================================= */

// =============================================================================
// Audio Configuration
// =============================================================================

/**
 * Array of available fart sound filenames.
 * These files should be placed in /fartAudio/ folder at the project root.
 */
const FART_SOUNDS = [
    'fart1.mp3',
    'fart2.mp3',
    'fart3.mp3',
    'fart4.mp3',
    'fart5.mp3',
    'fart6.mp3',
    'fart7.mp3',
    'fart8.mp3',
    'fart9.mp3',
    'fart10.mp3'
];

/**
 * Base path for audio files.
 * Adjust this if your deployment uses a subdirectory.
 */
const AUDIO_BASE_PATH = './fartAudio/';

// =============================================================================
// Color Definitions
// =============================================================================

/**
 * Body color palettes for the poop.
 * Each color has main, light, dark, highlight, yarn, and shadow variants.
 */
const BODY_COLORS = {
    chocolate: {
        main: '#5C3317',
        light: '#7B4B2A',
        dark: '#3D210F',
        highlight: '#8B5A2B',
        yarn: '#4A2511',
        shadow: '#2E1A0D'
    },
    vanilla: {
        main: '#F5DEB3',
        light: '#FFF8DC',
        dark: '#D4A574',
        highlight: '#FFFACD',
        yarn: '#E8D4A8',
        shadow: '#C4A67C'
    },
    blue: {
        main: '#4169E1',
        light: '#6495ED',
        dark: '#27408B',
        highlight: '#87CEEB',
        yarn: '#2B4F8C',
        shadow: '#1a2d5e'
    }
};

/**
 * Eye color hex values.
 */
const EYE_COLOR_HEX = {
    black: '#1a1a1a',
    blue: '#1E90FF',
    green: '#228B22',
    brown: '#8B4513',
    red: '#DC143C',
    purple: '#9932CC',
    orange: '#FF8C00'
};

// =============================================================================
// Application State
// =============================================================================

/**
 * Current configuration state for the poop generator.
 * This object tracks all user-selected options.
 */
const config = {
    bodyColor: 'chocolate',
    numLayers: 3,
    numEyes: 2,
    eyeColor: 'black',
    hasArms: false,
    hasLegs: false,
    mouthStyle: 'smile'
};

/**
 * Counter for tracking configuration changes.
 * Used to determine when to play a fart sound (every 5th change).
 */
let changeCounter = 0;

// =============================================================================
// SVG Generation Functions
// =============================================================================

/**
 * Generate the yarn texture pattern for the crocheted look.
 * Creates a repeating pattern that simulates yarn texture.
 * 
 * @param {string} patternId - Unique ID for the pattern element
 * @param {Object} colors - Color palette object with main, light, dark, etc.
 * @returns {string} SVG defs element with pattern definition
 */
function generateYarnTexturePattern(patternId, colors) {
    return `
        <defs>
            <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="10" height="10">
                <rect width="10" height="10" fill="${colors.main}"/>
                <path d="M0,3 Q5,1 10,3" stroke="${colors.light}" stroke-width="1.2" fill="none" opacity="0.7"/>
                <path d="M0,6 Q5,4 10,6" stroke="${colors.dark}" stroke-width="1.2" fill="none" opacity="0.6"/>
                <path d="M0,9 Q5,7 10,9" stroke="${colors.highlight}" stroke-width="0.8" fill="none" opacity="0.5"/>
                <circle cx="2" cy="5" r="0.8" fill="${colors.highlight}" opacity="0.3"/>
                <circle cx="7" cy="2" r="0.8" fill="${colors.highlight}" opacity="0.3"/>
                <circle cx="7" cy="8" r="0.8" fill="${colors.highlight}" opacity="0.3"/>
            </pattern>
            <linearGradient id="${patternId}_gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:${colors.shadow};stop-opacity:0.4" />
                <stop offset="30%" style="stop-color:${colors.main};stop-opacity:0" />
                <stop offset="70%" style="stop-color:${colors.main};stop-opacity:0" />
                <stop offset="100%" style="stop-color:${colors.highlight};stop-opacity:0.3" />
            </linearGradient>
        </defs>
    `;
}

/**
 * Generate a single coil layer of the poop swirl.
 * Each layer is an ellipse with yarn texture and shadow effects.
 * 
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} width - Width of the coil
 * @param {number} height - Height of the coil
 * @param {Object} colors - Color palette object
 * @param {number} layerIndex - Index of this layer (for CSS class)
 * @returns {string} SVG group element for the coil layer
 */
function generateCoilLayer(cx, cy, width, height, colors, layerIndex) {
    return `
        <g class="coil-layer-${layerIndex}">
            <ellipse cx="${cx + 3}" cy="${cy + 4}" rx="${width/2}" ry="${height/2}" 
                     fill="${colors.shadow}" opacity="0.3"/>
            <ellipse cx="${cx}" cy="${cy}" rx="${width/2}" ry="${height/2}" 
                     fill="url(#yarn_pattern)" stroke="${colors.dark}" stroke-width="2"/>
            <ellipse cx="${cx}" cy="${cy}" rx="${width/2}" ry="${height/2}" 
                     fill="url(#yarn_pattern_gradient)" opacity="0.5"/>
            <path d="M ${cx - width/2 + 10},${cy - height/4} 
                     Q ${cx},${cy - height/2 - 5} ${cx + width/2 - 10},${cy - height/4}" 
                  stroke="${colors.highlight}" stroke-width="2" fill="none" opacity="0.4"
                  stroke-linecap="round"/>
            <path d="M ${cx - width/2 + 15},${cy + height/4} 
                     Q ${cx},${cy + height/2 + 3} ${cx + width/2 - 15},${cy + height/4}" 
                  stroke="${colors.shadow}" stroke-width="2" fill="none" opacity="0.3"
                  stroke-linecap="round"/>
        </g>
    `;
}

/**
 * Generate the iconic swirl/curl at the top of the poop.
 * This is the classic "soft serve" tip shape.
 * 
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {number} width - Width of the swirl
 * @param {Object} colors - Color palette object
 * @returns {string} SVG group element for the swirl top
 */
function generateSwirlTop(cx, cy, width, colors) {
    return `
        <g class="swirl-top">
            <path d="M ${cx - width/3},${cy + 3}
                     C ${cx - width/4},${cy - 15} ${cx + width/6},${cy - 25} ${cx + width/6},${cy - 35}
                     C ${cx + width/6},${cy - 50} ${cx - width/8},${cy - 55} ${cx},${cy - 45}
                     C ${cx + width/8},${cy - 40} ${cx + width/5},${cy - 50} ${cx + width/10},${cy - 60}
                     C ${cx},${cy - 70} ${cx - width/10},${cy - 65} ${cx + width/20},${cy - 55}
                     L ${cx},${cy - 45}
                     C ${cx + width/12},${cy - 40} ${cx + width/10},${cy - 30} ${cx},${cy - 20}
                     C ${cx - width/8},${cy - 10} ${cx - width/5},${cy} ${cx + width/3},${cy + 3}
                     Z"
                  transform="translate(3, 3)"
                  fill="${colors.shadow}" opacity="0.3"/>
            <path d="M ${cx - width/3},${cy}
                     C ${cx - width/4},${cy - 18} ${cx + width/6},${cy - 28} ${cx + width/6},${cy - 38}
                     C ${cx + width/6},${cy - 53} ${cx - width/8},${cy - 58} ${cx},${cy - 48}
                     C ${cx + width/8},${cy - 43} ${cx + width/5},${cy - 53} ${cx + width/10},${cy - 63}
                     C ${cx},${cy - 73} ${cx - width/10},${cy - 68} ${cx + width/20},${cy - 58}
                     L ${cx},${cy - 48}
                     C ${cx + width/12},${cy - 43} ${cx + width/10},${cy - 33} ${cx},${cy - 23}
                     C ${cx - width/8},${cy - 13} ${cx - width/5},${cy - 3} ${cx + width/3},${cy}
                     Z"
                  fill="url(#yarn_pattern)" stroke="${colors.dark}" stroke-width="2"/>
            <path d="M ${cx},${cy - 48}
                     C ${cx + width/12},${cy - 53} ${cx + width/8},${cy - 58} ${cx + width/12},${cy - 63}"
                  stroke="${colors.highlight}" stroke-width="2.5" fill="none" opacity="0.5"
                  stroke-linecap="round"/>
            <circle cx="${cx + width/20}" cy="${cy - 68}" r="4" fill="${colors.highlight}" opacity="0.4"/>
        </g>
    `;
}

/**
 * Generate the complete poop body with stacked coil layers.
 * Builds up multiple layers with decreasing width toward the top.
 * 
 * @param {number} numLayers - Number of coil layers (2-5)
 * @param {Object} colors - Color palette object
 * @returns {Object} Object with svg string and positioning data
 */
function generatePoopBody(numLayers, colors) {
    // Clamp layers to valid range
    numLayers = Math.max(2, Math.min(5, numLayers));
    
    const baseWidth = 180;
    const layerHeight = 45;
    const taperRatio = 0.72;
    const widthVariations = [1.0, 0.96, 1.03, 0.97, 0.99];
    
    let layersSvg = '';
    const positions = [];
    const cx = 115;
    const currentY = 180;
    
    // Generate each layer from bottom to top
    for (let i = 0; i < numLayers; i++) {
        const layerY = currentY - (i * (layerHeight * 0.7));
        const layerWidth = baseWidth * Math.pow(taperRatio, i) * widthVariations[i % widthVariations.length];
        
        positions.push({
            y: layerY,
            width: layerWidth,
            cx: cx
        });
        
        // Prepend so bottom layers are rendered first (correct z-order)
        layersSvg = generateCoilLayer(cx, layerY, layerWidth, layerHeight, colors, i) + layersSvg;
    }
    
    // Generate the swirl top
    const topLayer = positions[positions.length - 1];
    const swirlY = topLayer.y - layerHeight * 0.4;
    const swirlWidth = topLayer.width * 0.8;
    const swirlSvg = generateSwirlTop(cx, swirlY, swirlWidth, colors);
    
    const bottomY = positions[0].y + layerHeight / 2;
    
    // Calculate arm positioning
    let armY, armLayerWidth;
    if (positions.length >= 2) {
        armY = (positions[positions.length - 1].y + positions[positions.length - 2].y) / 2;
        armLayerWidth = (positions[positions.length - 1].width + positions[positions.length - 2].width) / 2;
    } else {
        armY = positions[positions.length - 1].y;
        armLayerWidth = positions[positions.length - 1].width;
    }
    
    // Return positioning data for face and limb placement
    const positioning = {
        bottomY: bottomY,
        topY: swirlY - 75,
        faceY: positions[positions.length - 1].y - 10,
        faceWidth: positions[positions.length - 1].width,
        armY: armY,
        armLayerWidth: armLayerWidth,
        legY: bottomY,
        cx: cx
    };
    
    return { svg: swirlSvg + layersSvg, positioning };
}

/**
 * Generate a single eye with button-style crocheted look.
 * Includes pupil, highlights, and reflections.
 * 
 * @param {number} cx - Center X coordinate
 * @param {number} cy - Center Y coordinate
 * @param {string} color - Eye color name (key in EYE_COLOR_HEX)
 * @param {number} size - Radius of the eye (default 12)
 * @returns {string} SVG group element for the eye
 */
function generateEye(cx, cy, color, size = 12) {
    const colorHex = EYE_COLOR_HEX[color] || '#1a1a1a';
    
    return `
        <g class="eye">
            <circle cx="${cx}" cy="${cy}" r="${size}" fill="${colorHex}" stroke="#333" stroke-width="1.5"/>
            <circle cx="${cx - size * 0.3}" cy="${cy - size * 0.2}" r="${size * 0.15}" fill="white" opacity="0.8"/>
            <circle cx="${cx + size * 0.2}" cy="${cy - size * 0.3}" r="${size * 0.1}" fill="white" opacity="0.6"/>
            <circle cx="${cx}" cy="${cy}" r="${size * 0.4}" fill="#000"/>
            <circle cx="${cx - size * 0.15}" cy="${cy - size * 0.15}" r="${size * 0.15}" fill="white" opacity="0.9"/>
        </g>
    `;
}

/**
 * Generate multiple eyes arranged on the poop face.
 * Supports 1-6 eyes with different arrangements.
 * 
 * @param {number} numEyes - Number of eyes (1-6)
 * @param {string} eyeColor - Eye color name
 * @param {Object} positioning - Positioning data from generatePoopBody
 * @returns {string} SVG group elements for all eyes
 */
function generateEyes(numEyes, eyeColor, positioning) {
    let eyesSvg = '';
    
    const { cx, faceY, faceWidth } = positioning;
    const scale = faceWidth / 160;
    
    // Eye position offsets for different eye counts
    const eyeOffsets = {
        1: [[0, 0]],
        2: [[-25 * scale, 0], [25 * scale, 0]],
        3: [[-35 * scale, 5], [0, -5], [35 * scale, 5]],
        4: [[-35 * scale, -5], [-12 * scale, 5], [12 * scale, 5], [35 * scale, -5]],
        5: [[-40 * scale, 0], [-20 * scale, -10], [0, 0], [20 * scale, -10], [40 * scale, 0]],
        6: [[-42 * scale, 5], [-22 * scale, -8], [-5 * scale, 5], [10 * scale, 5], [28 * scale, -8], [45 * scale, 5]]
    };
    
    // Clamp to valid range
    numEyes = Math.max(1, Math.min(6, numEyes));
    
    const offsets = eyeOffsets[numEyes];
    offsets.forEach(([ox, oy], i) => {
        const x = cx + ox;
        const y = faceY + oy;
        // Slight size variation for visual interest
        const eyeSize = Math.max(8, (9 + (i % 2) * 2) * scale);
        eyesSvg += generateEye(x, y, eyeColor, eyeSize);
    });
    
    return eyesSvg;
}

/**
 * Generate mouth based on style.
 * Supports smile, frown, tongue, shark, and none.
 * 
 * @param {string} style - Mouth style name
 * @param {Object} positioning - Positioning data from generatePoopBody
 * @returns {string} SVG group element for the mouth (empty string for 'none')
 */
function generateMouth(style, positioning) {
    if (style === 'none') return '';
    
    const { cx, faceY, faceWidth } = positioning;
    const mouthY = faceY + 25;
    const scale = faceWidth / 160;
    const mouthWidth = 30 * scale;
    
    if (style === 'smile') {
        return `
            <g class="mouth">
                <path d="M ${cx - mouthWidth},${mouthY} Q ${cx},${mouthY + 20 * scale} ${cx + mouthWidth},${mouthY}" 
                      stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>
            </g>
        `;
    }
    
    if (style === 'frown') {
        return `
            <g class="mouth">
                <path d="M ${cx - mouthWidth},${mouthY + 12 * scale} Q ${cx},${mouthY - 8 * scale} ${cx + mouthWidth},${mouthY + 12 * scale}" 
                      stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>
            </g>
        `;
    }
    
    if (style === 'tongue') {
        return `
            <g class="mouth">
                <path d="M ${cx - mouthWidth},${mouthY} Q ${cx},${mouthY + 20 * scale} ${cx + mouthWidth},${mouthY}" 
                      stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>
                <ellipse cx="${cx}" cy="${mouthY + 12 * scale}" rx="${10 * scale}" ry="${7 * scale}" fill="#FF6B6B"/>
                <ellipse cx="${cx}" cy="${mouthY + 10 * scale}" rx="${8 * scale}" ry="${4 * scale}" fill="#FF8585" opacity="0.6"/>
            </g>
        `;
    }
    
    if (style === 'shark') {
        const toothW = 6 * scale;
        return `
            <g class="mouth">
                <path d="M ${cx - mouthWidth - 10},${mouthY - 2} 
                         Q ${cx},${mouthY + 25 * scale} ${cx + mouthWidth + 10},${mouthY - 2} 
                         Q ${cx},${mouthY + 12 * scale} ${cx - mouthWidth - 10},${mouthY - 2}" 
                      fill="#2a0a0a" stroke="#333" stroke-width="2"/>
                <polygon points="${cx - mouthWidth},${mouthY - 2} ${cx - mouthWidth + toothW},${mouthY + 10 * scale} ${cx - mouthWidth + toothW * 2},${mouthY - 2}" fill="white" stroke="#ddd" stroke-width="0.5"/>
                <polygon points="${cx - toothW * 1.5},${mouthY - 2} ${cx - toothW * 0.5},${mouthY + 12 * scale} ${cx + toothW * 0.5},${mouthY - 2}" fill="white" stroke="#ddd" stroke-width="0.5"/>
                <polygon points="${cx + toothW},${mouthY - 2} ${cx + toothW * 2},${mouthY + 10 * scale} ${cx + mouthWidth},${mouthY - 2}" fill="white" stroke="#ddd" stroke-width="0.5"/>
                <polygon points="${cx - toothW},${mouthY + 18 * scale} ${cx},${mouthY + 8 * scale} ${cx + toothW},${mouthY + 18 * scale}" fill="white" stroke="#ddd" stroke-width="0.5"/>
            </g>
        `;
    }
    
    // Default to smile if unknown style
    return generateMouth('smile', positioning);
}

/**
 * Generate crocheted-style arms.
 * Arms extend from the sides of the body.
 * 
 * @param {Object} colors - Color palette object
 * @param {Object} positioning - Positioning data from generatePoopBody
 * @returns {string} SVG group element for the arms
 */
function generateArms(colors, positioning) {
    const { cx, armY, armLayerWidth = 120 } = positioning;
    const bodyEdge = armLayerWidth / 2;
    
    const leftStartX = cx - bodyEdge + 5;
    const rightStartX = cx + bodyEdge - 5;
    
    return `
        <g class="arms">
            <path d="M ${leftStartX},${armY} 
                     C ${leftStartX - 20},${armY + 5} ${leftStartX - 35},${armY + 15} ${leftStartX - 30},${armY + 30} 
                     C ${leftStartX - 25},${armY + 45} ${leftStartX - 10},${armY + 40} ${leftStartX - 5},${armY + 30}" 
                  fill="url(#yarn_pattern)" stroke="${colors.dark}" stroke-width="2"/>
            <ellipse cx="${leftStartX - 28}" cy="${armY + 33}" rx="10" ry="8" 
                     fill="${colors.main}" stroke="${colors.dark}" stroke-width="1.5"/>
            <path d="M ${rightStartX},${armY} 
                     C ${rightStartX + 20},${armY + 5} ${rightStartX + 35},${armY + 15} ${rightStartX + 30},${armY + 30} 
                     C ${rightStartX + 25},${armY + 45} ${rightStartX + 10},${armY + 40} ${rightStartX + 5},${armY + 30}" 
                  fill="url(#yarn_pattern)" stroke="${colors.dark}" stroke-width="2"/>
            <ellipse cx="${rightStartX + 28}" cy="${armY + 33}" rx="10" ry="8" 
                     fill="${colors.main}" stroke="${colors.dark}" stroke-width="1.5"/>
        </g>
    `;
}

/**
 * Generate crocheted-style legs.
 * Legs extend from the bottom of the body.
 * 
 * @param {Object} colors - Color palette object
 * @param {Object} positioning - Positioning data from generatePoopBody
 * @returns {string} SVG group element for the legs
 */
function generateLegs(colors, positioning) {
    const { cx, legY } = positioning;
    
    return `
        <g class="legs">
            <path d="M ${cx - 30},${legY} 
                     C ${cx - 35},${legY + 15} ${cx - 40},${legY + 35} ${cx - 35},${legY + 50} 
                     C ${cx - 30},${legY + 60} ${cx - 15},${legY + 60} ${cx - 10},${legY + 50}" 
                  fill="url(#yarn_pattern)" stroke="${colors.dark}" stroke-width="2"/>
            <ellipse cx="${cx - 23}" cy="${legY + 55}" rx="15" ry="8" 
                     fill="${colors.main}" stroke="${colors.dark}" stroke-width="1.5"/>
            <path d="M ${cx + 30},${legY} 
                     C ${cx + 35},${legY + 15} ${cx + 40},${legY + 35} ${cx + 35},${legY + 50} 
                     C ${cx + 30},${legY + 60} ${cx + 15},${legY + 60} ${cx + 10},${legY + 50}" 
                  fill="url(#yarn_pattern)" stroke="${colors.dark}" stroke-width="2"/>
            <ellipse cx="${cx + 23}" cy="${legY + 55}" rx="15" ry="8" 
                     fill="${colors.main}" stroke="${colors.dark}" stroke-width="1.5"/>
        </g>
    `;
}

/**
 * Generate cute blush marks on the cheeks.
 * 
 * @param {Object} positioning - Positioning data from generatePoopBody
 * @returns {string} SVG group element for the blush marks
 */
function generateBlush(positioning) {
    const { cx, faceY, faceWidth } = positioning;
    const scale = faceWidth / 160;
    const blushOffset = 40 * scale;
    const blushY = faceY + 18 * scale;
    
    return `
        <g class="blush">
            <ellipse cx="${cx - blushOffset}" cy="${blushY}" rx="${10 * scale}" ry="${6 * scale}" fill="#FFB6C1" opacity="0.5"/>
            <ellipse cx="${cx + blushOffset}" cy="${blushY}" rx="${10 * scale}" ry="${6 * scale}" fill="#FFB6C1" opacity="0.5"/>
        </g>
    `;
}

/**
 * Generate the complete crocheted poop emoji SVG.
 * Assembles all components in the correct order.
 * 
 * @param {Object} cfg - Configuration object with all poop options
 * @returns {string} Complete SVG string
 */
function generateCrochetPoopSvg(cfg) {
    const colors = BODY_COLORS[cfg.bodyColor] || BODY_COLORS.chocolate;
    const { svg: bodySvg, positioning } = generatePoopBody(cfg.numLayers, colors);
    
    // Calculate viewbox dimensions based on whether legs are present
    const viewboxHeight = cfg.hasLegs 
        ? Math.round(positioning.legY + 80) 
        : Math.round(positioning.bottomY + 20);
    const viewboxWidth = 230;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" 
         viewBox="0 0 ${viewboxWidth} ${viewboxHeight}" 
         width="${viewboxWidth}" height="${viewboxHeight}">
        ${generateYarnTexturePattern('yarn_pattern', colors)}
        <rect width="100%" height="100%" fill="none"/>
    `;
    
    // Add legs first (behind body)
    if (cfg.hasLegs) {
        svg += generateLegs(colors, positioning);
    }
    
    // Add arms
    if (cfg.hasArms) {
        svg += generateArms(colors, positioning);
    }
    
    // Add main body
    svg += `<g class="poop-body">${bodySvg}</g>`;
    
    // Add face elements
    svg += generateEyes(cfg.numEyes, cfg.eyeColor, positioning);
    svg += generateMouth(cfg.mouthStyle, positioning);
    svg += generateBlush(positioning);
    
    svg += '</svg>';
    
    return svg;
}

// =============================================================================
// Audio Utility Functions
// =============================================================================

/**
 * Play a random fart sound effect.
 * Selects randomly from the available fart sounds and plays it.
 */
function playRandomFart() {
    // Select a random fart sound from the array
    const randomIndex = Math.floor(Math.random() * FART_SOUNDS.length);
    const selectedSound = FART_SOUNDS[randomIndex];
    
    // Construct the full path to the audio file
    const audioPath = `${AUDIO_BASE_PATH}${selectedSound}`;
    
    // Create a new Audio object and play it
    const audio = new Audio(audioPath);
    
    // Play the audio (catch any errors silently)
    audio.play().catch((error) => {
        // Log error but don't interrupt user experience
        console.warn('Could not play fart sound:', error);
    });
}

/**
 * Handle a configuration change with potential sound effect.
 * Plays a fart sound every 5th change.
 */
function handleConfigChange() {
    changeCounter++;
    
    // every change has 25% chance to fart
    if (Math.floor(Math.random() * 4) === 0) {
        playRandomFart();
    }
}

// =============================================================================
// Filename Generation
// =============================================================================

/**
 * Generate a descriptive filename based on current configuration.
 * 
 * @param {string} extension - File extension (svg or png)
 * @returns {string} Generated filename
 */
function generateFilename(extension) {
    const parts = [
        'crochet_poop',
        config.bodyColor,
        `${config.numLayers}layers`,
        `${config.numEyes}${config.eyeColor}eye${config.numEyes !== 1 ? 's' : ''}`
    ];
    
    // Add mouth style if not default smile
    if (config.mouthStyle !== 'smile') {
        parts.push(config.mouthStyle);
    }
    
    // Add limbs if present
    if (config.hasArms) {
        parts.push('arms');
    }
    if (config.hasLegs) {
        parts.push('legs');
    }
    
    return `${parts.join('_')}.${extension}`;
}

// =============================================================================
// Download Functions
// =============================================================================

/**
 * Download the current poop as an SVG file.
 * Always plays a fart sound when downloading.
 */
function downloadSvg() {
    // Play a satisfying fart sound when plopping out the SVG
    playRandomFart();
    
    const svgString = generateCrochetPoopSvg(config);
    const svgForDownload = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
    
    const blob = new Blob([svgForDownload], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = generateFilename('svg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Download the current poop as a PNG file.
 * Uses canvas rendering for conversion.
 * Always plays a fart sound when downloading.
 */
function downloadPng() {
    // Play a satisfying fart sound when plopping out the PNG
    playRandomFart();
    
    const svgString = generateCrochetPoopSvg(config);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const scale = 2; // Higher resolution output
    
    // Convert SVG to base64 data URL (works better in sandboxed environments)
    const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
    
    img.onload = () => {
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        
        // Get PNG as data URL and trigger download
        const pngDataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngDataUrl;
        link.download = generateFilename('png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    img.onerror = (err) => {
        console.error('Error loading SVG for PNG conversion:', err);
        alert('PNG download failed. Try downloading as SVG instead.');
    };
    
    img.src = dataUrl;
}

// =============================================================================
// UI Update Functions
// =============================================================================

/**
 * Update the preview display with the current configuration.
 */
function updatePreview() {
    const container = document.getElementById('previewContainer');
    const description = document.getElementById('previewDescription');
    
    // Generate and display the SVG
    container.innerHTML = generateCrochetPoopSvg(config);
    
    // Update the description text
    let descText = `A beautiful ${config.bodyColor} log with ${config.numLayers} stinky stacks, `;
    descText += `${config.numEyes} ${config.eyeColor} stink eye${config.numEyes !== 1 ? 's' : ''}, `;
    descText += config.mouthStyle === 'none' ? 'no mouth' : `${config.mouthStyle} mouth`;
    if (config.hasArms) descText += ', fudge fingers';
    if (config.hasLegs) descText += ', turd trotters';
    
    description.textContent = descText;
}

/**
 * Update slider value display.
 * 
 * @param {string} sliderId - ID of the slider element
 * @param {string} displayId - ID of the display span element
 */
function updateSliderDisplay(sliderId, displayId) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    display.textContent = slider.value;
}

/**
 * Initialize eye color option buttons.
 * Creates color swatch buttons for each available eye color.
 */
function initEyeColorOptions() {
    const container = document.getElementById('eyeColorOptions');
    
    Object.entries(EYE_COLOR_HEX).forEach(([name, hex]) => {
        const label = document.createElement('label');
        label.className = `eye-color-option${name === config.eyeColor ? ' selected' : ''}`;
        label.style.backgroundColor = hex;
        label.style.borderColor = name === 'black' ? '#666' : hex;
        label.title = name.charAt(0).toUpperCase() + name.slice(1);
        
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'eyeColor';
        input.value = name;
        input.checked = name === config.eyeColor;
        
        // Screen reader text
        const srText = document.createElement('span');
        srText.className = 'sr-only';
        srText.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        
        label.appendChild(input);
        label.appendChild(srText);
        container.appendChild(label);
    });
}

// =============================================================================
// Event Handlers
// =============================================================================

/**
 * Handle body color selection change.
 * 
 * @param {Event} event - Change event from radio input
 */
function handleBodyColorChange(event) {
    if (event.target.name === 'bodyColor' && event.target.checked) {
        config.bodyColor = event.target.value;
        
        // Update selected state on labels
        document.querySelectorAll('.color-option').forEach(label => {
            label.classList.toggle('selected', label.dataset.color === config.bodyColor);
        });
        
        handleConfigChange();
        updatePreview();
    }
}

/**
 * Handle layers slider change.
 */
function handleLayersChange() {
    const slider = document.getElementById('numLayers');
    config.numLayers = parseInt(slider.value, 10);
    updateSliderDisplay('numLayers', 'layersValue');
    handleConfigChange();
    updatePreview();
}

/**
 * Handle eyes slider change.
 */
function handleEyesChange() {
    const slider = document.getElementById('numEyes');
    config.numEyes = parseInt(slider.value, 10);
    updateSliderDisplay('numEyes', 'eyesValue');
    handleConfigChange();
    updatePreview();
}

/**
 * Handle eye color selection change.
 * 
 * @param {Event} event - Change event from radio input
 */
function handleEyeColorChange(event) {
    if (event.target.name === 'eyeColor' && event.target.checked) {
        config.eyeColor = event.target.value;
        
        // Update selected state on labels
        document.querySelectorAll('.eye-color-option').forEach(label => {
            const input = label.querySelector('input');
            label.classList.toggle('selected', input.value === config.eyeColor);
        });
        
        handleConfigChange();
        updatePreview();
    }
}

/**
 * Handle mouth style selection change.
 * 
 * @param {Event} event - Change event from radio input
 */
function handleMouthStyleChange(event) {
    if (event.target.name === 'mouthStyle' && event.target.checked) {
        config.mouthStyle = event.target.value;
        
        // Update selected state on labels
        document.querySelectorAll('.mouth-option').forEach(label => {
            const input = label.querySelector('input');
            label.classList.toggle('selected', input.checked);
        });
        
        handleConfigChange();
        updatePreview();
    }
}

/**
 * Handle arms checkbox change.
 */
function handleArmsChange() {
    const checkbox = document.getElementById('hasArms');
    config.hasArms = checkbox.checked;
    handleConfigChange();
    updatePreview();
}

/**
 * Handle legs checkbox change.
 */
function handleLegsChange() {
    const checkbox = document.getElementById('hasLegs');
    config.hasLegs = checkbox.checked;
    handleConfigChange();
    updatePreview();
}

// =============================================================================
// Initialization
// =============================================================================

/**
 * Initialize the application.
 * Sets up all event listeners and renders initial preview.
 */
function init() {
    // Initialize eye color buttons
    initEyeColorOptions();
    
    // Body color selection
    document.querySelectorAll('.color-option input').forEach(input => {
        input.addEventListener('change', handleBodyColorChange);
    });
    
    // Sliders
    document.getElementById('numLayers').addEventListener('input', handleLayersChange);
    document.getElementById('numEyes').addEventListener('input', handleEyesChange);
    
    // Eye color selection
    document.getElementById('eyeColorOptions').addEventListener('change', handleEyeColorChange);
    
    // Mouth style selection
    document.querySelectorAll('.mouth-option input').forEach(input => {
        input.addEventListener('change', handleMouthStyleChange);
    });
    
    // Checkboxes
    document.getElementById('hasArms').addEventListener('change', handleArmsChange);
    document.getElementById('hasLegs').addEventListener('change', handleLegsChange);
    
    // Download buttons
    document.getElementById('downloadSvg').addEventListener('click', downloadSvg);
    document.getElementById('downloadPng').addEventListener('click', downloadPng);
    
    // Initial preview render
    updatePreview();
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);
