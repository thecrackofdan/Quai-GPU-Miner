// Enhanced ROI Calculator with Break-Even Analysis
class EnhancedROICalculator {
    constructor() {
        this.init();
    }
    
    init() {
        this.createEnhancedCalculator();
        this.attachEventListeners();
    }
    
    createEnhancedCalculator() {
        // This will enhance the existing profitability calculator
        const existingCalc = document.getElementById('profitabilitySection');
        if (existingCalc) {
            // Add enhanced features to existing calculator
            this.addBreakEvenAnalysis(existingCalc);
            this.addDifficultyProjection(existingCalc);
            this.addScenarioComparison(existingCalc);
        }
    }
    
    addBreakEvenAnalysis(container) {
        const breakEvenSection = document.createElement('div');
        breakEvenSection.className = 'break-even-section';
        breakEvenSection.innerHTML = `
            <h3>📅 Break-Even Analysis</h3>
            <div class="break-even-results">
                <div class="break-even-item">
                    <span class="label">Days to Break-Even:</span>
                    <span class="value" id="breakEvenDays">--</span>
                </div>
                <div class="break-even-item">
                    <span class="label">Date:</span>
                    <span class="value" id="breakEvenDate">--</span>
                </div>
                <div class="break-even-item">
                    <span class="label">Total Investment:</span>
                    <span class="value" id="totalInvestment">$0.00</span>
                </div>
            </div>
            <div class="break-even-chart" id="breakEvenChart">
                <!-- Chart will be rendered here -->
            </div>
        `;
        container.appendChild(breakEvenSection);
    }
    
    addDifficultyProjection(container) {
        const difficultySection = document.createElement('div');
        difficultySection.className = 'difficulty-section';
        difficultySection.innerHTML = `
            <h3>📈 Difficulty Projection</h3>
            <div class="difficulty-info">
                <div class="difficulty-item">
                    <span class="label">Current Difficulty:</span>
                    <span class="value" id="currentDifficulty">Loading...</span>
                </div>
                <div class="difficulty-item">
                    <span class="label">Projected (30 days):</span>
                    <span class="value" id="projectedDifficulty">--</span>
                </div>
                <div class="difficulty-item">
                    <span class="label">Impact on Profitability:</span>
                    <span class="value" id="difficultyImpact">--</span>
                </div>
            </div>
            <p class="difficulty-note">
                💡 Difficulty adjusts based on network hash rate. Higher difficulty means longer time between blocks.
            </p>
        `;
        container.appendChild(difficultySection);
    }
    
    addScenarioComparison(container) {
        const scenarioSection = document.createElement('div');
        scenarioSection.className = 'scenario-section';
        scenarioSection.innerHTML = `
            <h3>📊 Scenario Comparison</h3>
            <div class="scenario-tabs">
                <button class="scenario-tab active" data-scenario="optimistic">Optimistic</button>
                <button class="scenario-tab" data-scenario="realistic">Realistic</button>
                <button class="scenario-tab" data-scenario="pessimistic">Pessimistic</button>
            </div>
            <div class="scenario-results" id="scenarioResults">
                <!-- Results will be shown here -->
            </div>
        `;
        container.appendChild(scenarioSection);
    }
    
    attachEventListeners() {
        // Scenario tabs
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('scenario-tab')) {
                document.querySelectorAll('.scenario-tab').forEach(tab => {
                    tab.classList.remove('active');
                });
                e.target.classList.add('active');
                this.updateScenario(e.target.dataset.scenario);
            }
        });
    }
    
    calculateBreakEven(hashRate, powerUsage, electricityRate, quaiPrice, hardwareCost) {
        // Simplified calculation
        const dailyRevenue = (hashRate / 1000) * 24 * quaiPrice;
        const dailyCost = (powerUsage / 1000) * 24 * electricityRate;
        const dailyProfit = dailyRevenue - dailyCost;
        
        if (dailyProfit <= 0) {
            return { days: Infinity, date: 'Never', profitable: false };
        }
        
        const days = Math.ceil(hardwareCost / dailyProfit);
        const date = new Date();
        date.setDate(date.getDate() + days);
        
        return {
            days,
            date: date.toLocaleDateString(),
            profitable: true,
            dailyProfit
        };
    }
    
    updateScenario(scenario) {
        // Update calculations based on scenario
        const multipliers = {
            optimistic: 1.2,
            realistic: 1.0,
            pessimistic: 0.8
        };
        
        const multiplier = multipliers[scenario];
        // Recalculate with scenario multiplier
        // This would integrate with the main calculator
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.enhancedROI = new EnhancedROICalculator();
    });
}

