/**
 * MATEPLUX DP GENERATOR - CANVAS HANDLER (PIXEL-PERFECT FIX)
 * Mateplux Media Systems Ltd.
 * Version: 1.0.2 - Precise Photo/Name Alignment for Your Frame
 */

class DPCanvasHandler {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) throw new Error(`Canvas #${canvasId} not found`);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        
        // Canvas dimensions
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // PIXEL-PERFECT Config for Your Frame (measured via image analysis)
        this.config = {
            photo: {
                centerX: 540,                     // Exact middle X
                centerY: 495,                     // Exact Y for white circle top-center
                radius: 352                       // Exact radius (diameter 704px, fits circle)
            },
            name: {
                centerX: 540,                     // Same X as photo
                centerY: 945,                     // Exact Y for white tag center
                maxWidth: 432,                    // Exact tag width minus 10px padding each side
                padding: 10,                      // Inner padding for text
                fontSize: { min: 30, max: 72 }    // Range for dynamic fit
            }
        };
        
        // State
        this.userImage = null;
        this.frameImage = null;
        this.userName = '';
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        
        // Your frame URL (permanent)
        this.frameImagePath = 'https://files.catbox.moe/7i5p0r.png';  // Update if new upload
        
        // Enable high DPI rendering
        this.setupHighDPI();
        
        // Debug mode (press 'D' to toggle in browser)
        this.debugMode = false;
        
        // Resize listener for mobile
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    // High DPI setup (fixed for crisp renders)
    setupHighDPI() {
        const dpr = window.devicePixelRatio || 1;
        if (dpr > 1) {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            
            // Scale config for DPR
            this.config.photo.centerX *= dpr;
            this.config.photo.centerY *= dpr;
            this.config.photo.radius *= dpr;
            this.config.name.centerX *= dpr;
            this.config.name.centerY *= dpr;
            this.config.name.maxWidth *= dpr;
        }
    }

    // Resize handler
    handleResize() {
        this.setupHighDPI();
        this.draw();  // Redraw on resize
    }

    // Async frame load with error fallback
    async loadFrame() {
        return new Promise((resolve, reject) => {
            this.frameImage = new Image();
            this.frameImage.crossOrigin = 'anonymous';
            
            this.frameImage.onload = () => {
                console.log('Frame loaded: ', this.frameImagePath);
                resolve(true);
            };
            
            this.frameImage.onerror = (err) => {
                console.error('Frame load error:', err);
                this.drawError('Frame not found. Check URL.');
                reject(new Error('Frame load failed'));
            };
            
            this.frameImage.src = this.frameImagePath + '?t=' + Date.now();  // Cache bust
        });
    }

    // Setters (unchanged)
    setUserImage(img) { this.userImage = img; }
    setUserName(name) { this.userName = name; }
    setImageZoom(zoom) { this.imageZoom = Math.max(0.5, Math.min(2, zoom)); }
    setImagePosX(x) { this.imagePosX = Math.max(-100, Math.min(100, x)); }
    setImagePosY(y) { this.imagePosY = Math.max(-100, Math.min(100, y)); }
    resetAdjustments() { this.imageZoom = 1; this.imagePosX = 0; this.imagePosY = 0; }

    // Main draw (optimized with guards)
    draw() {
        if (!this.frameImage) {
            this.drawError('Loading frame...');
            return;
        }

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw frame
        this.ctx.drawImage(this.frameImage, 0, 0, this.width, this.height);

        // Draw photo if loaded
        if (this.userImage) this.drawPhoto();

        // Draw name if set
        if (this.userName.trim()) this.drawName();

        // Debug overlay (if enabled)
        if (this.debugMode) this.drawDebugOverlay();
    }

    // FIXED: Photo draw with exact clip & positioning
    drawPhoto() {
        const { centerX, centerY, radius } = this.config.photo;
        const scaledRadius = radius * this.imageZoom;
        const offsetX = this.imagePosX * (scaledRadius / radius);
        const offsetY = this.imagePosY * (scaledRadius / radius);
        const drawX = centerX - scaledRadius + offsetX;
        const drawY = centerY - scaledRadius + offsetY;

        // Clip to exact circle
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
        this.ctx.clip();

        // Draw image scaled & positioned exactly
        this.ctx.drawImage(this.userImage, drawX, drawY, scaledRadius * 2, scaledRadius * 2);

        this.ctx.restore();
    }

    // FIXED: Name draw with dynamic sizing & padding
    drawName() {
        const { centerX, centerY, maxWidth, padding, fontSize } = this.config.name;
        const text = this.userName.toUpperCase().trim();

        if (!text) return;

        this.ctx.save();

        // Start with max font, scale down to fit with padding
        let currentFontSize = fontSize.max;
        this.ctx.font = `bold ${currentFontSize}px Arial`;

        // Measure and fit loop
        while (this.ctx.measureText(text).width > maxWidth - (padding * 2) && currentFontSize > fontSize.min) {
            currentFontSize -= 2;
            this.ctx.font = `bold ${currentFontSize}px Arial`;
        }

        // Position with padding (center in tag)
        const textX = centerX;
        const textY = centerY;

        // Black fill for name
        this.ctx.fillStyle = '#000000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, textX, textY);

        this.ctx.restore();
    }

    // Error overlay
    drawError(message = 'Error') {
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Error Loading Frame', this.width / 2, this.height / 2 - 20);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText(message, this.width / 2, this.height / 2 + 30);
    }

    // Debug overlay (press 'D' to toggle)
    drawDebugOverlay() {
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);

        // Photo circle debug
        const { centerX, centerY, radius } = this.config.photo;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Name tag debug
        const { centerX: nx, centerY: ny, maxWidth } = this.config.name;
        this.ctx.strokeRect(nx - maxWidth / 2, ny - 40, maxWidth, 80);  // Approx tag height

        this.ctx.setLineDash([]);
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Photo: (${centerX.toFixed(0)}, ${centerY.toFixed(0)}, r=${radius.toFixed(0)})`, 10, 30);
        this.ctx.fillText(`Name: (${nx.toFixed(0)}, ${ny.toFixed(0)}, w=${maxWidth.toFixed(0)})`, 10, 50);
    }

    // Toggle debug (global key listener)
    toggleDebug() {
        this.debugMode = !this.debugMode;
        this.draw();
        console.log('Debug mode:', this.debugMode ? 'ON (press D to toggle)' : 'OFF');
    }

    // Export methods (unchanged)
    async exportAsBlob(type = 'image/png', quality = 0.95) {
        return new Promise((resolve, reject) => {
            this.canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Export failed')), type, quality);
        });
    }

    exportAsDataURL(type = 'image/png', quality = 0.95) {
        return this.canvas.toDataURL(type, quality);
    }

    isReadyForDownload() {
        return !!this.userImage && !!this.frameImage;
    }

    getStats() {
        return {
            hasImage: !!this.userImage,
            hasFrame: !!this.frameImage,
            hasName: this.userName.length > 0,
            zoom: this.imageZoom,
            position: { x: this.imagePosX, y: this.imagePosY }
        };
    }

    reset() {
        this.userImage = null;
        this.userName = '';
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        this.draw();
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.draw();
    }
}

// Global init function
let dpCanvas = null;
function initializeCanvas(canvasId = 'dpCanvas') {
    dpCanvas = new DPCanvasHandler(canvasId);
    
    // Global debug toggle (press 'D')
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'd' && dpCanvas) dpCanvas.toggleDebug();
    });
    
    return dpCanvas;
}

// Export
if (typeof window !== 'undefined') {
    window.DPCanvasHandler = DPCanvasHandler;
    window.initializeCanvas = initializeCanvas;
}
