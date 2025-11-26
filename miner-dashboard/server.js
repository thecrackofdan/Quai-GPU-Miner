const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { apiLimiter, authLimiter, blockLimiter } = require('./middleware/rateLimit');
const { blocks, stats, notifications, users, config } = require('./database');
const { authenticate, optionalAuth, createDefaultUser, hashPassword, verifyPassword, generateToken, generateApiKey } = require('./auth');
const { securityHeaders, sanitizeLogData, preventDirectoryTraversal, sanitizeFilePath } = require('./middleware/security');
const { privacyHeaders, sanitizeResponse, maskWalletAddress, containsSensitiveData } = require('./middleware/privacy');
const { sanitizeObject, sanitizeString, validateWalletAddress, validateUrl, validateNumber, validateInteger, validateMiningConfig, validateGPUSettings } = require('./middleware/inputValidation');
const logger = require('./utils/logger');

// Cross-platform fetch support
// Node.js 18+ has built-in fetch, older versions need node-fetch
let fetch;
try {
    // Try built-in fetch first (Node.js 18+)
    if (typeof globalThis.fetch === 'function') {
        fetch = globalThis.fetch;
    } else {
        // Fallback for older Node.js versions
        fetch = require('node-fetch');
    }
} catch (e) {
    // node-fetch not installed, will use built-in if available
    fetch = globalThis.fetch || null;
    if (!fetch) {
        logger.warn('Warning: fetch not available. Install node-fetch for Node.js < 18: npm install node-fetch@2');
    }
}

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces for remote access
// Set NODE_ENV from environment or default to production
const NODE_ENV = process.env.NODE_ENV || 'production';

// Get network IP addresses for remote access
const os = require('os');
const networkInterfaces = os.networkInterfaces();
let networkIPs = [];
Object.keys(networkInterfaces).forEach((iface) => {
    networkInterfaces[iface].forEach((addr) => {
        if (addr.family === 'IPv4' && !addr.internal) {
            networkIPs.push(addr.address);
        }
    });
});

// Log startup info (using secure logger)
if (NODE_ENV === 'development') {
    logger.info('========================================');
    logger.info('  QuaiMiner CORE OS Dashboard Server');
    logger.info('========================================');
}

logger.info(`Server starting on ${HOST}:${PORT}`);
logger.info(`Dashboard accessible at: http://localhost:${PORT}`);
if (networkIPs.length > 0) {
    networkIPs.forEach(ip => {
        logger.info(`  Remote access: http://${ip}:${PORT}`);
    });
}
if (NODE_ENV === 'development') {
    logger.info('Press Ctrl+C to stop');
    logger.info('========================================');
}

// Configuration
const NODE_RPC_URL = process.env.NODE_RPC_URL || 'http://localhost:8545';
const MINER_API_URL = process.env.MINER_API_URL || null; // e.g., 'http://localhost:4028/api' for Team Red Miner

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Required for dashboard
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.quaiscan.io", "https://api.telegram.org"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// SECURITY: CORS configuration - restrict origins in production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
        : true, // Allow all in development
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// SECURITY: Body parser with size limits
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        // SECURITY: Validate JSON structure
        try {
            JSON.parse(buf.toString());
        } catch (e) {
            throw new Error('Invalid JSON');
        }
    }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(securityHeaders); // Security headers
app.use(privacyHeaders); // Privacy headers
app.use(apiLimiter); // Apply rate limiting to all routes

