/**
 * MATEPLUX DP GENERATOR - MAIN APPLICATION (FIXED VERSION)
 * Mateplux Media Systems Ltd.
 */

const AppState = {
    dpCanvas: null,
    isInitialized: false,
    isProcessing: false,
    uploadedFile: null
};

const Elements = {
    photoInput: null,
    uploadArea: null,
    uploadContainer: null,
    uploadedPreview: null,
    previewImage: null,
    changePhotoBtn: null,
    nameInput: null,
    charCount: null,
    zoomSlider: null,
    posXSlider: null,
    posYSlider: null,
    resetAdjustBtn: null,
    downloadBtn: null,
    loadingOverlay: null
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Mateplux DP Generator - Initializing...');
    
    initializeElements();
    initializeCanvasSimple();
    setupEventListeners();
    loadSavedState();
    
    console.log('✅ Application ready!');
});

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

// SIMPLIFIED CANVAS INITIALIZATION
async function initializeCanvasSimple() {
    try {
        showLoading(true);
        console.log('🔄 Starting canvas initialization...');
        
        // Initialize canvas handler
        AppState.dpCanvas = initializeCanvas('dpCanvas');
        console.log('✅ Canvas handler created');
        
        // Load frame with retries
        let frameLoaded = false;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!frameLoaded && attempts < maxAttempts) {
            attempts++;
            console.log(`🔄 Frame load attempt ${attempts}/${maxAttempts}`);
            
            try {
                frameLoaded = await AppState.dpCanvas.loadFrame();
                
                if (frameLoaded) {
                    console.log('✅ Frame loaded successfully!');
                    AppState.isInitialized = true;
                    Toast.success('Generator ready!');
                } else {
                    console.warn(`⚠️ Frame load attempt ${attempts} failed`);
                    if (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            } catch (error) {
                console.error(`❌ Error on attempt ${attempts}:`, error);
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        
        if (!frameLoaded) {
            console.error('❌ Failed to load frame after all attempts');
            Toast.error('Failed to load template. Please refresh the page.');
        }
        
        showLoading(false);
    } catch (error) {
        console.error('❌ Critical initialization error:', error);
        Toast.error('Failed to initialize generator. Please refresh.');
        showLoading(false);
    }
}

function setupEventListeners() {
    Elements.uploadArea.addEventListener('click', handleUploadClick);
    Elements.photoInput.addEventListener('change', handleFileSelect);
    Elements.changePhotoBtn.addEventListener('click', handleUploadClick);
    
    Elements.uploadArea.addEventListener('dragover', handleDragOver);
    Elements.uploadArea.addEventListener('dragleave', handleDragLeave);
    Elements.uploadArea.addEventListener('drop', handleDrop);
    
    Elements.nameInput.addEventListener('input', handleNameInput);
    
    Elements.zoomSlider.addEventListener('input', throttle(handleZoomChange, 50));
    Elements.posXSlider.addEventListener('input', throttle(handlePositionChange, 50));
    Elements.posYSlider.addEventListener('input', throttle(handlePositionChange, 50));
    
    Elements.resetAdjustBtn.addEventListener('click', handleResetAdjustments);
    Elements.downloadBtn.addEventListener('click', handleDownload);
    
    document.addEventListener('keydown', handleKeyboardShortcuts);
    window.addEventListener('beforeunload', handleBeforeUnload);
}

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
    const validation = FileValidator.validate(file);
    if (!validation.valid) {
        Toast.error(validation.error);
        return;
    }
    
    try {
        showLoading(true);
        
        const image = await ImageLoader.load(file);
        
        if (AppState.dpCanvas && AppState.isInitialized) {
            AppState.dpCanvas.setUserImage(image);
            AppState.uploadedFile = file;
            
            showUploadedPreview(image);
            updateDownloadButton();
            saveState();
            
            Toast.success('Photo uploaded successfully!');
        } else {
            Toast.error('Generator not ready. Please refresh the page.');
        }
        
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

const handleNameInput = debounce((event) => {
    const name = event.target.value;
    
    Elements.charCount.textContent = name.length;
    
    if (AppState.dpCanvas && AppState.isInitialized) {
        AppState.dpCanvas.setUserName(name);
        saveState();
        updateDownloadButton();
    }
}, 300);

function handleZoomChange(event) {
    const zoom = parseFloat(event.target.value);
    if (AppState.dpCanvas && AppState.isInitialized) {
        AppState.dpCanvas.setImageZoom(zoom);
        saveState();
    }
}

function handlePositionChange() {
    const x = parseInt(Elements.posXSlider.value);
    const y = parseInt(Elements.posYSlider.value);
    if (AppState.dpCanvas && AppState.isInitialized) {
        AppState.dpCanvas.setImagePosition(x, y);
        saveState();
    }
}

function handleResetAdjustments() {
    Elements.zoomSlider.value = 1;
    Elements.posXSlider.value = 0;
    Elements.posYSlider.value = 0;
    
    if (AppState.dpCanvas && AppState.isInitialized) {
        AppState.dpCanvas.resetAdjustments();
        saveState();
        Toast.info('Adjustments reset');
    }
}

async function handleDownload() {
    if (!AppState.dpCanvas || !AppState.dpCanvas.isReadyForDownload()) {
        Toast.error('Please upload a photo first!');
        return;
    }
    
    if (AppState.isProcessing) {
        return;
    }
    
    try {
        AppState.isProcessing = true;
        showLoading(true);
        
        const name = Elements.nameInput.value || 'user';
        const filename = DownloadUtils.generateFilename(name);
        
        DownloadUtils.downloadCanvas(AppState.dpCanvas.canvas, filename);
        
        Toast.success('DP downloaded successfully!');
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

function showLoading(show) {
    if (Elements.loadingOverlay) {
        Elements.loadingOverlay.classList.toggle('active', show);
    }
}

function updateDownloadButton() {
    const canDownload = AppState.dpCanvas && AppState.dpCanvas.isReadyForDownload();
    Elements.downloadBtn.disabled = !canDownload;
}

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
        
        if (AppState.isInitialized && AppState.dpCanvas) {
            AppState.dpCanvas.setUserName(saved.userName);
            AppState.dpCanvas.setImageZoom(saved.zoom);
            AppState.dpCanvas.setImagePosition(saved.posX, saved.posY);
        }
        
        Elements.charCount.textContent = saved.userName.length;
    }
}

function handleKeyboardShortcuts(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (!Elements.downloadBtn.disabled) {
            handleDownload();
        }
    }
    
    if ((event.ctrlKey || event.metaKey) && event.key === 'u') {
        event.preventDefault();
        handleUploadClick();
    }
    
    if (event.key === 'Escape') {
        handleResetAdjustments();
    }
}

function handleBeforeUnload(event) {
    if (AppState.uploadedFile && Elements.nameInput.value) {
        event.preventDefault();
        event.returnValue = 'You have unsaved work. Are you sure you want to leave?';
        return event.returnValue;
    }
}

function trackDownload() {
    console.log('📊 Download tracked:', {
        hasName: Elements.nameInput.value.length > 0,
        timestamp: new Date().toISOString()
    });
}

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

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

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
