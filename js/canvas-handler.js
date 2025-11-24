/**
 * MATEPLUX DP GENERATOR - CANVAS HANDLER
 * Handles all canvas drawing operations
 * Mateplux Media Systems Ltd.
 */

class DPCanvasHandler {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        
        // Canvas dimensions
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Frame configuration (adjust these based on your template)
        this.config = {
            photo: {
                centerX: this.width / 2,          // Center of circle
                centerY: this.height * 0.32,      // 32% from top
                radius: this.width * 0.23         // 23% of canvas width
            },
            name: {
                centerX: this.width / 2,
                centerY: this.height * 0.565,     // Position of name box
                maxWidth: this.width * 0.4,       // Maximum text width
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
        
        // Frame image path
     this.frameImagePath = 'https://bructonyxip.github.io/praise-night-dp-generator/assets/images/frame.png';
        
        // Enable high DPI rendering
        this.setupHighDPI();
    }

    // Setup high DPI rendering
    setupHighDPI() {
        const dpr = window.devicePixelRatio || 1;
        
        if (dpr > 1) {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
        }
    }

    // Load frame image
    async loadFrame() {
        try {
            this.frameImage = await ImageLoader.loadFromUrl(this.frameImagePath);
            this.draw();
            return true;
        } catch (error) {
            console.error('Failed to load frame:', error);
            this.drawError('Failed to load template. Please refresh the page.');
            return false;
        }
    }

    // Set user uploaded image
    setUserImage(image) {
        this.userImage = image;
        this.draw();
    }

    // Set user name
    setUserName(name) {
        this.userName = TextUtils.sanitize(name);
        this.draw();
    }

    // Set image adjustments
    setImageZoom(zoom) {
        this.imageZoom = parseFloat(zoom);
        this.draw();
    }

    setImagePosition(x, y) {
        this.imagePosX = parseInt(x);
        this.imagePosY = parseInt(y);
        this.draw();
    }

    // Reset image adjustments
    resetAdjustments() {
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        this.draw();
    }

    // Main draw function
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Fill with white background
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw user photo if available
        if (this.userImage) {
            this.drawUserPhoto();
        } else {
            this.drawPhotoPlaceholder();
        }

        // Draw frame overlay
        if (this.frameImage) {
            this.drawFrame();
        }

        // Draw user name if provided
        if (this.userName) {
            this.drawUserName();
        }
    }

    // Draw user photo in circular area
    drawUserPhoto() {
        const { centerX, centerY, radius } = this.config.photo;

        this.ctx.save();

        // Create circular clipping path
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.clip();

        // Calculate image dimensions maintaining aspect ratio
        const scale = Math.max(
            (radius * 2) / this.userImage.width,
            (radius * 2) / this.userImage.height
        ) * this.imageZoom;

        const imgWidth = this.userImage.width * scale;
        const imgHeight = this.userImage.height * scale;
        const imgX = centerX - imgWidth / 2 + this.imagePosX;
        const imgY = centerY - imgHeight / 2 + this.imagePosY;

        // Draw image with smooth rendering
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.drawImage(this.userImage, imgX, imgY, imgWidth, imgHeight);

        this.ctx.restore();
    }

    // Draw placeholder when no photo is uploaded
    drawPhotoPlaceholder() {
        const { centerX, centerY, radius } = this.config.photo;

        this.ctx.save();

        // Draw circle outline
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Draw placeholder text
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.font = 'bold 40px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Your Photo', centerX, centerY - 20);
        
        this.ctx.font = '30px Arial, sans-serif';
        this.ctx.fillText('Here', centerX, centerY + 20);

        this.ctx.restore();
    }

    // Draw frame overlay
    drawFrame() {
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.drawImage(this.frameImage, 0, 0, this.width, this.height);
        this.ctx.restore();
    }

    // Draw user name in the designated area
    drawUserName() {
        if (!this.userName) return;

        const { centerX, centerY, maxWidth, fontSize } = this.config.name;

        this.ctx.save();

        // Set text properties
        this.ctx.fillStyle = '#000000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Calculate optimal font size
        let size = fontSize.max;
        const nameLength = this.userName.length;

        if (nameLength > 15) {
            size = fontSize.max - 10;
        }
        if (nameLength > 20) {
            size = fontSize.min;
        }

        this.ctx.font = `bold ${size}px Arial, sans-serif`;

        // Measure text and adjust if needed
        let textWidth = this.ctx.measureText(this.userName.toUpperCase()).width;
        
        while (textWidth > maxWidth && size > fontSize.min) {
            size -= 2;
            this.ctx.font = `bold ${size}px Arial, sans-serif`;
            textWidth = this.ctx.measureText(this.userName.toUpperCase()).width;
        }

        // Draw text with shadow for better readability
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;

        this.ctx.fillText(this.userName.toUpperCase(), centerX, centerY, maxWidth);

        this.ctx.restore();
    }

    // Draw error message
    drawError(message) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Error', this.width / 2, this.height / 2 - 40);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#666';
        
        // Word wrap error message
        const words = message.split(' ');
        let line = '';
        let y = this.height / 2 + 20;
        
        words.forEach(word => {
            const testLine = line + word + ' ';
            const metrics = this.ctx.measureText(testLine);
            
            if (metrics.width > this.width - 100) {
                this.ctx.fillText(line, this.width / 2, y);
                line = word + ' ';
                y += 30;
            } else {
                line = testLine;
            }
        });
        
        this.ctx.fillText(line, this.width / 2, y);
    }

    // Export canvas as blob
    async exportAsBlob(type = 'image/png', quality = 1.0) {
        return new Promise((resolve, reject) => {
            this.canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to export canvas'));
                }
            }, type, quality);
        });
    }

    // Export canvas as data URL
    exportAsDataURL(type = 'image/png', quality = 1.0) {
        return this.canvas.toDataURL(type, quality);
    }

    // Check if canvas is ready for download
    isReadyForDownload() {
        return this.userImage !== null && this.frameImage !== null;
    }

    // Get canvas statistics
    getStats() {
        return {
            hasImage: this.userImage !== null,
            hasFrame: this.frameImage !== null,
            hasName: this.userName.length > 0,
            zoom: this.imageZoom,
            position: {
                x: this.imagePosX,
                y: this.imagePosY
            }
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

    // Update frame configuration (for fine-tuning)
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.draw();
    }
}

// Initialize and export
let dpCanvas = null;

function initializeCanvas(canvasId = 'dpCanvas') {
    dpCanvas = new DPCanvasHandler(canvasId);
    return dpCanvas;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.DPCanvasHandler = DPCanvasHandler;
    window.initializeCanvas = initializeCanvas;

}
