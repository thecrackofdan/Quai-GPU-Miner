/**
 * Difficulty Adjustor - Automatically mines the chain with lowest difficulty
 * Optimizes for mining profits by selecting chains with easier block discovery
 * Especially useful when blockchain scales and difficulty varies across chains
 */

class DifficultyAdjustor {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.isEnabled = false;
        this.checkInterval = 60000; // Check every minute
        this.minDifficultyThreshold = 0; // Minimum difficulty to consider
        this.difficultyHistory = {}; // Track difficulty changes
        this.currentLowestDifficultyChain = null;
        this.switchHistory = [];
        this.init();
    }

    init() {
        this.loadSettings();
        if (this.isEnabled) {
            this.start();
        }
    }

    /**
     * Load adjustor settings
     */
    async loadSettings() {
        try {
            const response = await fetch('/api/difficulty-adjustor/settings');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.isEnabled = data.settings?.enabled || false;
                    this.checkInterval = data.settings?.checkInterval || 60000;
                    this.minDifficultyThreshold = data.settings?.minDifficultyThreshold || 0;
                }
            }
        } catch (error) {
            console.error('Error loading difficulty adjustor settings:', error);
        }
    }

    /**
     * Save adjustor settings
     */
    async saveSettings() {
        try {
            const response = await fetch('/api/difficulty-adjustor/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enabled: this.isEnabled,
                    checkInterval: this.checkInterval,
                    minDifficultyThreshold: this.minDifficultyThreshold
                })
            });
            return response.ok;
        } catch (error) {
            console.error('Error saving difficulty adjustor settings:', error);
            return false;
        }
    }

    /**
     * Start difficulty monitoring
     */
    start() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.isEnabled = true;
        this.checkLowestDifficulty();
        this.intervalId = setInterval(() => this.checkLowestDifficulty(), this.checkInterval);
        
        if (typeof Toast !== 'undefined') {
            Toast.success('Difficulty adjustor started');
        }
    }

    /**
     * Stop difficulty monitoring
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isEnabled = false;
        
        if (typeof Toast !== 'undefined') {
            Toast.info('Difficulty adjustor stopped');
        }
    }

    /**
     * Check for chain with lowest difficulty
     */
    async checkLowestDifficulty() {
        try {
            // Get difficulty metrics for all chains
            const chainDifficulties = await this.fetchChainDifficulties();
            
            if (Object.keys(chainDifficulties).length === 0) {
                return;
            }

            // Find chain with lowest difficulty
            const lowestDifficultyChain = this.findLowestDifficultyChain(chainDifficulties);
            
            if (!lowestDifficultyChain) {
                return;
            }

            // Update difficulty history
            this.updateDifficultyHistory(chainDifficulties);

            // Switch if different from current chain
            if (this.shouldSwitch(lowestDifficultyChain)) {
                await this.switchToChain(lowestDifficultyChain);
            }

            // Update UI
            this.updateDifficultyDisplay(chainDifficulties, lowestDifficultyChain);
            
        } catch (error) {
            console.error('Error checking lowest difficulty:', error);
        }
    }

    /**
     * Fetch difficulty for all chains
     */
    async fetchChainDifficulties() {
        const difficulties = {};
        const chains = this.getAvailableChains();
        
        for (const [chainKey, chain] of Object.entries(chains)) {
            if (!chain.enabled) continue;
            
            try {
                const response = await fetch('/api/chain/metrics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chainId: chain.id, chainKey: chainKey })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const difficulty = data.difficulty || 0;
                    
                    // Only consider chains above minimum threshold
                    if (difficulty >= this.minDifficultyThreshold) {
                        difficulties[chainKey] = {
                            chain: chain,
                            difficulty: difficulty,
                            blockReward: data.blockReward || 0,
                            networkHashRate: data.networkHashRate || 0,
                            blockTime: data.blockTime || 10,
                            estimatedBlocksPerDay: (86400 / (data.blockTime || 10)),
                            // Calculate expected rewards per day (simplified)
                            expectedRewards: this.calculateExpectedRewards(
                                difficulty,
                                data.blockReward || 0,
                                data.networkHashRate || 0,
                                data.blockTime || 10
                            )
                        };
                    }
                }
            } catch (error) {
                console.error(`Error fetching difficulty for ${chainKey}:`, error);
            }
        }
        
        return difficulties;
    }

    /**
     * Calculate expected rewards based on difficulty
     */
    calculateExpectedRewards(difficulty, blockReward, networkHashRate, blockTime) {
        const userHashRate = this.getUserHashRate();
        if (!userHashRate || !networkHashRate) return 0;
        
        // Lower difficulty = easier to mine = more blocks per day for same hash rate
        // Simplified calculation: rewards inversely proportional to difficulty
        const blocksPerDay = 86400 / blockTime;
        const networkShare = userHashRate / networkHashRate;
        
        // Adjust for difficulty (lower difficulty = higher chance of finding blocks)
        // Difficulty factor: 1 / (1 + difficulty / baseDifficulty)
        const baseDifficulty = 1000000; // Base difficulty for normalization
        const difficultyFactor = 1 / (1 + (difficulty / baseDifficulty));
        
        return networkShare * blocksPerDay * blockReward * difficultyFactor;
    }

    /**
     * Get user's current hash rate
     */
    getUserHashRate() {
        if (this.dashboard && this.dashboard.miningData) {
            return this.dashboard.miningData.hashRate || 0;
        }
        return 0;
    }

    /**
     * Get available chains
     */
    getAvailableChains() {
        // Use profit optimizer's chain data if available, otherwise use default
        if (this.dashboard && this.dashboard.profitOptimizer) {
            return this.dashboard.profitOptimizer.chains || this.getDefaultChains();
        }
        return this.getDefaultChains();
    }

    /**
     * Get default chain structure
     */
    getDefaultChains() {
        return {
            prime: { id: 0, name: 'Prime', level: 0, token: 'QUAI', enabled: true },
            cyprus: { id: 1, name: 'Cyprus', level: 1, token: 'QI', enabled: false },
            paxos: { id: 2, name: 'Paxos', level: 1, token: 'QI', enabled: false },
            hydra: { id: 3, name: 'Hydra', level: 1, token: 'QI', enabled: false },
            cyprus1: { id: 4, name: 'Cyprus Zone 1', level: 2, token: 'QI', enabled: false },
            cyprus2: { id: 5, name: 'Cyprus Zone 2', level: 2, token: 'QI', enabled: false },
            cyprus3: { id: 6, name: 'Cyprus Zone 3', level: 2, token: 'QI', enabled: false },
            paxos1: { id: 7, name: 'Paxos Zone 1', level: 2, token: 'QI', enabled: false },
            paxos2: { id: 8, name: 'Paxos Zone 2', level: 2, token: 'QI', enabled: false },
            paxos3: { id: 9, name: 'Paxos Zone 3', level: 2, token: 'QI', enabled: false },
            hydra1: { id: 10, name: 'Hydra Zone 1', level: 2, token: 'QI', enabled: false },
            hydra2: { id: 11, name: 'Hydra Zone 2', level: 2, token: 'QI', enabled: false },
            hydra3: { id: 12, name: 'Hydra Zone 3', level: 2, token: 'QI', enabled: false }
        };
    }

    /**
     * Find chain with lowest difficulty
     */
    findLowestDifficultyChain(chainDifficulties) {
        if (Object.keys(chainDifficulties).length === 0) return null;
        
        let lowestDifficulty = Infinity;
        let lowestChain = null;
        
        for (const [chainKey, data] of Object.entries(chainDifficulties)) {
            if (data.difficulty < lowestDifficulty) {
                lowestDifficulty = data.difficulty;
                lowestChain = chainKey;
            }
        }
        
        return lowestChain;
    }

    /**
     * Determine if should switch chains
     */
    shouldSwitch(newChain) {
        if (!this.currentLowestDifficultyChain) return true;
        if (newChain === this.currentLowestDifficultyChain) return false;
        
        // Always switch to lower difficulty (no threshold needed for difficulty-based)
        return true;
    }

    /**
     * Switch to chain with lowest difficulty
     */
    async switchToChain(chainKey) {
        const chains = this.getAvailableChains();
        const chain = chains[chainKey];
        if (!chain) return;
        
        try {
            // Update merged mining config to focus on this chain
            const response = await fetch('/api/miner/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mining: {
                        mergedMining: {
                            enabled: true,
                            chains: [chain.id],
                            autoSwitched: true,
                            switchedAt: Date.now(),
                            previousChain: this.currentLowestDifficultyChain,
                            reason: 'lowest_difficulty'
                        }
                    }
                })
            });
            
            if (response.ok) {
                const previousChain = this.currentLowestDifficultyChain;
                this.currentLowestDifficultyChain = chainKey;
                
                // Log switch
                this.switchHistory.push({
                    from: previousChain,
                    to: chainKey,
                    timestamp: Date.now(),
                    reason: 'Lowest difficulty'
                });
                
                if (typeof Toast !== 'undefined') {
                    Toast.success(`Switched to ${chain.name} (lowest difficulty)`);
                }
                
                // Restart miner if needed
                await this.restartMiner();
            }
        } catch (error) {
            console.error('Error switching to lowest difficulty chain:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to switch chain');
            }
        }
    }

    /**
     * Restart miner to apply new chain
     */
    async restartMiner() {
        try {
            const response = await fetch('/api/miner/restart', {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Failed to restart miner');
            }
        } catch (error) {
            console.error('Error restarting miner:', error);
        }
    }

    /**
     * Update difficulty history
     */
    updateDifficultyHistory(chainDifficulties) {
        const timestamp = Date.now();
        
        for (const [chainKey, data] of Object.entries(chainDifficulties)) {
            if (!this.difficultyHistory[chainKey]) {
                this.difficultyHistory[chainKey] = [];
            }
            
            this.difficultyHistory[chainKey].push({
                difficulty: data.difficulty,
                timestamp: timestamp
            });
            
            // Keep only last 100 entries per chain
            if (this.difficultyHistory[chainKey].length > 100) {
                this.difficultyHistory[chainKey].shift();
            }
        }
    }

    /**
     * Update difficulty display in UI
     */
    updateDifficultyDisplay(chainDifficulties, lowestChain) {
        const widget = document.getElementById('difficultyAdjustorWidget');
        if (widget) {
            this.renderDifficultyWidget(widget, chainDifficulties, lowestChain);
        }
    }

    /**
     * Render difficulty widget
     */
    renderDifficultyWidget(container, chainDifficulties, lowestChain) {
        // Sort chains by difficulty (lowest first)
        const sorted = Object.entries(chainDifficulties)
            .sort((a, b) => a[1].difficulty - b[1].difficulty);
        
        container.innerHTML = `
            <div class="difficulty-list">
                <div style="margin-bottom: 1rem; padding: 1rem; background: var(--bg-dark); border-radius: 8px; border-left: 3px solid var(--quai-primary);">
                    <strong style="color: var(--quai-primary);">Current Target:</strong>
                    <span style="margin-left: 8px;">${lowestChain ? this.getAvailableChains()[lowestChain]?.name || lowestChain : 'None'}</span>
                </div>
                ${sorted.map(([chainKey, data], index) => {
                    const isLowest = chainKey === lowestChain;
                    const chain = data.chain;
                    return `
                        <div class="difficulty-item ${isLowest ? 'active' : ''}" style="
                            background: var(--bg-card);
                            padding: 1rem;
                            border-radius: 8px;
                            margin-bottom: 0.5rem;
                            border: 2px solid ${isLowest ? 'var(--quai-primary)' : 'var(--border-color)'};
                        ">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong style="color: ${isLowest ? 'var(--quai-primary)' : 'var(--text-primary)'};">
                                        ${chain.name} ${isLowest ? '← Lowest' : ''}
                                    </strong>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
                                        ${chain.token} • Block Time: ${data.blockTime}s
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 600; color: var(--success-color);">
                                        Difficulty: ${this.formatNumber(data.difficulty)}
                                    </div>
                                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                                        Est. Rewards: ${this.formatReward(data.expectedRewards)} ${chain.token}/day
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Format number with commas
     */
    formatNumber(num) {
        return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }

    /**
     * Format reward amount
     */
    formatReward(amount) {
        if (amount === 0) return '0.00';
        if (amount < 0.01) return amount.toFixed(6);
        return amount.toFixed(2);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DifficultyAdjustor;
}

