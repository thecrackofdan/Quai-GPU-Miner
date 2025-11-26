/**
 * Stability Monitor - Monitors system stability and prevents issues
 * Detects and prevents crashes, hangs, and performance degradation
 */

class StabilityMonitor {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.stabilityMetrics = {
            uptime: 0,
            crashCount: 0,
            restartCount: 0,
            errorCount: 0,
            lastError: null,
            lastRestart: null
        };
        this.healthChecks = [];
        this.init();
    }

    init() {
        this.loadStabilityMetrics();
        this.startHealthMonitoring();
        this.setupErrorTracking();
        this.setupPerformanceMonitoring();
    }

    /**
     * Start health monitoring
     */
    startHealthMonitoring() {
        // Check system health every 30 seconds
        setInterval(() => {
            this.performHealthCheck();
        }, 30000);

        // Initial health check
        this.performHealthCheck();
    }

    /**
     * Perform health check
     */
    performHealthCheck() {
        if (!this.dashboard || !this.dashboard.miningData) return;

        const checks = [];

        // Check 1: Mining status
        if (this.dashboard.miningData.isMining === false && this.wasMining) {
            checks.push({
                type: 'error',
                message: 'Mining stopped unexpectedly',
                action: 'Restart mining'
            });
        }
        this.wasMining = this.dashboard.miningData.isMining;

        // Check 2: GPU temperatures
        const gpus = this.dashboard.miningData.gpus || [];
        gpus.forEach((gpu, idx) => {
            if (gpu.temperature > 90) {
                checks.push({
                    type: 'critical',
                    message: `GPU ${idx} temperature critical: ${gpu.temperature}°C`,
                    action: 'Reduce power limit immediately'
                });
            } else if (gpu.temperature > 85) {
                checks.push({
                    type: 'warning',
                    message: `GPU ${idx} temperature high: ${gpu.temperature}°C`,
                    action: 'Monitor closely'
                });
            }
        });

        // Check 3: Hash rate stability
        if (this.dashboard.miningData.hashRate > 0) {
            const hashRateHistory = this.dashboard.hashRateHistory || [];
            if (hashRateHistory.length > 10) {
                const recent = hashRateHistory.slice(-10);
                const average = recent.reduce((a, b) => a + b, 0) / recent.length;
                const current = this.dashboard.miningData.hashRate;
                const variance = Math.abs(current - average) / average;

                if (variance > 0.3) {
                    checks.push({
                        type: 'warning',
                        message: 'Hash rate variance detected',
                        action: 'Check GPU stability'
                    });
                }
            }
        }

        // Check 4: Share rejection rate
        const totalShares = (this.dashboard.miningData.acceptedShares || 0) + 
                           (this.dashboard.miningData.rejectedShares || 0);
        if (totalShares > 100) {
            const rejectionRate = (this.dashboard.miningData.rejectedShares || 0) / totalShares;
            if (rejectionRate > 0.1) {
                checks.push({
                    type: 'error',
                    message: `High rejection rate: ${(rejectionRate * 100).toFixed(2)}%`,
                    action: 'Reduce overclock settings'
                });
            }
        }

        // Check 5: Memory usage
        if (performance.memory) {
            const usedMB = performance.memory.usedJSHeapSize / 1048576;
            const limitMB = performance.memory.jsHeapSizeLimit / 1048576;
            if (usedMB / limitMB > 0.9) {
                checks.push({
                    type: 'warning',
                    message: 'High memory usage detected',
                    action: 'Refresh page if issues occur'
                });
            }
        }

        // Process checks
        checks.forEach(check => {
            this.handleHealthCheck(check);
        });

        this.healthChecks = checks;
    }

    /**
     * Handle health check result
     */
    handleHealthCheck(check) {
        if (check.type === 'critical') {
            // Critical issue - take immediate action
            this.stabilityMetrics.errorCount++;
            this.stabilityMetrics.lastError = {
                timestamp: Date.now(),
                type: check.type,
                message: check.message
            };

            // Show critical alert
            if (typeof Toast !== 'undefined') {
                Toast.error(`CRITICAL: ${check.message}`, { duration: 0 }); // Don't auto-dismiss
            }

            // Auto-fix if possible
            this.attemptAutoFix(check);
        } else if (check.type === 'error') {
            this.stabilityMetrics.errorCount++;
            if (typeof Toast !== 'undefined') {
                Toast.error(check.message, { duration: 10000 });
            }
        } else if (check.type === 'warning') {
            if (typeof Toast !== 'undefined') {
                Toast.warning(check.message, { duration: 5000 });
            }
        }
    }

    /**
     * Attempt to auto-fix issues
     */
    async attemptAutoFix(check) {
        if (check.message.includes('temperature')) {
            // Auto-reduce power limit
            const gpus = this.dashboard.miningData.gpus || [];
            for (const gpu of gpus) {
                if (gpu.temperature > 90) {
                    try {
                        await fetch(`/api/gpus/${gpu.id}/tune`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                powerLimit: Math.max(70, (gpu.powerLimit || 80) - 10),
                                fanSpeed: Math.min(100, (gpu.fanSpeed || 60) + 10)
                            })
                        });
                    } catch (error) {
                        console.error('Error auto-fixing GPU:', error);
                    }
                }
            }
        } else if (check.message.includes('rejection rate')) {
            // Auto-reduce overclock
            const gpus = this.dashboard.miningData.gpus || [];
            for (const gpu of gpus) {
                try {
                    await fetch(`/api/gpus/${gpu.id}/tune`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            coreClock: Math.max(-200, (gpu.coreClock || 0) - 25),
                            memoryClock: Math.max(0, (gpu.memoryClock || 0) - 25)
                        })
                    });
                } catch (error) {
                    console.error('Error auto-fixing GPU:', error);
                }
            }
        }
    }

    /**
     * Setup error tracking
     */
    setupErrorTracking() {
        // Track unhandled errors
        window.addEventListener('error', (event) => {
            this.stabilityMetrics.errorCount++;
            this.stabilityMetrics.lastError = {
                timestamp: Date.now(),
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno
            };
            this.saveStabilityMetrics();
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.stabilityMetrics.errorCount++;
            this.stabilityMetrics.lastError = {
                timestamp: Date.now(),
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection'
            };
            this.saveStabilityMetrics();
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor frame rate (if available)
        if (typeof requestAnimationFrame !== 'undefined') {
            let lastTime = performance.now();
            let frameCount = 0;

            const checkFrameRate = () => {
                frameCount++;
                const currentTime = performance.now();
                
                if (currentTime - lastTime >= 1000) {
                    const fps = frameCount;
                    frameCount = 0;
                    lastTime = currentTime;

                    // Alert if FPS is very low (indicates performance issues)
                    if (fps < 10) {
                        console.warn('Low frame rate detected:', fps);
                    }
                }

                requestAnimationFrame(checkFrameRate);
            };

            requestAnimationFrame(checkFrameRate);
        }
    }

    /**
     * Get stability score (0-100)
     */
    getStabilityScore() {
        let score = 100;

        // Deduct for errors
        score -= Math.min(20, this.stabilityMetrics.errorCount * 2);

        // Deduct for crashes
        score -= this.stabilityMetrics.crashCount * 10;

        // Deduct for high temperatures
        const gpus = this.dashboard?.miningData?.gpus || [];
        gpus.forEach(gpu => {
            if (gpu.temperature > 90) score -= 15;
            else if (gpu.temperature > 85) score -= 10;
            else if (gpu.temperature > 80) score -= 5;
        });

        // Deduct for high rejection rate
        const totalShares = (this.dashboard?.miningData?.acceptedShares || 0) + 
                           (this.dashboard?.miningData?.rejectedShares || 0);
        if (totalShares > 100) {
            const rejectionRate = (this.dashboard.miningData.rejectedShares || 0) / totalShares;
            if (rejectionRate > 0.1) score -= 20;
            else if (rejectionRate > 0.05) score -= 10;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Save stability metrics
     */
    saveStabilityMetrics() {
        try {
            localStorage.setItem('stabilityMetrics', JSON.stringify(this.stabilityMetrics));
        } catch (error) {
            console.error('Error saving stability metrics:', error);
        }
    }

    /**
     * Load stability metrics
     */
    loadStabilityMetrics() {
        try {
            const saved = localStorage.getItem('stabilityMetrics');
            if (saved) {
                this.stabilityMetrics = { ...this.stabilityMetrics, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Error loading stability metrics:', error);
        }
    }

    /**
     * Get stability report
     */
    getStabilityReport() {
        return {
            score: this.getStabilityScore(),
            uptime: this.stabilityMetrics.uptime,
            errorCount: this.stabilityMetrics.errorCount,
            crashCount: this.stabilityMetrics.crashCount,
            lastError: this.stabilityMetrics.lastError,
            healthChecks: this.healthChecks,
            recommendations: this.getRecommendations()
        };
    }

    /**
     * Get recommendations for improving stability
     */
    getRecommendations() {
        const recommendations = [];

        if (this.stabilityMetrics.errorCount > 10) {
            recommendations.push('High error count detected. Consider refreshing the page.');
        }

        const gpus = this.dashboard?.miningData?.gpus || [];
        gpus.forEach((gpu, idx) => {
            if (gpu.temperature > 85) {
                recommendations.push(`GPU ${idx}: Reduce power limit or improve cooling`);
            }
        });

        const totalShares = (this.dashboard?.miningData?.acceptedShares || 0) + 
                           (this.dashboard?.miningData?.rejectedShares || 0);
        if (totalShares > 100) {
            const rejectionRate = (this.dashboard.miningData.rejectedShares || 0) / totalShares;
            if (rejectionRate > 0.05) {
                recommendations.push('High rejection rate: Reduce overclock settings');
            }
        }

        return recommendations;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.StabilityMonitor = StabilityMonitor;
}

