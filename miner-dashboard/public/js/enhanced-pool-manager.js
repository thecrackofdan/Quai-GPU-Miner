/**
 * Enhanced Pool Manager - Advanced pool selection with automatic switching
 * Features: Real-time pool stats, smart recommendations, automatic pool switching, profitability comparison
 */

class EnhancedPoolManager extends PoolManager {
    constructor(dashboard) {
        super(dashboard);
        this.autoSwitchEnabled = false;
        this.poolStats = new Map();
        this.switchHistory = [];
        this.monitoringInterval = null;
        this.init();
    }

    init() {
        super.init();
        this.loadSettings();
        this.startPoolMonitoring();
        this.setupAutoSwitch();
    }

    /**
     * Load settings
     */
    async loadSettings() {
        try {
            const settings = localStorage.getItem('poolManagerSettings');
            if (settings) {
                const parsed = JSON.parse(settings);
                this.autoSwitchEnabled = parsed.autoSwitchEnabled || false;
            }
            return Promise.resolve();
        } catch (error) {
            console.error('Error loading pool manager settings:', error);
            return Promise.resolve();
        }
    }

    /**
     * Save settings
     */
    saveSettings() {
        try {
            localStorage.setItem('poolManagerSettings', JSON.stringify({
                autoSwitchEnabled: this.autoSwitchEnabled
            }));
        } catch (error) {
            console.error('Error saving pool manager settings:', error);
        }
    }

    /**
     * Start monitoring pool statistics
     */
    startPoolMonitoring() {
        // Monitor pools every 5 minutes
        this.monitoringInterval = setInterval(() => {
            this.updatePoolStats();
        }, 300000);
        
        // Initial update
        this.updatePoolStats();
    }

    /**
     * Update pool statistics
     */
    async updatePoolStats() {
        for (const pool of this.pools) {
            try {
                const stats = await this.fetchPoolStats(pool.url);
                if (stats) {
                    this.poolStats.set(pool.id, {
                        ...stats,
                        lastUpdate: Date.now(),
                        latency: await this.measureLatency(pool.url)
                    });
                }
            } catch (error) {
                console.error(`Error updating stats for ${pool.name}:`, error);
            }
        }
        
        // If auto-switch is enabled, check if we should switch
        if (this.autoSwitchEnabled) {
            this.checkAutoSwitch();
        }
    }

    /**
     * Measure pool latency
     */
    async measureLatency(poolUrl) {
        const start = Date.now();
        try {
            // Try to connect to pool (simplified - would use actual stratum connection test)
            const host = poolUrl.replace(/^stratum\+?tcp?:\/\//, '').split(':')[0];
            // In real implementation, would test actual stratum connection
            return Date.now() - start;
        } catch (error) {
            return Infinity;
        }
    }

    /**
     * Check if we should automatically switch pools
     */
    async checkAutoSwitch() {
        const hashRate = this.dashboard.miningData?.hashRate || 0;
        if (hashRate === 0) return; // Not mining
        
        const comparisons = this.comparePools(hashRate);
        
        // Calculate profitability for each pool
        const poolProfitabilities = comparisons.map(pool => {
            const stats = this.poolStats.get(pool.id);
            const latency = stats?.latency || 1000;
            const uptime = this.parseUptime(pool.uptime);
            
            // Calculate expected daily earnings
            const dailyEarnings = this.estimateDailyEarnings(
                pool.effectiveHashRate,
                pool.fee,
                1000000, // Network hash rate (would be fetched)
                2.0 // Block reward
            );
            
            // Penalize high latency and low uptime
            const latencyPenalty = latency > 500 ? 0.95 : 1.0;
            const uptimePenalty = uptime < 99 ? (uptime / 100) : 1.0;
            
            return {
                pool,
                dailyEarnings: dailyEarnings * latencyPenalty * uptimePenalty,
                score: dailyEarnings * latencyPenalty * uptimePenalty,
                latency,
                uptime
            };
        });
        
        // Sort by profitability
        poolProfitabilities.sort((a, b) => b.score - a.score);
        const bestPool = poolProfitabilities[0];
        const currentPool = this.currentPool;
        
        // Switch if best pool is significantly better (5% improvement)
        if (currentPool && bestPool.pool.id !== currentPool.id) {
            const improvement = ((bestPool.score - poolProfitabilities.find(p => p.pool.id === currentPool.id)?.score || 0) / bestPool.score) * 100;
            
            if (improvement > 5) {
                await this.autoSwitchPool(bestPool.pool, improvement);
            }
        }
    }

    /**
     * Parse uptime percentage
     */
    parseUptime(uptimeStr) {
        const match = uptimeStr.match(/(\d+\.?\d*)%/);
        return match ? parseFloat(match[1]) : 99;
    }

    /**
     * Automatically switch to a better pool
     */
    async autoSwitchPool(pool, improvement) {
        try {
            const walletAddress = this.dashboard.miningData?.walletAddress || '';
            const workerName = this.dashboard.miningData?.workerName || 'rig1';
            
            const result = await this.switchPool(pool.id, walletAddress, workerName);
            
            if (result.success) {
                this.switchHistory.push({
                    from: this.currentPool?.name || 'Unknown',
                    to: pool.name,
                    improvement,
                    timestamp: Date.now()
                });
                
                // Notify user
                if (typeof Toast !== 'undefined') {
                    Toast.success(`Automatically switched to ${pool.name} (${improvement.toFixed(1)}% better profitability)`);
                }
                
                // Log switch
                this.dashboard.addLog(`Auto-switched to ${pool.name} (${improvement.toFixed(1)}% improvement)`, 'info');
            }
        } catch (error) {
            console.error('Error auto-switching pool:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to auto-switch pool');
            }
        }
    }

