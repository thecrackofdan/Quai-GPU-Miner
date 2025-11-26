/**
 * Enhanced Error Handling
 * Provides user-friendly error messages and recovery options
 */

class ErrorHandler {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.errorCount = 0;
        this.maxErrors = 5;
        this.init();
    }

    init() {
        this.setupGlobalErrorHandling();
        this.setupNetworkErrorHandling();
        this.setupRetryMechanisms();
    }

    /**
     * Setup global error handling
     */
    setupGlobalErrorHandling() {
        // Catch unhandled errors
        window.addEventListener('error', (event) => {
            this.handleError('JavaScript Error', event.message, event.filename, event.lineno);
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Promise Rejection', event.reason?.message || 'Unknown error', null, null);
        });
    }

    /**
     * Setup network error handling
     */
    setupNetworkErrorHandling() {
        // Intercept fetch errors
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                if (!response.ok) {
                    this.handleNetworkError(response.status, response.statusText, args[0]);
                }
                return response;
            } catch (error) {
                this.handleNetworkError(null, error.message, args[0]);
                throw error;
            }
        };
    }

    /**
     * Handle errors with user-friendly messages
     */
    handleError(type, message, file, line) {
        this.errorCount++;
        
        // Don't spam errors
        if (this.errorCount > this.maxErrors) {
            return;
        }

        console.error(`[${type}]`, message, file, line);

        // Show user-friendly error message
        if (typeof Toast !== 'undefined') {
            const userMessage = this.getUserFriendlyMessage(type, message);
            Toast.error(userMessage, { duration: 5000 });
        }

        // Log to server if available
        this.logErrorToServer(type, message, file, line);
    }

    /**
     * Handle network errors
     */
    handleNetworkError(status, statusText, url) {
        let message = 'Network error occurred';
        
        if (status === 404) {
            message = 'Resource not found. Please check your configuration.';
        } else if (status === 500) {
            message = 'Server error. Please try again later.';
        } else if (status === 0 || !status) {
            message = 'Cannot connect to server. Check if the dashboard server is running.';
        } else {
            message = `Network error: ${statusText || 'Unknown error'}`;
        }

        if (typeof Toast !== 'undefined') {
            Toast.error(message, { duration: 5000 });
        }

        // Update status indicator
        const statusText = document.getElementById('statusText');
        const statusDot = document.getElementById('statusDot');
        if (statusText) {
            statusText.textContent = 'Connection Error';
        }
        if (statusDot) {
            statusDot.className = 'status-dot error';
        }
    }

    /**
     * Get user-friendly error messages
     */
    getUserFriendlyMessage(type, message) {
        // Map technical errors to user-friendly messages
        const errorMap = {
            'Failed to fetch': 'Cannot connect to server. Please check if the dashboard is running.',
            'NetworkError': 'Network connection failed. Please check your internet connection.',
            'TypeError': 'An error occurred. Please refresh the page.',
            'ReferenceError': 'Configuration error. Please check your settings.',
        };

        for (const [key, value] of Object.entries(errorMap)) {
            if (message.includes(key)) {
                return value;
            }
        }

        return 'An error occurred. Please try again or refresh the page.';
    }

    /**
     * Setup retry mechanisms
     */
    setupRetryMechanisms() {
        // Auto-retry failed requests
        this.retryQueue = [];
        this.retryInterval = setInterval(() => {
            this.processRetryQueue();
        }, 5000);
    }

    /**
     * Add request to retry queue
     */
    addToRetryQueue(url, options, retries = 3) {
        this.retryQueue.push({
            url,
            options,
            retries,
            attempts: 0
        });
    }

    /**
     * Process retry queue
     */
    async processRetryQueue() {
        if (this.retryQueue.length === 0) return;

        const item = this.retryQueue[0];
        if (item.attempts >= item.retries) {
            this.retryQueue.shift();
            return;
        }

        try {
            const response = await fetch(item.url, item.options);
            if (response.ok) {
                this.retryQueue.shift();
                if (typeof Toast !== 'undefined') {
                    Toast.success('Connection restored', { duration: 3000 });
                }
            } else {
                item.attempts++;
            }
        } catch (error) {
            item.attempts++;
        }
    }

    /**
     * Log error to server
     */
    async logErrorToServer(type, message, file, line) {
        try {
            await fetch('/api/errors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    message,
                    file,
                    line,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent
                })
            });
        } catch (error) {
            // Silently fail - don't spam if server is down
        }
    }

    /**
     * Reset error count
     */
    reset() {
        this.errorCount = 0;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
}