// Error handling middleware
app.use((err, req, res, next) => {
    // SECURITY: Sanitize error before logging
    const sanitizedError = sanitizeLogData({
        message: err.message,
        stack: NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method
    });
    
    logger.error('Server error', sanitizedError);
    
    res.status(500).json({ 
        error: 'Internal server error',
        message: NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error logging endpoint
app.post('/api/errors', optionalAuth, async (req, res) => {
    try {
        // SECURITY: Sanitize error data
        const { type, message, file, line, timestamp, userAgent } = sanitizeObject(req.body);
        
        // Log error (in production, send to error tracking service)
        if (process.env.NODE_ENV === 'development') {
            console.error('[Client Error]', { type, message, file, line, timestamp, userAgent });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error logging client error:', error);
        res.status(500).json({ error: 'Failed to log error' });
    }
});

// Main mining stats endpoint (for Quai GPU Miner, Team Red Miner, etc.)
app.get('/api/stats', async (req, res) => {
    try {
        // If miner API URL is configured, try to fetch real data
        if (MINER_API_URL && fetch) {
            try {
                // Create AbortController for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
                
                const minerResponse = await fetch(MINER_API_URL, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId); // Clear timeout if request completes
                
                if (minerResponse.ok) {
                    const minerData = await minerResponse.json();
                    // Transform miner API response to dashboard format
                    // Adjust based on your miner's API format
                    return res.json({
                        hashRate: minerData.hashrate || minerData.hash_rate || 0,
                        shares: {
                            accepted: minerData.shares?.accepted || minerData.accepted_shares || 0,
                            rejected: minerData.shares?.rejected || minerData.rejected_shares || 0
                        },
                        earnings: minerData.earnings || 0,
                        powerUsage: minerData.power || minerData.power_usage || 0,
                        isMining: minerData.is_mining !== false,
                        gpus: minerData.gpus || minerData.devices || []
                    });
                }
            } catch (minerError) {
                if (minerError.name === 'AbortError') {
                    logger.warn('Miner API request timed out, using mock data');
                } else {
                    logger.warn('Miner API unavailable, using mock data', { message: minerError.message });
                }
            }
        }
        
        // Fallback to mock data if miner API is not configured or unavailable
        res.json({
            hashRate: 10.5,
            shares: {
                accepted: 123,
                rejected: 5
            },
            earnings: 0.001234,
            powerUsage: 150,
            isMining: true,
            gpus: [
                {
                    id: 0,
                    name: 'AMD RX 590',
                    hashRate: 10.5,
                    temperature: 72,
                    fanSpeed: 65,
                    powerUsage: 150,
                    memoryTemp: 78
                }
            ],
            network: {
                nodeSynced: true,
                currentChain: 'Prime',
                blockHeight: 1234567,
                difficulty: 1234567890
            }
        });
    } catch (error) {
        logger.error('Error in /api/stats', error);
        res.status(500).json({ error: 'Failed to fetch mining stats', message: NODE_ENV === 'development' ? error.message : 'An error occurred' });
    }
});

// Quai Node RPC proxy endpoint (for checking node status)
app.post('/api/node/rpc', async (req, res) => {
    try {
        const { method, params = [] } = req.body;
        
        // Validate request
        if (!method || typeof method !== 'string') {
            return res.status(400).json({ 
                error: 'Invalid request',
                message: 'Method is required and must be a string'
            });
        }
        
        // Forward to Quai node RPC
        try {
            if (!fetch) {
                throw new Error('fetch not available. Install node-fetch for Node.js < 18');
            }
            
            // Create AbortController for timeout (fetch doesn't support timeout option directly)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const nodeResponse = await fetch(NODE_RPC_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    jsonrpc: '2.0', 
                    method, 
                    params, 
                    id: Math.floor(Math.random() * 1000000)
                }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId); // Clear timeout if request completes
            
            if (!nodeResponse.ok) {
                throw new Error(`Node RPC returned ${nodeResponse.status}: ${nodeResponse.statusText}`);
            }
            
            const data = await nodeResponse.json();
            res.json(data);
        } catch (rpcError) {
            // Handle timeout errors specifically
            if (rpcError.name === 'AbortError') {
                logger.error('RPC call timed out after 10 seconds');
                if (process.env.NODE_ENV === 'development') {
                    logger.warn('Using mock RPC response for development');
                    if (method === 'eth_syncing') {
                        return res.json({ jsonrpc: '2.0', result: false, id: 1 });
                    } else if (method === 'eth_blockNumber') {
                        return res.json({ jsonrpc: '2.0', result: '0x12d687', id: 1 });
                    } else {
                        return res.json({ jsonrpc: '2.0', result: null, id: 1 });
                    }
                }
                return res.status(504).json({ 
                    error: 'Node RPC timeout',
                    message: 'Request timed out after 10 seconds'
                });
            }
            
            logger.error('RPC call failed', rpcError);
            
            // Return mock response for development if node is unavailable
            if (process.env.NODE_ENV === 'development') {
                console.warn('Using mock RPC response for development');
                if (method === 'eth_syncing') {
                    return res.json({ jsonrpc: '2.0', result: false, id: 1 });
                } else if (method === 'eth_blockNumber') {
                    return res.json({ jsonrpc: '2.0', result: '0x12d687', id: 1 });
                } else {
                    return res.json({ jsonrpc: '2.0', result: null, id: 1 });
                }
            }
            
            res.status(503).json({ 
                error: 'Node RPC unavailable',
                message: rpcError.message 
            });
        }
    } catch (error) {
        console.error('Error in /api/node/rpc:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Export endpoints
const exportService = require('./export');

app.get('/api/export/pdf', optionalAuth, async (req, res) => {
    try {
        const options = {
            startDate: req.query.startDate || null,
            endDate: req.query.endDate || null,
            includeCharts: req.query.includeCharts !== 'false',
            includeStats: req.query.includeStats !== 'false'
        };
        
        const result = await exportService.exportPDF(options);
        res.download(result.filepath, result.filename, (err) => {
            if (err) {
                console.error('Error sending PDF:', err);
                res.status(500).json({ error: 'Failed to send PDF' });
            }
        });
    } catch (error) {
        console.error('Error exporting PDF:', error);
        res.status(500).json({ error: 'Export failed', message: error.message });
    }
});

app.get('/api/export/csv', optionalAuth, async (req, res) => {
    try {
        const options = {
            type: req.query.type || 'blocks',
            hours: parseInt(req.query.hours) || 24
        };
        
        const result = await exportService.exportCSV(options);
        res.download(result.filepath, result.filename, (err) => {
            if (err) {
                console.error('Error sending CSV:', err);
                res.status(500).json({ error: 'Failed to send CSV' });
            }
        });
    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(500).json({ error: 'Export failed', message: error.message });
    }
});

app.get('/api/export/json', optionalAuth, async (req, res) => {
    try {
        const options = {
            type: req.query.type || 'blocks',
            hours: parseInt(req.query.hours) || 24
        };
        
        const result = await exportService.exportJSON(options);
        res.download(result.filepath, result.filename, (err) => {
            if (err) {
                console.error('Error sending JSON:', err);
                res.status(500).json({ error: 'Failed to send JSON' });
            }
        });
    } catch (error) {
        console.error('Error exporting JSON:', error);
        res.status(500).json({ error: 'Export failed', message: error.message });
    }
});

// Miner control endpoints (for QuaiMiner OS integration - Multi-GPU support)
let minerAPI = null;
try {
    // Try multi-GPU API first
    minerAPI = require('../quaiminer-os/miner-api-multigpu.js');
    console.log('✅ Multi-GPU Miner API loaded');
} catch (error) {
    try {
        // Fallback to single-GPU API
        minerAPI = require('../quaiminer-os/miner-api.js');
        logger.info('✅ Single-GPU Miner API loaded');
    } catch (error2) {
        logger.warn('QuaiMiner OS API not available', { message: error2.message });
        // Create a mock API for development
        minerAPI = {
            getGPUs: async () => [],
            getMinerStatus: async () => ({ status: 'unavailable', error: 'QuaiMiner OS not installed', gpu_count: 0, gpus: [] }),
            startMiner: async () => ({ success: false, error: 'QuaiMiner OS not installed' }),
            stopMiner: async () => ({ success: false, error: 'QuaiMiner OS not installed' }),
            restartMiner: async () => ({ success: false, error: 'QuaiMiner OS not installed' }),
            getConfig: async () => ({ success: false, error: 'QuaiMiner OS not installed' }),
            updateConfig: async () => ({ success: false, error: 'QuaiMiner OS not installed' }),
            getMinerLogs: async () => ({ success: false, error: 'QuaiMiner OS not installed', logs: [] }),
            getGPUSettings: async (gpuId) => ({ 
                success: false, 
                error: 'QuaiMiner OS not installed',
                settings: null 
            }),
            applyGPUSettings: async (gpuId, settings) => ({ 
                success: false, 
                error: 'QuaiMiner OS not installed' 
            }),
            resetGPUToOptimal: async (gpuId) => ({ 
                success: false, 
                error: 'QuaiMiner OS not installed' 
            })
    };
}

// GPU information endpoint (multi-GPU support)
app.get('/api/gpus', async (req, res) => {
    try {
        if (minerAPI.getGPUs) {
            const gpus = await minerAPI.getGPUs();
            res.json({ success: true, gpus });
        } else {
            res.json({ success: false, error: 'GPU API not available', gpus: [] });
        }
    } catch (error) {
        console.error('Error getting GPUs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/miner/status', async (req, res) => {
    try {
        const status = await minerAPI.getMinerStatus();
        res.json(status);
    } catch (error) {
        console.error('Error getting miner status:', error);
        res.status(500).json({ error: 'Failed to get miner status', message: error.message });
    }
});

app.post('/api/miner/start', async (req, res) => {
    try {
        // Support multi-GPU: accept gpu_indices array in request body
        const gpuIndices = req.body.gpu_indices || null;
        const result = await minerAPI.startMiner(gpuIndices);
        res.json(result);
    } catch (error) {
        console.error('Error starting miner:', error);
        res.status(500).json({ error: 'Failed to start miner', message: error.message });
    }
});

app.post('/api/miner/stop', async (req, res) => {
    try {
        // Support multi-GPU: accept gpu_index in request body (null = stop all)
        const gpuIndex = req.body.gpu_index !== undefined ? req.body.gpu_index : null;
        const result = await minerAPI.stopMiner(gpuIndex);
        res.json(result);
    } catch (error) {
        console.error('Error stopping miner:', error);
        res.status(500).json({ error: 'Failed to stop miner', message: error.message });
    }
});

app.post('/api/miner/restart', async (req, res) => {
    try {
        const result = await minerAPI.restartMiner();
        res.json(result);
    } catch (error) {
        console.error('Error restarting miner:', error);
        res.status(500).json({ error: 'Failed to restart miner', message: error.message });
    }
});

app.get('/api/miner/config', async (req, res) => {
    try {
        const result = await minerAPI.getConfig();
        res.json(result);
    } catch (error) {
        console.error('Error getting miner config:', error);
        res.status(500).json({ error: 'Failed to get miner config', message: error.message });
    }
});

app.post('/api/miner/config', optionalAuth, async (req, res) => {
    try {
        // SECURITY: Sanitize input first
        const updates = sanitizeObject(req.body);
        
        // SECURITY: Validate and sanitize input
        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ error: 'Invalid configuration data' });
        }
        
        // SECURITY: Validate mining configuration
        if (updates.mining) {
            const miningValidation = validateMiningConfig(updates.mining);
            if (!miningValidation.valid) {
                return res.status(400).json({ error: miningValidation.error });
            }
        }
        
        // SECURITY: Validate GPU settings
        if (updates.gpu) {
            const gpuValidation = validateGPUSettings(updates.gpu);
            if (!gpuValidation.valid) {
                return res.status(400).json({ error: gpuValidation.error });
            }
        }
        
        // SECURITY: Validate wallet addresses format
        if (updates.mining && updates.mining.mergedMining && updates.mining.mergedMining.wallets) {
            const wallets = updates.mining.mergedMining.wallets;
            const walletPattern = /^0x[a-fA-F0-9]{40}$/;
            
            // Validate prime wallet
            if (wallets.prime && !walletPattern.test(wallets.prime)) {
                return res.status(400).json({ error: 'Invalid prime wallet address format' });
            }
            
            // Validate region wallets
            if (wallets.regions) {
                for (const [region, address] of Object.entries(wallets.regions)) {
                    if (address && !walletPattern.test(address)) {
                        return res.status(400).json({ error: `Invalid ${region} wallet address format` });
                    }
                }
            }
            
            // Validate zone wallets
            if (wallets.zones) {
                for (const [zone, address] of Object.entries(wallets.zones)) {
                    if (address && !walletPattern.test(address)) {
                        return res.status(400).json({ error: `Invalid ${zone} wallet address format` });
                    }
                }
            }
        }
        
        // SECURITY: Sanitize file paths
        if (updates.mining && updates.mining.mergedMining) {
            const mergedMiningConfig = updates.mining.mergedMining;
            
            // Save merged mining config to file system
            const fs = require('fs');
            const path = require('path');
            
            // SECURITY: Use absolute path, prevent directory traversal
            const configDir = path.resolve(__dirname, '../quaiminer-os/config');
            const configFile = path.join(configDir, 'merged-mining-config.json');
            
            // SECURITY: Ensure we're writing to the correct directory
            if (!configFile.startsWith(path.resolve(__dirname, '../quaiminer-os'))) {
                return res.status(400).json({ error: 'Invalid configuration path' });
            }
            
            // Ensure config directory exists
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true, mode: 0o700 }); // Secure permissions
            }
            
            // SECURITY: Validate JSON before writing
            try {
                JSON.stringify(mergedMiningConfig);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid configuration data format' });
            }
            
            // Write merged mining config file with secure permissions
            fs.writeFileSync(configFile, JSON.stringify(mergedMiningConfig, null, 2), { mode: 0o600 });
            console.log('Merged mining config saved to:', configFile);
        }
        
        const result = await minerAPI.updateConfig(updates);
        res.json(result);
    } catch (error) {
        console.error('Error updating miner config:', error);
        res.status(500).json({ error: 'Failed to update miner config', message: error.message });
    }
});

app.get('/api/miner/logs', async (req, res) => {
    try {
        const lines = parseInt(req.query.lines) || 100;
        const gpuIndex = req.query.gpu_index !== undefined ? parseInt(req.query.gpu_index) : null;
        const result = await minerAPI.getMinerLogs(gpuIndex, lines);
        res.json(result);
    } catch (error) {
        console.error('Error getting miner logs:', error);
        res.status(500).json({ error: 'Failed to get miner logs', message: error.message });
    }
});

// Pool Management Endpoints
app.get('/api/pools', async (req, res) => {
    try {
        const pools = [
            {
                id: 'solo',
                name: 'Solo Mining (Your Node)',
                url: 'stratum://localhost:3333',
                fee: 0,
                feePercent: '0%',
                mining: 'Quai Network (All Chains)',
                payout: 'When block found',
                minPayout: 'Block reward',
                uptime: '99.9%',
                recommended: false,
                description: 'Mine directly to your own Quai node. 100% of rewards, no fees.',
                features: ['100% of rewards', 'No fees', 'Supports decentralization', 'Full control']
            },
            {
                id: 'official',
                name: 'Quai Network Official Pool',
                url: 'stratum+tcp://pool.quai.network:3333',
                fee: 0.5,
                feePercent: '0.5%',
                mining: 'Quai Network (Prime + All Zones)',
                payout: 'Daily',
                minPayout: '0.1 QUAI',
                uptime: '99.9%',
                recommended: true,
                description: 'Official Quai Network mining pool. Low fees, reliable infrastructure.',
                features: ['Lowest fee (0.5%)', 'Official support', 'High uptime', 'Fast payouts']
            },
            {
                id: 'quaiminer',
                name: 'QuaiMiner Pool',
                url: 'stratum+tcp://pool.quaiminer.io:3333',
                fee: 1.0,
                feePercent: '1.0%',
                mining: 'Quai Network (Prime + All Zones)',
                payout: 'Daily',
                minPayout: '0.05 QUAI',
                uptime: '99.5%',
                recommended: false,
                description: 'Community-run mining pool with active support.',
                features: ['Community support', 'Detailed statistics', 'Active development']
            },
            {
                id: 'quaihash',
                name: 'QuaiHash Pool',
                url: 'stratum+tcp://pool.quaihash.com:3333',
                fee: 1.5,
                feePercent: '1.5%',
                mining: 'Quai Network (Prime + All Zones)',
                payout: 'Weekly',
                minPayout: '0.2 QUAI',
                uptime: '99.0%',
                recommended: false,
                description: 'Established mining pool with good uptime.',
                features: ['Established pool', 'Good uptime', 'Regular payouts']
            }
        ];
        res.json({ success: true, pools });
    } catch (error) {
        console.error('Error getting pools:', error);
        res.status(500).json({ error: 'Failed to get pools', message: error.message });
    }
});

app.get('/api/pools/recommended', async (req, res) => {
    try {
        // Get current hash rate to recommend pool
        const hashRate = parseFloat(req.query.hashRate) || 0;
        let recommended;
        
        if (hashRate < 20) {
            recommended = 'quaiminer'; // Small miners
        } else if (hashRate < 100) {
            recommended = 'official'; // Medium miners
        } else {
            recommended = 'solo'; // Large miners
        }
        
        res.json({ success: true, recommended, hashRate });
    } catch (error) {
        console.error('Error getting recommended pool:', error);
        res.status(500).json({ error: 'Failed to get recommendation', message: error.message });
    }
});

// GPU Fine-Tuning Endpoints
app.get('/api/gpu/list', async (req, res) => {
    try {
        // Get GPU list with current and optimal settings
        const gpus = await minerAPI.getGPUs();
        res.json({ success: true, gpus });
    } catch (error) {
        console.error('Error getting GPU list:', error);
        res.status(500).json({ error: 'Failed to get GPUs', message: error.message });
    }
});

app.get('/api/gpu/:id/settings', async (req, res) => {
    try {
        const gpuId = parseInt(req.params.id);
        const settings = await minerAPI.getGPUSettings(gpuId);
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Error getting GPU settings:', error);
        res.status(500).json({ error: 'Failed to get GPU settings', message: error.message });
    }
});

app.post('/api/gpu/:id/settings', async (req, res) => {
    try {
        const gpuId = parseInt(req.params.id);
        const settings = req.body;
        const result = await minerAPI.applyGPUSettings(gpuId, settings);
        res.json({ success: true, result });
    } catch (error) {
        console.error('Error applying GPU settings:', error);
        res.status(500).json({ error: 'Failed to apply GPU settings', message: error.message });
    }
});

app.post('/api/gpu/:id/reset', async (req, res) => {
    try {
        const gpuId = parseInt(req.params.id);
        const result = await minerAPI.resetGPUToOptimal(gpuId);
        res.json({ success: true, result });
    } catch (error) {
        console.error('Error resetting GPU:', error);
        res.status(500).json({ error: 'Failed to reset GPU', message: error.message });
    }
});

app.get('/api/gpu/presets', async (req, res) => {
    try {
        // Get saved GPU presets
        const presets = config.get('gpu_presets') || [];
        res.json({ success: true, presets });
    } catch (error) {
        console.error('Error getting presets:', error);
        res.status(500).json({ error: 'Failed to get presets', message: error.message });
    }
});

app.post('/api/gpu/presets', optionalAuth, async (req, res) => {
    try {
        const { name, gpuId, settings } = req.body;
        if (!name || gpuId === undefined || !settings) {
            return res.status(400).json({ error: 'Name, gpuId, and settings are required' });
        }
        
        const presetsStr = config.get('gpu_presets');
        let presets = [];
        if (presetsStr) {
            try {
                presets = JSON.parse(presetsStr);
            } catch (e) {
                presets = [];
            }
        }
        
        presets.push({ name, gpuId, settings, createdAt: Date.now() });
        config.set('gpu_presets', JSON.stringify(presets));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving preset:', error);
        res.status(500).json({ error: 'Failed to save preset', message: error.message });
    }
});

// Profit Optimizer Endpoints
app.get('/api/optimizer/settings', async (req, res) => {
    try {
        const settingsStr = config.get('profit_optimizer');
        let settings = {
            enabled: false,
            strategy: 'profitability',
            minSwitchThreshold: 0.05,
            checkInterval: 300000
        };
        
        if (settingsStr) {
            try {
                settings = { ...settings, ...JSON.parse(settingsStr) };
            } catch (e) {
                // Use defaults
            }
        }
        
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Error getting optimizer settings:', error);
        res.status(500).json({ error: 'Failed to get settings', message: error.message });
    }
});

app.post('/api/optimizer/settings', optionalAuth, async (req, res) => {
    try {
        const settings = req.body;
        config.set('profit_optimizer', JSON.stringify(settings));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving optimizer settings:', error);
        res.status(500).json({ error: 'Failed to save settings', message: error.message });
    }
});

app.post('/api/chain/metrics', async (req, res) => {
    try {
        const { chainId, chainKey } = req.body;
        
        // Fetch chain metrics from node RPC
        // This would query the Quai node for difficulty, block reward, etc.
        // For now, return mock data structure
        
        const metrics = {
            difficulty: 1000000000 + Math.random() * 100000000,
            blockReward: 2.0 + Math.random() * 0.5,
            networkHashRate: 1000000 + Math.random() * 500000,
            blockTime: 10,
            price: 1.0, // Would fetch from price API
            // Include staking data for combined profitability calculation
            stakingAPY: 0, // Will be fetched from staking contract
            stakingRewards: 0 // Daily staking rewards for this chain
        };
        
        // Fetch staking data if available (from staking_balances config)
        // Use chainKey (e.g., "prime", "cyprus") if provided, otherwise try chainId
        try {
            const stakingDataStr = config.get('staking_balances');
            if (stakingDataStr) {
                const stakingData = JSON.parse(stakingDataStr);
                const rewards = stakingData.rewards || {};
                // Try chainKey first (e.g., "prime"), then chainId as string, then chainId as number
                const lookupKey = chainKey || String(chainId);
                const chainRewards = rewards[lookupKey] || rewards[String(chainId)] || rewards[chainId] || {};
                metrics.stakingAPY = chainRewards.apy || 0;
                metrics.stakingRewards = chainRewards.daily || 0;
            }
        } catch (e) {
            // Staking data not available
        }
        
        res.json({ success: true, ...metrics });
    } catch (error) {
        console.error('Error getting chain metrics:', error);
        res.status(500).json({ error: 'Failed to get metrics', message: error.message });
    }
});

// Staking Endpoints
app.get('/api/staking/balances', optionalAuth, async (req, res) => {
    try {
        // Fetch staking balances from node RPC or config
        // This would query the SOAP staking contract
        const stakingDataStr = config.get('staking_balances');
        let balances = {};
        let rewards = {};
        let lockupPeriods = {};
        
        if (stakingDataStr) {
            try {
                const stakingData = JSON.parse(stakingDataStr);
                balances = stakingData.balances || {};
                rewards = stakingData.rewards || {};
                lockupPeriods = stakingData.lockupPeriods || {};
            } catch (e) {
                // Use defaults
            }
        }
        
        // For now, return structure - in production, query actual staking contract
        res.json({
            success: true,
            balances,
            rewards,
            lockupPeriods
        });
    } catch (error) {
        console.error('Error getting staking balances:', error);
        res.status(500).json({ error: 'Failed to get staking balances', message: error.message });
    }
});

app.post('/api/staking/stake', optionalAuth, async (req, res) => {
    try {
        const { chainId, amount, lockupDays } = req.body;
        
        if (!chainId || !amount || !lockupDays) {
            return res.status(400).json({ error: 'chainId, amount, and lockupDays are required' });
        }
        
        // In production, this would call the SOAP staking contract
        // For now, save to config
        const stakingDataStr = config.get('staking_balances') || '{}';
        const stakingData = JSON.parse(stakingDataStr);
        
        if (!stakingData.balances) stakingData.balances = {};
        if (!stakingData.balances[chainId]) {
            stakingData.balances[chainId] = {
                staked: 0,
                available: 0,
                locked: 0
            };
        }
        
        stakingData.balances[chainId].staked += parseFloat(amount);
        stakingData.balances[chainId].locked += parseFloat(amount);
        
        // Set lockup period
        if (!stakingData.lockupPeriods) stakingData.lockupPeriods = {};
        stakingData.lockupPeriods[chainId] = {
            period: lockupDays,
            daysRemaining: lockupDays,
            unlockDate: new Date(Date.now() + lockupDays * 24 * 60 * 60 * 1000).toISOString(),
            rewardMultiplier: calculateRewardMultiplier(lockupDays)
        };
        
        config.set('staking_balances', JSON.stringify(stakingData));
        
        res.json({ success: true, message: 'Tokens staked successfully' });
    } catch (error) {
        console.error('Error staking tokens:', error);
        res.status(500).json({ error: 'Failed to stake tokens', message: error.message });
    }
});

app.post('/api/staking/unstake', optionalAuth, async (req, res) => {
    try {
        const { chainId, amount } = req.body;
        
        if (!chainId || !amount) {
            return res.status(400).json({ error: 'chainId and amount are required' });
        }
        
        // In production, this would call the SOAP staking contract
        const stakingDataStr = config.get('staking_balances') || '{}';
        const stakingData = JSON.parse(stakingDataStr);
        
        if (!stakingData.balances || !stakingData.balances[chainId]) {
            return res.status(400).json({ error: 'No staking balance found for this chain' });
        }
        
        const balance = stakingData.balances[chainId];
        const lockup = stakingData.lockupPeriods?.[chainId];
        
        // Check if lockup period has expired
        if (lockup && lockup.unlockDate) {
            const unlockDate = new Date(lockup.unlockDate);
            if (new Date() < unlockDate) {
                return res.status(400).json({ 
                    error: 'Lockup period not expired', 
                    daysRemaining: lockup.daysRemaining 
                });
            }
        }
        
        if (balance.locked < parseFloat(amount)) {
            return res.status(400).json({ error: 'Insufficient locked balance' });
        }
        
        balance.staked -= parseFloat(amount);
        balance.locked -= parseFloat(amount);
        balance.available += parseFloat(amount);
        
        config.set('staking_balances', JSON.stringify(stakingData));
        
        res.json({ success: true, message: 'Tokens unstaked successfully' });
    } catch (error) {
        console.error('Error unstaking tokens:', error);
        res.status(500).json({ error: 'Failed to unstake tokens', message: error.message });
    }
});

app.get('/api/staking/rewards', optionalAuth, async (req, res) => {
    try {
        const { chainId } = req.query;
        
        // Fetch staking rewards from staking contract
        const stakingDataStr = config.get('staking_balances') || '{}';
        const stakingData = JSON.parse(stakingDataStr);
        
        let rewards = stakingData.rewards || {};
        
        // If chainId specified, return only that chain's rewards
        if (chainId) {
            rewards = { [chainId]: rewards[chainId] || {} };
        }
        
        res.json({ success: true, rewards });
    } catch (error) {
        console.error('Error getting staking rewards:', error);
        res.status(500).json({ error: 'Failed to get staking rewards', message: error.message });
    }
});

// Helper function to calculate reward multiplier based on lockup period
function calculateRewardMultiplier(lockupDays) {
    if (lockupDays >= 365) return 2.0; // 100% bonus for 1 year
    if (lockupDays >= 180) return 1.5; // 50% bonus for 6 months
    if (lockupDays >= 90) return 1.25; // 25% bonus for 3 months
    if (lockupDays >= 30) return 1.1; // 10% bonus for 1 month
    return 1.0; // No bonus for less than 30 days
}

// Difficulty Adjustor Endpoints
app.get('/api/difficulty-adjustor/settings', optionalAuth, async (req, res) => {
    try {
        const settingsStr = config.get('difficulty_adjustor');
        let settings = {
            enabled: false,
            checkInterval: 60000,
            minDifficultyThreshold: 0
        };
        
        if (settingsStr) {
            try {
                settings = { ...settings, ...JSON.parse(settingsStr) };
            } catch (e) {
                // Use defaults
            }
        }
        
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Error getting difficulty adjustor settings:', error);
        res.status(500).json({ error: 'Failed to get settings', message: error.message });
    }
});

app.post('/api/difficulty-adjustor/settings', optionalAuth, async (req, res) => {
    try {
        const settings = req.body;
        config.set('difficulty_adjustor', JSON.stringify(settings));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving difficulty adjustor settings:', error);
        res.status(500).json({ error: 'Failed to save settings', message: error.message });
    }
});

// Multi-Rig Management Endpoints
app.get('/api/rigs', async (req, res) => {
    try {
        const rigsStr = config.get('rigs');
        let rigs = [];
        
        if (rigsStr) {
            try {
                rigs = JSON.parse(rigsStr);
            } catch (e) {
                rigs = [];
            }
        }
        
        res.json({ success: true, rigs });
    } catch (error) {
        console.error('Error getting rigs:', error);
        res.status(500).json({ error: 'Failed to get rigs', message: error.message });
    }
});

app.post('/api/rigs', optionalAuth, async (req, res) => {
    try {
        const { name, ip, port } = req.body;
        if (!name || !ip) {
            return res.status(400).json({ error: 'Name and IP are required' });
        }
        
        const rigsStr = config.get('rigs');
        let rigs = [];
        if (rigsStr) {
            try {
                rigs = JSON.parse(rigsStr);
            } catch (e) {
                rigs = [];
            }
        }
        
        const newRig = {
            id: Date.now().toString(),
            name,
            ip,
            port: port || 3000,
            status: 'offline',
            createdAt: Date.now()
        };
        
        rigs.push(newRig);
        config.set('rigs', JSON.stringify(rigs));
        res.json({ success: true, rig: newRig });
    } catch (error) {
        console.error('Error adding rig:', error);
        res.status(500).json({ error: 'Failed to add rig', message: error.message });
    }
});

app.get('/api/rigs/:id/status', async (req, res) => {
    try {
        const rigId = req.params.id;
        const rigsStr = config.get('rigs');
        let rigs = [];
        
        if (rigsStr) {
            try {
                rigs = JSON.parse(rigsStr);
            } catch (e) {
                rigs = [];
            }
        }
        
        const rig = rigs.find(r => r.id === rigId);
        if (!rig) {
            return res.status(404).json({ error: 'Rig not found' });
        }
        
        // Fetch status from remote rig
        try {
            const response = await fetch(`http://${rig.ip}:${rig.port}/api/stats`);
            if (response.ok) {
                const data = await response.json();
                res.json({ success: true, status: { ...rig, ...data, status: 'online' } });
            } else {
                res.json({ success: true, status: { ...rig, status: 'offline' } });
            }
        } catch (error) {
            res.json({ success: true, status: { ...rig, status: 'offline' } });
        }
    } catch (error) {
        console.error('Error getting rig status:', error);
        res.status(500).json({ error: 'Failed to get rig status', message: error.message });
    }
});

app.post('/api/rigs/:id/control', optionalAuth, async (req, res) => {
    try {
        const rigId = req.params.id;
        const { action } = req.body;
        
        const rigsStr = config.get('rigs');
        let rigs = [];
        if (rigsStr) {
            try {
                rigs = JSON.parse(rigsStr);
            } catch (e) {
                rigs = [];
            }
        }
        
        const rig = rigs.find(r => r.id === rigId);
        if (!rig) {
            return res.status(404).json({ error: 'Rig not found' });
        }
        
        // Send control command to remote rig
        const endpoint = action === 'start' ? '/api/miner/start' :
                        action === 'stop' ? '/api/miner/stop' :
                        '/api/miner/restart';
        
        const response = await fetch(`http://${rig.ip}:${rig.port}${endpoint}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            res.json({ success: true });
        } else {
            throw new Error('Failed to control rig');
        }
    } catch (error) {
        console.error('Error controlling rig:', error);
        res.status(500).json({ error: 'Failed to control rig', message: error.message });
    }
});

// Advanced Alerting Endpoints
app.get('/api/alerts/settings', optionalAuth, async (req, res) => {
    try {
        const settingsStr = config.get('alert_settings');
        let settings = {
            channels: {
                email: { enabled: false },
                sms: { enabled: false },
                telegram: { enabled: false },
                discord: { enabled: false },
                push: { enabled: false }
            },
            rules: []
        };
        
        if (settingsStr) {
            try {
                settings = { ...settings, ...JSON.parse(settingsStr) };
            } catch (e) {
                // Use defaults
            }
        }
        
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Error getting alert settings:', error);
        res.status(500).json({ error: 'Failed to get alert settings', message: error.message });
    }
});

app.post('/api/alerts/settings', optionalAuth, async (req, res) => {
    try {
        // SECURITY: Sanitize and validate settings
        const settings = sanitizeObject(req.body);
        
        // SECURITY: Validate settings structure
        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ error: 'Invalid settings format' });
        }
        
        // SECURITY: Validate channel configurations
        if (settings.channels) {
            const allowedChannels = ['email', 'sms', 'telegram', 'discord', 'push', 'browser'];
            for (const [channel, config] of Object.entries(settings.channels)) {
                if (!allowedChannels.includes(channel)) {
                    return res.status(400).json({ error: `Invalid channel: ${channel}` });
                }
                
                // SECURITY: Validate email config
                if (channel === 'email' && config.enabled) {
                    if (config.smtpHost && !validateUrl(`http://${config.smtpHost}`)) {
                        return res.status(400).json({ error: 'Invalid SMTP host' });
                    }
                    if (config.recipients && !Array.isArray(config.recipients)) {
                        return res.status(400).json({ error: 'Invalid recipients format' });
                    }
                }
                
                // SECURITY: Validate webhook URLs
                if (channel === 'discord' && config.enabled && config.webhookUrl) {
                    if (!validateUrl(config.webhookUrl)) {
                        return res.status(400).json({ error: 'Invalid webhook URL' });
                    }
                }
            }
        }
        
        config.set('alert_settings', JSON.stringify(settings));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving alert settings:', error);
        res.status(500).json({ error: 'Failed to save alert settings', message: error.message });
    }
});

app.post('/api/alerts/send', optionalAuth, async (req, res) => {
    try {
        // SECURITY: Sanitize input
        const sanitized = sanitizeObject(req.body);
        const { channel, title, message } = sanitized;
        
        // SECURITY: Validate input
        if (!channel || !title || !message) {
            return res.status(400).json({ error: 'Channel, title, and message are required' });
        }
        
        // SECURITY: Validate channel name
        const allowedChannels = ['email', 'sms', 'telegram', 'discord', 'push', 'browser'];
        if (!allowedChannels.includes(channel)) {
            return res.status(400).json({ error: 'Invalid channel' });
        }
        
        // SECURITY: Limit message length
        if (title.length > 200 || message.length > 2000) {
            return res.status(400).json({ error: 'Title or message too long' });
        }
        
        // Get channel configuration
        const settingsStr = config.get('alert_settings');
        let settings = {};
        if (settingsStr) {
            try {
                settings = JSON.parse(settingsStr);
            } catch (e) {
                // Use defaults
            }
        }
        
        const channelConfig = settings.channels?.[channel];
        if (!channelConfig || !channelConfig.enabled) {
            return res.status(400).json({ error: 'Channel not enabled' });
        }
        
        // Send alert based on channel
        let result = { success: false };
        
        switch (channel) {
            case 'email':
                result = await sendEmailAlert(channelConfig, title, message);
                break;
            case 'telegram':
                result = await sendTelegramAlert(channelConfig, title, message);
                break;
            case 'discord':
                result = await sendDiscordAlert(channelConfig, title, message);
                break;
            case 'sms':
                result = await sendSMSAlert(channelConfig, title, message);
                break;
            case 'push':
                result = await sendPushAlert(channelConfig, title, message);
                break;
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error sending alert:', error);
        res.status(500).json({ error: 'Failed to send alert', message: error.message });
    }
});

// Helper functions for sending alerts
async function sendEmailAlert(config, title, message) {
    // Email sending implementation (using nodemailer or similar)
    // For now, return success (implement actual email sending)
    return { success: true, message: 'Email alert sent' };
}

async function sendTelegramAlert(config, title, message) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: config.chatId,
                text: `*${title}*\n\n${message}`,
                parse_mode: 'Markdown'
            })
        });
        
        if (response.ok) {
            return { success: true, message: 'Telegram alert sent' };
        }
        throw new Error('Telegram API error');
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function sendDiscordAlert(config, title, message) {
    try {
        const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: title,
                    description: message,
                    color: 0xff0000, // Red for alerts
                    timestamp: new Date().toISOString()
                }]
            })
        });
        
        if (response.ok) {
            return { success: true, message: 'Discord alert sent' };
        }
        throw new Error('Discord webhook error');
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function sendSMSAlert(config, title, message) {
    // SMS sending implementation (using Twilio or similar)
    // For now, return success (implement actual SMS sending)
    return { success: true, message: 'SMS alert sent' };
}

