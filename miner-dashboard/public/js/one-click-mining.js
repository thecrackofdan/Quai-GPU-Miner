/**
 * One-Click Mining - Start mining with single click
 * Automatically handles all configuration for new and experienced users
 */

class OneClickMining {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.autoSetup = null;
        this.smartDefaults = null;
        this.init();
    }

    init() {
        if (typeof AutoSetup !== 'undefined') {
            this.autoSetup = new AutoSetup(this.dashboard);
        }
        if (typeof SmartDefaults !== 'undefined') {
            this.smartDefaults = new SmartDefaults();
        }
        this.createOneClickButton();
    }

    /**
     * Create one-click mining button
     */
    createOneClickButton() {
        // Check if button already exists
        if (document.getElementById('oneClickMiningBtn')) return;

        // Create button in header
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            const button = document.createElement('button');
            button.id = 'oneClickMiningBtn';
            button.className = 'btn-primary';
            button.innerHTML = '🚀 Start Mining';
            button.title = 'One-click mining start - automatically configures and starts';
            button.onclick = () => this.startMining();
            
            // Insert at beginning
            headerControls.insertBefore(button, headerControls.firstChild);
        }
    }

    /**
     * One-click mining start
     */
    async startMining() {
        try {
            // Check if already mining
            const statusResponse = await fetch('/api/miner/status');
            if (statusResponse.ok) {
                const status = await statusResponse.json();
                if (status.status === 'running') {
                    if (typeof Toast !== 'undefined') {
                        Toast.info('Mining is already running!');
                    }
                    return;
                }
            }

            // Show loading state
            const button = document.getElementById('oneClickMiningBtn');
            if (button) {
                button.disabled = true;
                button.innerHTML = '⏳ Configuring...';
            }

            if (typeof Toast !== 'undefined') {
                Toast.info('Auto-configuring mining setup...', { duration: 3000 });
            }

            // Step 1: Check if configured
            const configResponse = await fetch('/api/miner/config');
            let hasConfig = false;
            
            if (configResponse.ok) {
                const configData = await configResponse.json();
                hasConfig = configData.success && configData.config;
            }

            // Step 2: Auto-configure if needed
            if (!hasConfig) {
                await this.autoConfigure();
            }

            // Step 3: Start mining
            const startResponse = await fetch('/api/miner/start', {
                method: 'POST'
            });

            if (startResponse.ok) {
                const startData = await startResponse.json();
                if (startData.success) {
                    if (typeof Toast !== 'undefined') {
                        Toast.success('Mining started successfully!', { duration: 5000 });
                    }

                    // Update button
                    if (button) {
                        button.innerHTML = '⛏️ Mining';
                        button.className = 'btn-success';
                        button.onclick = () => this.stopMining();
                    }

                    // Update dashboard
                    if (this.dashboard) {
                        this.dashboard.updateMiningData();
                    }
                } else {
                    throw new Error(startData.error || 'Failed to start mining');
                }
            } else {
                throw new Error('Failed to start miner');
            }
        } catch (error) {
            console.error('Error in one-click mining:', error);
            
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to start mining: ' + error.message);
            }

            // Reset button
            const button = document.getElementById('oneClickMiningBtn');
            if (button) {
                button.disabled = false;
                button.innerHTML = '🚀 Start Mining';
            }
        }
    }

    /**
     * Stop mining
     */
    async stopMining() {
        try {
            const response = await fetch('/api/miner/stop', {
                method: 'POST'
            });

            if (response.ok) {
                if (typeof Toast !== 'undefined') {
                    Toast.info('Mining stopped');
                }

                const button = document.getElementById('oneClickMiningBtn');
                if (button) {
                    button.innerHTML = '🚀 Start Mining';
                    button.className = 'btn-primary';
                    button.onclick = () => this.startMining();
                }
            }
        } catch (error) {
            console.error('Error stopping mining:', error);
        }
    }

    /**
     * Auto-configure mining setup
     */
    async autoConfigure() {
        if (!this.smartDefaults) {
            this.smartDefaults = new SmartDefaults();
        }

        // Get optimal configuration
        const config = await this.smartDefaults.autoConfigure();
        if (!config) {
            // Fallback to basic config
            config = {
                mining: {
                    mode: 'solo',
                    mergedMining: { enabled: false, chains: [0] }
                }
            };
        }

        // Check for node
        const hasNode = await this.checkNode();
        if (!hasNode) {
            // No node - suggest pool mining
            config.mining.mode = 'pool';
            config.pool = {
                id: 'official',
                url: 'stratum+tcp://pool.quai.network:3333'
            };
        }

        // Apply configuration
        await fetch('/api/miner/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
    }

    /**
     * Check if node is available
     */
    async checkNode() {
        const urls = ['http://localhost:8545', 'http://127.0.0.1:8545'];
        
        for (const url of urls) {
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
                    if (data.result) return true;
                }
            } catch (error) {
                // Try next URL
            }
        }
        
        return false;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.OneClickMining = OneClickMining;
}

