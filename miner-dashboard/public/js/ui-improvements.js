/**
 * UI Improvements - Enhanced visual design and usability
 * Makes the dashboard easier to use and more visually appealing
 */

class UIImprovements {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.init();
    }

    init() {
        this.addRewardsDisplay();
        this.addStabilityIndicator();
        this.addQuickActions();
        this.improveVisualHierarchy();
        this.addTooltips();
        this.addKeyboardShortcuts();
        this.improveResponsiveness();
    }

    /**
     * Add enhanced rewards display
     */
    addRewardsDisplay() {
        // Check if rewards section exists
        let rewardsSection = document.getElementById('rewardsSection');
        
        if (!rewardsSection) {
            // Find a good place to insert rewards section (after mining stats)
            const miningSection = document.querySelector('.personal-mining-section');
            if (miningSection) {
                rewardsSection = document.createElement('section');
                rewardsSection.id = 'rewardsSection';
                rewardsSection.className = 'rewards-section';
                rewardsSection.innerHTML = `
                    <h2 class="section-title-red">
                        💰 Estimated Rewards
                        <span class="info-icon" data-tooltip="Estimated rewards based on current hash rate and network difficulty. Actual rewards may vary.">ℹ️</span>
                    </h2>
                    <div class="rewards-grid">
                        <div class="reward-card">
                            <div class="reward-label">Daily</div>
                            <div class="reward-value" id="dailyReward">0.000000 QUAI</div>
                        </div>
                        <div class="reward-card">
                            <div class="reward-label">Weekly</div>
                            <div class="reward-value" id="weeklyReward">0.000000 QUAI</div>
                        </div>
                        <div class="reward-card">
                            <div class="reward-label">Monthly</div>
                            <div class="reward-value" id="monthlyReward">0.000000 QUAI</div>
                        </div>
                        <div class="reward-card">
                            <div class="reward-label">Time to Block</div>
                            <div class="reward-value" id="timeToBlock">N/A</div>
                        </div>
                        <div class="reward-card">
                            <div class="reward-label">Block Probability</div>
                            <div class="reward-value" id="blockProbability">0.0000%</div>
                        </div>
                        <div class="reward-card">
                            <div class="reward-label">Total Earned</div>
                            <div class="reward-value" id="totalEarned">0.000000 QUAI</div>
                        </div>
                    </div>
                `;
                miningSection.insertAdjacentElement('afterend', rewardsSection);
            }
        }
    }

    /**
     * Add stability indicator
     */
    addStabilityIndicator() {
        const header = document.querySelector('.dashboard-header');
        if (header && !document.getElementById('stabilityIndicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'stabilityIndicator';
            indicator.className = 'stability-indicator';
            indicator.innerHTML = `
                <span class="stability-label">Stability:</span>
                <span class="stability-score" id="stabilityScore">100%</span>
                <div class="stability-bar">
                    <div class="stability-fill" id="stabilityFill" style="width: 100%"></div>
                </div>
            `;
            header.querySelector('.header-right')?.appendChild(indicator);
        }
    }

    /**
     * Add quick actions panel
     */
    addQuickActions() {
        const header = document.querySelector('.header-controls');
        if (header && !document.getElementById('quickActions')) {
            const quickActions = document.createElement('div');
            quickActions.id = 'quickActions';
            quickActions.className = 'quick-actions';
            quickActions.innerHTML = `
                <button class="quick-action-btn" id="optimizeAllBtn" title="Auto-optimize all GPUs">
                    ⚡ Optimize All
                </button>
                <button class="quick-action-btn" id="resetAllBtn" title="Reset all GPUs to defaults">
                    🔄 Reset All
                </button>
            `;
            header.appendChild(quickActions);

            // Add event listeners
            const optimizeBtn = document.getElementById('optimizeAllBtn');
            const resetBtn = document.getElementById('resetAllBtn');

            if (optimizeBtn && this.dashboard.gpuOptimizer) {
                optimizeBtn.addEventListener('click', async () => {
                    optimizeBtn.disabled = true;
                    optimizeBtn.textContent = '⏳ Optimizing...';
                    const result = await this.dashboard.gpuOptimizer.autoOptimizeAll();
                    optimizeBtn.disabled = false;
                    optimizeBtn.textContent = '⚡ Optimize All';
                    
                    if (result.success) {
                        if (typeof Toast !== 'undefined') {
                            Toast.success('All GPUs optimized', { duration: 3000 });
                        }
                    }
                });
            }

            if (resetBtn) {
                resetBtn.addEventListener('click', async () => {
                    if (confirm('Reset all GPUs to default settings?')) {
                        const gpus = this.dashboard?.miningData?.gpus || [];
                        for (const gpu of gpus) {
                            try {
                                await fetch(`/api/gpus/${gpu.id}/reset`, { method: 'POST' });
                            } catch (error) {
                                console.error('Error resetting GPU:', error);
                            }
                        }
                        if (typeof Toast !== 'undefined') {
                            Toast.success('All GPUs reset to defaults', { duration: 3000 });
                        }
                    }
                });
            }
        }
    }

    /**
     * Improve visual hierarchy
     */
    improveVisualHierarchy() {
        // Add visual emphasis to important metrics
        const hashRateEl = document.getElementById('hashRate');
        if (hashRateEl) {
            hashRateEl.style.fontSize = '2.5rem';
            hashRateEl.style.fontWeight = '800';
            hashRateEl.style.color = 'var(--quai-primary)';
            hashRateEl.style.textShadow = '0 0 20px rgba(255, 0, 0, 0.6)';
        }

        // Add glow effect to active mining status
        const miningStatus = document.getElementById('miningStatusText');
        if (miningStatus) {
            setInterval(() => {
                if (this.dashboard?.miningData?.isMining) {
                    miningStatus.style.animation = 'pulse 2s ease-in-out infinite';
                } else {
                    miningStatus.style.animation = '';
                }
            }, 1000);
        }
    }

    /**
     * Add helpful tooltips
     */
    addTooltips() {
        // Add tooltips to key metrics
        const tooltips = {
            'hashRate': 'Your mining speed in MegaHashes per second. Higher is better.',
            'acceptedShares': 'Number of valid proof-of-work solutions accepted by the network.',
            'temperature': 'GPU temperature. Keep below 80°C for optimal performance.',
            'powerUsage': 'Total power consumption of your mining rig in watts.',
            'efficiency': 'Hash rate per watt. Higher efficiency means better profitability.'
        };

        Object.entries(tooltips).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) {
                element.setAttribute('data-tooltip', text);
            }
        });
    }

    /**
     * Add keyboard shortcuts
     */
    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S: Start mining
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                const startBtn = document.getElementById('oneClickMiningBtn');
                if (startBtn && !startBtn.disabled) {
                    startBtn.click();
                }
            }

            // Ctrl/Cmd + O: Optimize GPUs
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                const optimizeBtn = document.getElementById('optimizeAllBtn');
                if (optimizeBtn) {
                    optimizeBtn.click();
                }
            }

            // Ctrl/Cmd + R: Refresh (prevent default to avoid page reload)
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                // Allow refresh but show message
                if (typeof Toast !== 'undefined') {
                    Toast.info('Refreshing data...', { duration: 2000 });
                }
            }

            // Escape: Close modals
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    if (modal.style.display === 'block') {
                        modal.style.display = 'none';
                    }
                });
            }
        });
    }

    /**
     * Improve responsiveness
     */
    improveResponsiveness() {
        // Add responsive adjustments
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .rewards-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                }
                
                .quick-actions {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .stability-indicator {
                    font-size: 0.8rem;
                }
            }

            @media (max-width: 480px) {
                .rewards-grid {
                    grid-template-columns: 1fr !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Update stability indicator
     */
    updateStabilityIndicator() {
        if (!this.dashboard.stabilityMonitor) return;

        const score = this.dashboard.stabilityMonitor.getStabilityScore();
        const scoreEl = document.getElementById('stabilityScore');
        const fillEl = document.getElementById('stabilityFill');

        if (scoreEl) {
            scoreEl.textContent = `${score}%`;
            
            // Color based on score
            if (score >= 80) {
                scoreEl.style.color = 'var(--success)';
                if (fillEl) fillEl.style.background = 'var(--success)';
            } else if (score >= 60) {
                scoreEl.style.color = 'var(--warning)';
                if (fillEl) fillEl.style.background = 'var(--warning)';
            } else {
                scoreEl.style.color = 'var(--error)';
                if (fillEl) fillEl.style.background = 'var(--error)';
            }
        }

        if (fillEl) {
            fillEl.style.width = `${score}%`;
        }
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.UIImprovements = UIImprovements;
}

