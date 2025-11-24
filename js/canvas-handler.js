/**
 * MATEPLUX DP GENERATOR - CANVAS HANDLER
 * Version: 1.0.1 - Fixed Init & Coord Issues
 */

class DPCanvasHandler {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) throw new Error(`Canvas #${canvasId} not found`);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        
        // Canvas dimensions
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Frame configuration (tuned for your poster: circle at ~center-top, name tag below)
        this.config = {
            photo: {
                centerX: this.width / 2,          // 540
                centerY: this.height * 0.32,      // ~615 (adjusted for your frame)
                radius: this.width * 0.23         // ~248
            },
            name: {
                centerX: this.width / 2,
                centerY: this.height * 0.565,     // ~1085 (name tag center)
                maxWidth: this.width * 0.4,       // ~432
                fontSize: {
                    min: 30,
                    max: 60
                }
            }
        };
        
        // State
        this.userImage = null;
        this.frameImage = null;
        this.userName = '';
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        
        // Frame image path (your uploaded frame)
        this.frameImagePath = 'https://files.catbox.moe/7i5p0r.png';  // Replace if needed
        
        // Enable high DPI
        this.setupHighDPI();
        
        // Resize listener
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    // High DPI setup (fixed)
    setupHighDPI() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.width = this.canvas.width / dpr;
        this.height = this.canvas.height / dpr;
    }

    // Resize handler
    handleResize() {
        this.setupHighDPI();
        this.draw();  // Redraw on resize
    }

    // Async frame load (fixed with error handling)
    async loadFrame() {
        return new Promise((resolve, reject) => {
            this.frameImage = new Image();
            this.frameImage.crossOrigin = 'anonymous';
            
            this.frameImage.onload = () => {
                console.log('Frame loaded successfully');
                resolve(true);
            };
            
            this.frameImage.onerror = () => {
                console.error('Frame load failed');
                reject(new Error('Failed to load frame image'));
            };
            
            this.frameImage.src = this.frameImagePath + '?t=' + Date.now();  // Cache bust
        });
    }

    // Set user image
    setUserImage(img) {
        this.userImage = img;
    }

    // Set user name
    setUserName(name) {
        this.userName = name;
    }

    // Set zoom
    setImageZoom(zoom) {
        this.imageZoom = Math.max(0.5, Math.min(2, zoom));
    }

    // Set position
    setImagePosX(x) {
        this.imagePosX = Math.max(-100, Math.min(100, x));
    }

    setImagePosY(y) {
        this.imagePosY = Math.max(-100, Math.min(100, y));
    }

    // Reset adjustments
    resetAdjustments() {
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
    }

    // Main draw function (optimized)
    draw() {
        if (!this.frameImage) return;  // Guard

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw frame
        this.ctx.drawImage(this.frameImage, 0, 0, this.width, this.height);

        // Draw photo if loaded
        if (this.userImage) {
            this.drawPhoto();
        }

        // Draw name if set
        if (this.userName) {
            this.drawName();
        }
    }

    // Draw photo with clip (pixel-perfect for your frame)
    drawPhoto() {
        const { centerX, centerY, radius } = this.config.photo;
        const scaledRadius = radius * this.imageZoom;
        const x = centerX + this.imagePosX;
        const y = centerY + this.imagePosY;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.clip();

        // Draw scaled image
        this.ctx.drawImage(this.userImage, x - scaledRadius, y - scaledRadius, scaledRadius * 2, scaledRadius * 2);

        this.ctx.restore();
    }

    // Draw name with fit (dynamic size)
    drawName() {
        const { centerX, centerY, maxWidth } = this.config.name;

        this.ctx.save();
        this.ctx.fillStyle = '#000000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        let fontSize = 72;
        this.ctx.font = `bold ${fontSize}px Arial`;

        // Fit text
        while (this.ctx.measureText(this.userName.toUpperCase()).width > maxWidth && fontSize > 30) {
            fontSize -= 2;
            this.ctx.font = `bold ${fontSize}px Arial`;
        }

        this.ctx.fillText(this.userName.toUpperCase(), centerX, centerY);

        this.ctx.restore();
    }

    // Export as blob (async fixed)
    async exportAsBlob(type = 'image/png', quality = 0.95) {
        return new Promise((resolve, reject) => {
            this.canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Export failed'));
            }, type, quality);
        });
    }

    // Export as data URL
    exportAsDataURL(type = 'image/png', quality = 0.95) {
        return this.canvas.toDataURL(type, quality);
    }

    // Ready check
    isReadyForDownload() {
        return !!this.userImage && !!this.frameImage;
    }

    // Stats
    getStats() {
        return {
            hasImage: !!this.userImage,
            hasFrame: !!this.frameImage,
            hasName: this.userName.length > 0,
            zoom: this.imageZoom,
            position: { x: this.imagePosX, y: this.imagePosY }
        };
    }

    // Reset
    reset() {
        this.userImage = null;
        this.userName = '';
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        this.draw();
    }

    // Update config
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.draw();
    }
}

// Global init (fixed)
let dpCanvas = null;

function initializeCanvas(canvasId = 'dpCanvas') {
    dpCanvas = new DPCanvasHandler(canvasId);
    return dpCanvas;
}

if (typeof window !== 'undefined') {
    window.DPCanvasHandler = DPCanvasHandler;
    window.initializeCanvas = initializeCanvas;
}
