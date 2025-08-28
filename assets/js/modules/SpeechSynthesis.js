/**
 * SpeechSynthesis - Gestion de la synthèse vocale avec file d'attente
 * Inclut la gestion des conflits audio et l'optimisation des performances
 */
class SpeechSynthesis {
    constructor() {
        this.speechQueue = [];
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.language = 'fr-FR';
        this.rate = 1.0;
        this.pitch = 1.0;
        this.volume = 1.0;
        this.autoStart = true;
        
        // Éléments DOM
        this.elements = {
            stopButton: document.getElementById('stop-voice-button')
        };
        
        this.isInitialized = false;
        this.init();
    }

    /**
     * Initialise le module
     */
    init() {
        if (!this.isSupported()) {
            console.error('[SpeechSynthesis] Synthèse vocale non supportée');
            this.disableButtons();
            return;
        }

        this.isInitialized = true;
        
        // Écouter les événements du bus
        if (window.eventBus) {
            this.setupEventListeners();
        }
        
        console.log('[SpeechSynthesis] Module initialisé');
    }

    /**
     * Vérifie si la synthèse vocale est supportée
     * @returns {boolean} Si la synthèse vocale est supportée
     */
    isSupported() {
        return 'speechSynthesis' in window;
    }

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Écouter les événements de synthèse vocale
        window.eventBus.on('speechSynthesis:start', this.start.bind(this));
        window.eventBus.on('speechSynthesis:stop', this.stop.bind(this));
        window.eventBus.on('speechSynthesis:speak', this.speak.bind(this));
        
        // Écouter les réponses de l'IA
        window.eventBus.on('app:aiResponse', (data) => {
            if (data.message) {
                this.enqueueSpeech(data.message);
            }
        });
        
