# QuaiMiner Dashboard - Go Build Makefile

.PHONY: build clean install run test

# Build for current platform
build:
	go build -o quaiminer-dashboard -ldflags="-s -w" main.go

# Build for Linux (production)
build-linux:
	GOOS=linux GOARCH=amd64 go build -o quaiminer-dashboard-linux -ldflags="-s -w" main.go

# Build static binary (no dependencies)
build-static:
	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags="-s -w" -o quaiminer-dashboard-static main.go

# Clean build artifacts
clean:
	rm -f quaiminer-dashboard quaiminer-dashboard-linux quaiminer-dashboard-static

# Install dependencies
install:
	go mod download
	go mod tidy

# Run development server
run:
	go run main.go

# Run tests
test:
	go test ./...

# Build optimized production binary
production: build-static
	@echo "✅ Production binary built: quaiminer-dashboard-static"
	@ls -lh quaiminer-dashboard-static

