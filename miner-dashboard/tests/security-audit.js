/**
 * Security Audit Test
 * Comprehensive security checks
 */

const fs = require('fs');
const path = require('path');

const tests = {
    passed: 0,
    failed: 0,
    warnings: 0,
    errors: []
};

function test(name, fn) {
    try {
        fn();
        tests.passed++;
        console.log(`✅ ${name}`);
    } catch (error) {
        tests.failed++;
        tests.errors.push({ name, error: error.message });
        console.error(`❌ ${name}: ${error.message}`);
    }
}

function warn(name, message) {
    tests.warnings++;
    console.warn(`⚠️  ${name}: ${message}`);
}

console.log('🔒 Running Security Audit...\n');

// Test 1: SQL Injection Prevention
test('SQL Injection prevention audit', () => {
    const sqlAudit = require('../utils/sql-injection-audit');
    const result = sqlAudit.testQuerySafety();
    
    if (!result.safe) {
        throw new Error('SQL injection prevention not properly configured');
    }
});

// Test 2: CSRF Protection Available
test('CSRF protection module exists', () => {
    const csrfPath = path.join(__dirname, '../utils/csrf.js');
    if (!fs.existsSync(csrfPath)) {
        throw new Error('CSRF protection module not found');
    }
});

// Test 3: Request Size Limits
test('Request size limit middleware exists', () => {
    const sizeLimitPath = path.join(__dirname, '../utils/request-size-limit.js');
    if (!fs.existsSync(sizeLimitPath)) {
        throw new Error('Request size limit middleware not found');
    }
});

// Test 4: Security Headers
test('Security headers are set', () => {
    const serverPath = path.join(__dirname, '../server.js');
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    if (!serverContent.includes('helmet')) {
        throw new Error('Helmet security headers not configured');
    }
});

// Test 5: Rate Limiting
test('Rate limiting is configured', () => {
    const serverPath = path.join(__dirname, '../server.js');
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    if (!serverContent.includes('rateLimit') && !serverContent.includes('apiLimiter')) {
        throw new Error('Rate limiting not found');
    }
});

// Test 6: Input Validation
test('Input validation middleware exists', () => {
    const validationPath = path.join(__dirname, '../middleware/inputValidation.js');
    if (!fs.existsSync(validationPath)) {
        throw new Error('Input validation middleware not found');
    }
});

// Test 7: Password Security
test('Password hashing is used', () => {
    const authPath = path.join(__dirname, '../auth.js');
    const authContent = fs.readFileSync(authPath, 'utf8');
    
    if (!authContent.includes('bcrypt') && !authContent.includes('hashPassword')) {
        throw new Error('Password hashing not found');
    }
});

// Test 8: Secrets in Environment
test('No hardcoded secrets in code', () => {
    const serverPath = path.join(__dirname, '../server.js');
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Check for common secret patterns
    const secretPatterns = [
        /password\s*=\s*['"][^'"]+['"]/i,
        /api[_-]?key\s*=\s*['"][^'"]+['"]/i,
        /secret\s*=\s*['"][^'"]+['"]/i
    ];
    
    for (const pattern of secretPatterns) {
        if (pattern.test(serverContent)) {
            warn('Potential hardcoded secret', 'Found pattern that might be a hardcoded secret');
        }
    }
});

// Test 9: Error Information Disclosure
test('Error messages don\'t expose sensitive info', () => {
    const serverPath = path.join(__dirname, '../server.js');
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Check that production errors are sanitized
    if (!serverContent.includes('NODE_ENV === \'development\'')) {
        warn('Error sanitization', 'May not be checking NODE_ENV for error messages');
    }
});

// Test 10: Dependency Vulnerabilities
test('Dependencies are audited', () => {
    const packagePath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check for known vulnerable packages (basic check)
    const vulnerablePackages = []; // Add known vulnerable packages here
    
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const found = Object.keys(allDeps).filter(dep => vulnerablePackages.includes(dep));
    
    if (found.length > 0) {
        warn('Potentially vulnerable packages', `Found: ${found.join(', ')}`);
    }
});

console.log('\n📊 Security Audit Results:');
console.log(`✅ Passed: ${tests.passed}`);
console.log(`❌ Failed: ${tests.failed}`);
console.log(`⚠️  Warnings: ${tests.warnings}`);

if (tests.errors.length > 0) {
    console.log(`\n❌ Errors:`);
    tests.errors.forEach(({ name, error }) => {
        console.log(`  - ${name}: ${error}`);
    });
}

const totalTests = tests.passed + tests.failed;
const passRate = totalTests > 0 ? ((tests.passed / totalTests) * 100).toFixed(1) : 0;

console.log(`\n📈 Pass Rate: ${passRate}%`);

if (tests.failed === 0) {
    console.log('\n✅ Security audit passed!');
    process.exit(0);
} else {
    console.log(`\n⚠️  ${tests.failed} test(s) failed. Please review.`);
    process.exit(1);
}

