/**
 * Real-Time Difficulty Switcher
 * Automatically directs hash power to the chain with lowest difficulty
 * Switches in real-time without requiring miner restart
 */

class RealTimeDifficultySwitcher {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.isEnabled = false;
        this.checkInterval = 10000; // Check every 10 seconds for real-time switching
        this.minSwitchThreshold = 0.05; // 5% difficulty difference to trigger switch
        this.currentTargetChain = null;
        this.chainDifficulties = {};
        this.switchHistory = [];
        this.lastSwitchTime = 0;
        this.minSwitchCooldown = 30000; // 30 seconds minimum between switches
        this.realTimeUpdateInterval = null;
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupUI();
        if (this.isEnabled) {
            this.start();
        }
    }

    /**
     * Load settings from server
     */
    async loadSettings() {
        try {
            const response = await fetch('/api/difficulty-adjustor/settings');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.isEnabled = data.settings?.enabled || false;
                    this.checkInterval = data.settings?.checkInterval || 10000;
                    this.minSwitchThreshold = data.settings?.minSwitchThreshold || 0.05;
                    this.minSwitchCooldown = data.settings?.minSwitchCooldown || 30000;
                }
            }
        } catch (error) {
            console.error('Error loading difficulty switcher settings:', error);
        }
    }

    /**
     * Save settings to server
     */
    async saveSettings() {
        try {
            const response = await fetch('/api/difficulty-adjustor/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enabled: this.isEnabled,
                    checkInterval: this.checkInterval,
                    minSwitchThreshold: this.minSwitchThreshold,
                    minSwitchCooldown: this.minSwitchCooldown
                })
            });
            return response.ok;
        } catch (error) {
            console.error('Error saving difficulty switcher settings:', error);
            return false;
        }
    }

    /**
     * Start real-time difficulty monitoring and switching
     */
    start() {
        if (this.realTimeUpdateInterval) {
            clearInterval(this.realTimeUpdateInterval);
        }
        
        this.isEnabled = true;
        this.monitorDifficulties();
        this.realTimeUpdateInterval = setInterval(() => this.monitorDifficulties(), this.checkInterval);
        
        if (typeof Toast !== 'undefined') {
            Toast.success('Real-time difficulty switching enabled');
        }
    }

    /**
     * Stop real-time switching
     */
    stop() {
        if (this.realTimeUpdateInterval) {
            clearInterval(this.realTimeUpdateInterval);
            this.realTimeUpdateInterval = null;
        }
        this.isEnabled = false;
        
        if (typeof Toast !== 'undefined') {
            Toast.info('Real-time difficulty switching disabled');
        }
    }

    /**
     * Monitor difficulties and switch if needed
     */
    async monitorDifficulties() {
        try {
            // Fetch current difficulties for all chains
            const difficulties = await this.fetchAllChainDifficulties();
            
            if (Object.keys(difficulties).length === 0) {
                return;
            }

            // Update chain difficulties
            this.chainDifficulties = difficulties;

            // Find chain with lowest difficulty
            const lowestDifficultyChain = this.findLowestDifficulty(difficulties);
            
            if (!lowestDifficultyChain) {
                return;
            }

            // Check if we should switch
            if (this.shouldSwitchToChain(lowestDifficultyChain, difficulties)) {
                await this.switchMiningTarget(lowestDifficultyChain, difficulties[lowestDifficultyChain]);
            }

            // Update UI
            this.updateUI(difficulties, lowestDifficultyChain);
            
        } catch (error) {
            console.error('Error monitoring difficulties:', error);
        }
    }

    /**
     * Fetch difficulties for all available chains
     */
    async fetchAllChainDifficulties() {
        const difficulties = {};
        const chains = this.getAvailableChains();
        
        // Fetch all chain difficulties in parallel
        const fetchPromises = Object.entries(chains)
            .filter(([_, chain]) => chain.enabled)
            .map(async ([chainKey, chain]) => {
                try {
                    const response = await fetch('/api/chain/metrics', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            chainId: chain.id, 
                            chainKey: chainKey 
                        })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        difficulties[chainKey] = {
                            chain: chain,
                            difficulty: data.difficulty || 0,
                            blockReward: data.blockReward || 0,
                            networkHashRate: data.networkHashRate || 0,
                            blockTime: data.blockTime || 10,
                            timestamp: Date.now()
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching difficulty for ${chainKey}:`, error);
                }
            });
        
        await Promise.all(fetchPromises);
        return difficulties;
    }

    /**
     * Find chain with lowest difficulty
     */
    findLowestDifficulty(difficulties) {
        let lowestDifficulty = Infinity;
        let lowestChain = null;
        
        for (const [chainKey, data] of Object.entries(difficulties)) {
            if (data.difficulty > 0 && data.difficulty < lowestDifficulty) {
                lowestDifficulty = data.difficulty;
                lowestChain = chainKey;
            }
        }
        
        return lowestChain;
    }

    /**
     * Determine if we should switch to a different chain
     */
    shouldSwitchToChain(newChain, difficulties) {
        // Check cooldown
        const timeSinceLastSwitch = Date.now() - this.lastSwitchTime;
        if (timeSinceLastSwitch < this.minSwitchCooldown) {
            return false;
        }

        // If no current target, switch immediately
        if (!this.currentTargetChain) {
            return true;
        }

        // If same chain, don't switch
        if (newChain === this.currentTargetChain) {
            return false;
        }

        // Check if new chain has significantly lower difficulty
        const currentDifficulty = difficulties[this.currentTargetChain]?.difficulty || Infinity;
        const newDifficulty = difficulties[newChain]?.difficulty || Infinity;

        if (newDifficulty >= currentDifficulty) {
            return false;
        }

        // Calculate difficulty improvement percentage
        const improvement = (currentDifficulty - newDifficulty) / currentDifficulty;
        
        // Switch if improvement exceeds threshold
        return improvement >= this.minSwitchThreshold;
    }

    /**
     * Switch mining target to new chain (real-time)
     */
    async switchMiningTarget(chainKey, chainData) {
        const chain = chainData.chain;
        
        try {
            // Call API to switch mining target in real-time
            const response = await fetch('/api/miner/switch-chain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chainId: chain.id,
                    chainKey: chainKey,
                    chainName: chain.name,
                    reason: 'lowest_difficulty',
                    difficulty: chainData.difficulty,
                    timestamp: Date.now()
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    const previousChain = this.currentTargetChain;
                    this.currentTargetChain = chainKey;
                    this.lastSwitchTime = Date.now();

                    // Log switch
                    this.switchHistory.push({
                        from: previousChain,
                        to: chainKey,
                        fromDifficulty: this.chainDifficulties[previousChain]?.difficulty || 0,
                        toDifficulty: chainData.difficulty,
                        timestamp: Date.now(),
                        reason: 'Lowest difficulty'
                    });

                    // Keep only last 50 switches
                    if (this.switchHistory.length > 50) {
                        this.switchHistory.shift();
                    }

                    // Show notification
                    if (typeof Toast !== 'undefined') {
                        const improvement = previousChain 
                            ? ((this.chainDifficulties[previousChain]?.difficulty - chainData.difficulty) / this.chainDifficulties[previousChain]?.difficulty * 100).toFixed(1)
                            : 0;
                        Toast.success(
                            `Switched to ${chain.name} (Difficulty: ${this.formatNumber(chainData.difficulty)})${improvement > 0 ? ` - ${improvement}% easier` : ''}`,
                            { duration: 5000 }
                        );
                    }

                    // Update dashboard
                    if (this.dashboard) {
                        this.dashboard.updateMiningTarget(chainKey, chain);
                    }

                    return true;
                }
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to switch chain');
            }
        } catch (error) {
            console.error('Error switching mining target:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error(`Failed to switch to ${chain.name}: ${error.message}`);
            }
            return false;
        }
    }

    /**
     * Get available chains
     */
    getAvailableChains() {
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
            cyprus: { id: 1, name: 'Cyprus', level: 1, token: 'QI', enabled: true },
            paxos: { id: 2, name: 'Paxos', level: 1, token: 'QI', enabled: true },
            hydra: { id: 3, name: 'Hydra', level: 1, token: 'QI', enabled: true },
            cyprus1: { id: 4, name: 'Cyprus Zone 1', level: 2, token: 'QI', enabled: true },
            cyprus2: { id: 5, name: 'Cyprus Zone 2', level: 2, token: 'QI', enabled: true },
            cyprus3: { id: 6, name: 'Cyprus Zone 3', level: 2, token: 'QI', enabled: true },
            paxos1: { id: 7, name: 'Paxos Zone 1', level: 2, token: 'QI', enabled: true },
            paxos2: { id: 8, name: 'Paxos Zone 2', level: 2, token: 'QI', enabled: true },
            paxos3: { id: 9, name: 'Paxos Zone 3', level: 2, token: 'QI', enabled: true },
            hydra1: { id: 10, name: 'Hydra Zone 1', level: 2, token: 'QI', enabled: true },
            hydra2: { id: 11, name: 'Hydra Zone 2', level: 2, token: 'QI', enabled: true },
            hydra3: { id: 12, name: 'Hydra Zone 3', level: 2, token: 'QI', enabled: true }
        };
    }

    /**
     * Update UI with current difficulties
     */
    updateUI(difficulties, lowestChain) {
        const widget = document.getElementById('realTimeDifficultyWidget');
        if (widget) {
            this.renderWidget(widget, difficulties, lowestChain);
        }
    }

    /**
     * Render difficulty widget
     */
    renderWidget(container, difficulties, lowestChain) {
        // Sort by difficulty
        const sorted = Object.entries(difficulties)
            .sort((a, b) => a[1].difficulty - b[1].difficulty);

        const currentChain = this.currentTargetChain || lowestChain;
        const currentData = difficulties[currentChain];

        container.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <div style="padding: 1rem; background: var(--bg-dark); border-radius: 8px; border-left: 4px solid var(--quai-primary);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: var(--quai-primary); font-size: 1.1rem;">Current Mining Target</strong>
                            <div style="margin-top: 0.5rem; font-size: 1.2rem; font-weight: 600;">
                                ${currentData ? currentData.chain.name : 'None'}
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">
                                Difficulty: ${currentData ? this.formatNumber(currentData.difficulty) : 'N/A'}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">Status</div>
                            <div style="margin-top: 4px; padding: 4px 12px; background: var(--quai-primary); color: #000; border-radius: 4px; font-weight: 600; font-size: 0.85rem;">
                                ${this.isEnabled ? 'ACTIVE' : 'INACTIVE'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="max-height: 400px; overflow-y: auto;">
                ${sorted.map(([chainKey, data], index) => {
                    const isCurrent = chainKey === currentChain;
                    const isLowest = chainKey === lowestChain;
                    return `
                        <div style="
                            background: var(--bg-card);
                            padding: 0.75rem;
                            border-radius: 6px;
                            margin-bottom: 0.5rem;
                            border: 2px solid ${isCurrent ? 'var(--quai-primary)' : isLowest ? 'var(--success-color)' : 'var(--border-color)'};
                            opacity: ${isCurrent ? 1 : 0.8};
                        ">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <strong style="color: ${isCurrent ? 'var(--quai-primary)' : 'var(--text-primary)'};">
                                            ${data.chain.name}
                                        </strong>
                                        ${isCurrent ? '<span style="background: var(--quai-primary); color: #000; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; font-weight: 600;">MINING</span>' : ''}
                                        ${isLowest && !isCurrent ? '<span style="background: var(--success-color); color: #000; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; font-weight: 600;">LOWEST</span>' : ''}
                                    </div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
                                        ${data.chain.token} • Block: ${data.blockTime}s
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 600; color: ${isLowest ? 'var(--success-color)' : 'var(--text-primary)'};">
                                        ${this.formatNumber(data.difficulty)}
                                    </div>
                                    ${isCurrent && currentData ? `
                                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                                            Mining now
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            ${this.switchHistory.length > 0 ? `
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <strong style="font-size: 0.9rem; color: var(--text-primary);">Recent Switches</strong>
                    <div style="margin-top: 0.5rem; max-height: 150px; overflow-y: auto;">
                        ${this.switchHistory.slice(-5).reverse().map(switchItem => `
                            <div style="font-size: 0.8rem; color: var(--text-secondary); padding: 0.25rem 0;">
                                ${new Date(switchItem.timestamp).toLocaleTimeString()} - 
                                ${switchItem.from ? this.getChainName(switchItem.from) : 'None'} → 
                                ${this.getChainName(switchItem.to)}
                                ${switchItem.fromDifficulty > 0 ? ` (${((switchItem.fromDifficulty - switchItem.toDifficulty) / switchItem.fromDifficulty * 100).toFixed(1)}% easier)` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }

    /**
     * Get chain name from key
     */
    getChainName(chainKey) {
        const chains = this.getAvailableChains();
        return chains[chainKey]?.name || chainKey;
    }

    /**
     * Format number
     */
    formatNumber(num) {
        if (num === 0) return '0';
        if (num < 1000) return num.toFixed(2);
        if (num < 1000000) return (num / 1000).toFixed(2) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(2) + 'M';
        return (num / 1000000000).toFixed(2) + 'B';
    }

    /**
     * Setup UI
     */
    setupUI() {
        // UI setup is handled by dashboard integration
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.RealTimeDifficultySwitcher = RealTimeDifficultySwitcher;
}

