/**
 * MATEPLUX DP GENERATOR - MAIN APPLICATION
 * Mateplux Media Systems Ltd.
 * Version: 1.0.1 - Fixed Init Failures
 */

// Application State
const AppState = {
    dpCanvas: null,
    isInitialized: false,
    isProcessing: false,
    uploadedFile: null
};

// DOM Elements (with null guards)
const Elements = {
    // Upload elements
    photoInput: null,
    uploadArea: null,
    uploadContainer: null,
    uploadedPreview: null,
    previewImage: null,
    changePhotoBtn: null,

    // Input elements
    nameInput: null,
    charCount: null,
    zoomSlider: null,
    posXSlider: null,
    posYSlider: null,
    resetAdjustBtn: null,

    // Action buttons
    downloadBtn: null,
    generateBtn: null,
    
    // Loading overlay
    loadingOverlay: null
};

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎨 Mateplux DP Generator - Initializing...');
    
    try {
        await initializeApp();
        console.log('✅ Application ready!');
        Toast.success('Generator loaded successfully!');
    } catch (error) {
        console.error('Initialization failed:', error);
        Toast.error('Failed to load generator. Please refresh the page.');
    }
});

// Main init function (async for canvas load)
async function initializeApp() {
    initializeElements();
    await initializeCanvas();
    setupEventListeners();
    loadSavedState();
}

// Initialize DOM elements (with null checks)
function initializeElements() {
    const getElement = (id) => {
        const el = document.getElementById(id);
        if (!el) console.warn(`Element #${id} not found`);
        return el;
    };

    Elements.photoInput = getElement('photoInput');
    Elements.uploadArea = getElement('uploadArea');
    Elements.uploadContainer = getElement('uploadContainer');
    Elements.uploadedPreview = getElement('uploadedPreview');
    Elements.previewImage = getElement('previewImage');
    Elements.changePhotoBtn = getElement('changePhotoBtn');
    
    Elements.nameInput = getElement('nameInput');
    Elements.charCount = getElement('charCount');
    Elements.zoomSlider = getElement('zoomSlider');
    Elements.posXSlider = getElement('posXSlider');
    Elements.posYSlider = getElement('posYSlider');
    Elements.resetAdjustBtn = getElement('resetAdjustBtn');
    
    Elements.downloadBtn = getElement('downloadBtn');
    Elements.generateBtn = getElement('generateBtn');
    Elements.loadingOverlay = getElement('loadingOverlay');

    // Enable generate button if elements exist
    if (Elements.generateBtn) Elements.generateBtn.disabled = false;
}

// Initialize canvas (async for image load)
async function initializeCanvas() {
    showLoading(true);
    
    if (!window.initializeCanvas) {
        throw new Error('Canvas handler not loaded');
    }

    AppState.dpCanvas = initializeCanvas('dpCanvas');
    
    if (!AppState.dpCanvas) {
        throw new Error('Failed to initialize canvas');
    }

    // Wait for frame load
    const frameLoaded = await AppState.dpCanvas.loadFrame();
    
    if (frameLoaded) {
        AppState.isInitialized = true;
        showLoading(false);
        return true;
    } else {
        throw new Error('Frame image failed to load');
    }
}

