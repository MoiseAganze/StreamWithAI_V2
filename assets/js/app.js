/**
 * Application principale StreamWithAI
 * Orchestre tous les modules et gère l'initialisation
 */

class StreamWithAI {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        
        // Configuration par défaut
        this.config = {
            captureDebounceMs: 500,
            maxRetries: 3,
            retryDelay: 1000,
            enableDebug: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        };
    }

    /**
     * Initialise l'application
     */
    async init() {
        try {
            console.log('[StreamWithAI] Initializing application...');
            
            // Attendre que le DOM soit prêt
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialiser les modules dans l'ordre
            await this.initializeModules();
            
            // Configurer les événements
            this.setupEventHandlers();
            
            // Initialiser l'interface utilisateur
            this.initializeUI();
            
            this.isInitialized = true;
            console.log('[StreamWithAI] Application initialized successfully');
            
            // Émettre l'événement d'initialisation
            if (window.eventBus) {
                window.eventBus.emit('app:initialized');
            }
            
        } catch (error) {
            console.error('[StreamWithAI] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Initialise tous les modules
     */
    async initializeModules() {
        // Vérifier que tous les modules sont disponibles
        const requiredModules = [
            'eventBus',
            'imageUploader', 
            'consoleLogger',
            'statusManager',
            'screenCapture',
            'speechRecognition',
            'speechSynthesisModule',
            'aiConnector'
        ];

        for (const moduleName of requiredModules) {
            if (!window[moduleName]) {
                throw new Error(`Required module not found: ${moduleName}`);
            }
        }

        // Stocker les références aux modules
        this.modules = {
            eventBus: window.eventBus,
            imageUploader: window.imageUploader,
            consoleLogger: window.consoleLogger,
            statusManager: window.statusManager,
            screenCapture: window.screenCapture,
            speechRecognition: window.speechRecognition,
            speechSynthesis: window.speechSynthesisModule,
            aiConnector: window.aiConnector
        };

        // Configurer les modules
        this.configureModules();
    }

    /**
     * Configure les modules avec les paramètres optimaux
     */
    configureModules() {
        // Configurer l'uploader d'images
        this.modules.imageUploader.configure({
            compressionQuality: 0.8,
            maxWidth: 800,
            retryAttempts: this.config.maxRetries,
            retryDelay: this.config.retryDelay
        });

        // Configurer le logger
        this.modules.consoleLogger.configure({
            maxMessages: 100
        });

        // Configurer la capture d'écran
        this.modules.screenCapture.configure({
            captureDebounceMs: this.config.captureDebounceMs,
            captureQuality: 0.8,
            maxWidth: 800
        });

        // Configurer la reconnaissance vocale
        this.modules.speechRecognition.configure({
            language: 'fr-FR',
            retryAttempts: this.config.maxRetries,
            retryDelay: this.config.retryDelay,
            autoRestart: true
        });

        // Configurer la synthèse vocale
        this.modules.speechSynthesis.configure({
            language: 'fr-FR',
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            autoStart: true
        });

        // Configurer le connecteur IA
        this.modules.aiConnector.configure({
            timeout: 15000,
            retryAttempts: this.config.maxRetries,
            retryDelay: this.config.retryDelay,
            maxHistoryLength: 50
        });

        // Activer le debug si nécessaire
        if (this.config.enableDebug) {
            this.modules.eventBus.enableDebug();
        }
    }

    /**
     * Configure les gestionnaires d'événements
     */
    setupEventHandlers() {
        const { eventBus, consoleLogger } = this.modules;

        // Écouter les événements de statut
        eventBus.on('status:screenShare', (data) => {
            consoleLogger.system(`Partage d'écran: ${data.active ? 'activé' : 'désactivé'}`);
        });

        eventBus.on('status:recognition', (data) => {
            consoleLogger.info(`Reconnaissance vocale: ${data.active ? 'activée' : 'désactivée'}`);
        });

        eventBus.on('status:ai', (data) => {
            consoleLogger.info(`IA: ${data.active ? 'traitement en cours' : 'inactive'}`);
        });

        eventBus.on('status:voice', (data) => {
            consoleLogger.info(`Synthèse vocale: ${data.active ? 'active' : 'inactive'}`);
        });

        // Écouter les erreurs
        eventBus.on('error', (error) => {
            consoleLogger.error(`Erreur: ${error.message || error}`);
        });
    }

    /**
     * Initialise l'interface utilisateur
     */
    initializeUI() {
        // Initialiser les icônes Lucide
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Configurer les boutons
        this.setupButtons();

        // Initialiser les modules d'interface
        this.initializeInterfaceModules();
    }

    /**
     * Configure les boutons de l'interface
     */
    setupButtons() {
        // Boutons de partage d'écran
        const shareButton = document.getElementById('share-button');
        const stopButton = document.getElementById('stop-share-button');
        
        if (shareButton) {
            shareButton.onclick = () => this.startScreenShare();
        }
        
        if (stopButton) {
            stopButton.onclick = () => this.stopScreenShare();
        }

        // Boutons de reconnaissance vocale
        const startRecognitionButton = document.getElementById('start-recognition-button');
        const stopRecognitionButton = document.getElementById('stop-recognition-button');
        
        if (startRecognitionButton) {
            startRecognitionButton.onclick = () => this.startSpeechRecognition();
        }
        
        if (stopRecognitionButton) {
            stopRecognitionButton.onclick = () => this.stopSpeechRecognition();
        }

        // Bouton d'arrêt de la voix
        const stopVoiceButton = document.getElementById('stop-voice-button');
        if (stopVoiceButton) {
            stopVoiceButton.onclick = () => this.stopVoice();
        }
    }

    /**
     * Initialise les modules d'interface
     */
    initializeInterfaceModules() {
        // Démarrer automatiquement la reconnaissance vocale après un délai
        setTimeout(() => {
            if (this.modules.speechRecognition && this.modules.speechRecognition.isSupported()) {
                this.modules.speechRecognition.start();
            }
        }, 1000);
        
        console.log('[StreamWithAI] Interface modules initialized');
    }



    /**
     * Méthodes publiques pour l'interface utilisateur
     */
    
    // Partage d'écran
    async startScreenShare() {
        if (this.modules.screenCapture) {
            this.modules.screenCapture.startScreenShare();
        }
    }

    stopScreenShare() {
        if (this.modules.screenCapture) {
            this.modules.screenCapture.stopScreenShare();
        }
    }

    // Reconnaissance vocale
    startSpeechRecognition() {
        if (this.modules.speechRecognition) {
            this.modules.speechRecognition.start();
        }
    }

    stopSpeechRecognition() {
        if (this.modules.speechRecognition) {
            this.modules.speechRecognition.stop();
        }
    }

    // Synthèse vocale
    stopVoice() {
        if (this.modules.speechSynthesis) {
            this.modules.speechSynthesis.stop();
        }
    }

    /**
     * Retourne les statistiques de l'application
     * @returns {Object} Statistiques
     */
    getStats() {
        return {
            initialized: this.isInitialized,
            modules: Object.keys(this.modules),
            status: this.modules.statusManager.getStats(),
            console: this.modules.consoleLogger.getStats(),
            imageCache: this.modules.imageUploader.getCacheStats(),
            screenCapture: this.modules.screenCapture.getState(),
            speechRecognition: this.modules.speechRecognition.getState(),
            speechSynthesis: this.modules.speechSynthesis.getState(),
            aiConnector: this.modules.aiConnector.getStats()
        };
    }

    /**
     * Configure l'application
     * @param {Object} config - Configuration
     */
    configure(config) {
        this.config = { ...this.config, ...config };
        this.configureModules();
    }
}

// Créer et initialiser l'application
window.streamWithAI = new StreamWithAI();

// Initialiser automatiquement quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.streamWithAI.init().catch(console.error);
    });
} else {
    window.streamWithAI.init().catch(console.error);
}
