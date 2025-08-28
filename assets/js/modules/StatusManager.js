/**
 * StatusManager - Gestion des états de l'application
 * Centralise la gestion des indicateurs de statut et des états
 */
class StatusManager {
    constructor() {
        this.states = {
            screenShare: { active: false, text: 'En attente de partage d\'écran' },
            recognition: { active: false, text: 'Reconnaissance vocale: inactive' },
            voice: { active: false, text: 'Synthèse vocale: inactive' },
            ai: { active: false, text: 'IA: inactive' },
            upload: { active: false, text: 'Upload: inactive' }
        };
        
        this.elements = {
            statusIndicator: document.getElementById('status-indicator'),
            statusText: document.getElementById('status-text'),
            recognitionStatus: document.getElementById('recognition-status')
        };
        
        this.isInitialized = false;
        this.init();
    }

    /**
     * Initialise le gestionnaire de statut
     */
    init() {
        if (!this.elements.statusIndicator || !this.elements.statusText) {
            console.error('[StatusManager] Required elements not found');
            return;
        }

        this.isInitialized = true;
        this.updateDisplay();
        
        // Écouter les événements du bus
        if (window.eventBus) {
            this.setupEventListeners();
        }
    }

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Écouter les changements d'état
        window.eventBus.on('status:screenShare', this.handleScreenShareChange.bind(this));
        window.eventBus.on('status:recognition', this.handleRecognitionChange.bind(this));
        window.eventBus.on('status:voice', this.handleVoiceChange.bind(this));
        window.eventBus.on('status:ai', this.handleAIChange.bind(this));
        window.eventBus.on('status:upload', this.handleUploadChange.bind(this));
    }

    /**
     * Met à jour l'affichage du statut
     */
    updateDisplay() {
        if (!this.isInitialized) return;

        // Déterminer l'état principal (le plus important)
        const primaryState = this.getPrimaryState();
        
        // Mettre à jour l'indicateur principal
        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.className = `status-indicator ${primaryState.active ? 'active' : ''}`;
        }
        
        // Mettre à jour le texte principal
        if (this.elements.statusText) {
            this.elements.statusText.textContent = primaryState.text;
        }
        
        // Mettre à jour le statut de reconnaissance vocale
        if (this.elements.recognitionStatus) {
            this.elements.recognitionStatus.textContent = this.states.recognition.text;
        }
    }

    /**
     * Détermine l'état principal à afficher
     * @returns {Object} État principal
     */
    getPrimaryState() {
        // Priorité des états
        const priorities = ['recognition', 'voice', 'ai', 'upload', 'screenShare'];
        
        for (const priority of priorities) {
            if (this.states[priority].active) {
                return this.states[priority];
            }
        }
        
        return this.states.screenShare; // État par défaut
    }

    /**
     * Met à jour un état spécifique
     * @param {string} stateName - Nom de l'état
     * @param {boolean} active - Si l'état est actif
     * @param {string} text - Texte à afficher
     */
    updateState(stateName, active, text = null) {
        if (!this.states[stateName]) {
            console.warn(`[StatusManager] Unknown state: ${stateName}`);
            return;
        }

        const oldState = { ...this.states[stateName] };
        
        this.states[stateName].active = active;
        if (text !== null) {
            this.states[stateName].text = text;
        }

        // Émettre un événement si l'état a changé
        if (oldState.active !== active || oldState.text !== this.states[stateName].text) {
            if (window.eventBus) {
                window.eventBus.emit(`status:${stateName}`, {
                    active,
                    text: this.states[stateName].text,
                    previous: oldState
                });
            }
        }

        this.updateDisplay();
    }

    /**
     * Gère les changements d'état du partage d'écran
     * @param {Object} data - Données de l'événement
     */
    handleScreenShareChange(data) {
        this.updateState('screenShare', data.active, data.text);
    }

    /**
     * Gère les changements d'état de la reconnaissance vocale
     * @param {Object} data - Données de l'événement
     */
    handleRecognitionChange(data) {
        this.updateState('recognition', data.active, data.text);
    }

    /**
     * Gère les changements d'état de la synthèse vocale
     * @param {Object} data - Données de l'événement
     */
    handleVoiceChange(data) {
        this.updateState('voice', data.active, data.text);
    }

    /**
     * Gère les changements d'état de l'IA
     * @param {Object} data - Données de l'événement
     */
    handleAIChange(data) {
        this.updateState('ai', data.active, data.text);
    }

    /**
     * Gère les changements d'état de l'upload
     * @param {Object} data - Données de l'événement
     */
    handleUploadChange(data) {
        this.updateState('upload', data.active, data.text);
    }

    /**
     * Méthodes de convenance pour chaque état
     */
    
    // Partage d'écran
    setScreenShareActive(active, text = null) {
        const defaultText = active ? 'Partage d\'écran actif' : 'En attente de partage d\'écran';
        this.updateState('screenShare', active, text || defaultText);
    }

    // Reconnaissance vocale
    setRecognitionActive(active, text = null) {
        const defaultText = active ? 'Reconnaissance vocale: écoute en cours' : 'Reconnaissance vocale: inactive';
        this.updateState('recognition', active, text || defaultText);
    }

    // Synthèse vocale
    setVoiceActive(active, text = null) {
        const defaultText = active ? 'Synthèse vocale: active' : 'Synthèse vocale: inactive';
        this.updateState('voice', active, text || defaultText);
    }

    // IA
    setAIActive(active, text = null) {
        const defaultText = active ? 'IA: traitement en cours' : 'IA: inactive';
        this.updateState('ai', active, text || defaultText);
    }

    // Upload
    setUploadActive(active, text = null) {
        const defaultText = active ? 'Upload: en cours' : 'Upload: inactive';
        this.updateState('upload', active, text || defaultText);
    }

    /**
     * Retourne l'état actuel d'un état spécifique
     * @param {string} stateName - Nom de l'état
     * @returns {Object|null} État actuel ou null
     */
    getState(stateName) {
        return this.states[stateName] || null;
    }

    /**
     * Retourne tous les états
     * @returns {Object} Tous les états
     */
    getAllStates() {
        return { ...this.states };
    }

    /**
     * Vérifie si un état est actif
     * @param {string} stateName - Nom de l'état
     * @returns {boolean} Si l'état est actif
     */
    isActive(stateName) {
        return this.states[stateName]?.active || false;
    }

    /**
     * Retourne les statistiques des états
     * @returns {Object} Statistiques
     */
    getStats() {
        const activeStates = Object.entries(this.states)
            .filter(([_, state]) => state.active)
            .map(([name, _]) => name);

        return {
            totalStates: Object.keys(this.states).length,
            activeStates: activeStates.length,
            activeStateNames: activeStates,
            states: this.states
        };
    }

    /**
     * Réinitialise tous les états
     */
    reset() {
        Object.keys(this.states).forEach(stateName => {
            this.updateState(stateName, false);
        });
    }

    /**
     * Configure le gestionnaire de statut
     * @param {Object} options - Options de configuration
     */
    configure(options = {}) {
        if (options.elements) {
            this.elements = { ...this.elements, ...options.elements };
        }
        
        if (options.states) {
            this.states = { ...this.states, ...options.states };
        }
    }
}

// Créer une instance globale
window.statusManager = new StatusManager();
