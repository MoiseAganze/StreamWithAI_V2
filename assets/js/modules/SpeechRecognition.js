/**
 * SpeechRecognition - Gestion de la reconnaissance vocale optimisée
 * Inclut la gestion des états, retry automatique et gestion des conflits audio
 */
class SpeechRecognition {
    constructor() {
        this.recognition = null;
        this.isActive = false;
        this.isListening = false;
        this.recognitionStarting = false;
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        this.autoRestart = true;
        this.language = 'fr-FR';
        
        // Éléments DOM
        this.elements = {
            startButton: document.getElementById('start-recognition-button'),
            stopButton: document.getElementById('stop-recognition-button')
        };
        
        this.isInitialized = false;
        this.init();
    }

    /**
     * Initialise le module
     */
    init() {
        if (!this.isSupported()) {
            console.error('[SpeechRecognition] Reconnaissance vocale non supportée');
            this.disableButtons();
            return;
        }

        this.setupRecognition();
        this.isInitialized = true;
        
        // Écouter les événements du bus
        if (window.eventBus) {
            this.setupEventListeners();
        }
        
        console.log('[SpeechRecognition] Module initialisé');
    }

    /**
     * Vérifie si la reconnaissance vocale est supportée
     * @returns {boolean} Si la reconnaissance vocale est supportée
     */
    isSupported() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    /**
     * Configure la reconnaissance vocale
     */
    setupRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configuration de base
        this.recognition.lang = this.language;
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        // Gestionnaires d'événements
        this.recognition.onstart = this.handleStart.bind(this);
        this.recognition.onend = this.handleEnd.bind(this);
        this.recognition.onresult = this.handleResult.bind(this);
        this.recognition.onerror = this.handleError.bind(this);
    }

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Écouter les événements de reconnaissance vocale
        window.eventBus.on('speechRecognition:start', this.start.bind(this));
        window.eventBus.on('speechRecognition:stop', this.stop.bind(this));
        
        // Écouter les changements d'état
        window.eventBus.on('status:voice', (data) => {
            if (data.active && this.isListening) {
                this.pauseRecognition();
            }
        });
    }

    /**
     * Démarre la reconnaissance vocale
     */
    start() {
        if (this.isActive) {
            console.log('[SpeechRecognition] Reconnaissance déjà active');
            return;
        }

        this.isActive = true;
        this.safeStartRecognition();
        
        // Mettre à jour les boutons
        this.updateButtonStates();
    }

    /**
     * Arrête la reconnaissance vocale
     */
    stop() {
        if (!this.isActive) {
            console.log('[SpeechRecognition] Reconnaissance déjà arrêtée');
            return;
        }

        this.isActive = false;
        this.autoRestart = false;
        
        try {
            if (this.recognition) {
                this.recognition.stop();
            }
        } catch (error) {
            console.warn('[SpeechRecognition] Erreur lors de l\'arrêt:', error);
        }
        
        // Mettre à jour les boutons
        this.updateButtonStates();
    }

    /**
     * Démarre la reconnaissance de manière sécurisée
     */
    safeStartRecognition() {
        if (this.recognitionStarting) {
            console.log('[SpeechRecognition] Démarrage déjà en cours');
            return;
        }

        try {
            this.recognitionStarting = true;
            this.recognition.start();
            
            if (window.consoleLogger) {
                window.consoleLogger.info('Démarrage de la reconnaissance vocale');
            }
            
        } catch (error) {
            this.recognitionStarting = false;
            
            if (error.message.includes('already started')) {
                console.log('[SpeechRecognition] Reconnaissance déjà active - attente...');
                setTimeout(() => {
                    this.recognitionStarting = false;
                }, 2000);
            } else {
                console.error('[SpeechRecognition] Erreur lors du démarrage:', error);
                this.handleStartupError(error);
            }
        }
    }

    /**
     * Gère les erreurs de démarrage
     * @param {Error} error - Erreur de démarrage
     */
    handleStartupError(error) {
        if (window.consoleLogger) {
            window.consoleLogger.error(`Erreur de démarrage: ${error.message}`);
        }
        
        // Réessayer après un délai
        setTimeout(() => {
            this.recognitionStarting = false;
            if (this.isActive) {
                this.safeStartRecognition();
            }
        }, this.retryDelay);
    }

    /**
     * Met en pause la reconnaissance (quand la synthèse vocale parle)
     */
    pauseRecognition() {
        if (this.isListening) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.warn('[SpeechRecognition] Erreur lors de la pause:', error);
            }
        }
    }

    /**
     * Gère le début de la reconnaissance
     */
    handleStart() {
        this.isListening = true;
        this.recognitionStarting = false;
        
        // Arrêter la synthèse vocale si elle parle
        if (window.eventBus) {
            window.eventBus.emit('speechSynthesis:stop');
        }
        
        // Mettre à jour le statut
        if (window.statusManager) {
            window.statusManager.setRecognitionActive(true, 'Reconnaissance vocale: écoute en cours');
        }
        
        if (window.consoleLogger) {
            window.consoleLogger.user('Micro activé - écoute en cours');
        }
        
        // Mettre à jour les boutons
        this.updateButtonStates();
    }

    /**
     * Gère la fin de la reconnaissance
     */
    handleEnd() {
        this.isListening = false;
        
        if (window.statusManager) {
            window.statusManager.setRecognitionActive(false, 'Reconnaissance vocale: en attente');
        }
        
        if (window.consoleLogger) {
            window.consoleLogger.user('Micro désactivé');
        }
        
        // Réactiver l'écoute après un court délai si toujours actif
        if (this.isActive && this.autoRestart) {
            setTimeout(() => {
                if (this.isActive && !this.isListening) {
                    this.safeStartRecognition();
                }
            }, 800);
        }
        
        // Mettre à jour les boutons
        this.updateButtonStates();
    }

    /**
     * Gère les résultats de reconnaissance
     * @param {SpeechRecognitionEvent} event - Événement de reconnaissance
     */
    handleResult(event) {
        const transcript = event.results[0][0].transcript.trim();
        if (!transcript) return;

        console.log('[SpeechRecognition] Transcription:', transcript);
        
        // Émettre l'événement de reconnaissance
        if (window.eventBus) {
            window.eventBus.emit('app:speech', { 
                transcript,
                confidence: event.results[0][0].confidence
            });
        }
        
        // Demander une capture d'écran si disponible
        if (window.eventBus) {
            window.eventBus.emit('capture:request', { message: transcript });
        }
    }

    /**
     * Gère les erreurs de reconnaissance
     * @param {SpeechRecognitionErrorEvent} event - Événement d'erreur
     */
    handleError(event) {
        console.warn('[SpeechRecognition] Erreur:', event.error);
        
        let errorMessage = '';
        let shouldRetry = true;
        
        switch (event.error) {
            case 'no-speech':
                errorMessage = 'Aucune parole détectée';
                shouldRetry = true;
                break;
                
            case 'audio-capture':
                errorMessage = 'Impossible de capturer l\'audio - vérifiez votre microphone';
                shouldRetry = false;
                break;
                
            case 'not-allowed':
                errorMessage = 'Microphone non autorisé - vérifiez les permissions';
                shouldRetry = false;
                this.isActive = false;
                break;
                
            case 'network':
                errorMessage = 'Erreur réseau';
                shouldRetry = true;
                break;
                
            default:
                errorMessage = `Erreur de reconnaissance vocale: ${event.error}`;
                shouldRetry = true;
        }
        
        // Mettre à jour le statut
        if (window.statusManager) {
            window.statusManager.setRecognitionActive(false, `Reconnaissance vocale: ${errorMessage}`);
        }
        
        if (window.consoleLogger) {
            if (event.error === 'no-speech') {
                window.consoleLogger.info(errorMessage);
            } else {
                window.consoleLogger.error(errorMessage);
            }
        }
        
        // Réessayer si nécessaire
        if (shouldRetry && this.isActive && this.autoRestart) {
            setTimeout(() => {
                if (this.isActive && !this.isListening) {
                    this.safeStartRecognition();
                }
            }, this.retryDelay);
        }
    }

    /**
     * Met à jour l'état des boutons
     */
    updateButtonStates() {
        if (this.elements.startButton) {
            this.elements.startButton.classList.toggle('hidden', this.isActive);
        }
        
        if (this.elements.stopButton) {
            this.elements.stopButton.classList.toggle('hidden', !this.isActive);
        }
    }

    /**
     * Désactive les boutons (quand non supporté)
     */
    disableButtons() {
        if (this.elements.startButton) {
            this.elements.startButton.disabled = true;
            this.elements.startButton.classList.add('opacity-50');
            this.elements.startButton.classList.remove('pulse');
        }
        
        if (window.statusManager) {
            window.statusManager.setRecognitionActive(false, 'Reconnaissance vocale: non supportée');
        }
    }

    /**
     * Configure le module
     * @param {Object} options - Options de configuration
     */
    configure(options = {}) {
        if (options.language) this.language = options.language;
        if (options.retryAttempts) this.retryAttempts = options.retryAttempts;
        if (options.retryDelay) this.retryDelay = options.retryDelay;
        if (options.autoRestart !== undefined) this.autoRestart = options.autoRestart;
        
        if (this.recognition) {
            this.recognition.lang = this.language;
        }
    }

    /**
     * Retourne l'état actuel du module
     * @returns {Object} État du module
     */
    getState() {
        return {
            isActive: this.isActive,
            isListening: this.isListening,
            isSupported: this.isSupported(),
            language: this.language,
            autoRestart: this.autoRestart
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
window.speechRecognition = new SpeechRecognition();
