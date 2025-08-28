/**
 * EventBus - Système de communication entre modules
 * Permet une communication découplée entre les différents composants
 */
class EventBus {
    constructor() {
        this.events = {};
        this.debug = false;
    }

    /**
     * Active le mode debug pour tracer les événements
     */
    enableDebug() {
        this.debug = true;
    }

    /**
     * S'abonne à un événement
     * @param {string} event - Nom de l'événement
     * @param {Function} callback - Fonction à exécuter
     * @param {Object} context - Contexte d'exécution (this)
     * @returns {Function} Fonction pour se désabonner
     */
    on(event, callback, context = null) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        const subscription = {
            callback,
            context,
            id: Date.now() + Math.random()
        };

        this.events[event].push(subscription);

        if (this.debug) {
            console.log(`[EventBus] Subscribed to: ${event} (ID: ${subscription.id})`);
        }

        // Retourner une fonction pour se désabonner
        return () => this.off(event, subscription.id);
    }

    /**
     * Se désabonne d'un événement
     * @param {string} event - Nom de l'événement
     * @param {string|Function} identifier - ID de souscription ou fonction callback
     */
    off(event, identifier) {
        if (!this.events[event]) return;

        if (typeof identifier === 'function') {
            // Supprimer par fonction callback
            this.events[event] = this.events[event].filter(sub => sub.callback !== identifier);
        } else {
            // Supprimer par ID
            this.events[event] = this.events[event].filter(sub => sub.id !== identifier);
        }

        if (this.debug) {
            console.log(`[EventBus] Unsubscribed from: ${event}`);
        }
    }

    /**
     * Émet un événement
     * @param {string} event - Nom de l'événement
     * @param {*} data - Données à passer aux callbacks
     * @param {boolean} async - Si true, exécute les callbacks de manière asynchrone
     */
    emit(event, data = null, async = false) {
        if (!this.events[event]) return;

        if (this.debug) {
            console.log(`[EventBus] Emitting: ${event}`, data);
        }

        const subscriptions = [...this.events[event]]; // Copie pour éviter les modifications pendant l'exécution

        if (async) {
            // Exécution asynchrone
            setTimeout(() => {
                subscriptions.forEach(subscription => {
                    try {
                        subscription.callback.call(subscription.context, data);
                    } catch (error) {
                        console.error(`[EventBus] Error in async event handler for ${event}:`, error);
                    }
                });
            }, 0);
        } else {
            // Exécution synchrone
            subscriptions.forEach(subscription => {
                try {
                    subscription.callback.call(subscription.context, data);
                } catch (error) {
                    console.error(`[EventBus] Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Émet un événement une seule fois
     * @param {string} event - Nom de l'événement
     * @param {*} data - Données à passer aux callbacks
     */
    emitOnce(event, data = null) {
        this.emit(event, data);
        this.events[event] = []; // Vider les abonnements après émission
    }

    /**
     * Supprime tous les abonnements d'un événement
     * @param {string} event - Nom de l'événement
     */
    clear(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }

        if (this.debug) {
            console.log(`[EventBus] Cleared events: ${event || 'all'}`);
        }
    }

    /**
     * Retourne le nombre d'abonnés à un événement
     * @param {string} event - Nom de l'événement
     * @returns {number} Nombre d'abonnés
     */
    listenerCount(event) {
        return this.events[event] ? this.events[event].length : 0;
    }

    /**
     * Retourne la liste des événements actifs
     * @returns {Array} Liste des noms d'événements
     */
    getEvents() {
        return Object.keys(this.events);
    }
}

// Créer une instance globale
window.eventBus = new EventBus();

// Activer le debug en mode développement
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.eventBus.enableDebug();
}
