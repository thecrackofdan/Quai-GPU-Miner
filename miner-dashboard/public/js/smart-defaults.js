/**
 * Smart Defaults - Intelligent configuration based on hardware and context
 * Provides optimal defaults for both beginners and experienced users
 */

class SmartDefaults {
    constructor() {
        this.hardwareProfiles = this.loadHardwareProfiles();
        this.miningProfiles = this.loadMiningProfiles();
    }

    /**
     * Load hardware-specific profiles
     */
    loadHardwareProfiles() {
        return {
            // AMD Profiles
            'amd-rx-590': {
                coreClock: 1545,
                memoryClock: 2000,
                powerLimit: -20,
                fanSpeed: 60,
                intensity: 20,
                worksize: 256
            },
            'amd-rx-580': {
                coreClock: 1450,
                memoryClock: 2000,
                powerLimit: -15,
                fanSpeed: 65,
                intensity: 20,
                worksize: 256
            },
            'amd-rx-570': {
                coreClock: 1400,
                memoryClock: 2000,
                powerLimit: -15,
                fanSpeed: 70,
                intensity: 20,
                worksize: 256
            },
            'amd-rx-6000': {
                coreClock: 2100,
                memoryClock: 2000,
                powerLimit: -10,
                fanSpeed: 55,
                intensity: 24,
                worksize: 256
            },
            'amd-rx-7000': {
                coreClock: 2500,
                memoryClock: 2500,
                powerLimit: -5,
                fanSpeed: 50,
                intensity: 28,
                worksize: 256
            },
            // NVIDIA Profiles
            'nvidia-rtx-30': {
                coreClock: 0,
                memoryClock: 1000,
                powerLimit: 70,
                fanSpeed: 70,
                intensity: 24,
                worksize: 128
            },
            'nvidia-rtx-40': {
                coreClock: -200,
                memoryClock: 1500,
                powerLimit: 75,
                fanSpeed: 65,
                intensity: 28,
                worksize: 128
            },
            'nvidia-gtx-10': {
                coreClock: 100,
                memoryClock: 500,
                powerLimit: 80,
                fanSpeed: 75,
                intensity: 20,
                worksize: 128
            },
            'nvidia-gtx-16': {
                coreClock: 100,
                memoryClock: 500,
                powerLimit: 80,
                fanSpeed: 75,
                intensity: 22,
                worksize: 128
            }
        };
    }

    /**
     * Load mining scenario profiles
     */
    loadMiningProfiles() {
        return {
            'beginner-solo': {
                mode: 'solo',
                mergedMining: { enabled: false, chains: [0] },
                description: 'Simple solo mining - easiest to start'
            },
            'beginner-pool': {
                mode: 'pool',
                pool: 'official',
                description: 'Pool mining - steady payouts'
            },
            'balanced': {
                mode: 'solo',
                mergedMining: { enabled: true, chains: [0, 1] },
                description: 'Balanced - Prime + 1 region'
            },
            'performance': {
                mode: 'solo',
                mergedMining: { enabled: true, chains: [0, 1, 2, 3] },
                description: 'Maximum performance - all chains'
            },
            'efficient': {
                mode: 'solo',
                mergedMining: { enabled: false, chains: [0] },
                gpu: { powerLimit: 70 },
                description: 'Power efficient - lower consumption'
            }
        };
    }

    /**
     * Get optimal settings for GPU
     */
    getOptimalGPUSettings(gpuName, vendor) {
        const key = this.matchHardwareProfile(gpuName, vendor);
        if (key && this.hardwareProfiles[key]) {
            return this.hardwareProfiles[key];
        }

        // Default fallback
        return {
            coreClock: 0,
            memoryClock: 200,
            powerLimit: 80,
            fanSpeed: 60,
            intensity: 20,
            worksize: 256
        };
    }

    /**
     * Match GPU to hardware profile
     */
    matchHardwareProfile(gpuName, vendor) {
        if (!gpuName) return null;

        const name = gpuName.toLowerCase();
        const ven = (vendor || '').toLowerCase();

        if (ven.includes('amd') || ven.includes('radeon')) {
            if (name.includes('590')) return 'amd-rx-590';
            if (name.includes('580')) return 'amd-rx-580';
            if (name.includes('570')) return 'amd-rx-570';
            if (name.includes('6000') || name.includes('6700') || name.includes('6800')) return 'amd-rx-6000';
            if (name.includes('7000') || name.includes('7900') || name.includes('7800')) return 'amd-rx-7000';
        }

        if (ven.includes('nvidia')) {
            if (name.includes('3060') || name.includes('3070') || name.includes('3080')) return 'nvidia-rtx-30';
            if (name.includes('4060') || name.includes('4070') || name.includes('4080')) return 'nvidia-rtx-40';
            if (name.includes('1060') || name.includes('1070') || name.includes('1080')) return 'nvidia-gtx-10';
            if (name.includes('1660')) return 'nvidia-gtx-16';
        }

        return null;
    }

    /**
     * Get recommended mining profile
     */
    getRecommendedMiningProfile(gpuCount, hashRate, hasNode) {
        if (!hasNode) {
            return 'beginner-pool';
        }

        if (gpuCount === 1) {
            return 'beginner-solo';
        } else if (gpuCount <= 4) {
            return 'balanced';
        } else {
            return 'performance';
        }
    }

    /**
     * Auto-configure based on detected hardware
     */
    async autoConfigure() {
        try {
            // Detect hardware
            const response = await fetch('/api/gpus');
            if (!response.ok) return null;

            const data = await response.json();
            if (!data.success || !data.gpus || data.gpus.length === 0) {
                return null;
            }

            const gpus = data.gpus;
            const config = {
                gpus: [],
                mining: {
                    mode: 'solo',
                    mergedMining: { enabled: false, chains: [0] }
                }
            };

            // Configure each GPU
            for (const gpu of gpus) {
                const optimal = this.getOptimalGPUSettings(gpu.name || gpu.model, gpu.vendor);
                config.gpus.push({
                    id: gpu.id,
                    ...optimal
                });
            }

            // Determine mining profile
            const totalHashRate = gpus.reduce((sum, g) => sum + (g.hashRate || 0), 0);
            const hasNode = await this.checkNode();
            const profile = this.getRecommendedMiningProfile(gpus.length, totalHashRate, hasNode);
            
            config.mining = { ...this.miningProfiles[profile] };

            return config;
        } catch (error) {
            console.error('Error in auto-configure:', error);
            return null;
        }
    }

    /**
     * Check if node is available
     */
    async checkNode() {
        try {
            const response = await fetch('/api/node/rpc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ method: 'eth_blockNumber', params: [] })
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.SmartDefaults = SmartDefaults;
}

