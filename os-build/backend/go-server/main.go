package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

// Configuration
type Config struct {
	Port        string
	Host        string
	NodeRPCURL  string
	MinerAPIURL string
}

var config Config
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for remote access
	},
}

func main() {
	// Load configuration from environment
	config = Config{
		Port:        getEnv("PORT", "3000"),
		Host:        getEnv("HOST", "0.0.0.0"),
		NodeRPCURL:  getEnv("NODE_RPC_URL", "http://localhost:8545"),
		MinerAPIURL: getEnv("MINER_API_URL", ""),
	}

	// Get network IPs for display
	displayNetworkInfo()

	// Setup routes
	router := mux.NewRouter()

	// API routes
	api := router.PathPrefix("/api").Subrouter()
	api.HandleFunc("/health", healthHandler).Methods("GET")
	api.HandleFunc("/stats", statsHandler).Methods("GET")
	api.HandleFunc("/blocks/validated", blocksHandler).Methods("GET")
	api.HandleFunc("/miner/status", minerStatusHandler).Methods("GET")
	api.HandleFunc("/miner/start", minerStartHandler).Methods("POST")
	api.HandleFunc("/miner/stop", minerStopHandler).Methods("POST")
	api.HandleFunc("/node/rpc", nodeRPCHandler).Methods("POST")

	// WebSocket for real-time updates
	router.HandleFunc("/ws", websocketHandler)

	// Serve static files (frontend)
	staticDir := getEnv("STATIC_DIR", "./public")
	router.PathPrefix("/").Handler(http.FileServer(http.Dir(staticDir)))

	// Start server
	addr := fmt.Sprintf("%s:%s", config.Host, config.Port)
	log.Printf("🚀 QuaiMiner CORE OS Dashboard starting on %s", addr)
	log.Printf("📊 Dashboard: http://localhost:%s", config.Port)

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func displayNetworkInfo() {
	// Display network IPs (simplified - would use net package in production)
	log.Println("🌐 Dashboard accessible at:")
	log.Printf("   http://localhost:%s", config.Port)
	log.Println("   (Network IPs will be displayed on connection)")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":    "ok",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"uptime":    runtime.NumGoroutine(), // Simplified
	}
	jsonResponse(w, response)
}

func statsHandler(w http.ResponseWriter, r *http.Request) {
	// Get mining stats from miner API or node RPC
	stats := map[string]interface{}{
		"hashRate":        0.0,
		"acceptedShares":  0,
		"rejectedShares":  0,
		"powerUsage":      0,
		"temperature":     0,
		"isMining":        false,
		"timestamp":       time.Now().UTC().Format(time.RFC3339),
	}

	// TODO: Fetch real stats from miner/node
	jsonResponse(w, stats)
}

func blocksHandler(w http.ResponseWriter, r *http.Request) {
	blocks := []map[string]interface{}{}
	jsonResponse(w, map[string]interface{}{
		"blocks": blocks,
		"total":  len(blocks),
	})
}

func minerStatusHandler(w http.ResponseWriter, r *http.Request) {
	// Check if miner process is running
	status := "stopped"
	if isMinerRunning() {
		status = "running"
	}

	jsonResponse(w, map[string]interface{}{
		"status": status,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

func minerStartHandler(w http.ResponseWriter, r *http.Request) {
	// Start miner process
	// TODO: Implement actual miner start
	jsonResponse(w, map[string]interface{}{
		"success": true,
		"message": "Miner started",
	})
}

func minerStopHandler(w http.ResponseWriter, r *http.Request) {
	// Stop miner process
	// TODO: Implement actual miner stop
	jsonResponse(w, map[string]interface{}{
		"success": true,
		"message": "Miner stopped",
	})
}

func nodeRPCHandler(w http.ResponseWriter, r *http.Request) {
	// Proxy RPC calls to Quai node
	var request map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// TODO: Forward to node RPC
	jsonResponse(w, map[string]interface{}{
		"result": nil,
		"error":  "Not implemented",
	})
}

func websocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade failed:", err)
		return
	}
	defer conn.Close()

	// Send periodic updates
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			stats := map[string]interface{}{
				"hashRate": 0.0,
				"timestamp": time.Now().UTC().Format(time.RFC3339),
			}
			if err := conn.WriteJSON(stats); err != nil {
				log.Println("WebSocket write error:", err)
				return
			}
		}
	}
}

func isMinerRunning() bool {
	// Check if miner process exists
	cmd := exec.Command("pgrep", "-f", "quai-gpu-miner")
	return cmd.Run() == nil
}

func jsonResponse(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

