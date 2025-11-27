// Add after metrics endpoints, before hardware endpoints

/**
 * @swagger
 * /api/qi/balance:
 *   get:
 *     summary: Get Qi token balance
 *     tags: [Tokens]
 *     parameters:
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         description: Wallet address to check balance
 *     responses:
 *       200:
 *         description: Qi token balance
 */
app.get('/api/qi/balance', async (req, res) => {
    try {
        const address = req.query.address || config.get('wallet_address');
        
        if (!address || address === '0x0000000000000000000000000000000000000000') {
            return res.json({
                balance: '0',
                formatted: '0.00',
                usd: 0,
                symbol: 'QI',
                message: 'No wallet address configured'
            });
        }

        const balance = await qiTracker.getBalance(address);
        const conversion = qiTracker.getConversionRate();
        
        res.json({
            ...balance,
            conversion: conversion
        });
    } catch (error) {
        logger.error('Error getting Qi balance:', error);
        res.status(500).json({ error: 'Failed to get Qi balance', message: error.message });
    }
});

/**
 * @swagger
 * /api/poem/optimize:
 *   get:
 *     summary: Get PoEM optimization recommendations
 *     tags: [Mining]
 *     responses:
 *       200:
 *         description: PoEM optimization data
 */
app.get('/api/poem/optimize', async (req, res) => {
    try {
        const optimization = await poemOptimizer.optimizeMining();
        const statistics = poemOptimizer.getStatistics();
        
        res.json({
            ...optimization,
            statistics: statistics
        });
    } catch (error) {
        logger.error('Error getting PoEM optimization:', error);
        res.status(500).json({ error: 'Failed to get PoEM optimization', message: error.message });
    }
});
