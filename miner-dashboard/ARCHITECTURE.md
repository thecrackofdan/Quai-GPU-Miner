# 🏗️ Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Client (Browser)                       │
│  - Dashboard UI (React-like vanilla JS)                │
│  - WebSocket Client                                      │
│  - Chart.js for visualizations                          │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/WebSocket
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Express Server (Node.js)                    │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Middleware Layer                                │   │
│  │  - Security (Helmet, CORS)                       │   │
│  │  - Rate Limiting                                 │   │
│  │  - Request Timing                                │   │
│  │  - Request ID Tracking                           │   │
│  │  - CSRF Protection                               │   │
│  │  - Input Validation                              │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  API Routes                                       │   │
│  │  - /api/stats - Mining statistics                │   │
│  │  - /api/health - Health check                   │   │
│  │  - /api/metrics - Performance metrics           │   │
│  │  - /api/miner/* - Miner control                 │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  WebSocket Server                                │   │
│  │  - Real-time updates                             │   │
│  │  - Mining stats broadcast                        │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼────────┐
│  SQLite DB     │   │  Quai Node RPC  │
│  - Blocks      │   │  - Network data │
│  - Stats       │   │  - Chain info   │
│  - Users       │   │  - Stratum proxy │
└────────────────┘   └─────────────────┘
```

## Component Architecture

### Frontend (Client-Side)
- **Dashboard Class**: Main application controller
- **Chart.js**: Real-time data visualization
- **WebSocket Client**: Real-time communication
- **Error Handler**: Client-side error management

### Backend (Server-Side)
- **Express Server**: HTTP/WebSocket server
- **Middleware Stack**: Security, validation, logging
- **Database Layer**: SQLite with WAL mode
- **API Layer**: RESTful endpoints
- **WebSocket Server**: Real-time broadcasting

### Utilities
- **Logger**: Winston structured logging
- **Security**: CSRF, rate limiting, input validation
- **Monitoring**: Performance metrics, memory tracking
- **Error Tracking**: Sentry integration (optional)

## Data Flow

```
User Action → Frontend → API Request → Middleware → 
Business Logic → Database/External API → Response → 
Frontend Update → WebSocket Broadcast
```

## Security Layers

1. **Network**: Rate limiting, CORS
2. **Application**: Input validation, CSRF protection
3. **Data**: SQL injection prevention, XSS protection
4. **Privacy**: Wallet masking, data sanitization
5. **Monitoring**: Error tracking, security audits

## Performance Optimizations

- **Database**: WAL mode, indexed queries
- **Caching**: Response compression
- **Monitoring**: Request timing, memory tracking
- **Logging**: Structured logs with rotation

---

**Last Updated**: 2024-12-26

