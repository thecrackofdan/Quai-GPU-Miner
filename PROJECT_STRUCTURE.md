# QuaiMiner CORE - Project Structure

## 📁 Professional File Organization

```
quaiminer-core/
│
├── 📄 README.md                    # Main project documentation
├── 📄 LICENSE                      # License file
├── 📄 index.html                   # Landing page/website
│
├── 📁 quaiminer-os/                # Core mining OS components
│   ├── 📄 README.md                # QuaiMiner OS documentation
│   ├── 📄 QUICK_START.md           # Quick start guide
│   │
│   ├── 🔧 Installation Scripts
│   │   ├── install.sh              # Original installation script
│   │   └── install-unified.sh      # Unified multi-GPU installation
│   │
│   ├── 🔍 Hardware Detection
│   │   └── hardware-detector.sh    # Auto-detect GPUs, CPUs, system info
│   │
│   ├── 🔧 Driver Management
│   │   ├── driver-manager.sh       # Auto-install/update GPU drivers
│   │   ├── amd-setup-integration.sh # AMD driver setup
│   │   └── quick_amd_setup.sh      # Quick AMD setup (root level)
│   │
│   ├── ⚡ GPU Optimization
│   │   ├── gpu-optimizer.sh        # Auto-optimize GPU settings
│   │   └── rx590-optimization.sh   # RX 590 specific optimizations
│   │
│   ├── 🏭 Multi-Rig Management
│   │   └── multi-rig-manager.sh     # Manage multiple mining rigs
│   │
│   ├── 🔌 API & Control
│   │   ├── miner-api.js            # Single-GPU miner API
│   │   └── miner-api-multigpu.js   # Multi-GPU miner API
│   │
│   └── 📚 Documentation
│       ├── INTEGRATION_SUMMARY.md  # AMD integration details
│       └── TEST_RESULTS.md         # Test results
│
├── 📁 miner-dashboard/             # Web dashboard application
│   ├── 📄 README.md                # Dashboard documentation
│   ├── 📄 package.json             # Node.js dependencies
│   ├── 📄 server.js                # Express server
│   │
│   ├── 🔐 Authentication
│   │   ├── auth.js                 # JWT authentication
│   │   └── middleware/
│   │       └── rateLimit.js        # API rate limiting
│   │
│   ├── 💾 Database
│   │   └── database.js             # SQLite database operations
│   │
│   ├── 📊 Frontend
│   │   └── public/
│   │       ├── index.html          # Dashboard HTML
│   │       ├── css/
│   │       │   ├── styles.css      # Main styles
│   │       │   └── wizard-styles.css # Setup wizard styles
│   │       └── js/
│   │           ├── dashboard.js   # Main dashboard logic
│   │           ├── multi-gpu.js   # Multi-GPU visualization
│   │           ├── setup-wizard.js # Interactive setup wizard
│   │           ├── leaderboard.js # Community leaderboard
│   │           ├── achievements.js # Achievement system
│   │           └── ...            # Other features
│   │
│   ├── 🐳 Docker
│   │   ├── Dockerfile              # Docker image definition
│   │   └── docker-compose.yml      # Docker Compose config
│   │
│   └── 📚 Documentation
│       ├── SETUP_GUIDE.md         # Setup instructions
│       ├── API_ENDPOINTS.md       # API documentation
│       ├── DEPLOYMENT.md          # Deployment guide
│       └── ...                    # Other docs
│
├── 📁 docs/                        # Additional documentation (if exists)
│
├── 🔧 Root Level Scripts
│   ├── quick_amd_setup.sh         # Quick AMD setup (legacy, moved to quaiminer-os)
│   ├── amd_opencl_setup.sh        # AMD OpenCL diagnostics
│   └── mining_software_comparison.sh # Miner comparison tool
│
└── 📚 Documentation Files
    ├── QUAI_MINING_COMMANDS.md    # Mining command reference
    ├── quai_mining_software_research.md # Mining software research
    ├── ubuntu_20_04_amd_rx590_setup.md # Ubuntu setup guide
    ├── amd_opencl_troubleshooting.md # Troubleshooting guide
    ├── UBUNTU_VERSION_SUPPORT.md  # Ubuntu compatibility
    ├── ATTRACT_SOLO_MINERS_STRATEGY.md # Marketing strategy
    └── PROJECT_STRUCTURE.md       # This file
```

## 🎯 Key Components

### 1. **QuaiMiner OS** (`quaiminer-os/`)
   - Complete mining OS with auto-detection
   - Multi-GPU and multi-rig support
   - Automatic driver management
   - GPU optimization

### 2. **Mining Dashboard** (`miner-dashboard/`)
   - Web-based monitoring and control
   - Multi-GPU visualization
   - Real-time statistics
   - Remote management

### 3. **Installation**
   - **Unified Installer**: `quaiminer-os/install-unified.sh`
   - One command installs everything
   - Auto-detects hardware
   - Configures automatically

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/thecrackofdan/quaiminer-core.git
cd quaiminer-core

# 2. Run unified installation
cd quaiminer-os
sudo ./install-unified.sh

# 3. Start dashboard
cd ../miner-dashboard
npm install
npm start
```

## 📋 File Naming Conventions

- **Scripts**: `kebab-case.sh` or `kebab-case.js`
- **Documentation**: `UPPER_SNAKE_CASE.md` or `Title Case.md`
- **Config Files**: `kebab-case.json`
- **Directories**: `kebab-case/`

## 🔄 Migration Notes

- Old scripts in root → Move to `quaiminer-os/` when appropriate
- Documentation → Organize by topic
- Keep backward compatibility where possible

