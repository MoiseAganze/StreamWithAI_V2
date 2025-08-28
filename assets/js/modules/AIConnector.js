/**
 * AIConnector - Communication avec l'API IA
 * Inclut la gestion des requêtes, retry automatique et cache des réponses
 */
class AIConnector {
    constructor() {
        this.apiUrl = '/api/proxy.php';
        this.timeout = 15000; // 15 secondes
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        this.requestQueue = [];
        this.isProcessing = false;
        this.conversationHistory = [];
        this.maxHistoryLength = 50;
        
        this.isInitialized = false;
        this.init();
    }

    /**
     * Initialise le module
     */
    init() {
        this.isInitialized = true;
        
        // Écouter les événements du bus
        if (window.eventBus) {
            this.setupEventListeners();
        }
        
        console.log('[AIConnector] Module initialisé');
    }

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Écouter les demandes de requêtes IA
        window.eventBus.on('app:aiRequest', this.handleAIRequest.bind(this));
        
        // Écouter les réponses IA pour l'historique
        window.eventBus.on('app:aiResponse', (data) => {
            this.addToHistory('ai', data.message);
        });
        
        // Écouter les messages utilisateur pour l'historique
        window.eventBus.on('app:speech', (data) => {
            this.addToHistory('user', data.transcript);
        });
    }

    /**
     * Gère une demande de requête IA
     * @param {Object} data - Données de la requête
     */
    async handleAIRequest(data) {
        try {
            // Mettre à jour le statut
            if (window.statusManager) {
                window.statusManager.setAIActive(true, 'IA: traitement en cours');
            }
            
            if (window.consoleLogger) {
                window.consoleLogger.system('Envoi de la requête à l\'IA...');
            }

            // Envoyer la requête
            const response = await this.sendRequest(data.message, data.imageUrl);
            
            // Mettre à jour le statut
            if (window.statusManager) {
                window.statusManager.setAIActive(false, 'IA: inactive');
            }

            // Émettre la réponse
            if (window.eventBus) {
                window.eventBus.emit('app:aiResponse', response);
            }

        } catch (error) {
            console.error('[AIConnector] Erreur de requête IA:', error);
            
            // Mettre à jour le statut
            if (window.statusManager) {
                window.statusManager.setAIActive(false, 'IA: erreur');
            }
            
            if (window.consoleLogger) {
                window.consoleLogger.error(`Erreur IA: ${error.message}`);
            }
            
            // Émettre l'erreur
            if (window.eventBus) {
                window.eventBus.emit('ai:error', { error: error.message });
            }
        }
    }

    /**
     * Envoie une requête à l'API IA avec retry
     * @param {string} message - Message à envoyer
     * @param {string} imageUrl - URL de l'image (optionnel)
     * @param {number} attempt - Tentative actuelle
     * @returns {Promise<Object>} Réponse de l'IA
     */
    async sendRequest(message, imageUrl = '', attempt = 1) {
        try {
            // Construire l'historique pour l'API
            const historyForAI = this.conversationHistory.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            // Construire les paramètres
            const params = new URLSearchParams({
                message: message,
                image_url: imageUrl,
                system: 'Reponds en francais au message de user'
            });

            if (historyForAI.length > 0) {
                params.append('history', JSON.stringify(historyForAI));
            }

            // Effectuer la requête
            const response = await this.makeRequest(params.toString());
            
            if (response.status === 'success') {
                return response;
            } else {
                throw new Error(response.message || 'Erreur de l\'API IA');
            }

        } catch (error) {
            if (attempt < this.retryAttempts) {
                console.warn(`[AIConnector] Tentative ${attempt} échouée, nouvelle tentative dans ${this.retryDelay}ms:`, error);
                await this.delay(this.retryDelay);
                return this.sendRequest(message, imageUrl, attempt + 1);
            }
            
            throw error;
        }
    }

    /**
     * Effectue la requête HTTP
     * @param {string} params - Paramètres de la requête
     * @returns {Promise<Object>} Réponse de l'API
     */
    async makeRequest(params) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.apiUrl}?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Timeout de la requête IA');
            }
            
            throw error;
        }
    }

    /**
     * Ajoute un message à l'historique de conversation
     * @param {string} sender - Expéditeur ('user' ou 'ai')
     * @param {string} text - Texte du message
     */
    addToHistory(sender, text) {
        if (!text || !text.trim()) return;

        this.conversationHistory.push({
            sender,
            text: text.trim(),
            timestamp: Date.now()
        });

        // Limiter la taille de l'historique
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }

        console.log(`[AIConnector] Message ajouté à l'historique: ${sender} - "${text.substring(0, 50)}..."`);
    }

    /**
     * Vide l'historique de conversation
     */
    clearHistory() {
        this.conversationHistory = [];
        console.log('[AIConnector] Historique de conversation vidé');
    }

    /**
     * Retourne l'historique de conversation
     * @returns {Array} Historique de conversation
     */
    getHistory() {
        return [...this.conversationHistory];
    }

    /**
     * Retourne l'historique formaté pour l'API IA
     * @returns {Array} Historique formaté
     */
    getFormattedHistory() {
        return this.conversationHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        }));
    }

    /**
     * Délai asynchrone
     * @param {number} ms - Millisecondes à attendre
     * @returns {Promise} Promise qui se résout après le délai
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Configure le module
     * @param {Object} options - Options de configuration
     */
    configure(options = {}) {
        if (options.apiUrl) this.apiUrl = options.apiUrl;
        if (options.timeout) this.timeout = options.timeout;
        if (options.retryAttempts) this.retryAttempts = options.retryAttempts;
        if (options.retryDelay) this.retryDelay = options.retryDelay;
        if (options.maxHistoryLength) this.maxHistoryLength = options.maxHistoryLength;
    }

    /**
     * Retourne l'état actuel du module
     * @returns {Object} État du module
     */
    getState() {
        return {
            isProcessing: this.isProcessing,
            queueLength: this.requestQueue.length,
            historyLength: this.conversationHistory.length,
            maxHistoryLength: this.maxHistoryLength,
            apiUrl: this.apiUrl,
            timeout: this.timeout,
            retryAttempts: this.retryAttempts,
            retryDelay: this.retryDelay
        };
    }

    /**
     * Retourne les statistiques du module
     * @returns {Object} Statistiques
     */
    getStats() {
        const userMessages = this.conversationHistory.filter(msg => msg.sender === 'user').length;
        const aiMessages = this.conversationHistory.filter(msg => msg.sender === 'ai').length;
        
        return {
            totalMessages: this.conversationHistory.length,
            userMessages,
            aiMessages,
            averageMessageLength: this.conversationHistory.length > 0 
                ? this.conversationHistory.reduce((sum, msg) => sum + msg.text.length, 0) / this.conversationHistory.length
                : 0,
            oldestMessage: this.conversationHistory.length > 0 
                ? new Date(this.conversationHistory[0].timestamp)
                : null,
            newestMessage: this.conversationHistory.length > 0 
                ? new Date(this.conversationHistory[this.conversationHistory.length - 1].timestamp)
                : null
        };
    }

    /**
     * Exporte l'historique de conversation
     * @returns {Object} Données exportées
     */
    exportHistory() {
        return {
            timestamp: Date.now(),
            totalMessages: this.conversationHistory.length,
            messages: this.conversationHistory.map(msg => ({
                sender: msg.sender,
                text: msg.text,
                timestamp: msg.timestamp,
                date: new Date(msg.timestamp).toISOString()
            }))
        };
    }

    /**
     * Nettoie les ressources
     */
    cleanup() {
        this.requestQueue = [];
        this.isProcessing = false;
        this.isInitialized = false;
    }
}

// Créer une instance globale
window.aiConnector = new AIConnector();
