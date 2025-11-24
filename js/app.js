/**
 * MATEPLUX DP GENERATOR - MAIN APPLICATION
 * Mateplux Media Systems Ltd.
 * Version: 1.0.0
 */

// Application State
const AppState = {
    dpCanvas: null,
    isInitialized: false,
    isProcessing: false,
    uploadedFile: null
};

// DOM Elements
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
    
    // Loading overlay
    loadingOverlay: null
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Mateplux DP Generator - Initializing...');
    
    initializeElements();
    initializeCanvas();
    setupEventListeners();
    loadSavedState();
    
    console.log('✅ Application ready!');
});

// Initialize DOM elements
function initializeElements() {
    Elements.photoInput = document.getElementById('photoInput');
    Elements.uploadArea = document.getElementById('uploadArea');
    Elements.uploadContainer = document.getElementById('uploadContainer');
    Elements.uploadedPreview = document.getElementById('uploadedPreview');
    Elements.previewImage = document.getElementById('previewImage');
    Elements.changePhotoBtn = document.getElementById('changePhotoBtn');
    
    Elements.nameInput = document.getElementById('nameInput');
    Elements.charCount = document.getElementById('charCount');
    Elements.zoomSlider = document.getElementById('zoomSlider');
    Elements.posXSlider = document.getElementById('posXSlider');
    Elements.posYSlider = document.getElementById('posYSlider');
    Elements.resetAdjustBtn = document.getElementById('resetAdjustBtn');
    
    Elements.downloadBtn = document.getElementById('downloadBtn');
    Elements.loadingOverlay = document.getElementById('loadingOverlay');
}

