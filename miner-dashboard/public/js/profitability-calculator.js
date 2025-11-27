// Profitability Calculator for Quai GPU Miner
class ProfitabilityCalculator {
    constructor() {
        this.electricityRate = 0.10; // $0.10 per kWh default
        this.quaiPrice = 0.01; // $0.01 per QUAI default
        this.init();
    }
    
    init() {
        this.createCalculatorUI();
        this.loadSavedSettings();
        this.attachEventListeners();
    }
    
    createCalculatorUI() {
        const section = document.createElement('section');
        section.id = 'profitabilitySection';
        section.className = 'profitability-section';
        section.innerHTML = `
            <h2 class="section-title-red">
                💰 Profitability Calculator
                <span class="info-icon" data-tooltip="Calculate mining profitability based on current stats">ℹ️</span>
            </h2>
            <div class="calculator-grid">
                <div class="calculator-inputs">
                    <div class="input-group">
                        <label>Hash Rate (MH/s):</label>
                        <input type="number" id="calcHashRate" step="0.1" placeholder="10.5">
                    </div>
                    <div class="input-group">
                        <label>Power Usage (W):</label>
                        <input type="number" id="calcPower" step="1" placeholder="150">
                    </div>
                    <div class="input-group">
                        <label>Electricity Rate ($/kWh):</label>
                        <input type="number" id="calcElectricity" step="0.01" value="0.10">
                    </div>
                    <div class="input-group">
                        <label>QUAI Price ($):</label>
                        <input type="number" id="calcQuaiPrice" step="0.001" value="0.01">
                    </div>
                    <div class="input-group">
                        <label>Pool Fee (%):</label>
                        <input type="number" id="calcPoolFee" step="0.1" value="0" min="0" max="100">
                    </div>
                    <button class="btn-primary" id="calculateBtn">Calculate</button>
                    <button class="btn-secondary" id="useCurrentStatsBtn">Use Current Stats</button>
                </div>
                <div class="calculator-results">
                    <h3>Results</h3>
                    <div class="result-card">
                        <div class="result-item">
                            <span class="result-label">Daily Revenue:</span>
                            <span class="result-value" id="dailyRevenue">$0.00</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Daily Cost:</span>
                            <span class="result-value" id="dailyCost">$0.00</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Daily Profit:</span>
                            <span class="result-value" id="dailyProfit">$0.00</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Monthly Profit:</span>
                            <span class="result-value" id="monthlyProfit">$0.00</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Yearly Profit:</span>
                            <span class="result-value" id="yearlyProfit">$0.00</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Daily QUAI:</span>
                            <span class="result-value" id="dailyQuai">0.000000</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">ROI (Break-even):</span>
                            <span class="result-value" id="roi">-- days</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Efficiency:</span>
                            <span class="result-value" id="efficiency">-- MH/s per W</span>
                        </div>
                        <div class="result-item">
                            <span class="result-label">Profit Margin:</span>
                            <span class="result-value" id="profitMargin">--%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after historical charts
        const chartsSection = document.getElementById('historicalChartsSection');
        if (chartsSection) {
            chartsSection.after(section);
        } else {
            document.querySelector('.validated-blocks-section')?.after(section);
        }
    }
    
    loadSavedSettings() {
        const saved = localStorage.getItem('profitabilitySettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.electricityRate = settings.electricityRate || 0.10;
            this.quaiPrice = settings.quaiPrice || 0.01;
            
            const electricityInput = document.getElementById('calcElectricity');
            const quaiPriceInput = document.getElementById('calcQuaiPrice');
            if (electricityInput) electricityInput.value = this.electricityRate;
            if (quaiPriceInput) quaiPriceInput.value = this.quaiPrice;
        }
    }
    
    attachEventListeners() {
        const calculateBtn = document.getElementById('calculateBtn');
        const useCurrentBtn = document.getElementById('useCurrentStatsBtn');
        
        if (calculateBtn) {
            calculateBtn.onclick = () => this.calculate();
        }
        
        if (useCurrentBtn) {
            useCurrentBtn.onclick = () => this.useCurrentStats();
        }
        
        // Auto-save settings
        const electricityInput = document.getElementById('calcElectricity');
        const quaiPriceInput = document.getElementById('calcQuaiPrice');
        
        if (electricityInput) {
            electricityInput.onchange = () => {
                this.electricityRate = parseFloat(electricityInput.value) || 0.10;
                this.saveSettings();
            };
        }
        
        if (quaiPriceInput) {
            quaiPriceInput.onchange = () => {
                this.quaiPrice = parseFloat(quaiPriceInput.value) || 0.01;
                this.saveSettings();
            };
        }
    }
    
    useCurrentStats() {
        if (typeof dashboard !== 'undefined' && dashboard.miningData) {
            const hashRateInput = document.getElementById('calcHashRate');
            const powerInput = document.getElementById('calcPower');
            
            if (hashRateInput) hashRateInput.value = dashboard.miningData.hashRate || 0;
            if (powerInput) powerInput.value = dashboard.miningData.powerUsage || 0;
            
            this.calculate();
        }
    }
    
    async calculate() {
        const hashRate = parseFloat(document.getElementById('calcHashRate')?.value) || 0;
        const power = parseFloat(document.getElementById('calcPower')?.value) || 0;
        const electricity = parseFloat(document.getElementById('calcElectricity')?.value) || this.electricityRate;
        const quaiPrice = parseFloat(document.getElementById('calcQuaiPrice')?.value) || this.quaiPrice;
        const poolFee = parseFloat(document.getElementById('calcPoolFee')?.value) || 0;
        
        if (hashRate === 0 || power === 0) {
            this.showError('Please enter hash rate and power usage');
            return;
        }
        
        // Get real network data for accurate calculations
        let networkHashRate = 0;
        let blockTime = 10; // Quai target block time
        let blockReward = 1.0; // Base reward
        
        try {
            // Try to get real network stats
            const response = await fetch('/api/quai/metrics?hashRate=' + hashRate + '&powerUsage=' + power + '&electricityCost=' + electricity);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.metrics) {
                    networkHashRate = data.metrics.network?.networkHashRate || 0;
                    blockTime = data.metrics.network?.averageBlockTime || 10;
                    // Use most profitable chain reward
                    if (data.metrics.totalProfitability) {
                        blockReward = data.metrics.totalProfitability.miningRevenue || 1.0;
                    }
                }
            }
        } catch (error) {
            console.debug('Using fallback calculations:', error);
        }
        
        // Accurate profitability calculation
        // Formula: (hashRate / networkHashRate) * blocksPerDay * blockReward * price
        const blocksPerDay = (86400 / blockTime); // Seconds per day / block time
        let dailyQuai = 0;
        
        if (networkHashRate > 0) {
            // Accurate calculation with network hash rate
            const shareOfNetwork = hashRate / networkHashRate;
            dailyQuai = shareOfNetwork * blocksPerDay * blockReward;
        } else {
            // Fallback: estimate based on hash rate efficiency
            // Assume 1 MH/s ≈ 0.01 QUAI/day (adjust based on actual network)
            dailyQuai = (hashRate / 100) * 0.01;
        }
        
        const dailyRevenue = dailyQuai * quaiPrice * (1 - poolFee / 100);
        const dailyCost = (power / 1000) * 24 * electricity;
        const dailyProfit = dailyRevenue - dailyCost;
        const efficiency = hashRate / power;
        
        // Calculate ROI (break-even days)
        const gpuCost = parseFloat(localStorage.getItem('gpuCost')) || 0;
        let breakEvenDays = 0;
        if (gpuCost > 0 && dailyProfit > 0) {
            breakEvenDays = Math.ceil(gpuCost / dailyProfit);
        }
        
        // Update UI
        this.updateResults({
            dailyRevenue,
            dailyCost,
            dailyProfit,
            monthlyProfit: dailyProfit * 30,
            yearlyProfit: dailyProfit * 365,
            efficiency,
            breakEvenDays,
            dailyQuai
        });
    }
    
    showError(message) {
        if (typeof showToast === 'function') {
            showToast(message, 'error');
        } else {
            alert(message);
        }
    }
    
    updateResults(results) {
        const formatCurrency = (value) => `$${value.toFixed(2)}`;
        const formatQuai = (value) => value.toFixed(6);
        
        const dailyRevenueEl = document.getElementById('dailyRevenue');
        const dailyCostEl = document.getElementById('dailyCost');
        const dailyProfitEl = document.getElementById('dailyProfit');
        const monthlyProfitEl = document.getElementById('monthlyProfit');
        const yearlyProfitEl = document.getElementById('yearlyProfit');
        const dailyQuaiEl = document.getElementById('dailyQuai');
        const roiEl = document.getElementById('roi');
        const efficiencyEl = document.getElementById('efficiency');
        const profitMarginEl = document.getElementById('profitMargin');
        
        if (dailyRevenueEl) dailyRevenueEl.textContent = formatCurrency(results.dailyRevenue);
        if (dailyCostEl) dailyCostEl.textContent = formatCurrency(results.dailyCost);
        if (dailyProfitEl) {
            dailyProfitEl.textContent = formatCurrency(results.dailyProfit);
            // Color code profit (green if positive, red if negative)
            dailyProfitEl.style.color = results.dailyProfit >= 0 ? '#00ff00' : '#ff0000';
        }
        if (monthlyProfitEl) {
            monthlyProfitEl.textContent = formatCurrency(results.monthlyProfit);
            monthlyProfitEl.style.color = results.monthlyProfit >= 0 ? '#00ff00' : '#ff0000';
        }
        if (yearlyProfitEl) {
            yearlyProfitEl.textContent = formatCurrency(results.yearlyProfit);
            yearlyProfitEl.style.color = results.yearlyProfit >= 0 ? '#00ff00' : '#ff0000';
        }
        if (dailyQuaiEl) dailyQuaiEl.textContent = formatQuai(results.dailyQuai || 0);
        if (roiEl) {
            if (results.breakEvenDays > 0) {
                roiEl.textContent = `${results.breakEvenDays} days`;
                const breakEvenDate = new Date();
                breakEvenDate.setDate(breakEvenDate.getDate() + results.breakEvenDays);
                roiEl.title = `Break-even date: ${breakEvenDate.toLocaleDateString()}`;
            } else {
                roiEl.textContent = '-- days';
            }
        }
        if (efficiencyEl) efficiencyEl.textContent = `${results.efficiency.toFixed(2)} MH/s per W`;
        if (profitMarginEl) {
            const margin = results.dailyRevenue > 0 
                ? ((results.dailyProfit / results.dailyRevenue) * 100).toFixed(1)
                : '0.0';
            profitMarginEl.textContent = `${margin}%`;
            profitMarginEl.style.color = parseFloat(margin) >= 0 ? '#00ff00' : '#ff0000';
        }
    }
    
    saveSettings() {
        localStorage.setItem('profitabilitySettings', JSON.stringify({
            electricityRate: this.electricityRate,
            quaiPrice: this.quaiPrice
        }));
    }
}

// Auto-initialize
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.profitabilityCalculator = new ProfitabilityCalculator();
    });
}

