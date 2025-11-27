/**
 * Mining Insights & Analytics - Advanced analytics for competitive mining
 * Provides profitability analysis, ROI calculations, earnings projections, and optimization insights
 */

class MiningInsights {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.insights = {
            profitability: null,
            roi: null,
            projections: null,
            optimization: null,
            comparisons: null
        };
        this.historicalData = [];
        this.init();
    }

    init() {
        this.loadHistoricalData();
        this.startPeriodicAnalysis();
    }

    /**
     * Load historical mining data
     */
    async loadHistoricalData() {
        try {
            const response = await fetch('/api/stats/history');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.historicalData = data.history || [];
                }
            }
        } catch (error) {
            console.error('Error loading historical data:', error);
        }
    }

    /**
     * Start periodic analysis
     */
    startPeriodicAnalysis() {
        setInterval(() => {
            this.analyze();
        }, 60000); // Analyze every minute
    }

    /**
     * Comprehensive profitability analysis
     */
    analyzeProfitability() {
        const hashRate = this.dashboard.miningData?.hashRate || 0;
        const powerUsage = this.dashboard.miningData?.powerUsage || 0;
        const electricityCost = 0.12; // $0.12 per kWh (configurable)
        const hoursPerDay = 24;
        
        // Calculate daily costs
        const dailyPowerCost = (powerUsage / 1000) * electricityCost * hoursPerDay;
        
        // Estimate daily earnings (simplified - would use real network data)
        const networkHashRate = 1000000; // MH/s (example)
        const blockReward = 2.0; // QUAI per block
        const blockTime = 10; // seconds
        const blocksPerDay = (86400 / blockTime);
        const dailyEarnings = (hashRate / networkHashRate) * blocksPerDay * blockReward;
        
        // Calculate profitability
        const dailyProfit = dailyEarnings - dailyPowerCost;
        const profitMargin = dailyEarnings > 0 ? (dailyProfit / dailyEarnings) * 100 : 0;
        const breakEvenHashRate = (dailyPowerCost / (blocksPerDay * blockReward / networkHashRate));
        
        this.insights.profitability = {
            dailyEarnings,
            dailyCosts: dailyPowerCost,
            dailyProfit,
            profitMargin,
            breakEvenHashRate,
            isProfitable: dailyProfit > 0,
            efficiency: hashRate > 0 ? hashRate / powerUsage : 0 // MH/s per Watt
        };
        
        return this.insights.profitability;
    }

    /**
     * ROI Calculator
     */
    calculateROI() {
        const hardwareCost = 500; // Example GPU cost (configurable)
        const dailyProfit = this.insights.profitability?.dailyProfit || 0;
        
        if (dailyProfit <= 0) {
            this.insights.roi = {
                daysToROI: Infinity,
                roi30Days: 0,
                roi90Days: 0,
                roi365Days: 0,
                totalProfit30Days: 0,
                totalProfit90Days: 0,
                totalProfit365Days: 0
            };
            return this.insights.roi;
        }
        
        const daysToROI = hardwareCost / dailyProfit;
        const totalProfit30Days = dailyProfit * 30;
        const totalProfit90Days = dailyProfit * 90;
        const totalProfit365Days = dailyProfit * 365;
        
        this.insights.roi = {
            daysToROI,
            roi30Days: ((totalProfit30Days / hardwareCost) * 100),
            roi90Days: ((totalProfit90Days / hardwareCost) * 100),
            roi365Days: ((totalProfit365Days / hardwareCost) * 100),
            totalProfit30Days,
            totalProfit90Days,
            totalProfit365Days,
            hardwareCost
        };
        
        return this.insights.roi;
    }

    /**
     * Earnings projections
     */
    projectEarnings() {
        const dailyEarnings = this.insights.profitability?.dailyEarnings || 0;
        const dailyProfit = this.insights.profitability?.dailyProfit || 0;
        
        this.insights.projections = {
            hourly: {
                earnings: dailyEarnings / 24,
                profit: dailyProfit / 24
            },
            daily: {
                earnings: dailyEarnings,
                profit: dailyProfit
            },
            weekly: {
                earnings: dailyEarnings * 7,
                profit: dailyProfit * 7
            },
            monthly: {
                earnings: dailyEarnings * 30,
                profit: dailyProfit * 30
            },
            yearly: {
                earnings: dailyEarnings * 365,
                profit: dailyProfit * 365
            }
        };
        
        return this.insights.projections;
    }

    /**
     * Optimization insights
     */
    generateOptimizationInsights() {
        const insights = [];
        const profitability = this.insights.profitability;
        
        if (!profitability) return insights;
        
        // Efficiency insights
        if (profitability.efficiency < 0.5) {
            insights.push({
                type: 'warning',
                category: 'efficiency',
                title: 'Low Mining Efficiency',
                message: `Your efficiency is ${profitability.efficiency.toFixed(2)} MH/s per Watt. Consider optimizing GPU settings for better power efficiency.`,
                action: 'Optimize GPU Settings',
                priority: 'high'
            });
        }
        
        // Profitability insights
        if (!profitability.isProfitable) {
            insights.push({
                type: 'error',
                category: 'profitability',
                title: 'Mining Not Profitable',
                message: `Current mining is losing $${Math.abs(profitability.dailyProfit).toFixed(2)} per day. Consider reducing power consumption or increasing hash rate.`,
                action: 'Review Settings',
                priority: 'critical'
            });
        }
        
        // Hash rate insights
        if (profitability.breakEvenHashRate > 0) {
            const currentHashRate = this.dashboard.miningData?.hashRate || 0;
            if (currentHashRate < profitability.breakEvenHashRate) {
                insights.push({
                    type: 'info',
                    category: 'hashrate',
                    title: 'Below Break-Even Hash Rate',
                    message: `You need ${profitability.breakEvenHashRate.toFixed(2)} MH/s to break even. Current: ${currentHashRate.toFixed(2)} MH/s.`,
                    action: 'Optimize Performance',
                    priority: 'medium'
                });
            }
        }
        
        // Pool fee insights
        const currentPool = this.dashboard.poolManager?.currentPool;
        if (currentPool && currentPool.fee > 1.0) {
            insights.push({
                type: 'warning',
                category: 'pool',
                title: 'High Pool Fee',
                message: `Current pool fee is ${currentPool.feePercent}. Consider switching to a pool with lower fees to increase profitability.`,
                action: 'Switch Pool',
                priority: 'medium'
            });
        }
        
        this.insights.optimization = insights;
        return insights;
    }

    /**
     * Compare with other miners (benchmarking)
     */
    async generateComparisons() {
        const hashRate = this.dashboard.miningData?.hashRate || 0;
        const efficiency = this.insights.profitability?.efficiency || 0;
        
        // Benchmark data (would come from API or database)
        const benchmarks = {
            average: { hashRate: 50, efficiency: 0.6 },
            top25: { hashRate: 100, efficiency: 0.8 },
            top10: { hashRate: 200, efficiency: 1.0 }
        };
        
        this.insights.comparisons = {
            hashRate: {
                current: hashRate,
                average: benchmarks.average.hashRate,
                top25: benchmarks.top25.hashRate,
                top10: benchmarks.top10.hashRate,
                percentile: this.calculatePercentile(hashRate, benchmarks)
            },
            efficiency: {
                current: efficiency,
                average: benchmarks.average.efficiency,
                top25: benchmarks.top25.efficiency,
                top10: benchmarks.top10.efficiency,
                percentile: this.calculatePercentile(efficiency, benchmarks)
            }
        };
        
        return this.insights.comparisons;
    }

    /**
     * Calculate percentile
     */
    calculatePercentile(value, benchmarks) {
        if (value >= benchmarks.top10.hashRate) return 90;
        if (value >= benchmarks.top25.hashRate) return 75;
        if (value >= benchmarks.average.hashRate) return 50;
        return 25;
    }

    /**
     * Run complete analysis
     */
    analyze() {
        this.analyzeProfitability();
        this.calculateROI();
        this.projectEarnings();
        this.generateOptimizationInsights();
        this.generateComparisons();
        this.updateUI();
    }

    /**
     * Update insights UI
     */
    updateUI() {
        const widget = document.getElementById('insightsWidget');
        if (!widget) return;
        
        const profitability = this.insights.profitability;
        const roi = this.insights.roi;
        const projections = this.insights.projections;
        const optimization = this.insights.optimization || [];
        
        let html = '<div class="insights-content">';
        
        // Profitability summary
        if (profitability) {
            html += `
                <div class="insight-card ${profitability.isProfitable ? 'profitable' : 'unprofitable'}">
                    <h4>💰 Profitability Analysis</h4>
                    <div class="insight-metrics">
                        <div class="metric">
                            <span class="metric-label">Daily Profit</span>
                            <span class="metric-value ${profitability.dailyProfit >= 0 ? 'positive' : 'negative'}">
                                $${profitability.dailyProfit.toFixed(2)}
                            </span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Profit Margin</span>
                            <span class="metric-value">${profitability.profitMargin.toFixed(1)}%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Efficiency</span>
                            <span class="metric-value">${profitability.efficiency.toFixed(2)} MH/s/W</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // ROI summary
        if (roi && roi.daysToROI !== Infinity) {
            html += `
                <div class="insight-card">
                    <h4>📊 ROI Analysis</h4>
                    <div class="insight-metrics">
                        <div class="metric">
                            <span class="metric-label">Days to ROI</span>
                            <span class="metric-value">${roi.daysToROI.toFixed(0)} days</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">30-Day ROI</span>
                            <span class="metric-value">${roi.roi30Days.toFixed(1)}%</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">90-Day ROI</span>
                            <span class="metric-value">${roi.roi90Days.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Projections
        if (projections) {
            html += `
                <div class="insight-card">
                    <h4>📈 Earnings Projections</h4>
                    <div class="insight-metrics">
                        <div class="metric">
                            <span class="metric-label">Daily</span>
                            <span class="metric-value">$${projections.daily.profit.toFixed(2)}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Weekly</span>
                            <span class="metric-value">$${projections.weekly.profit.toFixed(2)}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Monthly</span>
                            <span class="metric-value">$${projections.monthly.profit.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Optimization insights
        if (optimization.length > 0) {
            html += '<div class="insight-card"><h4>💡 Optimization Insights</h4><ul class="insights-list">';
            optimization.forEach(insight => {
                html += `
                    <li class="insight-item ${insight.type}">
                        <strong>${insight.title}</strong>
                        <p>${insight.message}</p>
                        ${insight.action ? `<button class="btn-small" onclick="handleInsightAction('${insight.action}')">${insight.action}</button>` : ''}
                    </li>
                `;
            });
            html += '</ul></div>';
        }
        
        html += '</div>';
        widget.innerHTML = html;
    }

    /**
     * Get insights summary
     */
    getSummary() {
        return {
            profitability: this.insights.profitability,
            roi: this.insights.roi,
            projections: this.insights.projections,
            optimizationCount: (this.insights.optimization || []).length,
            comparisons: this.insights.comparisons
        };
    }
}

/**
 * Handle insight action buttons
 */
function handleInsightAction(action) {
    if (!window.dashboard) return;
    
    switch(action) {
        case 'Optimize GPU Settings':
            const gpuTuneBtn = document.getElementById('gpuTuneBtn');
            if (gpuTuneBtn) gpuTuneBtn.click();
            break;
        case 'Review Settings':
            const settingsBtn = document.getElementById('settingsBtn');
            if (settingsBtn) settingsBtn.click();
            break;
        case 'Optimize Performance':
            // Open GPU tuner
            const gpuTune = document.getElementById('gpuTuneBtn');
            if (gpuTune) gpuTune.click();
            break;
        case 'Switch Pool':
            // Open miner config modal and show pool selection
            const configBtn = document.getElementById('openConfigBtn');
            if (configBtn) {
                configBtn.click();
                setTimeout(() => {
                    const miningModeSelect = document.getElementById('miningModeSelect');
                    if (miningModeSelect) {
                        miningModeSelect.value = 'pool';
                        miningModeSelect.dispatchEvent(new Event('change'));
                    }
                }, 500);
            }
            break;
        default:
            console.log('Unknown action:', action);
    }
}

// Export
if (typeof window !== 'undefined') {
    window.MiningInsights = MiningInsights;
    window.handleInsightAction = handleInsightAction;
}