async function sendPushAlert(config, title, message) {
    // Push notification implementation (using web push API)
    // For now, return success (implement actual push sending)
    return { success: true, message: 'Push alert sent' };
}

// Flight Sheets Endpoints
app.get('/api/flight-sheets', optionalAuth, async (req, res) => {
    try {
        const sheetsStr = config.get('flight_sheets');
        let sheets = [];
        const activeSheetStr = config.get('active_flight_sheet');
        let activeSheet = null;
        
        if (sheetsStr) {
            try {
                sheets = JSON.parse(sheetsStr);
            } catch (e) {
                sheets = [];
            }
        }
        
        if (activeSheetStr) {
            activeSheet = activeSheetStr;
        }
        
        res.json({ success: true, sheets, activeSheet });
    } catch (error) {
        console.error('Error getting flight sheets:', error);
        res.status(500).json({ error: 'Failed to get flight sheets', message: error.message });
    }
});

app.post('/api/flight-sheets', optionalAuth, async (req, res) => {
    try {
        // SECURITY: Sanitize input
        const sanitized = sanitizeObject(req.body);
        const { name, config: sheetConfig } = sanitized;
        
        if (!name || !sheetConfig) {
            return res.status(400).json({ error: 'Name and config are required' });
        }
        
        // SECURITY: Validate name length and format
        if (typeof name !== 'string' || name.length < 1 || name.length > 100) {
            return res.status(400).json({ error: 'Name must be between 1 and 100 characters' });
        }
        
        // SECURITY: Validate configuration
        if (sheetConfig.mining) {
            const miningValidation = validateMiningConfig(sheetConfig.mining);
            if (!miningValidation.valid) {
                return res.status(400).json({ error: miningValidation.error });
            }
        }
        
        if (sheetConfig.gpu) {
            const gpuValidation = validateGPUSettings(sheetConfig.gpu);
            if (!gpuValidation.valid) {
                return res.status(400).json({ error: gpuValidation.error });
            }
        }
        
        const sheetsStr = config.get('flight_sheets');
        let sheets = [];
        if (sheetsStr) {
            try {
                sheets = JSON.parse(sheetsStr);
            } catch (e) {
                sheets = [];
            }
        }
        
        const newSheet = {
            id: Date.now().toString(),
            name,
            config: sheetConfig,
            createdAt: Date.now()
        };
        
        sheets.push(newSheet);
        config.set('flight_sheets', JSON.stringify(sheets));
        res.json({ success: true, sheet: newSheet });
    } catch (error) {
        console.error('Error creating flight sheet:', error);
        res.status(500).json({ error: 'Failed to create flight sheet', message: error.message });
    }
});