// Setup event listeners (with guards)
function setupEventListeners() {
    // Photo upload
    if (Elements.photoInput) {
        Elements.photoInput.addEventListener('change', handleFileUpload);
    }

    if (Elements.uploadArea) {
        Elements.uploadArea.addEventListener('click', () => Elements.photoInput?.click());
        Elements.uploadArea.addEventListener('dragover', handleDragOver);
        Elements.uploadArea.addEventListener('drop', handleDrop);
    }

    if (Elements.changePhotoBtn) {
        Elements.changePhotoBtn.addEventListener('click', () => Elements.photoInput?.click());
    }

    // Name input
    if (Elements.nameInput) {
        Elements.nameInput.addEventListener('input', handleNameInput);
    }

    // Adjustments
    if (Elements.zoomSlider) Elements.zoomSlider.addEventListener('input', throttle(handleZoomChange, 50));
    if (Elements.posXSlider) Elements.posXSlider.addEventListener('input', throttle(handlePositionChange, 50));
    if (Elements.posYSlider) Elements.posYSlider.addEventListener('input', throttle(handlePositionChange, 50));
    if (Elements.resetAdjustBtn) Elements.resetAdjustBtn.addEventListener('click', handleResetAdjustments);

    // Generate & Download
    if (Elements.generateBtn) Elements.generateBtn.addEventListener('click', handleGenerate);
    if (Elements.downloadBtn) Elements.downloadBtn.addEventListener('click', handleDownload);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Before unload
    window.addEventListener('beforeunload', handleBeforeUnload);
}

// File upload handler (debounced)
function handleFileUpload(e) {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    const validation = FileValidator.validate(file);
    if (!validation.valid) {
        Toast.error(validation.error);
        return;
    }

    AppState.uploadedFile = file;
    processFile(file);
}

// Drag & Drop handlers
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    Elements.uploadArea?.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    Elements.uploadArea?.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
        Elements.photoInput.files = e.dataTransfer.files;
        handleFileUpload({ target: { files: [file] } });
    }
}

// Process uploaded file
async function processFile(file) {
    if (AppState.isProcessing) return;

    AppState.isProcessing = true;
    showLoading(true);

    try {
        const img = await ImageLoader.load(file);
        Elements.previewImage.src = img.src;
        Elements.uploadContainer.style.display = 'block';
        Elements.uploadArea.style.display = 'none';

        // Update canvas
        if (AppState.dpCanvas) {
            AppState.dpCanvas.setUserImage(img);
            AppState.dpCanvas.setUserName(Elements.nameInput.value);
            AppState.dpCanvas.draw();
        }

        Toast.success('Photo uploaded successfully!');
        updateGenerateButton();
    } catch (error) {
        console.error('File processing error:', error);
        Toast.error('Failed to process photo. Try again.');
    } finally {
        AppState.isProcessing = false;
        showLoading(false);
    }
}

// Name input handler
function handleNameInput(e) {
    const value = e.target.value;
    Elements.charCount.textContent = value.length + '/20';

    if (AppState.dpCanvas) {
        AppState.dpCanvas.setUserName(value);
        AppState.dpCanvas.draw();
    }

    saveState();
    updateGenerateButton();
}

// Adjustment handlers (throttled)
function handleZoomChange(e) {
    if (AppState.dpCanvas) {
        AppState.dpCanvas.setImageZoom(parseFloat(e.target.value));
        AppState.dpCanvas.draw();
    }
    saveState();
}

function handlePositionChange(e) {
    if (AppState.dpCanvas) {
        const slider = e.target;
        const value = parseFloat(slider.value);
        if (slider.id === 'posXSlider') {
            AppState.dpCanvas.setImagePosX(value);
        } else {
            AppState.dpCanvas.setImagePosY(value);
        }
        AppState.dpCanvas.draw();
    }
    saveState();
}

function handleResetAdjustments() {
    if (Elements.zoomSlider) Elements.zoomSlider.value = 1;
    if (Elements.posXSlider) Elements.posXSlider.value = 0;
    if (Elements.posYSlider) Elements.posYSlider.value = 0;

    if (AppState.dpCanvas) {
        AppState.dpCanvas.resetAdjustments();
        AppState.dpCanvas.draw();
    }

    saveState();
    Toast.success('Adjustments reset');
}

// Generate button logic
function updateGenerateButton() {
    const hasPhoto = AppState.uploadedFile;
    const hasName = Elements.nameInput.value.trim().length > 0;
    
    if (Elements.generateBtn) {
        Elements.generateBtn.disabled = !(hasPhoto && AppState.isInitialized);
        Elements.generateBtn.textContent = hasPhoto ? 'Generate DP' : 'Upload Photo First';
    }
}

