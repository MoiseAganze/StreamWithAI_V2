/**
 * ImageUploader - Gestion optimisée de l'upload d'images
 * Inclut la compression, le cache et la gestion d'erreurs
 */
class ImageUploader {
    constructor() {
        this.uploadServiceUrl = 'https://tmpfiles.org/api/v1/upload';
        this.cache = new Map();
        this.maxCacheSize = 10; // Nombre max d'images en cache
        this.compressionQuality = 0.8;
        this.maxWidth = 800;
        this.retryAttempts = 3;
        this.retryDelay = 1000; // ms
    }

    /**
     * Configure les paramètres d'upload
     * @param {Object} options - Options de configuration
     */
    configure(options = {}) {
        if (options.uploadServiceUrl) this.uploadServiceUrl = options.uploadServiceUrl;
        if (options.compressionQuality) this.compressionQuality = options.compressionQuality;
        if (options.maxWidth) this.maxWidth = options.maxWidth;
        if (options.retryAttempts) this.retryAttempts = options.retryAttempts;
        if (options.retryDelay) this.retryDelay = options.retryDelay;
    }

    /**
     * Compresse une image pour réduire sa taille
     * @param {Blob|File} imageBlob - Image à compresser
     * @returns {Promise<Blob>} Image compressée
     */
    async compressImage(imageBlob) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                try {
                    // Calculer les nouvelles dimensions
                    const { width, height } = this.calculateDimensions(img.width, img.height);
                    
                    canvas.width = width;
                    canvas.height = height;

                    // Dessiner l'image redimensionnée
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convertir en blob avec compression
                    canvas.toBlob(
                        (compressedBlob) => {
                            if (compressedBlob) {
                                resolve(compressedBlob);
                            } else {
                                reject(new Error('Failed to compress image'));
                            }
                        },
                        'image/jpeg',
                        this.compressionQuality
                    );
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => reject(new Error('Failed to load image for compression'));
            img.src = URL.createObjectURL(imageBlob);
        });
    }

    /**
     * Calcule les nouvelles dimensions en conservant le ratio
     * @param {number} originalWidth - Largeur originale
     * @param {number} originalHeight - Hauteur originale
     * @returns {Object} Nouvelles dimensions
     */
    calculateDimensions(originalWidth, originalHeight) {
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
     * Génère une clé de cache pour une image
     * @param {Blob} imageBlob - Image
     * @returns {string} Clé de cache
     */
    generateCacheKey(imageBlob) {
        return `${imageBlob.size}_${imageBlob.lastModified}_${imageBlob.name || 'screenshot'}`;
    }

    /**
     * Vérifie si une image est en cache
     * @param {Blob} imageBlob - Image à vérifier
     * @returns {string|null} URL en cache ou null
     */
    getFromCache(imageBlob) {
        const key = this.generateCacheKey(imageBlob);
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
            return cached.url;
        }
        
        // Supprimer l'entrée expirée
        if (cached) {
            this.cache.delete(key);
        }
        
        return null;
    }

    /**
     * Ajoute une image au cache
     * @param {Blob} imageBlob - Image
     * @param {string} url - URL de l'image uploadée
     */
    addToCache(imageBlob, url) {
        const key = this.generateCacheKey(imageBlob);
        
        // Nettoyer le cache si nécessaire
        if (this.cache.size >= this.maxCacheSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        
        this.cache.set(key, {
            url,
            timestamp: Date.now()
        });
    }

    /**
     * Upload une image avec retry automatique
     * @param {Blob} imageBlob - Image à uploader
     * @param {number} attempt - Tentative actuelle
     * @returns {Promise<string>} URL de l'image uploadée
     */
    async uploadWithRetry(imageBlob, attempt = 1) {
        try {
            const formData = new FormData();
            formData.append('file', imageBlob, 'screenshot.jpg');

            const response = await fetch(this.uploadServiceUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.status !== 'success') {
                throw new Error('Upload service error: ' + JSON.stringify(data));
            }

            // Construire l'URL de téléchargement direct
            const parts = data.data.url.split('/');
            const downloadUrl = `${parts[0]}//${parts[2]}/dl/${parts[3]}/${parts[4]}`;
            
            return downloadUrl;

        } catch (error) {
            if (attempt < this.retryAttempts) {
                console.warn(`Upload attempt ${attempt} failed, retrying in ${this.retryDelay}ms:`, error);
                await this.delay(this.retryDelay);
                return this.uploadWithRetry(imageBlob, attempt + 1);
            }
            
            throw error;
        }
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
     * Upload une image avec optimisation
     * @param {Blob|File} imageBlob - Image à uploader
     * @returns {Promise<string>} URL de l'image uploadée
     */
    async upload(imageBlob) {
        try {
            // Vérifier le cache d'abord
            const cachedUrl = this.getFromCache(imageBlob);
            if (cachedUrl) {
                console.log('[ImageUploader] Using cached image URL');
                return cachedUrl;
            }

            // Compresser l'image
            console.log('[ImageUploader] Compressing image...');
            const compressedBlob = await this.compressImage(imageBlob);
            
            console.log(`[ImageUploader] Compression: ${imageBlob.size} -> ${compressedBlob.size} bytes`);

            // Upload avec retry
            console.log('[ImageUploader] Uploading image...');
            const url = await this.uploadWithRetry(compressedBlob);
            
            // Ajouter au cache
            this.addToCache(imageBlob, url);
            
            console.log('[ImageUploader] Upload successful:', url);
            return url;

        } catch (error) {
            console.error('[ImageUploader] Upload failed:', error);
            throw error;
        }
    }

    /**
     * Nettoie le cache
     * @param {number} maxAge - Âge maximum en ms (défaut: 5 minutes)
     */
    clearCache(maxAge = 300000) {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > maxAge) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Retourne les statistiques du cache
     * @returns {Object} Statistiques du cache
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            entries: Array.from(this.cache.entries()).map(([key, value]) => ({
                key,
                age: Date.now() - value.timestamp,
                url: value.url
            }))
        };
    }
}

// Créer une instance globale
window.imageUploader = new ImageUploader();
