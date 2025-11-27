// Community Leaderboard for Quai GPU Miner
class Leaderboard {
    constructor() {
        this.leaderboards = {
            blocks: [],
            uptime: [],
            efficiency: [],
            hashRate: []
        };
        this.init();
    }
    
    init() {
        this.createLeaderboardSection();
        this.fetchLeaderboardData();
        setInterval(() => this.fetchLeaderboardData(), 60000); // Update every minute
    }
    
    createLeaderboardSection() {
        const section = document.createElement('section');
        section.id = 'leaderboardSection';
        section.className = 'leaderboard-section';
        section.innerHTML = `
            <h2 class="section-title-red">
                🏆 Community Leaderboard
                <span class="info-icon" data-tooltip="See how you rank against other Quai solo miners">ℹ️</span>
            </h2>
            <div class="leaderboard-tabs">
                <button class="leaderboard-tab active" data-board="blocks">Most Blocks</button>
                <button class="leaderboard-tab" data-board="uptime">Best Uptime</button>
                <button class="leaderboard-tab" data-board="efficiency">Most Efficient</button>
                <button class="leaderboard-tab" data-board="hashRate">Highest Hash Rate</button>
            </div>
            <div class="leaderboard-container" id="leaderboardContainer">
                <div class="leaderboard-loading">Loading leaderboard...</div>
            </div>
            <div class="leaderboard-footer">
                <p class="leaderboard-note">
                    💡 Leaderboard updates every minute. Your stats are anonymized for privacy.
                </p>
                <button class="btn-secondary" id="opt-out-leaderboard" style="display: none;">
                    Opt Out of Leaderboard
                </button>
            </div>
        `;
        
        // Insert after profitability section
        const profitabilitySection = document.getElementById('profitabilitySection');
        if (profitabilitySection) {
            profitabilitySection.after(section);
        }
        
        // Tab switching
        document.querySelectorAll('.leaderboard-tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.leaderboard-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.showLeaderboard(tab.dataset.board);
            };
        });
    }
    
    async fetchLeaderboardData() {
        try {
            // This would fetch from an API endpoint
            // For now, using mock data structure
            const response = await fetch('/api/leaderboard');
            if (response.ok) {
                const data = await response.json();
                this.leaderboards = data;
                this.updateDisplay();
            } else {
                // Use local stats if available
                this.updateFromLocalStats();
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            this.updateFromLocalStats();
        }
    }
    
    updateFromLocalStats() {
        if (typeof dashboard !== 'undefined' && dashboard.miningData) {
            // Create leaderboard from local stats
            const myStats = {
                blocks: dashboard.miningData.rewards.blocksFound || 0,
                uptime: this.calculateUptime(),
                efficiency: dashboard.miningData.efficiency || 0,
                hashRate: dashboard.miningData.hashRate || 0,
                rank: '?',
                isYou: true
            };
            
            // Show user's position
            this.showUserPosition(myStats);
        }
    }
    
    calculateUptime() {
        if (typeof dashboard !== 'undefined' && dashboard.startTime) {
            const uptimeMs = Date.now() - dashboard.startTime;
            return Math.floor(uptimeMs / (1000 * 60 * 60)); // Hours
        }
        return 0;
    }
    
    showLeaderboard(type) {
        const container = document.getElementById('leaderboardContainer');
        const data = this.leaderboards[type] || [];
        
        if (data.length === 0) {
            container.innerHTML = `
                <div class="leaderboard-empty">
                    <p>No data available yet. Start mining to see your rank!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="leaderboard-list">
                ${data.map((entry, index) => `
                    <div class="leaderboard-entry ${entry.isYou ? 'your-entry' : ''}">
                        <div class="rank">#${entry.rank || index + 1}</div>
                        <div class="entry-info">
                            <div class="entry-name">
                                ${entry.isYou ? '👤 You' : `Miner ${entry.rank || index + 1}`}
                                ${entry.isYou ? '<span class="you-badge">You</span>' : ''}
                            </div>
                            <div class="entry-stats">
                                ${this.getStatDisplay(type, entry)}
                            </div>
                        </div>
                        ${entry.isYou ? '<div class="your-position">Your Position</div>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    getStatDisplay(type, entry) {
        switch(type) {
            case 'blocks':
                return `<span class="stat-value">${entry.blocks || 0}</span> blocks found`;
            case 'uptime':
                return `<span class="stat-value">${entry.uptime || 0}</span> hours`;
            case 'efficiency':
                return `<span class="stat-value">${entry.efficiency?.toFixed(2) || 0}</span> MH/s per W`;
            case 'hashRate':
                return `<span class="stat-value">${entry.hashRate?.toFixed(2) || 0}</span> MH/s`;
            default:
                return '';
        }
    }
    
    showUserPosition(stats) {
        const container = document.getElementById('leaderboardContainer');
        container.innerHTML = `
            <div class="your-stats-card">
                <h3>Your Mining Stats</h3>
                <div class="your-stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Blocks Found</div>
                        <div class="stat-number">${stats.blocks}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Uptime</div>
                        <div class="stat-number">${stats.uptime}h</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Efficiency</div>
                        <div class="stat-number">${stats.efficiency.toFixed(2)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Hash Rate</div>
                        <div class="stat-number">${stats.hashRate.toFixed(2)}</div>
                    </div>
                </div>
                <p class="leaderboard-note">
                    💡 Share your stats to join the community leaderboard!
                </p>
            </div>
        `;
    }
    
    updateDisplay() {
        const activeTab = document.querySelector('.leaderboard-tab.active');
        if (activeTab) {
            this.showLeaderboard(activeTab.dataset.board);
        }
    }
}

// Initialize
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.leaderboard = new Leaderboard();
    });
}

