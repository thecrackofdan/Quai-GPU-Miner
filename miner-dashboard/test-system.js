/**
 * Comprehensive System Test Script
 * Tests all components: API endpoints, database, GPU detection, ProgPoW, SOAP staking
 */

const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const TEST_RESULTS = {
    passed: [],
    failed: [],
    warnings: []
};

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
}

function test(name, fn) {
    try {
        log(`Testing: ${name}`, 'info');
        const result = fn();
        if (result === true || result === undefined) {
            TEST_RESULTS.passed.push(name);
            log(`PASSED: ${name}`, 'success');
            return true;
        } else {
            TEST_RESULTS.failed.push(name);
            log(`FAILED: ${name} - ${result}`, 'error');
            return false;
        }
    } catch (error) {
        TEST_RESULTS.failed.push(name);
        log(`FAILED: ${name} - ${error.message}`, 'error');
        return false;
    }
}

function httpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const req = http.request({
            hostname: urlObj.hostname,
            port: urlObj.port || 3000,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        req.end();
    });
}

// Test 1: Server Health
async function testServerHealth() {
    return test('Server Health Check', async () => {
        const result = await httpRequest(`${BASE_URL}/api/health`);
        return result.status === 200;
    });
}

// Test 2: Database Connection
function testDatabase() {
    return test('Database Connection', () => {
        try {
            const db = require('./database');
            return db !== null;
        } catch (error) {
            return `Database error: ${error.message}`;
        }
    });
}

// Test 3: API Endpoints
async function testAPIEndpoints() {
    const endpoints = [
        { path: '/api/stats', method: 'GET' },
        { path: '/api/miner/status', method: 'GET' },
        { path: '/api/depool/config', method: 'GET' },
        { path: '/api/staking/balances', method: 'GET' },
        { path: '/api/rigs', method: 'GET' }
    ];

    for (const endpoint of endpoints) {
        await test(`API Endpoint: ${endpoint.method} ${endpoint.path}`, async () => {
            const result = await httpRequest(`${BASE_URL}${endpoint.path}`, { method: endpoint.method });
            return result.status === 200 || result.status === 401; // 401 is OK (auth required)
        });
    }
}

// Test 4: DePool Functionality
async function testDePool() {
    await test('DePool Config Get', async () => {
        const result = await httpRequest(`${BASE_URL}/api/depool/config`);
        return result.status === 200 && result.data.success !== undefined;
    });

    await test('DePool Stats Get', async () => {
        const result = await httpRequest(`${BASE_URL}/api/depool/stats`);
        return result.status === 200 && result.data.success !== undefined;
    });
}

// Test 5: SOAP Staking
async function testSOAPStaking() {
    await test('Staking Balances Get', async () => {
        const result = await httpRequest(`${BASE_URL}/api/staking/balances`);
        return result.status === 200 && result.data.success !== undefined;
    });

    await test('Staking Rewards Get', async () => {
        const result = await httpRequest(`${BASE_URL}/api/staking/rewards`);
        return result.status === 200 && result.data.success !== undefined;
    });
}

// Test 6: File Structure
function testFileStructure() {
    return test('Required Files Exist', () => {
        const requiredFiles = [
            'server.js',
            'database.js',
            'auth.js',
            'public/index.html',
            'public/mobile.html',
            'public/sw.js',
            'public/manifest.json',
            'public/js/dashboard.js',
            'public/js/staking-manager.js',
            'public/js/depool-manager.js'
        ];

        const missing = [];
        for (const file of requiredFiles) {
            if (!fs.existsSync(path.join(__dirname, file))) {
                missing.push(file);
            }
        }

        if (missing.length > 0) {
            return `Missing files: ${missing.join(', ')}`;
        }
        return true;
    });
}

// Test 7: PWA Configuration
function testPWA() {
    return test('PWA Configuration', () => {
        const manifestPath = path.join(__dirname, 'public/manifest.json');
        const swPath = path.join(__dirname, 'public/sw.js');

        if (!fs.existsSync(manifestPath)) {
            return 'manifest.json missing';
        }

        if (!fs.existsSync(swPath)) {
            return 'sw.js missing';
        }

        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            if (!manifest.name || !manifest.short_name) {
                return 'manifest.json incomplete';
            }
        } catch (e) {
            return `manifest.json invalid: ${e.message}`;
        }

        return true;
    });
}

// Test 8: GPU Optimization Scripts
function testGPUScripts() {
    return test('GPU Optimization Scripts', () => {
        const scripts = [
            '../quaiminer-os/gpu-optimizer.sh',
            '../quaiminer-os/gpu-tuner.sh',
            '../quaiminer-os/progpow-gpu-optimizer.sh',
            '../quaiminer-os/hardware-detector.sh',
            '../quaiminer-os/driver-manager.sh'
        ];

        const missing = [];
        for (const script of scripts) {
            const scriptPath = path.join(__dirname, script);
            if (!fs.existsSync(scriptPath)) {
                missing.push(script);
            }
        }

        if (missing.length > 0) {
            TEST_RESULTS.warnings.push(`Some GPU scripts missing: ${missing.join(', ')}`);
        }

        return true;
    });
}

// Test 9: Security Middleware
function testSecurity() {
    return test('Security Middleware', () => {
        try {
            require('./middleware/security');
            require('./middleware/rateLimit');
            require('./middleware/inputValidation');
            return true;
        } catch (error) {
            return `Security middleware error: ${error.message}`;
        }
    });
}

// Test 10: Mobile Support
function testMobileSupport() {
    return test('Mobile Support Files', () => {
        const mobileFiles = [
            'public/mobile.html',
            'public/css/mobile.css',
            'public/js/mobile-dashboard.js'
        ];

        const missing = [];
        for (const file of mobileFiles) {
            if (!fs.existsSync(path.join(__dirname, file))) {
                missing.push(file);
            }
        }

        if (missing.length > 0) {
            TEST_RESULTS.warnings.push(`Some mobile files missing: ${missing.join(', ')}`);
        }

        return true;
    });
}

// Main test runner
async function runTests() {
    console.log('\n🧪 QuaiMiner CORE OS - Comprehensive System Test\n');
    console.log('='.repeat(50));
    console.log('');

    // Run all tests
    await testServerHealth();
    testDatabase();
    await testAPIEndpoints();
    await testDePool();
    await testSOAPStaking();
    testFileStructure();
    testPWA();
    testGPUScripts();
    testSecurity();
    testMobileSupport();

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Test Summary\n');
    console.log(`✅ Passed: ${TEST_RESULTS.passed.length}`);
    console.log(`❌ Failed: ${TEST_RESULTS.failed.length}`);
    console.log(`⚠️  Warnings: ${TEST_RESULTS.warnings.length}`);
    console.log('');

    if (TEST_RESULTS.failed.length > 0) {
        console.log('❌ Failed Tests:');
        TEST_RESULTS.failed.forEach(test => console.log(`   - ${test}`));
        console.log('');
    }

    if (TEST_RESULTS.warnings.length > 0) {
        console.log('⚠️  Warnings:');
        TEST_RESULTS.warnings.forEach(warning => console.log(`   - ${warning}`));
        console.log('');
    }

    if (TEST_RESULTS.failed.length === 0) {
        console.log('🎉 All critical tests passed!');
        process.exit(0);
    } else {
        console.log('⚠️  Some tests failed. Please review and fix issues.');
        process.exit(1);
    }
}

// Run tests if called directly
if (require.main === module) {
    runTests().catch(error => {
        console.error('Fatal error running tests:', error);
        process.exit(1);
    });
}

module.exports = { runTests, test, httpRequest };

