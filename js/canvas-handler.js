/**
 * MATEPLUX DP GENERATOR - CANVAS HANDLER (ULTRA-SIMPLIFIED VERSION)
 * Mateplux Media Systems Ltd.
 */

class DPCanvasHandler {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Frame configuration
        this.config = {
            photo: {
                centerX: this.width / 2,
                centerY: this.height * 0.32,
                radius: this.width * 0.23
            },
            name: {
                centerX: this.width / 2,
                centerY: this.height * 0.565,
                maxWidth: this.width * 0.4,
                fontSize: { min: 30, max: 60 }
            }
        };
        
        this.userImage = null;
        this.frameImage = null;
        this.userName = '';
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        
        this.setupHighDPI();
    }

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

    // ULTRA-SIMPLE frame loading
    loadFrame() {
        return new Promise((resolve) => {
            this.frameImage = new Image();
            
            this.frameImage.onload = () => {
                console.log('✅ FRAME LOADED SUCCESSFULLY!');
                this.draw();
                resolve(true);
            };
            
            this.frameImage.onerror = (error) => {
                console.error('❌ FRAME FAILED TO LOAD:', error);
                console.error('Tried to load from:', this.frameImage.src);
                this.drawError('Failed to load frame template');
                resolve(false);
            };
            
            // Try absolute path first
            const basePath = window.location.origin + window.location.pathname.replace(/\/$/, '');
            this.frameImage.src = basePath + '/assets/images/frame.png';
            
            console.log('🔄 Attempting to load frame from:', this.frameImage.src);
        });
    }

    setUserImage(image) {
        this.userImage = image;
        this.draw();
    }

    setUserName(name) {
        this.userName = name.trim().substring(0, 25);
        this.draw();
    }

    setImageZoom(zoom) {
        this.imageZoom = parseFloat(zoom);
        this.draw();
    }

    setImagePosition(x, y) {
        this.imagePosX = parseInt(x);
        this.imagePosY = parseInt(y);
        this.draw();
    }

    resetAdjustments() {
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.width, this.height);

        if (this.userImage) {
            this.drawUserPhoto();
        } else {
            this.drawPhotoPlaceholder();
        }

        if (this.frameImage) {
            this.drawFrame();
        } else {
            console.warn('⚠️ Frame image not loaded yet');
        }

        if (this.userName) {
            this.drawUserName();
        }
    }

    drawUserPhoto() {
        const { centerX, centerY, radius } = this.config.photo;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.clip();

        const scale = Math.max(
            (radius * 2) / this.userImage.width,
            (radius * 2) / this.userImage.height
        ) * this.imageZoom;

        const imgWidth = this.userImage.width * scale;
        const imgHeight = this.userImage.height * scale;
        const imgX = centerX - imgWidth / 2 + this.imagePosX;
        const imgY = centerY - imgHeight / 2 + this.imagePosY;

        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.drawImage(this.userImage, imgX, imgY, imgWidth, imgHeight);
        this.ctx.restore();
    }

    drawPhotoPlaceholder() {
        const { centerX, centerY, radius } = this.config.photo;

        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Your Photo', centerX, centerY - 20);
        this.ctx.font = '30px Arial';
        this.ctx.fillText('Here', centerX, centerY + 20);
        this.ctx.restore();
    }

    drawFrame() {
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.drawImage(this.frameImage, 0, 0, this.width, this.height);
        this.ctx.restore();
    }

    drawUserName() {
        if (!this.userName) return;

        const { centerX, centerY, maxWidth, fontSize } = this.config.name;

        this.ctx.save();
        this.ctx.fillStyle = '#000000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        let size = fontSize.max;
        if (this.userName.length > 15) size = fontSize.max - 10;
        if (this.userName.length > 20) size = fontSize.min;

        this.ctx.font = `bold ${size}px Arial`;
        let textWidth = this.ctx.measureText(this.userName.toUpperCase()).width;
        
        while (textWidth > maxWidth && size > fontSize.min) {
            size -= 2;
            this.ctx.font = `bold ${size}px Arial`;
            textWidth = this.ctx.measureText(this.userName.toUpperCase()).width;
        }

        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        this.ctx.shadowBlur = 2;
        this.ctx.fillText(this.userName.toUpperCase(), centerX, centerY, maxWidth);
        this.ctx.restore();
    }

    drawError(message) {
        this.ctx.clearRect(0, 0, this.width, this.height);
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

    isReadyForDownload() {
        return this.userImage !== null && this.frameImage !== null;
    }

    reset() {
        this.userImage = null;
        this.userName = '';
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        this.draw();
    }
}

function initializeCanvas(canvasId = 'dpCanvas') {
    return new DPCanvasHandler(canvasId);
}

if (typeof window !== 'undefined') {
    window.DPCanvasHandler = DPCanvasHandler;
    window.initializeCanvas = initializeCanvas;
}