// Generate handler
async function handleGenerate() {
    if (!AppState.isInitialized || !AppState.uploadedFile) return;

    showLoading(true);

    try {
        AppState.dpCanvas.setUserName(Elements.nameInput.value);
        AppState.dpCanvas.draw();

        Elements.generateBtn.disabled = true;
        Elements.generateBtn.textContent = 'Generating...';

        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing

        Elements.downloadBtn.disabled = false;
        Elements.downloadBtn.style.display = 'block';

        trackDownload();

        Toast.success('DP generated! Download ready.');
    } catch (error) {
        console.error('Generate error:', error);
        Toast.error('Failed to generate DP');
    } finally {
        showLoading(false);
        Elements.generateBtn.disabled = false;
        Elements.generateBtn.textContent = 'Generate DP';
    }
}

// Download handler
async function handleDownload() {
    if (!AppState.dpCanvas.isReadyForDownload()) {
        Toast.error('Please generate your DP first');
        return;
    }

    showLoading(true);

    try {
        const blob = await AppState.dpCanvas.exportAsBlob('image/png', 0.95);
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `PraiseNight2025_${Elements.nameInput.value.replace(/\s+/g, '_').toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        Toast.success('Downloaded successfully!');
        trackDownload();
    } catch (error) {
        console.error('Download error:', error);
        Toast.error('Download failed. Try again.');
    } finally {
        showLoading(false);
    }
}

// Loading overlay
function showLoading(show = true) {
    if (Elements.loadingOverlay) {
        Elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

// Save state to localStorage
function saveState() {
    const state = {
        userName: Elements.nameInput?.value || '',
        zoom: Elements.zoomSlider?.value || 1,
        posX: Elements.posXSlider?.value || 0,
        posY: Elements.posYSlider?.value || 0,
        timestamp: Date.now()
    };

    localStorage.setItem('praiseNightDPState', JSON.stringify(state));
}

// Load saved state
function loadSavedState() {
    const saved = localStorage.getItem('praiseNightDPState');
    if (!saved) return;

    try {
        const state = JSON.parse(saved);
        
        if (Elements.nameInput) Elements.nameInput.value = state.userName;
        if (Elements.charCount) Elements.charCount.textContent = state.userName.length + '/20';

        if (Elements.zoomSlider) Elements.zoomSlider.value = state.zoom;
        if (Elements.posXSlider) Elements.posXSlider.value = state.posX;
        if (Elements.posYSlider) Elements.posYSlider.value = state.posY;

        if (AppState.dpCanvas) {
            AppState.dpCanvas.setUserName(state.userName);
            AppState.dpCanvas.setImageZoom(parseFloat(state.zoom));
            AppState.dpCanvas.setImagePosX(parseFloat(state.posX));
            AppState.dpCanvas.setImagePosY(parseFloat(state.posY));
            AppState.dpCanvas.draw();
        }

        updateGenerateButton();
    } catch (error) {
        console.error('Load state error:', error);
    }
}

// Keyboard shortcuts
function handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 's':
                event.preventDefault();
                handleDownload();
                break;
            case 'u':
                event.preventDefault();
                Elements.photoInput?.click();
                break;
        }
    }
}

// Before unload warning
function handleBeforeUnload(event) {
    if (AppState.uploadedFile && Elements.nameInput.value.trim()) {
        event.preventDefault();
        event.returnValue = 'You have unsaved work. Are you sure?';
        return event.returnValue;
    }
}

// Analytics (stub - add your GA ID)
function trackDownload() {
    console.log('📊 Download:', {
        name: Elements.nameInput.value,
        timestamp: new Date().toISOString()
    });
    // gtag('event', 'dp_download', { event_category: 'PraiseNight2025' });
}

// Throttle utility
function throttle(func, limit) {
    let inThrottle;
    return function() {
        if (!inThrottle) {
            func.apply(this, arguments);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