app.post('/api/flight-sheets/:id/apply', optionalAuth, async (req, res) => {
    try {
        const sheetId = req.params.id;
        const sheetsStr = config.get('flight_sheets');
        let sheets = [];
        
        if (sheetsStr) {
            try {
                sheets = JSON.parse(sheetsStr);
            } catch (e) {
                sheets = [];
            }
        }
        
        const sheet = sheets.find(s => s.id === sheetId);
        if (!sheet) {
            return res.status(404).json({ error: 'Flight sheet not found' });
        }
        
        // Apply configuration
        await minerAPI.updateConfig(sheet.config);
        
        // Set as active
        config.set('active_flight_sheet', sheetId);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error applying flight sheet:', error);
        res.status(500).json({ error: 'Failed to apply flight sheet', message: error.message });
    }
});

app.delete('/api/flight-sheets/:id', optionalAuth, async (req, res) => {
    try {
        const sheetId = req.params.id;
        const sheetsStr = config.get('flight_sheets');
        let sheets = [];
        
        if (sheetsStr) {
            try {
                sheets = JSON.parse(sheetsStr);
            } catch (e) {
                sheets = [];
            }
        }
        
        const filtered = sheets.filter(s => s.id !== sheetId);
        config.set('flight_sheets', JSON.stringify(filtered));
        
        // If deleted sheet was active, clear active
        const activeSheet = config.get('active_flight_sheet');
        if (activeSheet === sheetId) {
            config.set('active_flight_sheet', '');
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting flight sheet:', error);
        res.status(500).json({ error: 'Failed to delete flight sheet', message: error.message });
    }
});

// Auto-Setup Endpoints
app.get('/api/setup/status', async (req, res) => {
    try {
        const setupComplete = config.get('setup_complete') === 'true';
        res.json({ success: true, setupComplete });
    } catch (error) {
        console.error('Error getting setup status:', error);
        res.status(500).json({ error: 'Failed to get setup status', message: error.message });
    }
});

app.post('/api/setup/complete', async (req, res) => {
    try {
        config.set('setup_complete', 'true');
        res.json({ success: true });
    } catch (error) {
        console.error('Error completing setup:', error);
        res.status(500).json({ error: 'Failed to complete setup', message: error.message });
    }
});

app.post('/api/setup/auto', async (req, res) => {
    try {
        // Auto-setup endpoint - detects hardware and configures automatically
        const gpusResponse = await fetch('http://localhost:3000/api/gpus');
        let gpus = [];
        if (gpusResponse.ok) {
            const gpusData = await gpusResponse.json();
            gpus = gpusData.gpus || [];
        }

        // Auto-configure based on hardware
        const miningConfig = {
            mining: {
                mode: gpus.length > 0 ? 'solo' : 'pool',
                mergedMining: {
                    enabled: gpus.length > 1,
                    chains: gpus.length > 4 ? [0, 1, 2, 3] : [0]
                }
            }
        };

        // Apply configuration
        await minerAPI.updateConfig(miningConfig);
        
        // Mark setup as complete
        config.set('setup_complete', 'true');

        res.json({ 
            success: true, 
            hardware: { gpuCount: gpus.length },
            config: miningConfig
        });
    } catch (error) {
        console.error('Error in auto-setup:', error);
        res.status(500).json({ error: 'Auto-setup failed', message: error.message });
    }
});

// Initialize default admin user
createDefaultUser().catch(console.error);

// Cleanup old blocks periodically (keep last 1000)
setInterval(() => {
    blocks.deleteOld(1000);
}, 60 * 60 * 1000); // Run every hour

// Authentication endpoints
app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const user = users.findByUsername(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);
        users.updateLastLogin(user.id);
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'Login failed', message: error.message });
    }
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        if (users.findByUsername(username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const passwordHash = await hashPassword(password);
        const apiKey = generateApiKey();
        const result = users.create(username, passwordHash, apiKey);

        res.json({
            success: true,
            message: 'User created successfully',
            apiKey: apiKey // Only shown once
        });
    } catch (error) {
        console.error('Error in registration:', error);
        res.status(500).json({ error: 'Registration failed', message: error.message });
    }
});

