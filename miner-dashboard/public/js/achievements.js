// Achievement System for Quai GPU Miner
class AchievementSystem {
    constructor() {
        this.achievements = [];
        this.unlockedAchievements = new Set();
        this.init();
    }
    
    init() {
        this.loadAchievements();
        this.createAchievementUI();
        this.startMonitoring();
    }
    
    loadAchievements() {
        this.achievements = [
            {
                id: 'first-block',
                name: 'First Block!',
                description: 'Found your first block',
                icon: '🎯',
                rarity: 'common',
                condition: (stats) => stats.blocksFound >= 1
            },
            {
                id: 'ten-blocks',
                name: 'Block Master',
                description: 'Found 10 blocks',
                icon: '🏆',
                rarity: 'uncommon',
                condition: (stats) => stats.blocksFound >= 10
            },
            {
                id: 'hundred-blocks',
                name: 'Block Legend',
                description: 'Found 100 blocks',
                icon: '👑',
                rarity: 'rare',
                condition: (stats) => stats.blocksFound >= 100
            },
            {
                id: 'seven-day-streak',
                name: 'Consistency King',
                description: 'Mined for 7 consecutive days',
                icon: '🔥',
                rarity: 'uncommon',
                condition: (stats) => stats.consecutiveDays >= 7
            },
            {
                id: 'efficiency-master',
                name: 'Efficiency Master',
                description: 'Achieve >0.1 MH/s per watt',
                icon: '⚡',
                rarity: 'rare',
                condition: (stats) => stats.efficiency >= 0.1
            },
            {
                id: 'perfect-uptime',
                name: 'Perfect Uptime',
                description: '99%+ uptime for 30 days',
                icon: '💎',
                rarity: 'epic',
                condition: (stats) => stats.uptimePercentage >= 99 && stats.daysActive >= 30
            },
            {
                id: 'solo-warrior',
                name: 'Solo Warrior',
                description: 'Mined 1000 blocks solo',
                icon: '⚔️',
                rarity: 'legendary',
                condition: (stats) => stats.blocksFound >= 1000
            }
        ];
        
        // Load unlocked achievements from storage
        const saved = localStorage.getItem('quaiminer-achievements');
        if (saved) {
            this.unlockedAchievements = new Set(JSON.parse(saved));
        }
    }
    
    createAchievementUI() {
        const section = document.createElement('section');
        section.id = 'achievementsSection';
        section.className = 'achievements-section';
        section.innerHTML = `
            <h2 class="section-title-red">
                🏅 Achievements
                <span class="info-icon" data-tooltip="Unlock achievements as you mine!">ℹ️</span>
            </h2>
            <div class="achievements-grid" id="achievementsGrid">
                <!-- Achievements will be rendered here -->
            </div>
        `;
        
        // Insert after leaderboard
        const leaderboardSection = document.getElementById('leaderboardSection');
        if (leaderboardSection) {
            leaderboardSection.after(section);
        }
        
        this.renderAchievements();
    }
    
    renderAchievements() {
        const grid = document.getElementById('achievementsGrid');
        if (!grid) return;
        
        grid.innerHTML = this.achievements.map(achievement => {
            const unlocked = this.unlockedAchievements.has(achievement.id);
            return `
                <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}" data-id="${achievement.id}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <h4>${achievement.name}</h4>
                        <p>${achievement.description}</p>
                        <span class="achievement-rarity ${achievement.rarity}">${achievement.rarity}</span>
                    </div>
                    ${unlocked ? '<div class="achievement-badge">✓</div>' : ''}
                </div>
            `;
        }).join('');
    }
    
    startMonitoring() {
        setInterval(() => this.checkAchievements(), 30000); // Check every 30 seconds
        this.checkAchievements();
    }
    
    checkAchievements() {
        if (typeof dashboard === 'undefined' || !dashboard.miningData) return;
        
        const stats = {
            blocksFound: dashboard.miningData.rewards.blocksFound || 0,
            consecutiveDays: this.calculateConsecutiveDays(),
            efficiency: dashboard.miningData.efficiency || 0,
            uptimePercentage: this.calculateUptimePercentage(),
            daysActive: this.calculateDaysActive()
        };
        
        this.achievements.forEach(achievement => {
            if (!this.unlockedAchievements.has(achievement.id)) {
                if (achievement.condition(stats)) {
                    this.unlockAchievement(achievement);
                }
            }
        });
    }
    
    unlockAchievement(achievement) {
        this.unlockedAchievements.add(achievement.id);
        localStorage.setItem('quaiminer-achievements', JSON.stringify([...this.unlockedAchievements]));
        
        // Show notification
        this.showAchievementNotification(achievement);
        
        // Update UI
        this.renderAchievements();
        
        // Play sound (optional)
        this.playAchievementSound();
    }
    
    showAchievementNotification(achievement) {
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Achievement Unlocked: ${achievement.name}`, {
                body: achievement.description,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        }
        
        // In-app notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-content">
                <div class="achievement-notification-icon">${achievement.icon}</div>
                <div class="achievement-notification-text">
                    <h4>Achievement Unlocked!</h4>
                    <p>${achievement.name}</p>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    playAchievementSound() {
        // Optional: Play achievement sound
        // const audio = new Audio('/sounds/achievement.mp3');
        // audio.play().catch(() => {}); // Ignore errors
    }
    
    calculateConsecutiveDays() {
        // Calculate consecutive mining days
        const lastMiningDate = localStorage.getItem('lastMiningDate');
        if (!lastMiningDate) return 0;
        
        const lastDate = new Date(lastMiningDate);
        const today = new Date();
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays <= 1 ? diffDays : 0;
    }
    
    calculateUptimePercentage() {
        if (typeof dashboard === 'undefined' || !dashboard.startTime) return 0;
        // Simplified calculation
        return 95; // Would calculate actual uptime percentage
    }
    
    calculateDaysActive() {
        const firstMiningDate = localStorage.getItem('firstMiningDate');
        if (!firstMiningDate) return 0;
        
        const firstDate = new Date(firstMiningDate);
        const today = new Date();
        const diffTime = Math.abs(today - firstDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

// Initialize
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.achievements = new AchievementSystem();
    });
}

