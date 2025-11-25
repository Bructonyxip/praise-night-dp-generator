/**
 * MATEPLUX DP GENERATOR - CANVAS HANDLER (FIXED VERSION)
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
                centerX: this.width / 2,
                centerY: this.height * 0.32,
                radius: this.width * 0.23
            },
            name: {
                centerX: this.width / 2,
                centerY: this.height * 0.565,
                maxWidth: this.width * 0.4,
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
        
        // Enable high DPI rendering
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

    // FIXED: Load frame image with multiple path attempts
    async loadFrame() {
        const paths = [
            './assets/images/frame.png',
            'assets/images/frame.png',
            'https://bructonyxip.github.io/praise-night-dp-generator/assets/images/frame.png'
        ];

        for (const path of paths) {
            try {
                console.log('🔄 Attempting to load frame from:', path);
                
                this.frameImage = await new Promise((resolve, reject) => {
                    const img = new Image();
                    
                    img.onload = () => {
                        console.log('✅ Frame loaded successfully from:', path);
                        resolve(img);
                    };
                    
                    img.onerror = () => {
                        reject(new Error(`Failed to load from ${path}`));
                    };
                    
                    img.src = path;
                });
                
                // If we get here, frame loaded successfully
                this.draw();
                return true;
                
            } catch (error) {
                console.warn('⚠️ Failed to load from:', path);
                continue;
            }
        }
        
        // If all paths failed
        console.error('❌ Failed to load frame from all paths');
        this.drawError('Failed to load template. Please refresh the page.');
        return false;
    }

    setUserImage(image) {
        this.userImage = image;
        this.draw();
    }

    setUserName(name) {
        this.userName = TextUtils.sanitize(name);
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
        this.ctx.font = 'bold 40px Arial, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Your Photo', centerX, centerY - 20);
        
        this.ctx.font = '30px Arial, sans-serif';
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
        const nameLength = this.userName.length;

        if (nameLength > 15) {
            size = fontSize.max - 10;
        }
        if (nameLength > 20) {
            size = fontSize.min;
        }

        this.ctx.font = `bold ${size}px Arial, sans-serif`;

        let textWidth = this.ctx.measureText(this.userName.toUpperCase()).width;
        
        while (textWidth > maxWidth && size > fontSize.min) {
            size -= 2;
            this.ctx.font = `bold ${size}px Arial, sans-serif`;
            textWidth = this.ctx.measureText(this.userName.toUpperCase()).width;
        }

        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;

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
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Error', this.width / 2, this.height / 2 - 40);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#666';
        
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

    exportAsDataURL(type = 'image/png', quality = 1.0) {
        return this.canvas.toDataURL(type, quality);
    }

    isReadyForDownload() {
        return this.userImage !== null && this.frameImage !== null;
    }

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

let dpCanvas = null;

function initializeCanvas(canvasId = 'dpCanvas') {
    dpCanvas = new DPCanvasHandler(canvasId);
    return dpCanvas;
}

if (typeof window !== 'undefined') {
    window.DPCanvasHandler = DPCanvasHandler;
    window.initializeCanvas = initializeCanvas;
}
