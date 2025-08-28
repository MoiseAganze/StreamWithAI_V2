/**
 * ScreenCapture - Gestion du partage d'écran et des captures
 * Inclut la gestion des permissions, la capture optimisée et la gestion d'erreurs
 */
class ScreenCapture {
    constructor() {
        this.screenStream = null;
        this.captureInterval = null;
        this.isActive = false;
        this.captureDebounceMs = 500;
        this.lastCaptureTime = 0;
        this.captureQuality = 0.8;
        this.maxWidth = 800;
        
        // Éléments DOM
        this.elements = {
            lastCapture: document.getElementById('lastCapture'),
            captureOverlay: document.getElementById('capture-overlay'),
            shareButton: document.getElementById('share-button'),
            stopButton: document.getElementById('stop-share-button')
        };
        
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
        
        console.log('[ScreenCapture] Module initialisé');
    }

    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Écouter les événements de partage d'écran
        window.eventBus.on('screenShare:start', this.startScreenShare.bind(this));
        window.eventBus.on('screenShare:stop', this.stopScreenShare.bind(this));
        
        // Écouter les demandes de capture
        window.eventBus.on('capture:request', this.captureAndSend.bind(this));
        
        // Écouter les changements d'état
        window.eventBus.on('status:screenShare', (data) => {
            this.updateButtonStates(data.active);
        });
    }

    /**
     * Démarre le partage d'écran
     */
    async startScreenShare() {
        try {
            if (this.isActive) {
                console.log('[ScreenCapture] Partage d\'écran déjà actif');
                return;
            }

            console.log('[ScreenCapture] Démarrage du partage d\'écran...');
            
            // Demander les permissions de partage d'écran
            this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { 
                    cursor: "always",
                    displaySurface: "monitor"
                },
                audio: false
            });

            this.isActive = true;
            
            // Mettre à jour le statut
            if (window.statusManager) {
                window.statusManager.setScreenShareActive(true, 'Partage d\'écran actif');
            }
            
            if (window.consoleLogger) {
                window.consoleLogger.system('Partage d\'écran démarré avec succès');
            }

            // Gérer la fin du partage d'écran
            this.screenStream.getTracks().forEach(track => {
                track.onended = () => {
                    console.log('[ScreenCapture] Partage d\'écran interrompu par l\'utilisateur');
                    this.stopScreenShare();
                };
            });

            // Émettre l'événement de succès
            if (window.eventBus) {
                window.eventBus.emit('screenShare:started', { stream: this.screenStream });
            }

        } catch (error) {
            console.error('[ScreenCapture] Erreur de partage d\'écran:', error);
            
            if (window.consoleLogger) {
                window.consoleLogger.error(`Erreur de partage d'écran: ${error.message}`);
            }
            
            if (window.statusManager) {
                window.statusManager.setScreenShareActive(false, 'Erreur de partage d\'écran');
            }
            
            // Émettre l'événement d'erreur
            if (window.eventBus) {
                window.eventBus.emit('screenShare:error', { error: error.message });
            }
        }
    }

    /**
     * Arrête le partage d'écran
     */
    stopScreenShare() {
        if (!this.isActive) {
            console.log('[ScreenCapture] Partage d\'écran déjà arrêté');
            return;
        }

        console.log('[ScreenCapture] Arrêt du partage d\'écran...');

        // Arrêter l'intervalle de capture
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
            this.captureInterval = null;
        }

        // Arrêter le stream
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
        }

        this.isActive = false;

        // Mettre à jour le statut
        if (window.statusManager) {
            window.statusManager.setScreenShareActive(false, 'Partage d\'écran arrêté');
        }
        
        if (window.consoleLogger) {
            window.consoleLogger.system('Partage d\'écran arrêté');
        }

        // Émettre l'événement d'arrêt
        if (window.eventBus) {
            window.eventBus.emit('screenShare:stopped');
        }
    }

    /**
     * Capture l'écran et envoie à l'IA
     * @param {Object} data - Données de la demande de capture
     */
    async captureAndSend(data) {
        if (!this.isActive || !this.screenStream) {
            console.log('[ScreenCapture] Pas de partage d\'écran actif, envoi sans image');
            this.sendToAI(data.message, '');
            return;
        }

        // Debouncing pour éviter les captures trop fréquentes
        const now = Date.now();
        if (now - this.lastCaptureTime < this.captureDebounceMs) {
            console.log('[ScreenCapture] Capture ignorée (debouncing)');
            return;
        }
        this.lastCaptureTime = now;

        try {
            console.log('[ScreenCapture] Capture d\'écran en cours...');
            
            // Afficher l'indicateur de capture
            this.showCaptureOverlay(true);

            // Capturer l'écran
            const blob = await this.captureScreen();
            
            if (blob) {
                // Émettre l'événement de capture
                if (window.eventBus) {
                    window.eventBus.emit('app:capture', { 
                        blob, 
                        message: data.message 
                    });
                }
            } else {
                throw new Error('Échec de la capture d\'écran');
            }

        } catch (error) {
            console.error('[ScreenCapture] Erreur de capture:', error);
            
            if (window.consoleLogger) {
                window.consoleLogger.error(`Échec de la capture: ${error.message}`);
            }
            
            // Envoyer quand même le message sans image
            this.sendToAI(data.message, '');
            
        } finally {
            // Masquer l'indicateur de capture
            this.showCaptureOverlay(false);
        }
    }

    /**
     * Capture l'écran actuel
     * @returns {Promise<Blob>} Blob de l'image capturée
     */
    async captureScreen() {
        return new Promise((resolve, reject) => {
            try {
                const video = document.createElement('video');
                video.srcObject = this.screenStream;
                video.play();

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                video.onloadedmetadata = () => {
                    try {
                        // Calculer les dimensions optimales
                        const { width, height } = this.calculateOptimalDimensions(
                            video.videoWidth, 
                            video.videoHeight
                        );

                        canvas.width = width;
                        canvas.height = height;

                        // Dessiner l'image
                        ctx.drawImage(video, 0, 0, width, height);

                        // Convertir en blob
                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    console.log(`[ScreenCapture] Capture réussie: ${blob.size} bytes`);
                                    resolve(blob);
                                } else {
                                    reject(new Error('Échec de la conversion en blob'));
                                }
                            },
                            'image/jpeg',
                            this.captureQuality
                        );

                    } catch (error) {
                        reject(error);
                    }
                };

                video.onerror = () => {
                    reject(new Error('Erreur lors du chargement de la vidéo'));
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Calcule les dimensions optimales pour la capture
     * @param {number} originalWidth - Largeur originale
     * @param {number} originalHeight - Hauteur originale
     * @returns {Object} Nouvelles dimensions
     */
    calculateOptimalDimensions(originalWidth, originalHeight) {
        if (originalWidth <= this.maxWidth) {
            return { width: originalWidth, height: originalHeight };
        }

        const ratio = this.maxWidth / originalWidth;
        return {
            width: this.maxWidth,
            height: Math.round(originalHeight * ratio)
        };
    }

    /**
     * Envoie une requête à l'IA
     * @param {string} message - Message à envoyer
     * @param {string} imageUrl - URL de l'image (optionnel)
     */
    async sendToAI(message, imageUrl) {
        if (window.eventBus) {
            window.eventBus.emit('app:aiRequest', { message, imageUrl });
        }
    }

    /**
     * Affiche ou masque l'overlay de capture
     * @param {boolean} show - Si true, affiche l'overlay
     */
    showCaptureOverlay(show) {
        if (this.elements.captureOverlay) {
            if (show) {
                this.elements.captureOverlay.classList.remove('hidden');
            } else {
                this.elements.captureOverlay.classList.add('hidden');
            }
        }
    }

    /**
     * Met à jour l'image de capture affichée
     * @param {string} imageUrl - URL de l'image
     */
    updateCaptureImage(imageUrl) {
        if (this.elements.lastCapture) {
            this.elements.lastCapture.src = imageUrl;
        }
    }

    /**
     * Met à jour l'état des boutons
     * @param {boolean} isActive - Si le partage est actif
     */
    updateButtonStates(isActive) {
        if (this.elements.shareButton) {
            this.elements.shareButton.disabled = isActive;
            this.elements.shareButton.classList.toggle('opacity-50', isActive);
        }
        
        if (this.elements.stopButton) {
            this.elements.stopButton.disabled = !isActive;
            this.elements.stopButton.classList.toggle('opacity-50', !isActive);
        }
    }

    /**
     * Configure le module
     * @param {Object} options - Options de configuration
     */
    configure(options = {}) {
        if (options.captureDebounceMs) this.captureDebounceMs = options.captureDebounceMs;
        if (options.captureQuality) this.captureQuality = options.captureQuality;
        if (options.maxWidth) this.maxWidth = options.maxWidth;
    }

    /**
     * Retourne l'état actuel du module
     * @returns {Object} État du module
     */
    getState() {
        return {
            isActive: this.isActive,
            hasStream: !!this.screenStream,
            captureDebounceMs: this.captureDebounceMs,
            captureQuality: this.captureQuality,
            maxWidth: this.maxWidth
        };
    }

    /**
     * Nettoie les ressources
     */
    cleanup() {
        this.stopScreenShare();
        this.isInitialized = false;
    }
}

// Créer une instance globale
window.screenCapture = new ScreenCapture();