        // Écouter les changements d'état de reconnaissance vocale
        window.eventBus.on('status:recognition', (data) => {
            if (data.active && this.isSpeaking) {
                this.pauseSpeech();
            }
        });
    }

    /**
     * Démarre la synthèse vocale
     */
    start() {
        if (this.autoStart) {
            this.playNextSpeech();
        }
    }

    /**
     * Arrête la synthèse vocale
     */
    stop() {
        this.stopSpeech();
        this.clearQueue();
        
        // Mettre à jour le statut
        if (window.statusManager) {
            window.statusManager.setVoiceActive(false, 'Synthèse vocale: arrêtée');
        }
        
        if (window.consoleLogger) {
            window.consoleLogger.voice('Synthèse vocale arrêtée');
        }
    }

    /**
     * Ajoute du texte à la file d'attente de synthèse vocale
     * @param {string} text - Texte à synthétiser
     * @param {Object} options - Options de synthèse
     */
    speak(text, options = {}) {
        this.enqueueSpeech(text, options);
    }

    /**
     * Ajoute du texte à la file d'attente
     * @param {string} text - Texte à synthétiser
     * @param {Object} options - Options de synthèse
     */
    enqueueSpeech(text, options = {}) {
        if (!text || !text.trim()) return;

        const speechItem = {
            text: text.trim(),
            options: {
                language: options.language || this.language,
                rate: options.rate || this.rate,
                pitch: options.pitch || this.pitch,
                volume: options.volume || this.volume
            },
            timestamp: Date.now()
        };

        this.speechQueue.push(speechItem);
        
        console.log(`[SpeechSynthesis] Texte ajouté à la file d'attente: "${text.substring(0, 50)}..."`);
        
        // Démarrer la lecture si pas déjà en cours
        if (!this.isSpeaking && this.autoStart) {
            this.playNextSpeech();
        }
    }

    /**
     * Lit le prochain texte de la file d'attente
     */
    playNextSpeech() {
        if (this.speechQueue.length === 0) {
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.hideStopButton();
            
            // Mettre à jour le statut
            if (window.statusManager) {
                window.statusManager.setVoiceActive(false, 'Synthèse vocale: inactive');
            }
            
            return;
        }

        const speechItem = this.speechQueue.shift();
        this.playSpeech(speechItem);
    }

    /**
     * Lit un texte spécifique
     * @param {Object} speechItem - Élément de synthèse vocale
     */
    playSpeech(speechItem) {
        if (!this.isSupported()) {
            console.error('[SpeechSynthesis] Synthèse vocale non supportée');
            return;
        }

        try {
            const utterance = new SpeechSynthesisUtterance(speechItem.text);
            
            // Configurer les paramètres
            utterance.lang = speechItem.options.language;
            utterance.rate = speechItem.options.rate;
            utterance.pitch = speechItem.options.pitch;
            utterance.volume = speechItem.options.volume;

            this.currentUtterance = utterance;
            this.isSpeaking = true;
            
            // Afficher le bouton d'arrêt
            this.showStopButton();
            
            // Mettre à jour le statut
            if (window.statusManager) {
                window.statusManager.setVoiceActive(true, 'Synthèse vocale: active');
            }
            
            if (window.consoleLogger) {
                window.consoleLogger.voice(`Début de la synthèse vocale: "${speechItem.text.substring(0, 50)}..."`);
            }

            // Gestionnaires d'événements
            utterance.onend = () => {
                if (window.consoleLogger) {
                    window.consoleLogger.voice('Fin de la synthèse vocale');
                }
                this.isSpeaking = false;
                this.currentUtterance = null;
                this.playNextSpeech();
            };

            utterance.onerror = (event) => {
                console.error('[SpeechSynthesis] Erreur de synthèse vocale:', event.error);
                
                if (window.consoleLogger) {
                    window.consoleLogger.error(`Erreur de synthèse vocale: ${event.error}`);
                }
                
                this.isSpeaking = false;
                this.currentUtterance = null;
                this.playNextSpeech();
            };

            utterance.onpause = () => {
                console.log('[SpeechSynthesis] Synthèse vocale mise en pause');
            };

            utterance.onresume = () => {
                console.log('[SpeechSynthesis] Synthèse vocale reprise');
            };

            // Démarrer la synthèse
            window.speechSynthesis.speak(utterance);

        } catch (error) {
            console.error('[SpeechSynthesis] Erreur lors de la création de l\'utterance:', error);
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.playNextSpeech();
        }
    }

    /**
     * Met en pause la synthèse vocale
     */
    pauseSpeech() {
        if (this.isSpeaking && this.currentUtterance) {
            try {
                window.speechSynthesis.pause();
                console.log('[SpeechSynthesis] Synthèse vocale mise en pause');
            } catch (error) {
                console.warn('[SpeechSynthesis] Erreur lors de la pause:', error);
            }
        }
    }

    /**
     * Reprend la synthèse vocale
     */
    resumeSpeech() {
        if (this.isSpeaking && this.currentUtterance) {
            try {
                window.speechSynthesis.resume();
                console.log('[SpeechSynthesis] Synthèse vocale reprise');
            } catch (error) {
                console.warn('[SpeechSynthesis] Erreur lors de la reprise:', error);
            }
        }
    }

    /**
     * Arrête la synthèse vocale en cours
     */
    stopSpeech() {
        if (this.isSpeaking || window.speechSynthesis.speaking) {
            try {
                window.speechSynthesis.cancel();
                this.isSpeaking = false;
                this.currentUtterance = null;
                console.log('[SpeechSynthesis] Synthèse vocale arrêtée');
            } catch (error) {
                console.warn('[SpeechSynthesis] Erreur lors de l\'arrêt:', error);
            }
        }
    }

    /**
     * Vide la file d'attente
     */
    clearQueue() {
        this.speechQueue = [];
        console.log('[SpeechSynthesis] File d\'attente vidée');
    }

    /**
     * Affiche le bouton d'arrêt
     */
    showStopButton() {
        if (this.elements.stopButton) {
            this.elements.stopButton.classList.remove('hidden');
        }
    }

    /**
     * Masque le bouton d'arrêt
     */
    hideStopButton() {
        if (this.elements.stopButton) {
            this.elements.stopButton.classList.add('hidden');
        }
    }

    /**
     * Désactive les boutons (quand non supporté)
     */
    disableButtons() {
        if (this.elements.stopButton) {
            this.elements.stopButton.disabled = true;
            this.elements.stopButton.classList.add('opacity-50');
        }
        
        if (window.statusManager) {
            window.statusManager.setVoiceActive(false, 'Synthèse vocale: non supportée');
        }
    }

    /**
     * Configure le module
     * @param {Object} options - Options de configuration
     */
    configure(options = {}) {
        if (options.language) this.language = options.language;
        if (options.rate) this.rate = options.rate;
        if (options.pitch) this.pitch = options.pitch;
        if (options.volume) this.volume = options.volume;
        if (options.autoStart !== undefined) this.autoStart = options.autoStart;
    }

    /**
     * Retourne l'état actuel du module
     * @returns {Object} État du module
     */
    getState() {
        return {
            isSpeaking: this.isSpeaking,
            queueLength: this.speechQueue.length,
            isSupported: this.isSupported(),
            language: this.language,
            rate: this.rate,
            pitch: this.pitch,
            volume: this.volume,
            autoStart: this.autoStart
        };
    }

    /**
     * Retourne les statistiques de la file d'attente
     * @returns {Object} Statistiques
     */
    getQueueStats() {
        return {
            length: this.speechQueue.length,
            items: this.speechQueue.map(item => ({
                text: item.text.substring(0, 50) + (item.text.length > 50 ? '...' : ''),
                timestamp: item.timestamp,
                age: Date.now() - item.timestamp
            }))
        };
    }

    /**
     * Nettoie les ressources
     */
    cleanup() {
        this.stop();
        this.isInitialized = false;
    }
}

// Créer une instance globale
window.speechSynthesisModule = new SpeechSynthesis();