// Initialize canvas
async function initializeCanvas() {
    try {
        showLoading(true);
        
        AppState.dpCanvas = initializeCanvas('dpCanvas');
        
        // Load frame image
        const frameLoaded = await AppState.dpCanvas.loadFrame();
        
        if (frameLoaded) {
            AppState.isInitialized = true;
            Toast.success('Generator ready!');
        } else {
            Toast.error('Failed to load template');
        }
        
        showLoading(false);
    } catch (error) {
        console.error('Initialization error:', error);
        Toast.error('Failed to initialize generator');
        showLoading(false);
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Photo upload
    Elements.uploadArea.addEventListener('click', handleUploadClick);
    Elements.photoInput.addEventListener('change', handleFileSelect);
    Elements.changePhotoBtn.addEventListener('click', handleUploadClick);
    
    // Drag and drop
    Elements.uploadArea.addEventListener('dragover', handleDragOver);
    Elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    Elements.uploadArea.addEventListener('drop', handleDrop);
    
    // Name input
    Elements.nameInput.addEventListener('input', handleNameInput);
    
    // Sliders
    Elements.zoomSlider.addEventListener('input', throttle(handleZoomChange, 50));
    Elements.posXSlider.addEventListener('input', throttle(handlePositionChange, 50));
    Elements.posYSlider.addEventListener('input', throttle(handlePositionChange, 50));
    
    // Reset button
    Elements.resetAdjustBtn.addEventListener('click', handleResetAdjustments);
    
    // Download button
    Elements.downloadBtn.addEventListener('click', handleDownload);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Prevent accidental page leave
    window.addEventListener('beforeunload', handleBeforeUnload);
}

// === UPLOAD HANDLERS ===

function handleUploadClick() {
    Elements.photoInput.click();
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        await processFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    Elements.uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    Elements.uploadArea.classList.remove('dragover');
}

async function handleDrop(event) {
    event.preventDefault();
    Elements.uploadArea.classList.remove('dragover');
    
    const file = event.dataTransfer.files[0];
    if (file) {
        await processFile(file);
    }
}

async function processFile(file) {
    // Validate file
    const validation = FileValidator.validate(file);
    if (!validation.valid) {
        Toast.error(validation.error);
        return;
    }
    
    try {
        showLoading(true);
        
        // Load image
        const image = await ImageLoader.load(file);
        
        // Set to canvas
        AppState.dpCanvas.setUserImage(image);
        AppState.uploadedFile = file;
        
        // Update UI
        showUploadedPreview(image);
        updateDownloadButton();
        
        // Save state
        saveState();
        
        Toast.success('Photo uploaded successfully!');
        showLoading(false);
    } catch (error) {
        console.error('File processing error:', error);
        Toast.error('Failed to process image. Please try another file.');
        showLoading(false);
    }
}

function showUploadedPreview(image) {
    Elements.previewImage.src = image.src;
    Elements.uploadArea.style.display = 'none';
    Elements.uploadedPreview.style.display = 'block';
}

function hideUploadedPreview() {
    Elements.uploadArea.style.display = 'block';
    Elements.uploadedPreview.style.display = 'none';
    Elements.previewImage.src = '';
}

// === NAME INPUT HANDLER ===

const handleNameInput = debounce((event) => {
    const name = event.target.value;
    
    // Update character count
    Elements.charCount.textContent = name.length;
    
    // Update canvas
    AppState.dpCanvas.setUserName(name);
    
    // Save state
    saveState();
    
    // Update download button
    updateDownloadButton();
}, 300);

// === SLIDER HANDLERS ===

function handleZoomChange(event) {
    const zoom = parseFloat(event.target.value);
    AppState.dpCanvas.setImageZoom(zoom);
    saveState();
}

function handlePositionChange() {
    const x = parseInt(Elements.posXSlider.value);
    const y = parseInt(Elements.posYSlider.value);
    AppState.dpCanvas.setImagePosition(x, y);
    saveState();
}

function handleResetAdjustments() {
    // Reset sliders
    Elements.zoomSlider.value = 1;
    Elements.posXSlider.value = 0;
    Elements.posYSlider.value = 0;
    
    // Reset canvas
    AppState.dpCanvas.resetAdjustments();
    
    saveState();
    Toast.info('Adjustments reset');
}

// === DOWNLOAD HANDLER ===

async function handleDownload() {
    if (!AppState.dpCanvas.isReadyForDownload()) {
        Toast.error('Please upload a photo first!');
        return;
    }
    
    if (AppState.isProcessing) {
        return;
    }
    
    try {
        AppState.isProcessing = true;
        showLoading(true);
        
        // Generate filename
        const name = Elements.nameInput.value || 'user';
        const filename = DownloadUtils.generateFilename(name);
        
        // Download
        DownloadUtils.downloadCanvas(AppState.dpCanvas.canvas, filename);
        
        Toast.success('DP downloaded successfully!');
        
        // Track download (you can add analytics here)
        trackDownload();
        
        showLoading(false);
        AppState.isProcessing = false;
    } catch (error) {
        console.error('Download error:', error);
        Toast.error('Failed to download. Please try again.');
        showLoading(false);
        AppState.isProcessing = false;
    }
}

// === UI HELPERS ===

function showLoading(show) {
    if (Elements.loadingOverlay) {
        Elements.loadingOverlay.classList.toggle('active', show);
    }
}

function updateDownloadButton() {
    const canDownload = AppState.dpCanvas && AppState.dpCanvas.isReadyForDownload();
    Elements.downloadBtn.disabled = !canDownload;
}

// === STATE MANAGEMENT ===

function saveState() {
    if (!AppState.isInitialized) return;
    
    const state = {
        userName: Elements.nameInput.value,
        zoom: parseFloat(Elements.zoomSlider.value),
        posX: parseInt(Elements.posXSlider.value),
        posY: parseInt(Elements.posYSlider.value),
        timestamp: Date.now()
    };
    
    StorageManager.set('last_state', state);
}

function loadSavedState() {
    const saved = StorageManager.get('last_state');
    
    if (saved && saved.userName) {
        Elements.nameInput.value = saved.userName;
        Elements.zoomSlider.value = saved.zoom || 1;
        Elements.posXSlider.value = saved.posX || 0;
        Elements.posYSlider.value = saved.posY || 0;
        
        // Update canvas if initialized
        if (AppState.isInitialized) {
            AppState.dpCanvas.setUserName(saved.userName);
            AppState.dpCanvas.setImageZoom(saved.zoom);
            AppState.dpCanvas.setImagePosition(saved.posX, saved.posY);
        }
        
        // Update character count
        Elements.charCount.textContent = saved.userName.length;
    }
}

// === KEYBOARD SHORTCUTS ===

function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + S: Download
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (!Elements.downloadBtn.disabled) {
            handleDownload();
        }
    }
    
    // Ctrl/Cmd + U: Upload
    if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
        event.preventDefault();
        handleUploadClick();
    }
    
    // Escape: Reset adjustments
    if (event.key === 'Escape') {
        handleResetAdjustments();
    }
}

// === BEFORE UNLOAD ===

function handleBeforeUnload(event) {
    if (AppState.uploadedFile && Elements.nameInput.value) {
        event.preventDefault();
        event.returnValue = 'You have unsaved work. Are you sure you want to leave?';
        return event.returnValue;
    }
}

// === ANALYTICS & TRACKING ===

function trackDownload() {
    // Add your analytics tracking here
    console.log('📊 Download tracked:', {
        hasName: Elements.nameInput.value.length > 0,
        timestamp: new Date().toISOString()
    });
    
    // Example: Google Analytics
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', 'download', {
    //         'event_category': 'DP_Generator',
    //         'event_label': 'Praise_Night_2025'
    //     });
    // }
}

// === SMOOTH SCROLLING ===

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// === ERROR HANDLING ===

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Don't show toast for every error, but log it
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Don't show toast for every rejection, but log it
});

// === EXPORT FOR TESTING ===

if (typeof window !== 'undefined') {
    window.MatepluxDPApp = {
        state: AppState,
        elements: Elements,
        handlers: {
            processFile,
            handleDownload,
            saveState,
            loadSavedState
        }
    };
}
