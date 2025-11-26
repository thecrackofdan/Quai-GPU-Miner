/**
 * Enhanced Animations and Visual Effects
 * Adds smooth transitions and visual polish to the dashboard
 */

class EnhancedAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.addSmoothTransitions();
        this.addLoadingAnimations();
        this.addHoverEffects();
        this.addPulseEffects();
        this.addNumberAnimations();
    }

    /**
     * Add smooth transitions to elements
     */
    addSmoothTransitions() {
        const style = document.createElement('style');
        style.textContent = `
            /* Smooth transitions for all interactive elements */
            .stat-card, .gpu-card, .network-badge, button, .btn {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            /* Smooth number transitions */
            .stat-value, .hash-rate-value, .temperature-value {
                transition: all 0.5s ease-out;
            }

            /* Smooth chart updates */
            canvas {
                transition: opacity 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Add loading animations
     */
    addLoadingAnimations() {
        // Add loading spinner to status indicator
        const statusDot = document.getElementById('statusDot');
        if (statusDot) {
            statusDot.style.animation = 'pulse 2s ease-in-out infinite';
        }

        // Add loading animation to charts
        const charts = document.querySelectorAll('canvas');
        charts.forEach(chart => {
            chart.style.opacity = '0';
            setTimeout(() => {
                chart.style.opacity = '1';
            }, 300);
        });
    }

    /**
     * Add hover effects
     */
    addHoverEffects() {
        // Enhanced hover effects for stat cards
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px) scale(1.02)';
                this.style.boxShadow = '0 8px 24px rgba(255, 0, 0, 0.4)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '';
            });
        });

        // Enhanced hover effects for GPU cards
        const gpuCards = document.querySelectorAll('.gpu-card');
        gpuCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.borderColor = 'var(--quai-primary)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.borderColor = '';
            });
        });
    }

    /**
     * Add pulse effects for important metrics
     */
    addPulseEffects() {
        // Pulse effect for hash rate when it increases
        const hashRateElement = document.getElementById('hashRateValue');
        if (hashRateElement) {
            let lastHashRate = 0;
            const observer = new MutationObserver(() => {
                const currentHashRate = parseFloat(hashRateElement.textContent) || 0;
                if (currentHashRate > lastHashRate && lastHashRate > 0) {
                    hashRateElement.style.animation = 'pulse 0.5s ease';
                    setTimeout(() => {
                        hashRateElement.style.animation = '';
                    }, 500);
                }
                lastHashRate = currentHashRate;
            });
            observer.observe(hashRateElement, { childList: true, characterData: true });
        }
    }

    /**
     * Animate number changes
     */
    addNumberAnimations() {
        // Animate stat values when they change
        const statValues = document.querySelectorAll('.stat-value, .hash-rate-value');
        statValues.forEach(element => {
            let lastValue = parseFloat(element.textContent) || 0;
            const observer = new MutationObserver(() => {
                const currentValue = parseFloat(element.textContent) || 0;
                if (currentValue !== lastValue) {
                    element.style.transform = 'scale(1.1)';
                    element.style.color = 'var(--quai-primary)';
                    setTimeout(() => {
                        element.style.transform = 'scale(1)';
                        element.style.color = '';
                    }, 300);
                }
                lastValue = currentValue;
            });
            observer.observe(element, { childList: true, characterData: true });
        });
    }

    /**
     * Add success animation
     */
    showSuccessAnimation(element) {
        element.style.animation = 'successPulse 0.6s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    /**
     * Add error animation
     */
    showErrorAnimation(element) {
        element.style.animation = 'errorShake 0.5s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

// Add CSS animations
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.8;
            transform: scale(1.05);
        }
    }

    @keyframes successPulse {
        0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7);
        }
        50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(0, 255, 0, 0);
        }
    }

    @keyframes errorShake {
        0%, 100% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-10px);
        }
        75% {
            transform: translateX(10px);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .fade-in {
        animation: fadeIn 0.5s ease-out;
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(20px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .slide-in-right {
        animation: slideInRight 0.4s ease-out;
    }
`;
document.head.appendChild(animationStyles);

// Export for use
if (typeof window !== 'undefined') {
    window.EnhancedAnimations = EnhancedAnimations;
}

