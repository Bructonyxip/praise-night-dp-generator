/**
 * MATEPLUX DP GENERATOR - UTILITY FUNCTIONS
 * Mateplux Media Systems Ltd.
 */

// Toast Notification System
const Toast = {
    element: null,
    timeout: null,

    init() {
        this.element = document.getElementById('toast');
    },

    show(message, type = 'success', duration = 3000) {
        if (!this.element) this.init();

        this.element.textContent = message;
        this.element.className = `toast show ${type}`;

        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.hide();
        }, duration);
    },

    hide() {
        if (this.element) {
            this.element.classList.remove('show');
        }
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error', 4000);
    },

    info(message) {
        this.show(message, 'info');
    }
};

// File Validation
const FileValidator = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

    validate(file) {
        if (!file) {
            return { valid: false, error: 'No file selected' };
        }

        if (!this.allowedTypes.includes(file.type)) {
            return { 
                valid: false, 
                error: 'Invalid file type. Please upload JPG, PNG, or WEBP.' 
            };
        }

        if (file.size > this.maxSize) {
            return { 
                valid: false, 
                error: 'File size exceeds 5MB. Please choose a smaller file.' 
            };
        }

        return { valid: true };
    }
};

// Image Loader Utility
const ImageLoader = {
    load(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    resolve(img);
                };

                img.onerror = () => {
                    reject(new Error('Failed to load image'));
                };

                img.src = e.target.result;
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsDataURL(file);
        });
    },

    loadFromUrl(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image from ${url}`));

            img.src = url;
        });
    }
};

// Text Utilities
const TextUtils = {
    sanitize(text) {
        return text
            .trim()
            .replace(/[<>]/g, '')
            .substring(0, 25);
    },

    truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    capitalize(text) {
        return text
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
};

// Canvas Utilities
const CanvasUtils = {
    clearCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    fillCanvas(canvas, color = '#FFFFFF') {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    },

    drawCircularImage(ctx, img, x, y, radius, zoom = 1, offsetX = 0, offsetY = 0) {
        ctx.save();

        // Create circular clipping path
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Calculate scaled dimensions
        const scale = Math.max(
            (radius * 2) / img.width,
            (radius * 2) / img.height
        ) * zoom;

        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;
        const imgX = x - imgWidth / 2 + offsetX;
        const imgY = y - imgHeight / 2 + offsetY;

        // Draw image
        ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
        ctx.restore();
    },

    measureText(ctx, text, maxWidth) {
        let fontSize = 50;
        ctx.font = `bold ${fontSize}px Arial`;
        
        while (ctx.measureText(text).width > maxWidth && fontSize > 20) {
            fontSize -= 2;
            ctx.font = `bold ${fontSize}px Arial`;
        }

        return fontSize;
    }
};

// Download Utilities
const DownloadUtils = {
    downloadCanvas(canvas, filename = 'praise-night-2025-dp.png') {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = filename;
            link.href = url;
            link.click();
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }, 'image/png', 1.0);
    },

    generateFilename(name) {
        const sanitized = name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const timestamp = Date.now();
        return sanitized ? 
            `${sanitized}-praise-night-2025.png` : 
            `praise-night-2025-${timestamp}.png`;
    }
};

// Local Storage Manager
const StorageManager = {
    prefix: 'mateplux_dp_',

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('LocalStorage not available:', e);
            return false;
        }
    },

    get(key) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.warn('Failed to retrieve from LocalStorage:', e);
            return null;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (e) {
            console.warn('Failed to remove from LocalStorage:', e);
            return false;
        }
    },

    clear() {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.prefix))
                .forEach(key => localStorage.removeItem(key));
            return true;
        } catch (e) {
            console.warn('Failed to clear LocalStorage:', e);
            return false;
        }
    }
};

// Debounce Function
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle Function
function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Animation Frame Helper
const AnimationHelper = {
    callbacks: new Map(),
    running: false,

    add(id, callback) {
        this.callbacks.set(id, callback);
        if (!this.running) {
            this.start();
        }
    },

    remove(id) {
        this.callbacks.delete(id);
        if (this.callbacks.size === 0) {
            this.stop();
        }
    },

    start() {
        this.running = true;
        this.animate();
    },

    stop() {
        this.running = false;
    },

    animate() {
        if (!this.running) return;

        this.callbacks.forEach(callback => callback());
        requestAnimationFrame(() => this.animate());
    }
};

// Browser Detection
const BrowserDetect = {
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },

    isSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    },

    supportsTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
};

// Performance Monitor
const PerformanceMonitor = {
    marks: new Map(),

    start(name) {
        this.marks.set(name, performance.now());
    },

    end(name) {
        const startTime = this.marks.get(name);
        if (startTime) {
            const duration = performance.now() - startTime;
            console.log(`${name}: ${duration.toFixed(2)}ms`);
            this.marks.delete(name);
            return duration;
        }
        return 0;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Toast,
        FileValidator,
        ImageLoader,
        TextUtils,
        CanvasUtils,
        DownloadUtils,
        StorageManager,
        debounce,
        throttle,
        AnimationHelper,
        BrowserDetect,
        PerformanceMonitor
    };
}