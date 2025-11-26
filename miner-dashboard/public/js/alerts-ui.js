/**
 * Alerts UI - User interface for alert configuration
 */

class AlertsUI {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.alertManager = dashboard.alertManager;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAlertSettings();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const openBtn = document.getElementById('openAlertsBtn');
        const closeBtn = document.getElementById('closeAlertsBtn');
        const saveBtn = document.getElementById('saveAlertsBtn');
        const testBtn = document.getElementById('testAlertsBtn');
        const modal = document.getElementById('alertsModal');

        if (openBtn && modal) {
            openBtn.onclick = () => {
                modal.style.display = 'block';
                this.loadAlertSettings();
            };
        }

        if (closeBtn && modal) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

        // Channel toggles
        const emailToggle = document.getElementById('emailAlertsEnabled');
        const telegramToggle = document.getElementById('telegramAlertsEnabled');
        const discordToggle = document.getElementById('discordAlertsEnabled');

        if (emailToggle) {
            emailToggle.onchange = (e) => {
                document.getElementById('emailConfig').style.display = e.target.checked ? 'block' : 'none';
            };
        }

        if (telegramToggle) {
            telegramToggle.onchange = (e) => {
                document.getElementById('telegramConfig').style.display = e.target.checked ? 'block' : 'none';
            };
        }

        if (discordToggle) {
            discordToggle.onchange = (e) => {
                document.getElementById('discordConfig').style.display = e.target.checked ? 'block' : 'none';
            };
        }

        if (saveBtn) {
            saveBtn.onclick = () => this.saveAlertSettings();
        }

        if (testBtn) {
            testBtn.onclick = () => this.testAlerts();
        }

        // Close on outside click
        if (modal) {
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }

