/**
 * Pool Integration - Connects pool manager to dashboard
 */

// Initialize pool manager when dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.dashboard !== 'undefined' && typeof PoolManager !== 'undefined') {
        window.dashboard.poolManager = new PoolManager(window.dashboard);
    }
});

// Helper function to get recommended pool based on hash rate
async function getRecommendedPool() {
    try {
        const response = await fetch('/api/stats');
        if (response.ok) {
            const data = await response.json();
            const hashRate = data.hashRate || 0;
            
            const recResponse = await fetch(`/api/pools/recommended?hashRate=${hashRate}`);
            if (recResponse.ok) {
                const recData = await recResponse.json();
                return recData.recommended;
            }
        }
    } catch (error) {
        console.error('Error getting recommended pool:', error);
    }
    return 'official'; // Default
}

// Show pool recommendation banner
async function showPoolRecommendation() {
    const recommended = await getRecommendedPool();
    const poolManager = window.dashboard?.poolManager;
    
    if (poolManager) {
        const pool = poolManager.pools.find(p => p.id === recommended);
        if (pool) {
            // Show recommendation toast or banner
            if (typeof Toast !== 'undefined') {
                Toast.info(`Recommended pool for your hash rate: ${pool.name} (${pool.feePercent} fee)`, {
                    duration: 10000,
                    title: 'Pool Recommendation'
                });
            }
        }
    }
}

