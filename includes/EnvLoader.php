<?php

/**
 * EnvLoader - Gestionnaire de variables d'environnement
 * Charge les variables depuis un fichier .env et les rend disponibles
 */
class EnvLoader {
    private static $instance = null;
    private $env = [];
    private $envFile = '.env';

    private function __construct() {
        $this->loadEnvFile();
    }

    /**
     * Instance singleton
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Charge le fichier .env
     */
    private function loadEnvFile() {
        $envPath = dirname(__DIR__) . '/' . $this->envFile;
        
        if (!file_exists($envPath)) {
            // Si le fichier .env n'existe pas, utiliser les valeurs par défaut
            $this->setDefaultValues();
            return;
        }

        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Ignorer les commentaires
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            // Parser les variables
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Supprimer les guillemets si présents
                $value = trim($value, '"\'');
                
                $this->env[$key] = $value;
            }
        }
    }

    /**
     * Définit les valeurs par défaut si le fichier .env n'existe pas
     */
    private function setDefaultValues() {
        $this->env = [
            'AI_API_URL' => '' // Pas de valeur par défaut pour l'IA personnalisée
        ];
    }

    /**
     * Récupère une variable d'environnement
     * @param string $key - Clé de la variable
     * @param mixed $default - Valeur par défaut si la variable n'existe pas
     * @return mixed
     */
    public function get($key, $default = null) {
        return $this->env[$key] ?? $default;
    }

    /**
     * Vérifie si une variable existe
     * @param string $key - Clé de la variable
     * @return bool
     */
    public function has($key) {
        return isset($this->env[$key]);
    }

    /**
     * Retourne l'URL de l'API IA
     * @return string
     */
    public function getAIApiUrl() {
        return $this->get('AI_API_URL', '');
    }
}
