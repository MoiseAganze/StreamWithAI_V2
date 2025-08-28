/**
 * ConsoleLogger - Gestion de l'affichage des messages dans la console
 * Gère les différents types de messages avec couleurs et animations
 */
class ConsoleLogger {
    constructor(containerId = 'console') {
        this.container = document.getElementById(containerId);
        this.maxMessages = 100; // Nombre maximum de messages à conserver
        this.messageTypes = {
            system: { color: 'purple', icon: '⚙️', prefix: '[SYSTEM]' },
            ai: { color: 'green', icon: '🤖', prefix: '[IA]' },
            user: { color: 'blue', icon: '👤', prefix: '[UTILISATEUR]' },
            error: { color: 'red', icon: '❌', prefix: '[ERREUR]' },
            voice: { color: 'yellow', icon: '🎤', prefix: '[VOIX]' },
            warning: { color: 'orange', icon: '⚠️', prefix: '[ATTENTION]' },
            info: { color: 'cyan', icon: 'ℹ️', prefix: '[INFO]' }
        };
        
        this.isInitialized = false;
        this.init();
    }

    /**
     * Initialise le logger
     */
    init() {
        if (!this.container) {
            console.error('[ConsoleLogger] Container not found:', this.containerId);
            return;
        }

        this.isInitialized = true;
        this.log('Initialisation du laboratoire...', 'system');
        
        // Nettoyer périodiquement les anciens messages
        setInterval(() => this.cleanup(), 60000); // Toutes les minutes
    }

    /**
     * Ajoute un message à la console
     * @param {string} text - Texte du message
     * @param {string} type - Type de message (system, ai, user, error, voice, warning, info)
     * @param {Object} options - Options supplémentaires
     */
    log(text, type = 'system', options = {}) {
        if (!this.isInitialized) {
            console.warn('[ConsoleLogger] Logger not initialized');
            return;
        }

        const messageType = this.messageTypes[type] || this.messageTypes.system;
        const now = new Date();
        const time = now.toLocaleTimeString('fr-FR', { hour12: false });
        
        // Créer l'élément du message
        const messageElement = document.createElement('div');
        messageElement.className = `console-text ${type}`;
        
        // Échapper le HTML pour la sécurité
        const safeText = this.escapeHtml(text);
        
        // Construire le contenu du message
        const content = `
            <span class="text-${messageType.color}-400">${messageType.prefix}</span>
            <span class="text-gray-400">${time}</span>
            <span class="message-content">${safeText}</span>
        `;
        
        messageElement.innerHTML = content;
        
        // Ajouter des attributs pour l'accessibilité
        messageElement.setAttribute('role', 'log');
        messageElement.setAttribute('aria-label', `${messageType.prefix} ${safeText}`);
        
        // Ajouter des options personnalisées
        if (options.className) {
            messageElement.classList.add(options.className);
        }
        
        if (options.id) {
            messageElement.id = options.id;
        }
        
        // Ajouter le message au conteneur
        this.container.appendChild(messageElement);
        
        // Faire défiler vers le bas
        this.scrollToBottom();
        
        // Limiter le nombre de messages
        this.limitMessages();
        
        // Émettre un événement pour les autres modules
        if (window.eventBus) {
            window.eventBus.emit('console:message', {
                text,
                type,
                timestamp: now,
                element: messageElement
            });
        }
    }

    /**
     * Échappe le HTML pour éviter les injections
     * @param {string} text - Texte à échapper
     * @returns {string} Texte échappé
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Fait défiler la console vers le bas
     */
    scrollToBottom() {
        if (this.container) {
            this.container.scrollTop = this.container.scrollHeight;
        }
    }

    /**
     * Limite le nombre de messages affichés
     */
    limitMessages() {
        const messages = this.container.querySelectorAll('.console-text');
        if (messages.length > this.maxMessages) {
            const toRemove = messages.length - this.maxMessages;
            for (let i = 0; i < toRemove; i++) {
                messages[i].remove();
            }
        }
    }

    /**
     * Nettoie les anciens messages
     */
    cleanup() {
        const messages = this.container.querySelectorAll('.console-text');
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30 minutes
        
        messages.forEach(message => {
            const timestamp = message.getAttribute('data-timestamp');
            if (timestamp && (now - parseInt(timestamp)) > maxAge) {
                message.remove();
            }
        });
    }

    /**
     * Efface tous les messages
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
            this.log('Console effacée', 'system');
        }
    }

    /**
     * Ajoute un message système
     * @param {string} text - Texte du message
     */
    system(text) {
        this.log(text, 'system');
    }

    /**
     * Ajoute un message de l'IA
     * @param {string} text - Texte du message
     */
    ai(text) {
        this.log(text, 'ai');
    }

    /**
     * Ajoute un message utilisateur
     * @param {string} text - Texte du message
     */
    user(text) {
        this.log(text, 'user');
    }

    /**
     * Ajoute un message d'erreur
     * @param {string} text - Texte du message
     */
    error(text) {
        this.log(text, 'error');
    }

    /**
     * Ajoute un message vocal
     * @param {string} text - Texte du message
     */
    voice(text) {
        this.log(text, 'voice');
    }

    /**
     * Ajoute un message d'avertissement
     * @param {string} text - Texte du message
     */
    warning(text) {
        this.log(text, 'warning');
    }

    /**
     * Ajoute un message d'information
     * @param {string} text - Texte du message
     */
    info(text) {
        this.log(text, 'info');
    }

    /**
     * Configure le logger
     * @param {Object} options - Options de configuration
     */
    configure(options = {}) {
        if (options.maxMessages) this.maxMessages = options.maxMessages;
        if (options.containerId) {
            this.container = document.getElementById(options.containerId);
        }
    }

    /**
     * Retourne les statistiques du logger
     * @returns {Object} Statistiques
     */
    getStats() {
        const messages = this.container.querySelectorAll('.console-text');
        const stats = {
            total: messages.length,
            byType: {}
        };

        // Compter par type
        Object.keys(this.messageTypes).forEach(type => {
            stats.byType[type] = this.container.querySelectorAll(`.console-text.${type}`).length;
        });

        return stats;
    }

    /**
     * Exporte les messages vers un format JSON
     * @returns {Array} Messages exportés
     */
    export() {
        const messages = this.container.querySelectorAll('.console-text');
        return Array.from(messages).map(message => {
            const type = Array.from(message.classList)
                .find(cls => Object.keys(this.messageTypes).includes(cls)) || 'system';
            
            return {
                type,
                text: message.querySelector('.message-content')?.textContent || '',
                timestamp: message.querySelector('.text-gray-400')?.textContent || '',
                html: message.innerHTML
            };
        });
    }
}

// Créer une instance globale
window.consoleLogger = new ConsoleLogger();
