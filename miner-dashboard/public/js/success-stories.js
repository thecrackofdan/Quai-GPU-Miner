// Success Stories Section
class SuccessStories {
    constructor() {
        this.stories = [
            {
                name: 'Alex M.',
                location: 'USA',
                gpu: 'AMD RX 590',
                blocks: 47,
                quote: 'Started with zero mining experience. QuaiMiner CORE made it so easy!',
                image: null,
                verified: true
            },
            {
                name: 'Sarah K.',
                location: 'Canada',
                gpu: 'NVIDIA RTX 3060',
                blocks: 123,
                quote: 'Love the solo mining approach. 100% of rewards and full control!',
                image: null,
                verified: true
            },
            {
                name: 'Mike R.',
                location: 'Germany',
                gpu: 'AMD RX 580',
                blocks: 89,
                quote: 'The dashboard is amazing. Everything I need in one place.',
                image: null,
                verified: true
            }
        ];
        this.init();
    }
    
    init() {
        this.createStoriesSection();
    }
    
    createStoriesSection() {
        const section = document.createElement('section');
        section.id = 'successStoriesSection';
        section.className = 'success-stories-section';
        section.innerHTML = `
            <h2 class="section-title-red">
                🌟 Success Stories
                <span class="info-icon" data-tooltip="Real miners sharing their Quai solo mining success">ℹ️</span>
            </h2>
            <p class="section-subtitle" style="text-align: center; color: var(--text-secondary); margin-bottom: 2rem;">
                Join hundreds of solo miners earning 100% of their rewards
            </p>
            <div class="stories-grid">
                ${this.stories.map(story => `
                    <div class="story-card">
                        <div class="story-header">
                            <div class="story-avatar">${story.name.charAt(0)}</div>
                            <div class="story-info">
                                <div class="story-name">
                                    ${story.name}
                                    ${story.verified ? '<span class="verified-badge">✓</span>' : ''}
                                </div>
                                <div class="story-location">${story.location}</div>
                            </div>
                        </div>
                        <div class="story-stats">
                            <div class="story-stat">
                                <span class="stat-label">Blocks Found</span>
                                <span class="stat-value">${story.blocks}</span>
                            </div>
                            <div class="story-stat">
                                <span class="stat-label">GPU</span>
                                <span class="stat-value">${story.gpu}</span>
                            </div>
                        </div>
                        <div class="story-quote">
                            "${story.quote}"
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="stories-cta">
                <p>Share your success story and help others get started!</p>
                <button class="btn-primary" id="shareStoryBtn">Share Your Story</button>
            </div>
        `;
        
        // Insert in landing page or dashboard
        const profitabilitySection = document.getElementById('profitabilitySection');
        if (profitabilitySection) {
            profitabilitySection.after(section);
        }
    }
}

// Initialize
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.successStories = new SuccessStories();
    });
}

