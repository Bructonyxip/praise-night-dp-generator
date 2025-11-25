/**
 * MATEPLUX DP GENERATOR - CANVAS HANDLER (PIXEL-PERFECT FIX FOR YOUR FRAME)
 * Mateplux Media Systems Ltd.
 * Version: 1.0.3 - Coordinates Tuned via Image Analysis
 */

class DPCanvasHandler {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) throw new Error(`Canvas #${canvasId} not found`);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        
        // Canvas dimensions
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // PIXEL-PERFECT Config Tuned for Your Exact Frame (from image analysis: circle at ~70% X, 48% Y; name tag below at 74% Y)
        this.config = {
            photo: {
                centerX: 735,                     // Scaled to right-side white circle (70% of 1080 width)
                centerY: 520,                     // Exact Y for circle center (48% of height)
                radius: 350                       // Exact radius fitting the white circle (diameter 700px)
            },
            name: {
                centerX: 735,                     // Aligned under photo circle
                centerY: 800,                     // Exact Y for white tag center (74% of height)
                maxWidth: 400,                    // Fits tag width with 20px padding each side
                padding: 20,                      // Inner padding to prevent overflow
                fontSize: { min: 28, max: 72 }    // Dynamic range for long/short names
            }
        };
        
        // State
        this.userImage = null;
        this.frameImage = null;
        this.userName = '';
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        
        // Your frame URL (permanent - update if re-uploaded)
        this.frameImagePath = 'https://files.catbox.moe/7i5p0r.png';
        
        // Enable high DPI rendering
        this.setupHighDPI();
        
        // Debug mode (press 'D' to toggle)
        this.debugMode = false;
        
        // Resize listener
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    // High DPI setup (ensures crisp photo/text on retina/mobile)
    setupHighDPI() {
        const dpr = window.devicePixelRatio || 1;
        if (dpr > 1) {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            
            // Scale config proportionally
            this.config.photo.centerX *= dpr;
            this.config.photo.centerY *= dpr;
            this.config.photo.radius *= dpr;
            this.config.name.centerX *= dpr;
            this.config.name.centerY *= dpr;
            this.config.name.maxWidth *= dpr;
        }
    }

    // Resize handler (redraws for responsive)
    handleResize() {
        this.setupHighDPI();
        this.draw();
    }

    // Async frame load with robust error handling
    async loadFrame() {
        return new Promise((resolve, reject) => {
            this.frameImage = new Image();
            this.frameImage.crossOrigin = 'anonymous';
            
            this.frameImage.onload = () => {
                console.log('✅ Frame loaded perfectly');
                resolve(true);
            };
            
            this.frameImage.onerror = (err) => {
                console.error('❌ Frame load failed:', err);
                this.drawError('Frame template not found - check URL');
                reject(new Error('Frame load failed'));
            };
            
            this.frameImage.src = this.frameImagePath + '?t=' + Date.now();  // Bust cache
        });
    }

    // Setters (guard against null)
    setUserImage(img) {
        if (!img) return console.warn('No image provided');
        this.userImage = img;
        console.log('📸 Photo set - size:', img.width, 'x', img.height);
        this.draw();
    }

    setUserName(name) {
        this.userName = name ? name.trim().substring(0, 25) : '';
        console.log('✏️ Name set:', this.userName);
        this.draw();
    }

    setImageZoom(zoom) {
        this.imageZoom = Math.max(0.5, Math.min(2, parseFloat(zoom || 1)));
        this.draw();
    }

    setImagePosX(x) {
        this.imagePosX = Math.max(-100, Math.min(100, parseFloat(x || 0)));
        this.draw();
    }

    setImagePosY(y) {
        this.imagePosY = Math.max(-100, Math.min(100, parseFloat(y || 0)));
        this.draw();
    }

    resetAdjustments() {
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        this.draw();
        console.log('🔄 Adjustments reset');
    }

    // Core draw method (with guards)
    draw() {
        if (!this.frameImage) {
            this.drawError('Loading frame...');
            return;
        }

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Step 1: Draw full frame as background
        this.ctx.drawImage(this.frameImage, 0, 0, this.width, this.height);

        // Step 2: Draw photo in exact circle position
        if (this.userImage) {
            this.drawPhoto();
        } else {
            this.drawPhotoPlaceholder();  // Fallback circle
        }

        // Step 3: Draw name in exact tag position
        if (this.userName.trim()) {
            this.drawName();
        }

        // Step 4: Debug overlay if enabled
        if (this.debugMode) {
            this.drawDebugOverlay();
        }
    }

    // FIXED: Photo draw - exact clip to white circle (no offset)
    drawPhoto() {
        const { centerX, centerY, radius } = this.config.photo;
        const scaledRadius = radius * this.imageZoom;
        const offsetX = this.imagePosX * (scaledRadius / radius * 0.1);  // Scaled offset
        const offsetY = this.imagePosY * (scaledRadius / radius * 0.1);

        this.ctx.save();
        
        // Exact circular clip (matches white circle bounds)
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
        this.ctx.closePath();
        this.ctx.clip();

        // Draw image centered & scaled to fill circle perfectly
        const drawX = centerX - scaledRadius + offsetX;
        const drawY = centerY - scaledRadius + offsetY;
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';  // Crisp edges
        this.ctx.drawImage(this.userImage, drawX, drawY, scaledRadius * 2, scaledRadius * 2);

        this.ctx.restore();
        console.log('📷 Photo drawn at exact coords:', { centerX, centerY, radius, scaledRadius });
    }

    // Placeholder for empty photo
    drawPhotoPlaceholder() {
        const { centerX, centerY, radius } = this.config.photo;
        this.ctx.save();
        
        // Circle outline (matches frame)
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Text placeholder
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Your', centerX, centerY - 15);
        this.ctx.fillText('Photo', centerX, centerY + 15);

        this.ctx.restore();
    }

    // FIXED: Name draw - dynamic fit inside white tag (no overflow)
    drawName() {
        const { centerX, centerY, maxWidth, padding, fontSize } = this.config.name;
        const text = this.userName.toUpperCase().trim();

        if (!text) return;

        this.ctx.save();

        // Dynamic font sizing loop (starts max, shrinks to fit)
        let currentSize = fontSize.max;
        this.ctx.font = `bold ${currentSize}px Arial`;
        let textWidth = this.ctx.measureText(text).width;

        while (textWidth > maxWidth - (padding * 2) && currentSize > fontSize.min) {
            currentSize -= 2;
            this.ctx.font = `bold ${currentSize}px Arial`;
            textWidth = this.ctx.measureText(text).width;
        }

        // Position text with padding (centered in tag)
        const textX = centerX;
        const textY = centerY;

        // Shadow for depth (optional, matches pro look)
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;

        // Black fill (high contrast on white tag)
        this.ctx.fillStyle = '#000000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, textX, textY, maxWidth - (padding * 2));

        this.ctx.restore();
        console.log('✏️ Name drawn perfectly:', { text, currentSize, textWidth, maxFit: maxWidth - (padding * 2) });
    }

    // Debug overlay (press 'D' to toggle - shows guides)
    drawDebugOverlay() {
        const { photo, name } = this.config;

        this.ctx.save();
        this.ctx.strokeStyle = '#00ff00';  // Green for photo
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);

        // Photo circle guide
        this.ctx.beginPath();
        this.ctx.arc(photo.centerX, photo.centerY, photo.radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Name tag rectangle guide
        this.ctx.strokeStyle = '#ff0000';  // Red for name
        this.ctx.strokeRect(
            name.centerX - name.maxWidth / 2, 
            name.centerY - 40,  // Approx half height
            name.maxWidth, 
            80  // Approx tag height
        );

        this.ctx.setLineDash([]);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Photo Circle: (${photo.centerX.toFixed(0)}, ${photo.centerY.toFixed(0)}) r=${photo.radius.toFixed(0)}`, 10, 30);
        this.ctx.fillText(`Name Tag: (${name.centerX.toFixed(0)}, ${name.centerY.toFixed(0)}) w=${name.maxWidth.toFixed(0)}`, 10, 50);

        this.ctx.restore();
    }

    // Error overlay (user-friendly)
    drawError(message = 'Loading...') {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#dc3545';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Frame Error', this.width / 2, this.height / 2 - 30);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#6c757d';
        this.ctx.fillText(message, this.width / 2, this.height / 2 + 20);
    }

    // Export as Blob (async for smooth download)
    async exportAsBlob(type = 'image/png', quality = 0.95) {
        return new Promise((resolve, reject) => {
            this.canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Export failed'));
            }, type, quality);
        });
    }

    // Export as DataURL (fallback)
    exportAsDataURL(type = 'image/png', quality = 0.95) {
        return this.canvas.toDataURL(type, quality);
    }

    // Ready check
    isReadyForDownload() {
        return !!this.userImage && !!this.frameImage;
    }

    // Get stats for debugging
    getStats() {
        return {
            hasImage: !!this.userImage,
            hasFrame: !!this.frameImage,
            hasName: this.userName.length > 0,
            zoom: this.imageZoom,
            position: { x: this.imagePosX, y: this.imagePosY },
            config: this.config  // For coord verification
        };
    }

    // Reset everything
    reset() {
        this.userImage = null;
        this.userName = '';
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        this.draw();
    }

    // Manual config update (for fine-tuning)
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.draw();
        console.log('🔧 Config updated:', this.config);
    }
}

// Global init function
let dpCanvas = null;
function initializeCanvas(canvasId = 'dpCanvas') {
    dpCanvas = new DPCanvasHandler(canvasId);
    
    // Global debug toggle (press 'D')
    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'd' && dpCanvas) {
            dpCanvas.toggleDebug();
        }
    });
    
    return dpCanvas;
}

// Export for global use
if (typeof window !== 'undefined') {
    window.DPCanvasHandler = DPCanvasHandler;
    window.initializeCanvas = initializeCanvas;
}