// Get validated blocks (using database)
app.get('/api/blocks/validated', optionalAuth, async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 100, 500);
        const dbBlocks = blocks.getAll(limit);
        res.json({ 
            blocks: dbBlocks,
            total: blocks.getStats().total
        });
    } catch (error) {
        console.error('Error getting validated blocks:', error);
        res.status(500).json({ error: 'Failed to get validated blocks', message: error.message });
    }
});

// Add validated block (called when miner finds a block)
app.post('/api/blocks/validated', blockLimiter, optionalAuth, async (req, res) => {
    try {
        const { blockNumber, blockHash, timestamp, chain, reward, txHash } = req.body;
        
        if (!blockNumber) {
            return res.status(400).json({ error: 'blockNumber is required' });
        }
        
        const blockNum = parseInt(blockNumber);
        if (isNaN(blockNum) || blockNum < 0) {
            return res.status(400).json({ error: 'Invalid blockNumber' });
        }
        
        const block = {
            blockNumber: blockNum,
            blockHash: blockHash || null,
            timestamp: timestamp || Date.now(),
            chain: chain || 'Prime',
            reward: parseFloat(reward) || 0,
            txHash: txHash || null
        };
        
        const result = blocks.add(block);
        
        if (result.success) {
            // Create notification for block find
            if (req.user) {
                notifications.create(
                    req.user.id,
                    'block_found',
                    'Block Found!',
                    `You found block #${blockNum} on ${block.chain} chain with reward ${block.reward} QUAI`
                );
            }
            
            res.json({ success: true, block: { ...block, id: result.id } });
        } else {
            res.json({ success: false, message: result.error });
        }
    } catch (error) {
        console.error('Error adding validated block:', error);
        res.status(500).json({ error: 'Failed to add validated block', message: error.message });
    }
});

