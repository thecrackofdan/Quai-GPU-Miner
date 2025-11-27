/**
 * Quai Metrics UI - Sophisticated interface for Quai-specific mining data
 * Displays SOAP features, LMT/LMR, profitability, and chain-specific metrics
 */

class QuaiMetricsUI {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.metrics = null;
        this.updateInterval = null;
        this.init();
    }

    async init() {
        this.createMetricsSection();
        await this.loadMetrics();
        this.startUpdates();
    }

    /**
     * Create sophisticated metrics section
     */
    createMetricsSection() {
        // Find where to insert (after GPU section)
        const gpuSection = document.querySelector('.gpu-section-top') || 
                          document.querySelector('.mining-stats-section');
        
        if (!gpuSection) return;

        const section = document.createElement('section');
        section.className = 'quai-metrics-section';
        section.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(255,0,0,0.1) 0%, rgba(0,0,0,0.9) 100%); border: 2px solid var(--quai-primary); border-radius: 16px; padding: 2rem; margin: 2rem 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="color: var(--quai-primary); margin: 0; font-size: 1.8rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>⚡</span> Quai Network Metrics
                    </h2>
                    <div style="display: flex; gap: 0.5rem;">
                        <span class="network-badge" style="background: rgba(255,0,0,0.2);">ProgPoW</span>
                        <span class="network-badge" id="soapBadge" style="background: rgba(255,0,0,0.2); display: none;">SOAP</span>
                    </div>
                </div>

                <!-- Profitability Overview -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div class="metric-card" style="background: rgba(0,255,0,0.1); border-left: 4px solid var(--success-color);">
                        <div class="metric-label">Daily Profit</div>
                        <div class="metric-value" id="dailyProfit">$0.00</div>
                        <div class="metric-change" id="profitChange">-</div>
                    </div>
                    <div class="metric-card" style="background: rgba(255,0,0,0.1); border-left: 4px solid var(--quai-primary);">
                        <div class="metric-label">Daily Revenue</div>
                        <div class="metric-value" id="dailyRevenue">$0.00</div>
                        <div class="metric-subtext" id="revenueBreakdown">Mining only</div>
                    </div>
                    <div class="metric-card" style="background: rgba(255,170,0,0.1); border-left: 4px solid var(--warning-color);">
                        <div class="metric-label">Daily Cost</div>
                        <div class="metric-value" id="dailyCost">$0.00</div>
                        <div class="metric-subtext" id="costBreakdown">Electricity</div>
                    </div>
                    <div class="metric-card" style="background: rgba(0,0,255,0.1); border-left: 4px solid #00aaff;">
                        <div class="metric-label">Efficiency</div>
                        <div class="metric-value" id="efficiency">0.00</div>
                        <div class="metric-subtext">Hash/Watt</div>
                    </div>
                </div>

                <!-- Chain Profitability Comparison -->
                <div style="background: var(--bg-card); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--text-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>📊</span> Chain Profitability
                    </h3>
                    <div id="chainComparison" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                        <!-- Chains will be populated here -->
                    </div>
                </div>

                <!-- SOAP Features -->
                <div id="soapSection" style="background: var(--bg-card); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; display: none;">
                    <h3 style="color: var(--quai-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>🔐</span> SOAP Staking & Merge Mining
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div class="soap-card">
                            <div class="soap-label">Staking Status</div>
                            <div class="soap-value" id="stakingStatus">Not Active</div>
                            <div class="soap-detail" id="stakingDetails">-</div>
                        </div>
                        <div class="soap-card">
                            <div class="soap-label">Reward Multiplier</div>
                            <div class="soap-value" id="rewardMultiplier">1.0x</div>
                            <div class="soap-detail" id="lockupPeriod">-</div>
                        </div>
                        <div class="soap-card">
                            <div class="soap-label">Staking Bonus</div>
                            <div class="soap-value" id="stakingBonus">$0.00/day</div>
                            <div class="soap-detail">Additional rewards</div>
                        </div>
                        <div class="soap-card">
                            <div class="soap-label">Merge Mining</div>
                            <div class="soap-value" id="mergeMiningStatus">Disabled</div>
                            <div class="soap-detail" id="mergeMiningRewards">-</div>
                        </div>
                    </div>
                </div>

                <!-- LMT/LMR -->
                <div id="lmtLmrSection" style="background: var(--bg-card); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; display: none;">
                    <h3 style="color: var(--quai-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>💎</span> Liquid Mining Tokens (LMT) & Locked Mining Rewards (LMR)
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div class="lmt-card">
                            <div class="lmt-label">Liquid Balance</div>
                            <div class="lmt-value" id="liquidBalance">0 QUAI</div>
                            <div class="lmt-detail">Available immediately</div>
                        </div>
                        <div class="lmt-card">
                            <div class="lmt-label">Locked Balance</div>
                            <div class="lmt-value" id="lockedBalance">0 QUAI</div>
                            <div class="lmt-detail" id="lockupInfo">-</div>
                        </div>
                        <div class="lmt-card">
                            <div class="lmt-label">Staking Rewards</div>
                            <div class="lmt-value" id="stakingRewards">0 QUAI</div>
                            <div class="lmt-detail">Total earned</div>
                        </div>
                    </div>
                </div>

                <!-- Earnings Projection -->
                <div style="background: var(--bg-card); border-radius: 12px; padding: 1.5rem;">
                    <h3 style="color: var(--text-primary); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>💰</span> Earnings Projection
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                        <div class="projection-card">
                            <div class="projection-label">Daily</div>
                            <div class="projection-value" id="projectionDaily">$0.00</div>
                        </div>
                        <div class="projection-card">
                            <div class="projection-label">Weekly</div>
                            <div class="projection-value" id="projectionWeekly">$0.00</div>
                        </div>
                        <div class="projection-card">
                            <div class="projection-label">Monthly</div>
                            <div class="projection-value" id="projectionMonthly">$0.00</div>
                        </div>
                        <div class="projection-card">
                            <div class="projection-label">Yearly</div>
                            <div class="projection-value" id="projectionYearly">$0.00</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        gpuSection.parentNode.insertBefore(section, gpuSection.nextSibling);
        this.injectStyles();
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('quai-metrics-styles')) return;

        const style = document.createElement('style');
        style.id = 'quai-metrics-styles';
        style.textContent = `
            .metric-card {
                background: var(--bg-card);
                border-radius: 12px;
                padding: 1.5rem;
                transition: all 0.3s;
            }
            .metric-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(255, 0, 0, 0.3);
            }
            .metric-label {
                color: var(--text-secondary);
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 0.5rem;
            }
            .metric-value {
                color: var(--text-primary);
                font-size: 2rem;
                font-weight: 700;
                font-family: 'JetBrains Mono', monospace;
            }
            .metric-change {
                color: var(--success-color);
                font-size: 0.85rem;
                margin-top: 0.25rem;
            }
            .metric-subtext {
                color: var(--text-muted);
                font-size: 0.75rem;
                margin-top: 0.25rem;
            }
            .soap-card, .lmt-card, .projection-card {
                background: rgba(255, 0, 0, 0.05);
                border: 1px solid rgba(255, 0, 0, 0.2);
                border-radius: 8px;
                padding: 1rem;
            }
            .soap-label, .lmt-label, .projection-label {
                color: var(--text-secondary);
                font-size: 0.85rem;
                margin-bottom: 0.5rem;
            }
            .soap-value, .lmt-value, .projection-value {
                color: var(--quai-primary);
                font-size: 1.5rem;
                font-weight: 600;
                font-family: 'JetBrains Mono', monospace;
            }
            .soap-detail, .lmt-detail {
                color: var(--text-muted);
                font-size: 0.75rem;
                margin-top: 0.25rem;
            }
            .chain-profit-item {
                background: var(--bg-dark);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 1rem;
                text-align: center;
                transition: all 0.3s;
            }
            .chain-profit-item:hover {
                border-color: var(--quai-primary);
                box-shadow: 0 4px 12px rgba(255, 0, 0, 0.2);
            }
            .chain-profit-item.best {
                border-color: var(--success-color);
                background: rgba(0, 255, 0, 0.1);
            }
            .chain-name {
                color: var(--text-primary);
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            .chain-profit {
                color: var(--quai-primary);
                font-size: 1.2rem;
                font-weight: 700;
                font-family: 'JetBrains Mono', monospace;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Load metrics from server
     */
    async loadMetrics() {
        try {
            // Get current mining stats
            let hashRate = 0;
            let powerUsage = 0;
            
            try {
                const statsResponse = await fetch('/api/stats');
                if (statsResponse.ok) {
                    const stats = await statsResponse.json();
                    hashRate = stats.hashRate || 0;
                    powerUsage = stats.powerUsage || 0;
                }
            } catch (e) {
                // Fallback to dashboard data if available
                if (this.dashboard && this.dashboard.miningData) {
                    hashRate = this.dashboard.miningData.hashRate || 0;
                    powerUsage = this.dashboard.miningData.powerUsage || 0;
                }
            }

            const response = await fetch(`/api/quai/metrics?hashRate=${hashRate}&powerUsage=${powerUsage}`);
            if (response.ok) {
                const data = await response.json();
                this.metrics = data.metrics;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error loading Quai metrics:', error);
        }
    }

    /**
     * Update UI with metrics
     */
    updateUI() {
        if (!this.metrics) return;

        const tp = this.metrics.totalProfitability || {};
        const earnings = this.metrics.earnings || {};
        const efficiency = this.metrics.efficiency || {};

        // Update profitability cards
        this.updateElement('dailyProfit', this.formatCurrency(tp.dailyProfit || 0));
        this.updateElement('dailyRevenue', this.formatCurrency(tp.dailyRevenue || 0));
        this.updateElement('dailyCost', this.formatCurrency(tp.dailyCost || 0));
        this.updateElement('efficiency', (efficiency.hashPerWatt || 0).toFixed(2));

        // Update revenue breakdown
        const breakdown = [];
        if (tp.miningRevenue) breakdown.push(`Mining: ${this.formatCurrency(tp.miningRevenue)}`);
        if (tp.stakingBonus) breakdown.push(`Staking: ${this.formatCurrency(tp.stakingBonus)}`);
        if (tp.mergeMiningBonus) breakdown.push(`Merge: ${this.formatCurrency(tp.mergeMiningBonus)}`);
        this.updateElement('revenueBreakdown', breakdown.join(' • ') || 'Mining only');

        // Update chain comparison
        this.updateChainComparison();

        // Update SOAP section
        this.updateSOAPSection();

        // Update LMT/LMR section
        this.updateLMTLMRSection();

        // Update projections
        this.updateElement('projectionDaily', this.formatCurrency(earnings.daily || 0));
        this.updateElement('projectionWeekly', this.formatCurrency(earnings.weekly || 0));
        this.updateElement('projectionMonthly', this.formatCurrency(earnings.monthly || 0));
        this.updateElement('projectionYearly', this.formatCurrency(earnings.yearly || 0));
    }

    /**
     * Update chain comparison
     */
    updateChainComparison() {
        const container = document.getElementById('chainComparison');
        if (!container || !this.metrics.chainProfitability) return;

        const chains = Object.entries(this.metrics.chainProfitability)
            .sort((a, b) => (b[1].daily || 0) - (a[1].daily || 0));

        container.innerHTML = chains.map(([chain, profit]) => {
            const isBest = profit.daily === Math.max(...chains.map(c => c[1].daily || 0));
            return `
                <div class="chain-profit-item ${isBest ? 'best' : ''}">
                    <div class="chain-name">${chain}</div>
                    <div class="chain-profit">${this.formatCurrency(profit.daily || 0)}</div>
                    <div style="color: var(--text-muted); font-size: 0.75rem; margin-top: 0.25rem;">per day</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Update SOAP section
     */
    updateSOAPSection() {
        const section = document.getElementById('soapSection');
        const soap = this.metrics.soap || {};
        
        if (!soap.enabled && !soap.stakingEnabled) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = 'block';
        if (document.getElementById('soapBadge')) {
            document.getElementById('soapBadge').style.display = 'inline-block';
        }

        this.updateElement('stakingStatus', soap.stakingEnabled ? 'Active' : 'Not Active');
        this.updateElement('rewardMultiplier', `${(soap.rewardMultiplier || 1.0).toFixed(2)}x`);
        this.updateElement('lockupPeriod', soap.lockupDays ? `${soap.lockupDays} days` : '-');
        this.updateElement('stakingBonus', this.formatCurrency((this.metrics.totalProfitability?.stakingBonus || 0)));
        this.updateElement('mergeMiningStatus', soap.mergeMiningEnabled ? 'Enabled' : 'Disabled');
        this.updateElement('mergeMiningRewards', soap.ravencoinRewards ? `+${this.formatCurrency(soap.ravencoinRewards)}/day` : '-');
    }

    /**
     * Update LMT/LMR section
     */
    updateLMTLMRSection() {
        const section = document.getElementById('lmtLmrSection');
        const lmtLmr = this.metrics.lmtLmr || {};
        
        if (!lmtLmr.liquidBalance && !lmtLmr.lockedBalance) {
            if (section) section.style.display = 'none';
            return;
        }

        if (section) section.style.display = 'block';

        this.updateElement('liquidBalance', `${(lmtLmr.liquidBalance || 0).toFixed(4)} QUAI`);
        this.updateElement('lockedBalance', `${(lmtLmr.lockedBalance || 0).toFixed(4)} QUAI`);
        this.updateElement('lockupInfo', lmtLmr.lockupPeriod ? `Locked for ${lmtLmr.lockupPeriod} days` : '-');
        this.updateElement('stakingRewards', `${(lmtLmr.stakingRewards || 0).toFixed(4)} QUAI`);
    }

    /**
     * Update element
     */
    updateElement(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    /**
     * Format currency
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    /**
     * Start periodic updates
     */
    startUpdates() {
        this.updateInterval = setInterval(() => {
            this.loadMetrics();
        }, 30000); // Update every 30 seconds
    }

    /**
     * Stop updates
     */
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Export
if (typeof window !== 'undefined') {
    window.QuaiMetricsUI = QuaiMetricsUI;
}

