# QuaiMiner Dashboard - Go Backend

High-performance Go implementation of the QuaiMiner dashboard server.

## Why Go?

- ✅ **Fast**: Compiled, low latency
- ✅ **Efficient**: Low memory footprint (~10-20MB vs 100MB+ for Node.js)
- ✅ **Stable**: No garbage collection pauses for critical paths
- ✅ **Simple**: Single binary deployment
- ✅ **Concurrent**: Excellent for handling multiple connections
- ✅ **System-friendly**: Perfect for Linux services

## Performance Comparison

| Metric | Node.js | Go |
|--------|---------|-----|
| Memory Usage | 100-200MB | 10-20MB |
| Startup Time | 2-5s | <100ms |
| Latency | Variable | Consistent |
| Binary Size | N/A (many files) | ~10MB single file |
| CPU Usage | Higher | Lower |

## Building

### Development

```bash
go mod download
go run main.go
```

### Production Build

```bash
make build-linux
```

### Static Binary (No Dependencies)

```bash
make build-static
```

## Deployment

### As Systemd Service

```bash
# Copy binary
sudo cp quaiminer-dashboard-static /usr/local/bin/quaiminer-dashboard

# Create service file
sudo cp quaiminer-dashboard.service /etc/systemd/system/

# Enable and start
sudo systemctl enable quaiminer-dashboard
sudo systemctl start quaiminer-dashboard
```

## Configuration

Environment variables:
- `PORT` - Server port (default: 3000)
- `HOST` - Bind address (default: 0.0.0.0)
- `NODE_RPC_URL` - Quai node RPC endpoint
- `MINER_API_URL` - Miner API endpoint
- `STATIC_DIR` - Frontend files directory

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/stats` - Mining statistics
- `GET /api/blocks/validated` - Validated blocks
- `GET /api/miner/status` - Miner status
- `POST /api/miner/start` - Start miner
- `POST /api/miner/stop` - Stop miner
- `POST /api/node/rpc` - Node RPC proxy
- `WS /ws` - WebSocket for real-time updates

## Migration from Node.js

1. Build Go binary
2. Replace Node.js service with Go binary
3. Keep frontend files (HTML/JS/CSS) unchanged
4. Update systemd service file
5. Test and deploy

## Dependencies

- `github.com/gorilla/mux` - HTTP router
- `github.com/gorilla/websocket` - WebSocket support

Minimal dependencies = better security and stability.