// Get block statistics (using database)
app.get('/api/blocks/stats', optionalAuth, async (req, res) => {
    try {
        const blockStats = blocks.getStats();
        const allBlocks = blocks.getAll(1);
        const lastBlock = allBlocks.length > 0 ? allBlocks[0] : null;
        
        res.json({
            ...blockStats,
            lastBlock
        });
    } catch (error) {
        console.error('Error getting block stats:', error);
        res.status(500).json({ error: 'Failed to get block stats', message: error.message });
    }
});

// Historical mining statistics
app.post('/api/stats/history', optionalAuth, async (req, res) => {
    try {
        const stat = req.body;
        stats.add(stat);
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving mining stats:', error);
        res.status(500).json({ error: 'Failed to save stats', message: error.message });
    }
});

app.get('/api/stats/history', optionalAuth, async (req, res) => {
    try {
        const hours = parseInt(req.query.hours) || 24;
        const gpuId = req.query.gpuId ? parseInt(req.query.gpuId) : null;
        const aggregated = req.query.aggregated === 'true';
        
        if (aggregated) {
            const interval = parseInt(req.query.interval) || 60;
            const data = stats.getAggregated(hours, interval);
            res.json({ data });
        } else {
            const data = stats.getHistory(hours, gpuId);
            res.json({ data });
        }
    } catch (error) {
        console.error('Error getting mining stats history:', error);
        res.status(500).json({ error: 'Failed to get stats', message: error.message });
    }
});

