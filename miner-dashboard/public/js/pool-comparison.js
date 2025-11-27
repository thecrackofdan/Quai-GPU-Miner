/**
 * Pool Comparison Widget
 * Shows why our pool is better than competitors
 */

class PoolComparison {
    constructor() {
        this.competitors = [
            {
                name: 'K1Pool',
                fee: '0%',
                minPayout: 'Not specified',
                payoutFreq: 'Not specified',
                features: ['Multiple servers', 'Various miners'],
                score: 3
            },
            {
                name: 'Kryptex',
                fee: '1% PROP',
                minPayout: '20 QUAI',
                payoutFreq: 'Not specified',
                features: ['Global servers'],
                score: 2
            },
            {
                name: 'HeroMiners',
                fee: 'Not specified',
                minPayout: 'Not specified',
                payoutFreq: 'Not specified',
                features: ['Claims highest performance'],
                score: 2
            },
            {
                name: 'Apool',
                fee: 'Not specified',
                minPayout: 'Not specified',
                payoutFreq: 'Not specified',
                features: ['High performance', 'Security'],
                score: 2
            },
            {
                name: 'Our Pool',
                fee: '0.5-1.5%',
                minPayout: '0.1 QUAI',
                payoutFreq: 'Daily',
                features: [
                    'SOAP Staking',
                    'ProgPoW Optimization',
                    'Mobile Dashboard',
                    'DePool System',
                    'Auto Chain Switching',
                    'Merged Mining',
                    'Open Source',
                    '5-Minute Setup'
                ],
                score: 5,
                highlight: true
            }
        ];
    }

    render() {
        const container = document.getElementById('poolComparisonWidget');
        if (!container) return;

        container.innerHTML = `
            <div class="pool-comparison">
                <h3 style="margin-bottom: 1.5rem; color: var(--quai-red);">🏆 Pool Comparison</h3>
                <div class="comparison-table">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--bg-dark); border-bottom: 2px solid var(--quai-red);">
                                <th style="padding: 1rem; text-align: left;">Pool</th>
                                <th style="padding: 1rem; text-align: center;">Fee</th>
                                <th style="padding: 1rem; text-align: center;">Min Payout</th>
                                <th style="padding: 1rem; text-align: center;">Payout</th>
                                <th style="padding: 1rem; text-align: center;">Features</th>
                                <th style="padding: 1rem; text-align: center;">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.competitors.map(pool => `
                                <tr style="border-bottom: 1px solid var(--border-color); ${pool.highlight ? 'background: var(--quai-red-light); font-weight: 600;' : ''}">
                                    <td style="padding: 1rem;">
                                        ${pool.highlight ? '🏆 ' : ''}${pool.name}
                                    </td>
                                    <td style="padding: 1rem; text-align: center;">${pool.fee}</td>
                                    <td style="padding: 1rem; text-align: center;">${pool.minPayout}</td>
                                    <td style="padding: 1rem; text-align: center;">${pool.payoutFreq}</td>
                                    <td style="padding: 1rem; text-align: center;">
                                        <span style="font-size: 0.85rem;">${pool.features.length} features</span>
                                    </td>
                                    <td style="padding: 1rem; text-align: center;">
                                        ${'⭐'.repeat(pool.score)}${'☆'.repeat(5 - pool.score)}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-dark); border-radius: 8px;">
                    <h4 style="color: var(--quai-red); margin-bottom: 0.5rem;">Why We Win:</h4>
                    <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary);">
                        <li>✅ <strong>200x lower</strong> minimum payout (0.1 vs 20 QUAI)</li>
                        <li>✅ <strong>Fastest</strong> payouts (daily vs weekly/monthly)</li>
                        <li>✅ <strong>Most features</strong> (SOAP staking, ProgPoW optimization, mobile app)</li>
                        <li>✅ <strong>Only open source</strong> pool (100% transparent)</li>
                        <li>✅ <strong>Easiest setup</strong> (5 minutes vs 30+ minutes)</li>
                    </ul>
                </div>
            </div>
        `;
    }

    showModal() {
        const modal = document.createElement('div');
        modal.id = 'poolComparisonModal';
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1200px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>🏆 Pool Comparison</h2>
                    <button class="modal-close" onclick="this.closest('.modal').style.display='none'" aria-label="Close">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.renderDetailedComparison()}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    renderDetailedComparison() {
        return `
            <div class="detailed-comparison">
                <p style="margin-bottom: 2rem; color: var(--text-secondary);">
                    Compare our pool with all major Quai Network pools. See why we're the best choice.
                </p>
                ${this.render()}
                <div style="margin-top: 2rem; padding: 1.5rem; background: var(--quai-red-light); border-radius: 8px; border: 1px solid var(--quai-red);">
                    <h3 style="color: var(--quai-red); margin-bottom: 1rem;">💡 Key Advantages</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                        <div>
                            <strong>Financial Benefits:</strong>
                            <ul style="margin-top: 0.5rem;">
                                <li>0.1 QUAI minimum (200x lower)</li>
                                <li>Daily payouts (compound daily)</li>
                                <li>SOAP staking (5-20% APY bonus)</li>
                                <li>Competitive fees (0.5-1.5%)</li>
                            </ul>
                        </div>
                        <div>
                            <strong>Technical Benefits:</strong>
                            <ul style="margin-top: 0.5rem;">
                                <li>ProgPoW GPU optimization</li>
                                <li>Auto chain switching</li>
                                <li>Merged mining support</li>
                                <li>Kernel optimization</li>
                            </ul>
                        </div>
                        <div>
                            <strong>User Experience:</strong>
                            <ul style="margin-top: 0.5rem;">
                                <li>Best-looking dashboard</li>
                                <li>Mobile PWA support</li>
                                <li>5-minute setup</li>
                                <li>One-click optimization</li>
                            </ul>
                        </div>
                        <div>
                            <strong>Transparency:</strong>
                            <ul style="margin-top: 0.5rem;">
                                <li>100% open source</li>
                                <li>Community-driven</li>
                                <li>No hidden fees</li>
                                <li>Verifiable code</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Export for use
if (typeof window !== 'undefined') {
    window.PoolComparison = PoolComparison;
}

