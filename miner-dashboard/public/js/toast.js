/**
 * Toast Notification System for QuaiMiner Dashboard
 * Provides user-friendly notifications for actions and errors
 */

class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - Toast message
     * @param {Object} options - Toast options
     * @param {string} options.type - Toast type: 'success', 'error', 'warning', 'info'
     * @param {string} options.title - Toast title
     * @param {number} options.duration - Duration in milliseconds (0 = no auto-dismiss)
     * @param {boolean} options.dismissible - Whether toast can be dismissed
     * @returns {string} Toast ID
     */
    show(message, options = {}) {
        const {
            type = 'info',
            title = null,
            duration = 5000,
            dismissible = true
        } = options;

        const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toastHTML = `
            <span class="toast-icon" aria-hidden="true">${icons[type] || icons.info}</span>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            ${dismissible ? '<button class="toast-close" aria-label="Close notification" title="Close">&times;</button>' : ''}
            ${duration > 0 ? '<div class="toast-progress-bar" style="animation-duration: ' + duration + 'ms;"></div>' : ''}
        `;

        toast.innerHTML = toastHTML;

        // Add close button handler
        if (dismissible) {
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => this.dismiss(toastId));
        }

        // Add click to dismiss (optional)
        if (dismissible) {
            toast.addEventListener('click', (e) => {
                if (e.target !== toast && !toast.contains(e.target.closest('.toast-close'))) {
                    // Only dismiss if clicking on toast itself, not children
                    if (e.target === toast) {
                        this.dismiss(toastId);
                    }
                }
            });
        }

        this.container.appendChild(toast);
        this.toasts.set(toastId, toast);

        // Auto-dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(toastId);
            }, duration);
        }

        // Announce to screen readers
        this.announceToScreenReader(message, type);

        return toastId;
    }

    /**
     * Dismiss a toast
     * @param {string} toastId - Toast ID
     */
    dismiss(toastId) {
        const toast = this.toasts.get(toastId);
        if (toast) {
            toast.classList.add('slide-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                this.toasts.delete(toastId);
            }, 300);
        }
    }

    /**
     * Dismiss all toasts
     */
    dismissAll() {
        this.toasts.forEach((toast, id) => {
            this.dismiss(id);
        });
    }

    /**
     * Show success toast
     */
    success(message, options = {}) {
        return this.show(message, { ...options, type: 'success' });
    }

    /**
     * Show error toast
     */
    error(message, options = {}) {
        return this.show(message, { ...options, type: 'error', duration: 7000 });
    }

    /**
     * Show warning toast
     */
    warning(message, options = {}) {
        return this.show(message, { ...options, type: 'warning' });
    }

    /**
     * Show info toast
     */
    info(message, options = {}) {
        return this.show(message, { ...options, type: 'info' });
    }

    /**
     * Announce to screen readers
     */
    announceToScreenReader(message, type) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        announcement.textContent = `${type}: ${message}`;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// Create global instance
const Toast = new ToastManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToastManager;
}