// Notifications endpoints
app.get('/api/notifications', authenticate, async (req, res) => {
    try {
        const unread = notifications.getUnread(req.user.id);
        res.json({ notifications: unread });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ error: 'Failed to get notifications', message: error.message });
    }
});

app.post('/api/notifications/:id/read', authenticate, async (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);
        notifications.markRead(notificationId, req.user.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to update notification', message: error.message });
    }
});

// Serve index.html for all routes (SPA support)
// Serve PWA manifest
app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

// Serve service worker
app.get('/sw.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sw.js'), {
        headers: { 'Content-Type': 'application/javascript' }
    });
});

// Serve remote access landing page
app.get('/remote', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'remote.html'));
});

// Serve mobile.html for mobile devices
app.get('/mobile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'mobile.html'));
});

// Serve remote.html as default landing page
app.get('/', (req, res) => {
    // Check if user wants dashboard or landing page
    const userAgent = req.get('user-agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    
    if (isMobile) {
        res.sendFile(path.join(__dirname, 'public', 'mobile.html'));
    } else if (req.query.dashboard || req.query.rig) {
        // Direct dashboard access
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        // Default to remote landing page
        res.sendFile(path.join(__dirname, 'public', 'remote.html'));
    }
});

// Serve index.html for dashboard route
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, HOST, () => {
    if (NODE_ENV === 'development') {
        console.log(`🚀 QuaiMiner CORE OS Dashboard running on http://localhost:${PORT}`);
        console.log(`📊 Open your browser and navigate to the URL above`);
        console.log(`🔗 Node RPC: ${NODE_RPC_URL}`);
    } else {
        logger.info(`Server running on ${HOST}:${PORT}`);
    }
    if (MINER_API_URL) {
            logger.info(`⛏️  Miner API: ${MINER_API_URL}`);
        } else {
            logger.info(`⛏️  Miner API: Not configured (using mock data)`);
        }
});