    /**
     * Load alert settings
     */
    async loadAlertSettings() {
        try {
            const response = await fetch('/api/alerts/settings');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.settings) {
                    this.populateSettings(data.settings);
                    this.renderAlertRules(data.settings.rules || []);
                }
            }
        } catch (error) {
            console.error('Error loading alert settings:', error);
        }
    }

    /**
     * Populate settings in UI
     */
    populateSettings(settings) {
        const channels = settings.channels || {};

        // Email
        const emailEnabled = document.getElementById('emailAlertsEnabled');
        const emailConfig = document.getElementById('emailConfig');
        if (emailEnabled) {
            emailEnabled.checked = channels.email?.enabled || false;
            emailConfig.style.display = emailEnabled.checked ? 'block' : 'none';
        }
        if (channels.email) {
            document.getElementById('emailSmtpHost').value = channels.email.smtpHost || '';
            document.getElementById('emailSmtpPort').value = channels.email.smtpPort || '587';
            document.getElementById('emailUsername').value = channels.email.username || '';
            document.getElementById('emailPassword').value = channels.email.password || '';
            document.getElementById('emailRecipients').value = channels.email.recipients?.join(', ') || '';
        }

        // Telegram
        const telegramEnabled = document.getElementById('telegramAlertsEnabled');
        const telegramConfig = document.getElementById('telegramConfig');
        if (telegramEnabled) {
            telegramEnabled.checked = channels.telegram?.enabled || false;
            telegramConfig.style.display = telegramEnabled.checked ? 'block' : 'none';
        }
        if (channels.telegram) {
            document.getElementById('telegramBotToken').value = channels.telegram.botToken || '';
            document.getElementById('telegramChatId').value = channels.telegram.chatId || '';
        }

        // Discord
        const discordEnabled = document.getElementById('discordAlertsEnabled');
        const discordConfig = document.getElementById('discordConfig');
        if (discordEnabled) {
            discordEnabled.checked = channels.discord?.enabled || false;
            discordConfig.style.display = discordEnabled.checked ? 'block' : 'none';
        }
        if (channels.discord) {
            document.getElementById('discordWebhookUrl').value = channels.discord.webhookUrl || '';
        }
    }

    /**
     * Render alert rules
     */
    renderAlertRules(rules) {
        const container = document.getElementById('alertRulesList');
        if (!container) return;

        if (rules.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary);">No alert rules configured. Default rules will be used.</p>';
            return;
        }

        container.innerHTML = rules.map(rule => `
            <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong>${rule.name}</strong>
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" class="rule-enabled" data-rule-id="${rule.id}" ${rule.enabled ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--quai-primary);">
                        <span style="font-size: 0.85rem;">Enabled</span>
                    </label>
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0;">Condition: ${rule.condition}</p>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0;">Channels: ${rule.channels?.join(', ') || 'None'}</p>
            </div>
        `).join('');

        // Add event listeners for rule toggles
        container.querySelectorAll('.rule-enabled').forEach(toggle => {
            toggle.onchange = (e) => {
                const ruleId = e.target.dataset.ruleId;
                const rule = rules.find(r => r.id === ruleId);
                if (rule) {
                    rule.enabled = e.target.checked;
                }
            };
        });
    }

    /**
     * Save alert settings
     */
    async saveAlertSettings() {
        const errorEl = document.getElementById('alertsError');
        const successEl = document.getElementById('alertsSuccess');
        
        if (errorEl) errorEl.style.display = 'none';
        if (successEl) successEl.style.display = 'none';

        try {
            // SECURITY: Sanitize input values
            const emailHost = document.getElementById('emailSmtpHost').value.trim();
            const emailPort = parseInt(document.getElementById('emailSmtpPort').value) || 587;
            const emailUser = document.getElementById('emailUsername').value.trim();
            const emailPass = document.getElementById('emailPassword').value; // Password - don't trim
            const emailRecipients = document.getElementById('emailRecipients').value
                .split(',')
                .map(e => e.trim().toLowerCase())
                .filter(e => {
                    // SECURITY: Validate email format
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
                });
            
            const telegramToken = document.getElementById('telegramBotToken').value.trim();
            const telegramChatId = document.getElementById('telegramChatId').value.trim();
            const discordWebhook = document.getElementById('discordWebhookUrl').value.trim();
            
            // SECURITY: Validate inputs
            if (emailRecipients.length === 0 && document.getElementById('emailAlertsEnabled').checked) {
                throw new Error('Please enter valid email addresses');
            }
            
            if (document.getElementById('telegramAlertsEnabled').checked) {
                if (!telegramToken || telegramToken.length < 20) {
                    throw new Error('Invalid Telegram bot token');
                }
                if (!telegramChatId || !/^-?\d+$/.test(telegramChatId)) {
                    throw new Error('Invalid Telegram chat ID');
                }
            }
            
            if (document.getElementById('discordAlertsEnabled').checked) {
                if (!discordWebhook || !discordWebhook.startsWith('https://discord.com/api/webhooks/')) {
                    throw new Error('Invalid Discord webhook URL');
                }
            }
            
            const settings = {
                channels: {
                    email: {
                        enabled: document.getElementById('emailAlertsEnabled').checked,
                        smtpHost: emailHost,
                        smtpPort: emailPort >= 1 && emailPort <= 65535 ? emailPort : 587,
                        username: emailUser,
                        password: emailPass, // Will be encrypted on server
                        recipients: emailRecipients
                    },
                    telegram: {
                        enabled: document.getElementById('telegramAlertsEnabled').checked,
                        botToken: telegramToken,
                        chatId: telegramChatId
                    },
                    discord: {
                        enabled: document.getElementById('discordAlertsEnabled').checked,
                        webhookUrl: discordWebhook
                    }
                },
                rules: this.alertManager?.alertRules || []
            };

            const response = await fetch('/api/alerts/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    if (successEl) {
                        successEl.textContent = 'Alert settings saved successfully!';
                        successEl.style.display = 'block';
                    }
                    if (this.alertManager) {
                        await this.alertManager.loadSettings();
                    }
                    if (typeof Toast !== 'undefined') {
                        Toast.success('Alert settings saved!');
                    }
                } else {
                    throw new Error(data.error || 'Failed to save settings');
                }
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving alert settings:', error);
            if (errorEl) {
                errorEl.textContent = error.message || 'Failed to save alert settings';
                errorEl.style.display = 'block';
            }
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to save alert settings');
            }
        }
    }

    /**
     * Test alerts
     */
    async testAlerts() {
        try {
            const response = await fetch('/api/alerts/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channel: 'telegram', // Test with first enabled channel
                    title: 'Test Alert',
                    message: 'This is a test alert from QuaiMiner CORE OS. If you receive this, your alert configuration is working correctly!'
                })
            });

            if (response.ok) {
                if (typeof Toast !== 'undefined') {
                    Toast.success('Test alert sent! Check your configured channels.');
                }
            } else {
                throw new Error('Failed to send test alert');
            }
        } catch (error) {
            console.error('Error sending test alert:', error);
            if (typeof Toast !== 'undefined') {
                Toast.error('Failed to send test alert');
            }
        }
    }
}

// Export for use in dashboard
if (typeof window !== 'undefined') {
    window.AlertsUI = AlertsUI;
}

