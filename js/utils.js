/**
 * MATEPLUX DP GENERATOR - UTILITY FUNCTIONS
 * Version: 1.0.1 - Fixed Init & Errors
 */

class Toast {
    constructor() {
        this.element = document.getElementById('toast');
        this.timeout = null;
        if (!this.element) {
            this.createElement();
        }
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.id = 'toast';
        this.element.className = 'toast';
        document.body.appendChild(this.element);
    }

    show(message, type = 'success', duration = 3000) {
        this.element.textContent = message;
        this.element.className = `toast show ${type}`;

        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.hide(), duration);
    }

    hide() {
        this.element.classList.remove('show');
    }

    success(message) {
        this.show(message, 'success');
    }

    error(message) {
        this.show(message, 'error', 4000);
    }

    info(message) {
        this.show(message, 'info');
    }
}

// Global Toast instance (auto-init)
const Toast = new Toast();

// File Validator (unchanged, but added guard)
const FileValidator = {
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

    validate(file) {
        if (!file) return { valid: false, error: 'No file selected' };
        if (!this.allowedTypes.includes(file.type)) return { valid: false, error: 'Invalid file type' };
        if (file.size > this.maxSize) return { valid: false, error: 'File too large (max 5MB)' };
        return { valid: true };
    }
};

// Image Loader (async fixed)
const ImageLoader = {
    load(file) {
        return new Promise((resolve, reject) => {
            if (!file) reject(new Error('No file'));
            const reader = new FileReader();
            reader.onload = e => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};

// Debounce & Throttle (fixed implementation)
function debounce(func, wait) {
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

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Storage Manager (with error handling)
const StorageManager = {
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('LocalStorage save failed:', e);
        }
    },

    load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('LocalStorage load failed:', e);
            return defaultValue;
        }
    },

    clear(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('LocalStorage clear failed:', e);
        }
    }
};

// Download Utils (async blob)
const DownloadUtils = {
    async downloadCanvas(canvas, filename = 'dp.png') {
        try {
            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob(resolve, 'image/png', 0.95);
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } catch (e) {
            console.error('Download failed:', e);
            return false;
        }
    }
};

// Export
if (typeof window !== 'undefined') {
    window.Toast = Toast;
    window.FileValidator = FileValidator;
    window.ImageLoader = ImageLoader;
    window.StorageManager = StorageManager;
    window.DownloadUtils = DownloadUtils;
    window.debounce = debounce;
    window.throttle = throttle;
}
