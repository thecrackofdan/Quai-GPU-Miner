/**
 * Metrics API Endpoint Tests
 */
const request = require('supertest');

let app;
beforeAll(() => {
    process.env.NODE_ENV = 'test';
    
    const express = require('express');
    app = express();
    app.use(express.json());
    
    // Metrics endpoint
    app.get('/api/metrics', (req, res) => {
        const memUsage = process.memoryUsage();
        const totalMem = memUsage.heapTotal;
        const usedMem = memUsage.heapUsed;
        
        res.json({
            memory: {
                used: Math.round(usedMem / 1024 / 1024),
                total: Math.round(totalMem / 1024 / 1024),
                percentage: Math.round((usedMem / totalMem) * 100)
            },
            cpu: {
                usage: process.cpuUsage()
            },
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    });
    
    // Prometheus metrics endpoint
    const prometheusMetrics = require('../../utils/prometheus-metrics');
    app.get('/api/metrics/prometheus', (req, res) => {
        res.set('Content-Type', 'text/plain');
        res.send(prometheusMetrics.getPrometheusMetrics());
    });
});

describe('Metrics API', () => {
    test('GET /api/metrics should return 200', async () => {
        const response = await request(app)
            .get('/api/metrics')
            .expect(200);
        
        expect(response.body).toHaveProperty('memory');
        expect(response.body).toHaveProperty('cpu');
        expect(response.body).toHaveProperty('uptime');
        expect(response.body).toHaveProperty('timestamp');
    });
    
    test('GET /api/metrics should return valid memory data', async () => {
        const response = await request(app)
            .get('/api/metrics')
            .expect(200);
        
        expect(response.body.memory).toHaveProperty('used');
        expect(response.body.memory).toHaveProperty('total');
        expect(response.body.memory).toHaveProperty('percentage');
        expect(typeof response.body.memory.used).toBe('number');
        expect(typeof response.body.memory.total).toBe('number');
    });
    
    test('GET /api/metrics/prometheus should return Prometheus format', async () => {
        const response = await request(app)
            .get('/api/metrics/prometheus')
            .expect(200);
        
        expect(response.headers['content-type']).toContain('text/plain');
        expect(response.text).toContain('http_requests_total');
        expect(response.text).toContain('nodejs_memory_usage_bytes');
    });
});

