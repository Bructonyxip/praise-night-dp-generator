/**
 * MATEPLUX DP GENERATOR - CANVAS HANDLER (POSITION-CORRECTED VERSION)
 * Mateplux Media Systems Ltd.
 */

class DPCanvasHandler {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // ADJUSTED Frame configuration for your specific template
        this.config = {
            photo: {
                centerX: this.width * 0.68,        // 66% from left (right side)
                centerY: this.height * 0.266,      // 26.5% from top (higher up)
                radius: this.width * 0.198         // Slightly smaller circle
            },
            name: {
                centerX: this.width * 0.68,        // Same X as photo (right side)
                centerY: this.height * 0.50,       // 48% from top (in white box)
                maxWidth: this.width * 0.35,       // Max text width
                fontSize: { min: 40, max: 60 }     // Font size range
            }
        };
        
        this.userImage = null;
        this.frameImage = null;
        this.userName = '';
        this.imageZoom = 1;
        this.imagePosX = 0;
        this.imagePosY = 0;
        
        this.setupHighDPI();
        
        // Debug mode - set to false in production
        this.debugMode = false;
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
                this.drawError('Failed to load frame template');
                resolve(false);
            };
            
            const basePath = window.location.origin + window.location.pathname.replace(/\/$/, '');
            this.frameImage.src = basePath + '/assets/images/frame.png';
            
            console.log('🔄 Loading frame from:', this.frameImage.src);
        });
    }

    setUserImage(image) {
        this.userImage = image;
        console.log('📸 User image set:', image.width, 'x', image.height);
        this.draw();
    }

    setUserName(name) {
        this.userName = name.trim().substring(0, 25);
        console.log('✏️ User name set:', this.userName);
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
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // White background
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw frame first (as background)
        if (this.frameImage) {
            this.drawFrame();
        }

        // Draw user photo on top of frame
        if (this.userImage) {
            this.drawUserPhoto();
        } else {
            this.drawPhotoPlaceholder();
        }

        // Draw user name on top
        if (this.userName) {
            this.drawUserName();
        }

        // Debug mode - show positioning guides
        if (this.debugMode) {
            this.drawDebugGuides();
        }
    }

    drawFrame() {
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.drawImage(this.frameImage, 0, 0, this.width, this.height);
        this.ctx.restore();
    }

    drawUserPhoto() {
        const { centerX, centerY, radius } = this.config.photo;

        this.ctx.save();
        
        // Create circular clipping path
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.clip();

        // Calculate image scaling to fill circle
        const scale = Math.max(
            (radius * 2) / this.userImage.width,
            (radius * 2) / this.userImage.height
        ) * this.imageZoom;

        const imgWidth = this.userImage.width * scale;
        const imgHeight = this.userImage.height * scale;
        const imgX = centerX - imgWidth / 2 + this.imagePosX;
        const imgY = centerY - imgHeight / 2 + this.imagePosY;

        // Draw image
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.drawImage(this.userImage, imgX, imgY, imgWidth, imgHeight);
        
        this.ctx.restore();
    }

    drawPhotoPlaceholder() {
        const { centerX, centerY, radius } = this.config.photo;

        this.ctx.save();
        
        // Circle outline
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();

        // Placeholder text
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.font = 'bold 35px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Your Photo', centerX, centerY - 15);
        this.ctx.font = '28px Arial';
        this.ctx.fillText('Here', centerX, centerY + 20);
        
        this.ctx.restore();
    }

    drawUserName() {
        if (!this.userName) return;

        const { centerX, centerY, maxWidth, fontSize } = this.config.name;

        this.ctx.save();
        
        // Black text
        this.ctx.fillStyle = '#000000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Calculate font size based on name length
        let size = fontSize.max;
        if (this.userName.length > 12) size = fontSize.max - 8;
        if (this.userName.length > 18) size = fontSize.min;

        this.ctx.font = `bold ${size}px Arial, sans-serif`;
        
        // Measure and adjust if too wide
        let textWidth = this.ctx.measureText(this.userName.toUpperCase()).width;
        while (textWidth > maxWidth && size > fontSize.min) {
            size -= 2;
            this.ctx.font = `bold ${size}px Arial, sans-serif`;
            textWidth = this.ctx.measureText(this.userName.toUpperCase()).width;
        }

        // Add subtle shadow for depth
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        this.ctx.shadowBlur = 3;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;

        // Draw the name
        this.ctx.fillText(this.userName.toUpperCase(), centerX, centerY, maxWidth);
        
        this.ctx.restore();
        
        console.log('✅ Name drawn at:', centerX, centerY, 'Font size:', size);
    }

    drawDebugGuides() {
        const { photo, name } = this.config;
        
        this.ctx.save();
        
        // Photo circle guide
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(photo.centerX, photo.centerY, photo.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Photo center cross
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(photo.centerX - 20, photo.centerY);
        this.ctx.lineTo(photo.centerX + 20, photo.centerY);
        this.ctx.moveTo(photo.centerX, photo.centerY - 20);
        this.ctx.lineTo(photo.centerX, photo.centerY + 20);
        this.ctx.stroke();
        
        // Name position guide
        this.ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            name.centerX - name.maxWidth / 2,
            name.centerY - 30,
            name.maxWidth,
            60
        );
        
        // Name center cross
        this.ctx.strokeStyle = 'rgba(0, 0, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.moveTo(name.centerX - 20, name.centerY);
        this.ctx.lineTo(name.centerX + 20, name.centerY);
        this.ctx.moveTo(name.centerX, name.centerY - 20);
        this.ctx.lineTo(name.centerX, name.centerY + 20);
        this.ctx.stroke();
        
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

    // Helper method to adjust positions manually
    updatePositions(photoX, photoY, photoRadius, nameX, nameY) {
        this.config.photo.centerX = this.width * photoX;
        this.config.photo.centerY = this.height * photoY;
        this.config.photo.radius = this.width * photoRadius;
        this.config.name.centerX = this.width * nameX;
        this.config.name.centerY = this.height * nameY;
        this.draw();
        console.log('📍 Positions updated:', this.config);
    }

    // Toggle debug mode
    toggleDebug() {
        this.debugMode = !this.debugMode;
        this.draw();
        console.log('🐛 Debug mode:', this.debugMode ? 'ON' : 'OFF');
    }
}

function initializeCanvas(canvasId = 'dpCanvas') {
    return new DPCanvasHandler(canvasId);
}

if (typeof window !== 'undefined') {
    window.DPCanvasHandler = DPCanvasHandler;
    window.initializeCanvas = initializeCanvas;
}