    /**
     * Setup auto-switch UI
     */
    setupAutoSwitch() {
        // Setup auto-switch checkbox handler
        const autoSwitchCheckbox = document.getElementById('autoSwitchPools');
        if (autoSwitchCheckbox) {
            autoSwitchCheckbox.checked = this.autoSwitchEnabled;
            autoSwitchCheckbox.onchange = (e) => {
                this.toggleAutoSwitch(e.target.checked);
            };
        }
    }
    
    /**
     * Toggle automatic pool switching
     */
    toggleAutoSwitch(enabled) {
        this.autoSwitchEnabled = enabled;
        this.saveSettings();
        
        if (enabled) {
            this.startPoolMonitoring();
            if (typeof Toast !== 'undefined') {
                Toast.success('Automatic pool switching enabled');
            }
            this.dashboard.addLog('Automatic pool switching enabled', 'info');
        } else {
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
                this.monitoringInterval = null;
            }
            if (typeof Toast !== 'undefined') {
                Toast.info('Automatic pool switching disabled');
            }
            this.dashboard.addLog('Automatic pool switching disabled', 'info');
        }
    }

    /**
     * Switch to a pool (override parent method with enhanced functionality)
     */
    async switchPool(poolId, walletAddress = null, workerName = '') {
        const pool = this.pools.find(p => p.id === poolId);
        if (!pool) {
            if (typeof Toast !== 'undefined') {
                Toast.error('Pool not found');
            }
            throw new Error('Pool not found');
        }

        // Get wallet address from dashboard if not provided
        if (!walletAddress) {
            walletAddress = this.dashboard.miningData?.walletAddress || 
                          this.dashboard.miningData?.wallets?.prime || '';
        }

        if (!walletAddress) {
            // Prompt for wallet address
            walletAddress = prompt('Enter your Quai wallet address (0x...):');
            if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
                if (typeof Toast !== 'undefined') {
                    Toast.error('Invalid wallet address');
                }
                return { success: false, error: 'Invalid wallet address' };
            }
        }

        try {
            const response = await fetch('/api/miner/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mining: {
                        mode: 'pool',
                        stratum: pool.url
                    },
                    wallet: walletAddress,
                    worker: workerName || 'rig1'
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.currentPool = pool;
                    
                    // Update dashboard
                    if (this.dashboard.miningData) {
                        this.dashboard.miningData.miningMode = 'pool';
                        this.dashboard.miningData.currentPool = pool;
                    }
                    
                    // Show success message
                    if (typeof Toast !== 'undefined') {
                        Toast.success(`Connected to ${pool.name}`);
                    }
                    
                    // Log the switch
                    this.dashboard.addLog(`Switched to pool: ${pool.name}`, 'info');
                    
                    return { success: true, pool: pool };
                }
            }
            throw new Error('Failed to switch pool');
        } catch (error) {
            console.error('Error switching pool:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to switch pool: ' + error.message);
            }
            throw error;
        }
    }

    /**
     * Enhanced pool comparison with real-time data
     */
    comparePoolsEnhanced(hashRate) {
        const comparisons = this.comparePools(hashRate);
        
        return comparisons.map(pool => {
            const stats = this.poolStats.get(pool.id);
            const latency = stats?.latency || null;
            const uptime = this.parseUptime(pool.uptime);
            
            // Calculate profitability score
            const dailyEarnings = this.estimateDailyEarnings(
                pool.effectiveHashRate,
                pool.fee,
                1000000,
                2.0
            );
            
            const score = dailyEarnings * (latency ? (latency < 200 ? 1.0 : 0.95) : 0.9) * (uptime / 100);
            
            return {
                ...pool,
                ...stats,
                latency,
                uptime,
                dailyEarnings,
                score,
                isBest: false // Will be set after sorting
            };
        }).sort((a, b) => b.score - a.score).map((pool, index) => ({
            ...pool,
            isBest: index === 0,
            rank: index + 1
        }));
    }

    /**
     * Get pool recommendation with reasoning
     */
    getSmartRecommendation(hashRate) {
        const comparisons = this.comparePoolsEnhanced(hashRate);
        const best = comparisons[0];
        
        let reasoning = [];
        
        if (best.fee === 0) {
            reasoning.push('No pool fees (100% rewards)');
        } else {
            reasoning.push(`Low fee (${best.feePercent})`);
        }
        
        if (best.latency && best.latency < 200) {
            reasoning.push('Low latency connection');
        }
        
        if (best.uptime >= 99.5) {
            reasoning.push('Excellent uptime');
        }
        
        if (best.dailyEarnings) {
            reasoning.push(`Estimated $${best.dailyEarnings.toFixed(2)}/day`);
        }
        
        return {
            pool: best,
            reasoning,
            alternatives: comparisons.slice(1, 3)
        };
    }

    /**
     * Render enhanced pool selection UI
     */
    renderPoolSelection() {
        const hashRate = this.dashboard.miningData?.hashRate || 0;
        const recommendation = this.getSmartRecommendation(hashRate);
        const comparisons = this.comparePoolsEnhanced(hashRate);
        
        let html = `
            <div class="pool-selection-enhanced">
                <div class="pool-recommendation-card ${recommendation.pool.isBest ? 'recommended' : ''}">
                    <h4>⭐ Recommended: ${recommendation.pool.name}</h4>
                    <ul class="recommendation-reasons">
                        ${recommendation.reasoning.map(r => `<li>${r}</li>`).join('')}
                    </ul>
                    <button class="btn-primary" onclick="window.poolManager.switchPool('${recommendation.pool.id}')">
                        Connect to ${recommendation.pool.name}
                    </button>
                </div>
                
                <div class="pool-comparison-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Pool</th>
                                <th>Fee</th>
                                <th>Latency</th>
                                <th>Uptime</th>
                                <th>Daily Est.</th>
                                <th>Score</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${comparisons.map(pool => `
                                <tr class="${pool.isBest ? 'best-pool' : ''}">
                                    <td>
                                        <strong>${pool.name}</strong>
                                        ${pool.isBest ? '<span class="badge-best">Best</span>' : ''}
                                    </td>
                                    <td>${pool.feePercent}</td>
                                    <td>${pool.latency ? `${pool.latency}ms` : 'N/A'}</td>
                                    <td>${pool.uptime.toFixed(1)}%</td>
                                    <td>$${pool.dailyEarnings.toFixed(2)}</td>
                                    <td>${pool.score.toFixed(0)}</td>
                                    <td>
                                        <button class="btn-small" onclick="window.poolManager.switchPool('${pool.id}')">
                                            Connect
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="auto-switch-controls">
                    <label>
                        <input type="checkbox" id="autoSwitchPools" ${this.autoSwitchEnabled ? 'checked' : ''} 
                               onchange="window.poolManager.toggleAutoSwitch(this.checked)">
                        Enable Automatic Pool Switching
                    </label>
                    <p class="hint">Automatically switch to the most profitable pool when a better option is available (5% improvement threshold)</p>
                </div>
            </div>
        `;
        
        return html;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.EnhancedPoolManager = EnhancedPoolManager;
    // Make toggleAutoSwitch globally accessible
    window.toggleAutoSwitch = function(enabled) {
        if (window.poolManager && typeof window.poolManager.toggleAutoSwitch === 'function') {
            window.poolManager.toggleAutoSwitch(enabled);
        }
    };
}

