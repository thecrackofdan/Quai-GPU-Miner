/**
 * GPU Optimizer - Advanced GPU settings optimization
 * Provides intelligent GPU tuning based on hardware and mining conditions
 */

class GPUOptimizer {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.optimizationHistory = [];
        this.currentOptimizations = {};
        this.init();
    }

    init() {
        this.loadOptimizationHistory();
        this.startOptimizationMonitoring();
    }

    /**
     * Optimize GPU settings based on current conditions
     */
    async optimizeGPU(gpuId, currentSettings, miningData) {
        const gpu = miningData.gpus?.find(g => g.id === gpuId);
        if (!gpu) {
            return { success: false, error: 'GPU not found' };
        }

        const optimization = {
            gpuId,
            timestamp: Date.now(),
            before: { ...currentSettings },
            after: {},
            reason: []
        };

        // Get optimal settings for this GPU
        const optimal = this.getOptimalSettings(gpu, miningData);
        optimization.after = optimal.settings;
        optimization.reason = optimal.reasons;

        // Apply optimization
        try {
            const response = await fetch(`/api/gpus/${gpuId}/tune`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(optimal.settings)
            });

            if (response.ok) {
                this.optimizationHistory.push(optimization);
                this.currentOptimizations[gpuId] = optimal.settings;
                this.saveOptimizationHistory();
                return { success: true, optimization };
            } else {
                throw new Error('Failed to apply optimization');
            }
        } catch (error) {
            console.error('Error optimizing GPU:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get optimal settings for GPU
     */
    getOptimalSettings(gpu, miningData) {
        const settings = {
            coreClock: gpu.coreClock || 0,
            memoryClock: gpu.memoryClock || 0,
            powerLimit: gpu.powerLimit || 80,
            fanSpeed: gpu.fanSpeed || 60
        };

        const reasons = [];

        // Temperature-based optimization
        if (gpu.temperature > 80) {
            // Too hot - reduce power and increase fan
            settings.powerLimit = Math.max(70, settings.powerLimit - 10);
            settings.fanSpeed = Math.min(100, settings.fanSpeed + 10);
            reasons.push('High temperature detected - reducing power, increasing fan');
        } else if (gpu.temperature < 60 && settings.powerLimit < 90) {
            // Cool enough - can increase power
            settings.powerLimit = Math.min(90, settings.powerLimit + 5);
            reasons.push('Temperature optimal - increasing power limit');
        }

        // Hash rate optimization
        if (gpu.hashRate < (gpu.baseHashRate || 10) * 0.9) {
            // Hash rate below expected - try increasing memory clock
            settings.memoryClock = Math.min(1000, (settings.memoryClock || 0) + 50);
            reasons.push('Hash rate below expected - increasing memory clock');
        }

        // Power efficiency optimization
        const efficiency = gpu.hashRate / (gpu.powerUsage || 1);
        if (efficiency < 0.1 && settings.powerLimit > 70) {
            // Low efficiency - reduce power
            settings.powerLimit = Math.max(70, settings.powerLimit - 5);
            reasons.push('Low efficiency - optimizing power limit');
        }

        // Stability optimization
        if (miningData.rejectedShares > 0 && miningData.rejectedShares / (miningData.acceptedShares + miningData.rejectedShares) > 0.05) {
            // High rejection rate - reduce overclock
            settings.coreClock = Math.max(-200, (settings.coreClock || 0) - 25);
            settings.memoryClock = Math.max(0, (settings.memoryClock || 0) - 25);
            reasons.push('High rejection rate - reducing overclock for stability');
        }

        return {
            settings,
            reasons: reasons.length > 0 ? reasons : ['Settings already optimal']
        };
    }

    /**
     * Auto-optimize all GPUs
     */
    async autoOptimizeAll() {
        if (!this.dashboard || !this.dashboard.miningData) {
            return { success: false, error: 'No mining data available' };
        }

        const results = [];
        const gpus = this.dashboard.miningData.gpus || [];

        for (const gpu of gpus) {
            const currentSettings = {
                coreClock: gpu.coreClock || 0,
                memoryClock: gpu.memoryClock || 0,
                powerLimit: gpu.powerLimit || 80,
                fanSpeed: gpu.fanSpeed || 60
            };

            const result = await this.optimizeGPU(gpu.id, currentSettings, this.dashboard.miningData);
            results.push({ gpuId: gpu.id, ...result });
        }

        return { success: true, results };
    }

    /**
     * Get optimization recommendations
     */
    getRecommendations(gpu, miningData) {
        const recommendations = [];

        // Temperature recommendations
        if (gpu.temperature > 85) {
            recommendations.push({
                type: 'warning',
                message: 'GPU temperature is very high. Consider reducing power limit or improving cooling.',
                action: 'Reduce power limit by 10%'
            });
        } else if (gpu.temperature > 80) {
            recommendations.push({
                type: 'info',
                message: 'GPU temperature is elevated. Monitor closely.',
                action: 'Increase fan speed or reduce power limit'
            });
        }

        // Hash rate recommendations
        const expectedHashRate = gpu.baseHashRate || 10;
        if (gpu.hashRate < expectedHashRate * 0.9) {
            recommendations.push({
                type: 'warning',
                message: `Hash rate (${gpu.hashRate.toFixed(2)} MH/s) is below expected (${expectedHashRate} MH/s)`,
                action: 'Check GPU settings and increase memory clock'
            });
        }

        // Power efficiency recommendations
        const efficiency = gpu.hashRate / (gpu.powerUsage || 1);
        if (efficiency < 0.08) {
            recommendations.push({
                type: 'info',
                message: 'Power efficiency could be improved',
                action: 'Optimize power limit for better efficiency'
            });
        }

        // Stability recommendations
        if (miningData.rejectedShares > 0) {
            const rejectionRate = miningData.rejectedShares / (miningData.acceptedShares + miningData.rejectedShares);
            if (rejectionRate > 0.1) {
                recommendations.push({
                    type: 'error',
                    message: 'High share rejection rate detected',
                    action: 'Reduce overclock settings for stability'
                });
            }
        }

        return recommendations;
    }

    /**
     * Start optimization monitoring
     */
    startOptimizationMonitoring() {
        // Check for optimization opportunities every 5 minutes
        setInterval(() => {
            if (this.dashboard && this.dashboard.miningData && this.dashboard.miningData.isMining) {
                this.checkOptimizationOpportunities();
            }
        }, 300000); // 5 minutes
    }

    /**
     * Check for optimization opportunities
     */
    checkOptimizationOpportunities() {
        const gpus = this.dashboard.miningData.gpus || [];
        
        gpus.forEach(gpu => {
            const recommendations = this.getRecommendations(gpu, this.dashboard.miningData);
            
            // Show critical recommendations
            const critical = recommendations.filter(r => r.type === 'error' || r.type === 'warning');
            if (critical.length > 0) {
                critical.forEach(rec => {
                    if (typeof Toast !== 'undefined') {
                        Toast.warning(`GPU ${gpu.id}: ${rec.message}`, { duration: 10000 });
                    }
                });
            }
        });
    }

    /**
     * Save optimization history
     */
    saveOptimizationHistory() {
        try {
            // Keep only last 100 optimizations
            const recent = this.optimizationHistory.slice(-100);
            localStorage.setItem('gpuOptimizationHistory', JSON.stringify(recent));
        } catch (error) {
            console.error('Error saving optimization history:', error);
        }
    }

    /**
     * Load optimization history
     */
    loadOptimizationHistory() {
        try {
            const saved = localStorage.getItem('gpuOptimizationHistory');
            if (saved) {
                this.optimizationHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading optimization history:', error);
            this.optimizationHistory = [];
        }
    }

    /**
     * Reset GPU to optimal defaults
     */
    async resetToOptimal(gpuId) {
        try {
            const response = await fetch(`/api/gpus/${gpuId}/reset`, {
                method: 'POST'
            });

            if (response.ok) {
                // Remove from current optimizations
                delete this.currentOptimizations[gpuId];
                return { success: true };
            } else {
                throw new Error('Failed to reset GPU');
            }
        } catch (error) {
            console.error('Error resetting GPU:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.GPUOptimizer = GPUOptimizer;
}

