/**
 * GPU Tuner - Fine-tuning interface for GPU settings
 * Allows users to override auto-detected optimal settings
 */

class GPUTuner {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.gpus = [];
        this.optimalSettings = {};
        this.currentSettings = {};
        this.init();
    }

    init() {
        this.loadGPUSettings();
        this.setupUI();
    }

    /**
     * Load current GPU settings
     */
    async loadGPUSettings() {
        try {
            const response = await fetch('/api/gpu/settings');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.gpus = data.gpus || [];
                    this.currentSettings = data.settings || {};
                    this.optimalSettings = data.optimal || {};
                }
            }
        } catch (error) {
            console.error('Error loading GPU settings:', error);
        }
    }

    /**
     * Setup UI for GPU tuning
     */
    setupUI() {
        // Create tuning interface
        this.createTuningModal();
    }

    /**
     * Create GPU tuning modal
     */
    createTuningModal() {
        // This will create the tuning interface
    }

    /**
     * Get optimal settings for a GPU
     */
    getOptimalSettings(gpuId) {
        const gpu = this.gpus.find(g => g.id === gpuId);
        if (!gpu) return null;

        // Base optimal settings (from auto-detection)
        const base = {
            coreClock: gpu.defaultCoreClock || 0,
            memoryClock: gpu.defaultMemoryClock || 0,
            powerLimit: gpu.defaultPowerLimit || 0,
            fanSpeed: gpu.defaultFanSpeed || 50,
            voltage: gpu.defaultVoltage || 0,
            intensity: gpu.defaultIntensity || 0
        };

        // Apply GPU-specific optimizations
        if (gpu.vendor === 'AMD') {
            return this.getAMDOptimalSettings(gpu, base);
        } else if (gpu.vendor === 'NVIDIA') {
            return this.getNVIDIAOptimalSettings(gpu, base);
        }

        return base;
    }

    /**
     * Get AMD-specific optimal settings
     */
    getAMDOptimalSettings(gpu, base) {
        const settings = { ...base };

        // RX 590 specific
        if (gpu.model.includes('590')) {
            settings.coreClock = 1545; // MHz
            settings.memoryClock = 2000; // MHz
            settings.powerLimit = -20; // -20% for efficiency
            settings.fanSpeed = 60;
            settings.intensity = 20;
        }
        // RX 580/570
        else if (gpu.model.includes('580') || gpu.model.includes('570')) {
            settings.coreClock = 1450;
            settings.memoryClock = 2000;
            settings.powerLimit = -15;
            settings.fanSpeed = 65;
            settings.intensity = 20;
        }
        // RX 6000 series
        else if (gpu.model.includes('6000') || gpu.model.includes('6700') || gpu.model.includes('6800')) {
            settings.coreClock = 2100;
            settings.memoryClock = 2000;
            settings.powerLimit = -10;
            settings.fanSpeed = 55;
            settings.intensity = 24;
        }
        // RX 7000 series
        else if (gpu.model.includes('7000') || gpu.model.includes('7900') || gpu.model.includes('7800')) {
            settings.coreClock = 2500;
            settings.memoryClock = 2500;
            settings.powerLimit = -5;
            settings.fanSpeed = 50;
            settings.intensity = 28;
        }

        return settings;
    }

    /**
     * Get NVIDIA-specific optimal settings
     */
    getNVIDIAOptimalSettings(gpu, base) {
        const settings = { ...base };

        // RTX 30 series
        if (gpu.model.includes('3060') || gpu.model.includes('3070') || gpu.model.includes('3080')) {
            settings.coreClock = 0; // Lock to base
            settings.memoryClock = 1000; // +1000 MHz
            settings.powerLimit = 70; // 70% power limit
            settings.fanSpeed = 70;
        }
        // RTX 40 series
        else if (gpu.model.includes('4060') || gpu.model.includes('4070') || gpu.model.includes('4080')) {
            settings.coreClock = -200; // -200 MHz
            settings.memoryClock = 1500; // +1500 MHz
            settings.powerLimit = 75;
            settings.fanSpeed = 65;
        }
        // GTX 10/16 series
        else if (gpu.model.includes('1060') || gpu.model.includes('1660')) {
            settings.coreClock = 100;
            settings.memoryClock = 500;
            settings.powerLimit = 80;
            settings.fanSpeed = 75;
        }

        return settings;
    }

    /**
     * Apply settings to GPU
     */
    async applySettings(gpuId, settings) {
        try {
            const response = await fetch(`/api/gpu/${gpuId}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.currentSettings[gpuId] = settings;
                    return { success: true };
                }
            }
            throw new Error('Failed to apply settings');
        } catch (error) {
            console.error('Error applying GPU settings:', error);
            throw error;
        }
    }

    /**
     * Reset to optimal settings
     */
    async resetToOptimal(gpuId) {
        const optimal = this.getOptimalSettings(gpuId);
        if (optimal) {
            return await this.applySettings(gpuId, optimal);
        }
        throw new Error('No optimal settings found');
    }

    /**
     * Test settings (apply temporarily)
     */
    async testSettings(gpuId, settings, duration = 60) {
        // Apply settings temporarily for testing
        const original = { ...this.currentSettings[gpuId] };
        
        try {
            await this.applySettings(gpuId, settings);
            
            // Restore after duration
            setTimeout(async () => {
                await this.applySettings(gpuId, original);
            }, duration * 1000);

            return { success: true, message: `Testing for ${duration} seconds` };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get performance impact estimate
     */
    estimatePerformanceImpact(gpuId, settings) {
        const gpu = this.gpus.find(g => g.id === gpuId);
        const optimal = this.getOptimalSettings(gpuId);
        
        if (!gpu || !optimal) return null;

        // Calculate estimated impact
        const coreDiff = settings.coreClock - optimal.coreClock;
        const memDiff = settings.memoryClock - optimal.memoryClock;
        const powerDiff = settings.powerLimit - optimal.powerLimit;

        // Rough estimates (would need actual benchmarks)
        const hashRateImpact = (coreDiff * 0.1) + (memDiff * 0.05);
        const powerImpact = powerDiff;
        const efficiencyImpact = hashRateImpact / (1 + powerImpact / 100);

        return {
            hashRateChange: hashRateImpact,
            powerChange: powerImpact,
            efficiencyChange: efficiencyImpact,
            recommendation: this.getRecommendation(hashRateImpact, powerImpact, efficiencyImpact)
        };
    }

    /**
     * Get recommendation based on impact
     */
    getRecommendation(hashRateChange, powerChange, efficiencyChange) {
        if (efficiencyChange > 0 && hashRateChange > 0) {
            return 'Good - Better efficiency and hash rate';
        } else if (efficiencyChange > 0) {
            return 'Good - Better efficiency';
        } else if (hashRateChange > 0 && powerChange < 10) {
            return 'Acceptable - Higher hash rate, slightly more power';
        } else if (hashRateChange < -5) {
            return 'Warning - Significant hash rate loss';
        } else if (powerChange > 20) {
            return 'Warning - High power increase';
        }
        return 'Neutral - Similar to optimal';
    }

    /**
     * Save custom preset
     */
    async savePreset(name, gpuId, settings) {
        try {
            const response = await fetch('/api/gpu/presets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    gpuId,
                    settings
                })
            });

            if (response.ok) {
                return await response.json();
            }
            throw new Error('Failed to save preset');
        } catch (error) {
            console.error('Error saving preset:', error);
            throw error;
        }
    }

    /**
     * Load preset
     */
    async loadPreset(presetId) {
        try {
            const response = await fetch(`/api/gpu/presets/${presetId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    return await this.applySettings(data.preset.gpuId, data.preset.settings);
                }
            }
            throw new Error('Failed to load preset');
        } catch (error) {
            console.error('Error loading preset:', error);
            throw error;
        }
    }
}

// Export for use in dashboard
if (typeof window !== 'undefined') {
    window.GPUTuner = GPUTuner;
}

