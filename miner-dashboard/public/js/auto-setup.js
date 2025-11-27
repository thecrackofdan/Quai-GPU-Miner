/**
 * Auto-Setup System - Zero-configuration mining setup
 * Automatically detects hardware, optimizes settings, and starts mining
 */

class AutoSetup {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.setupComplete = false;
        this.detectedHardware = null;
        this.optimizedSettings = null;
        this.userExperience = 'beginner'; // 'beginner' or 'advanced'
        this.init();
    }

    init() {
        this.detectUserExperience();
        this.checkSetupStatus();
        
        // Auto-start setup if not configured
        if (!this.setupComplete && this.userExperience === 'beginner') {
            this.startAutoSetup();
        }
    }

    /**
     * Detect if user is beginner or advanced
     */
    detectUserExperience() {
        // Check if user has existing configuration
        const hasConfig = localStorage.getItem('quaiminer_config') || 
                         localStorage.getItem('miner_settings');
        
        // Check if user has customized settings
        const hasCustomSettings = localStorage.getItem('custom_gpu_settings') ||
                                  localStorage.getItem('custom_mining_config');
        
        if (hasConfig || hasCustomSettings) {
            this.userExperience = 'advanced';
        } else {
            this.userExperience = 'beginner';
        }
    }

    /**
     * Check if setup is complete
     */
    async checkSetupStatus() {
        try {
            const response = await fetch('/api/setup/status');
            if (response.ok) {
                const data = await response.json();
                this.setupComplete = data.setupComplete || false;
            }
        } catch (error) {
            console.error('Error checking setup status:', error);
        }
    }

    /**
     * Start automatic setup process
     */
    async startAutoSetup() {
        if (this.setupComplete) return;

        // Show welcome modal for first-time users
        this.showWelcomeModal();
    }

    /**
     * Show welcome modal with auto-setup option
     */
    showWelcomeModal() {
        // Check if already shown
        if (localStorage.getItem('auto_setup_shown')) return;

        const modal = document.createElement('div');
        modal.id = 'autoSetupModal';
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>🚀 Welcome to Quai GPU Miner</h2>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 1.5rem; color: var(--text-secondary); line-height: 1.6;">
                        We can automatically detect your hardware and configure optimal mining settings for you.
                        This takes just a few seconds and you can always customize later.
                    </p>
                    
                    <div style="background: var(--bg-dark); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                        <h4 style="margin-bottom: 0.5rem; color: var(--quai-primary);">What we'll do:</h4>
                        <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary);">
                            <li>Detect your GPUs automatically</li>
                            <li>Optimize settings for your hardware</li>
                            <li>Configure mining pools or solo mining</li>
                            <li>Set up alerts and monitoring</li>
                            <li>Start mining automatically</li>
                        </ul>
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 1.5rem;">
                        <button class="btn-primary" id="startAutoSetupBtn" style="flex: 1;">
                            ✨ Auto-Setup (Recommended)
                        </button>
                        <button class="btn-secondary" id="skipAutoSetupBtn" style="flex: 1;">
                            Manual Setup
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('startAutoSetupBtn').onclick = () => {
            this.runAutoSetup();
            modal.style.display = 'none';
        };

        document.getElementById('skipAutoSetupBtn').onclick = () => {
            localStorage.setItem('auto_setup_shown', 'true');
            modal.style.display = 'none';
        };
    }

    /**
     * Run automatic setup process
     */
    async runAutoSetup() {
        try {
            if (typeof Toast !== 'undefined') {
                Toast.info('Starting automatic setup...', { duration: 3000 });
            }

            // Step 1: Detect hardware
            const hardware = await this.detectHardware();
            this.detectedHardware = hardware;

            // Step 2: Optimize settings
            const settings = await this.optimizeSettings(hardware);
            this.optimizedSettings = settings;

            // Step 3: Configure mining
            await this.configureMining(settings);

            // Step 4: Setup alerts
            await this.setupAlerts();

            // Step 5: Start mining
            await this.startMining();

            // Mark setup as complete
            await this.completeSetup();

            if (typeof Toast !== 'undefined') {
                Toast.success('Automatic setup complete! Mining started.', { duration: 5000 });
            }

            // Show success summary
            this.showSetupSummary(hardware, settings);

        } catch (error) {
            console.error('Error in auto-setup:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Auto-setup encountered an issue. You can configure manually.');
            }
        }
    }

    /**
     * Detect hardware automatically
     */
    async detectHardware() {
        try {
            const response = await fetch('/api/gpus');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.gpus && data.gpus.length > 0) {
                    return {
                        gpus: data.gpus,
                        gpuCount: data.gpus.length,
                        vendor: this.detectVendor(data.gpus),
                        models: data.gpus.map(g => g.model || g.name)
                    };
                }
            }
        } catch (error) {
            console.error('Error detecting hardware:', error);
        }

        // Fallback: Use config GPUs
        if (typeof CONFIG !== 'undefined' && CONFIG.gpus) {
            return {
                gpus: CONFIG.gpus,
                gpuCount: CONFIG.gpus.length,
                vendor: 'unknown',
                models: CONFIG.gpus.map(g => g.name)
            };
        }

        return { gpus: [], gpuCount: 0, vendor: 'unknown', models: [] };
    }

    /**
     * Detect GPU vendor
     */
    detectVendor(gpus) {
        if (gpus.length === 0) return 'unknown';
        
        const firstGpu = gpus[0];
        if (firstGpu.vendor) return firstGpu.vendor.toLowerCase();
        if (firstGpu.name) {
            if (firstGpu.name.toLowerCase().includes('nvidia') || 
                firstGpu.name.toLowerCase().includes('rtx') ||
                firstGpu.name.toLowerCase().includes('gtx')) {
                return 'nvidia';
            }
            if (firstGpu.name.toLowerCase().includes('amd') ||
                firstGpu.name.toLowerCase().includes('radeon') ||
                firstGpu.name.toLowerCase().includes('rx')) {
                return 'amd';
            }
        }
        return 'unknown';
    }

    /**
     * Optimize settings based on hardware
     */
    async optimizeSettings(hardware) {
        const settings = {
            mining: {
                mode: 'solo', // Default to solo
                mergedMining: {
                    enabled: false,
                    chains: [0] // Start with Prime only
                }
            },
            gpu: {},
            alerts: {
                enabled: true,
                channels: {
                    browser: { enabled: true }
                }
            }
        };

        // Optimize based on GPU count
        if (hardware.gpuCount === 0) {
            // No GPUs detected - suggest hardware check
            settings.warning = 'No GPUs detected. Please check hardware connections.';
        } else if (hardware.gpuCount === 1) {
            // Single GPU - conservative settings
            settings.gpu.powerLimit = 85;
            settings.gpu.coreClock = 0;
            settings.gpu.memoryClock = 200;
        } else if (hardware.gpuCount <= 4) {
            // Small rig - balanced settings
            settings.gpu.powerLimit = 80;
            settings.gpu.coreClock = 50;
            settings.gpu.memoryClock = 300;
            settings.mining.mergedMining.enabled = true;
            settings.mining.mergedMining.chains = [0, 1]; // Prime + 1 region
        } else {
            // Large rig - performance settings
            settings.gpu.powerLimit = 90;
            settings.gpu.coreClock = 100;
            settings.gpu.memoryClock = 500;
            settings.mining.mergedMining.enabled = true;
            settings.mining.mergedMining.chains = [0, 1, 2, 3]; // All chains
        }

        // Vendor-specific optimizations
        if (hardware.vendor === 'amd') {
            settings.gpu.intensity = 20;
            settings.gpu.worksize = 256;
        } else if (hardware.vendor === 'nvidia') {
            settings.gpu.intensity = 24;
            settings.gpu.worksize = 128;
        }

        return settings;
    }

    /**
     * Configure mining settings
     */
    async configureMining(settings) {
        try {
            // Check if node is available
            const nodeAvailable = await this.checkNodeAvailability();
            
            if (nodeAvailable) {
                // Solo mining with node
                settings.mining.mode = 'solo';
                settings.node = {
                    rpcUrl: 'http://localhost:8545',
                    requireSynced: true
                };
            } else {
                // Suggest pool mining
                settings.mining.mode = 'pool';
                settings.pool = {
                    id: 'official', // Default to official pool
                    url: 'stratum+tcp://pool.quai.network:3333'
                };
            }

            // Apply settings
            const response = await fetch('/api/miner/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                return true;
            }
        } catch (error) {
            console.error('Error configuring mining:', error);
        }
        return false;
    }

    /**
     * Check if Quai node is available
     */
    async checkNodeAvailability() {
        const rpcUrls = [
            'http://localhost:8545',
            'http://127.0.0.1:8545',
            'http://localhost:8546',
            'http://localhost:8547'
        ];

        for (const url of rpcUrls) {
            try {
                const response = await fetch('/api/node/rpc', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        method: 'eth_blockNumber',
                        params: []
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.result) {
                        return true; // Node is available
                    }
                }
            } catch (error) {
                // Try next URL
            }
        }

        return false; // No node found
    }

    /**
     * Setup basic alerts
     */
    async setupAlerts() {
        try {
            const alertSettings = {
                channels: {
                    browser: { enabled: true },
                    email: { enabled: false },
                    telegram: { enabled: false },
                    discord: { enabled: false }
                },
                rules: [
                    {
                        id: 'high-temp',
                        name: 'High Temperature',
                        condition: 'temperature > 80',
                        enabled: true,
                        channels: ['browser']
                    },
                    {
                        id: 'miner-crash',
                        name: 'Miner Crash',
                        condition: 'isMining === false',
                        enabled: true,
                        channels: ['browser']
                    },
                    {
                        id: 'block-found',
                        name: 'Block Found',
                        condition: 'blocksFound > previousBlocksFound',
                        enabled: true,
                        channels: ['browser']
                    }
                ]
            };

            await fetch('/api/alerts/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alertSettings)
            });
        } catch (error) {
            console.error('Error setting up alerts:', error);
        }
    }

    /**
     * Start mining automatically
     */
    async startMining() {
        try {
            const response = await fetch('/api/miner/start', {
                method: 'POST'
            });

            if (response.ok) {
                return true;
            }
        } catch (error) {
            console.error('Error starting miner:', error);
        }
        return false;
    }

    /**
     * Mark setup as complete
     */
    async completeSetup() {
        try {
            await fetch('/api/setup/complete', {
                method: 'POST'
            });
            this.setupComplete = true;
            localStorage.setItem('auto_setup_shown', 'true');
        } catch (error) {
            console.error('Error completing setup:', error);
        }
    }

    /**
     * Show setup summary
     */
    showSetupSummary(hardware, settings) {
        const summary = document.createElement('div');
        summary.className = 'modal';
        summary.style.display = 'block';
        // SECURITY: Sanitize hardware info before displaying
        const safeGpuCount = Math.min(hardware.gpuCount || 0, 100);
        const safeVendor = String(hardware.vendor || 'unknown').substring(0, 20);
        const safeModels = (hardware.models || []).slice(0, 10).map(m => 
            String(m || 'Unknown').substring(0, 50)
        ).join(', ') || 'Unknown';
        
        summary.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>✅ Setup Complete!</h2>
                    <button class="modal-close" onclick="this.closest('.modal').style.display='none'">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background: var(--bg-dark); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <h4 style="margin-bottom: 0.5rem; color: var(--quai-primary);">Detected Hardware:</h4>
                        <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary);">
                            <li><strong>GPUs:</strong> ${safeGpuCount}</li>
                            <li><strong>Vendor:</strong> ${safeVendor.toUpperCase()}</li>
                            <li><strong>Models:</strong> ${safeModels}</li>
                        </ul>
                    </div>

                    <div style="background: var(--bg-dark); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <h4 style="margin-bottom: 0.5rem; color: var(--quai-primary);">Configuration:</h4>
                        <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary);">
                            <li><strong>Mining Mode:</strong> ${String(settings.mining?.mode || 'solo').substring(0, 20)}</li>
                            <li><strong>Merged Mining:</strong> ${settings.mining?.mergedMining?.enabled ? 'Enabled' : 'Disabled'}</li>
                            <li><strong>Chains:</strong> ${Math.min(settings.mining?.mergedMining?.chains?.length || 0, 13)}</li>
                            <li><strong>Power Limit:</strong> ${Math.min(Math.max(settings.gpu?.powerLimit || 80, -100), 100)}%</li>
                        </ul>
                    </div>

                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                        Your mining rig is now configured and starting. You can customize settings anytime using the configuration options.
                    </p>

                    <div style="display: flex; gap: 10px;">
                        <button class="btn-primary" onclick="this.closest('.modal').style.display='none'" style="flex: 1;">
                            Got it!
                        </button>
                        <button class="btn-secondary" onclick="window.location.reload()" style="flex: 1;">
                            View Dashboard
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(summary);
    }

    /**
     * Quick start for experienced users
     */
    async quickStart() {
        // For experienced users - minimal prompts, use existing config or smart defaults
        try {
            // Check for existing config
            const response = await fetch('/api/miner/config');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.config) {
                    // Config exists - just start mining
                    await this.startMining();
                    return;
                }
            }

            // No config - quick setup with smart defaults
            const hardware = await this.detectHardware();
            const settings = await this.optimizeSettings(hardware);
            await this.configureMining(settings);
            await this.startMining();

            if (typeof Toast !== 'undefined') {
                Toast.success('Quick start complete! Mining started.');
            }
        } catch (error) {
            console.error('Error in quick start:', error);
        }
    }
}

// Export for use in dashboard
if (typeof window !== 'undefined') {
    window.AutoSetup = AutoSetup;
}

