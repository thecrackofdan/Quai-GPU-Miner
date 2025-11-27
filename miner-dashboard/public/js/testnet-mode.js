// Testnet Practice Mode for New Miners
class TestnetMode {
    constructor() {
        this.isTestnetMode = false;
        this.testnetStats = {
            blocksFound: 0,
            totalMined: 0,
            practiceTime: 0
        };
        this.init();
    }
    
    init() {
        this.createTestnetUI();
        this.loadTestnetStats();
    }
    
    createTestnetUI() {
        const banner = document.createElement('div');
        banner.id = 'testnetBanner';
        banner.className = 'testnet-banner';
        banner.innerHTML = `
            <div class="testnet-banner-content">
                <div class="testnet-info">
                    <span class="testnet-icon">🧪</span>
                    <div>
                        <strong>Testnet Practice Mode</strong>
                        <p>Learn to mine safely on testnet - no risk, real experience!</p>
                    </div>
                </div>
                <div class="testnet-actions">
                    <button class="btn-primary" id="enableTestnetBtn">Enable Testnet Mode</button>
                    <button class="btn-secondary" id="switchToMainnetBtn" style="display: none;">Switch to Mainnet</button>
                </div>
            </div>
        `;
        
        // Insert at top of dashboard
        const dashboardContainer = document.querySelector('.dashboard-container');
        if (dashboardContainer) {
            dashboardContainer.insertBefore(banner, dashboardContainer.firstChild);
        }
        
        // Event listeners
        document.getElementById('enableTestnetBtn').onclick = () => this.enableTestnet();
        document.getElementById('switchToMainnetBtn').onclick = () => this.switchToMainnet();
    }
    
    enableTestnet() {
        this.isTestnetMode = true;
        localStorage.setItem('quaiminer-testnet-mode', 'true');
        
        // Update UI
        document.getElementById('testnetBanner').classList.add('active');
        document.getElementById('enableTestnetBtn').style.display = 'none';
        document.getElementById('switchToMainnetBtn').style.display = 'block';
        
        // Show testnet indicator
        this.showTestnetIndicator();
        
        // Update dashboard to show testnet data
        this.updateDashboardForTestnet();
        
        // Show welcome message
        this.showTestnetWelcome();
    }
    
    switchToMainnet() {
        if (confirm('Switch to mainnet? You\'ll start earning real QUAI rewards!')) {
            this.isTestnetMode = false;
            localStorage.setItem('quaiminer-testnet-mode', 'false');
            
            document.getElementById('testnetBanner').classList.remove('active');
            document.getElementById('enableTestnetBtn').style.display = 'block';
            document.getElementById('switchToMainnetBtn').style.display = 'none';
            
            this.hideTestnetIndicator();
        }
    }
    
    showTestnetIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'testnetIndicator';
        indicator.className = 'testnet-indicator';
        indicator.innerHTML = '🧪 TESTNET MODE';
        document.body.appendChild(indicator);
    }
    
    hideTestnetIndicator() {
        const indicator = document.getElementById('testnetIndicator');
        if (indicator) indicator.remove();
    }
    
    updateDashboardForTestnet() {
        // Modify dashboard to show testnet-specific data
        const title = document.querySelector('.dashboard-header h1');
        if (title) {
            title.innerHTML = '⚡ Quai GPU Miner <span style="color: #FFAA00;">(Testnet)</span>';
        }
    }
    
    showTestnetWelcome() {
        const welcome = document.createElement('div');
        welcome.className = 'testnet-welcome';
        welcome.innerHTML = `
            <div class="testnet-welcome-content">
                <h3>🧪 Welcome to Testnet Practice Mode!</h3>
                <p>You're now mining on Quai testnet. This is perfect for:</p>
                <ul>
                    <li>Learning how mining works</li>
                    <li>Testing your setup</li>
                    <li>Practicing without risk</li>
                    <li>Understanding the dashboard</li>
                </ul>
                <p><strong>When you're ready, switch to mainnet to earn real QUAI!</strong></p>
                <button class="btn-primary" onclick="this.closest('.testnet-welcome').remove()">Got it!</button>
            </div>
        `;
        document.body.appendChild(welcome);
        setTimeout(() => welcome.classList.add('show'), 100);
    }
    
    loadTestnetStats() {
        const saved = localStorage.getItem('quaiminer-testnet-stats');
        if (saved) {
            this.testnetStats = JSON.parse(saved);
        }
        
        const isTestnet = localStorage.getItem('quaiminer-testnet-mode') === 'true';
        if (isTestnet) {
            this.enableTestnet();
        }
    }
    
    saveTestnetStats() {
        localStorage.setItem('quaiminer-testnet-stats', JSON.stringify(this.testnetStats));
    }
    
    recordTestnetBlock(block) {
        if (this.isTestnetMode) {
            this.testnetStats.blocksFound++;
            this.testnetStats.totalMined += block.reward || 0;
            this.saveTestnetStats();
            
            // Show testnet-specific notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🧪 Testnet Block Found!', {
                    body: `You found block #${block.blockNumber} on testnet. Great practice!`,
                    icon: '/favicon.ico'
                });
            }
        }
    }
}

// Initialize
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.testnetMode = new TestnetMode();
    });
}

