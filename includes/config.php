<?php
/**
 * Configuration globale de l'application StreamWithAI
 */

// Charger les variables d'environnement
require_once __DIR__ . '/EnvLoader.php';
$env = EnvLoader::getInstance();

// === CONFIGURATION API ===
define('AI_API_URL', $env->getAIApiUrl());
define('AI_API_TIMEOUT', 15);
define('AI_API_SYSTEM_PROMPT', 'Reponds en francais au message de user');

// === CONFIGURATION UPLOAD ===
define('UPLOAD_SERVICE_URL', 'https://tmpfiles.org/api/v1/upload');
define('UPLOAD_TIMEOUT', 10);

// === CONFIGURATION APPLICATION ===
define('APP_NAME', 'StreamWithAI');
define('APP_VERSION', '2.0.0');
define('APP_DEBUG', false);

// === CONFIGURATION PERFORMANCE ===
define('CAPTURE_QUALITY', 0.8); // Qualité de compression des images (0.1 à 1.0)
define('MAX_CAPTURE_SIZE', 1024 * 1024); // Taille max en bytes (1MB)
define('CAPTURE_DEBOUNCE_MS', 500); // Délai entre captures en ms

// === CONFIGURATION SÉCURITÉ ===
define('ALLOWED_ORIGINS', $env->getArray('CORS_ALLOWED_ORIGINS', ',', ['*'])); // CORS - à restreindre en production
define('MAX_REQUEST_SIZE', 10 * 1024 * 1024); // 10MB max

// === CONFIGURATION LOGGING ===
define('LOG_ENABLED', true);
define('LOG_LEVEL', 'INFO'); // DEBUG, INFO, WARNING, ERROR

// === FONCTIONS UTILITAIRES ===

/**
 * Vérifie si l'application est en mode debug
 */
function isDebugMode() {
    return APP_DEBUG;
}

/**
 * Log un message selon le niveau configuré
 */
function logMessage($message, $level = 'INFO') {
    if (!LOG_ENABLED) return;
    
    $levels = ['DEBUG' => 0, 'INFO' => 1, 'WARNING' => 2, 'ERROR' => 3];
    $currentLevel = $levels[LOG_LEVEL] ?? 1;
    $messageLevel = $levels[$level] ?? 1;
    
    if ($messageLevel >= $currentLevel) {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[$timestamp] [$level] $message" . PHP_EOL;
        
        if (isDebugMode()) {
            error_log($logMessage);
        }
    }
}

/**
 * Valide l'origine de la requête (CORS)
 */
function validateOrigin() {
    if (in_array('*', ALLOWED_ORIGINS)) {
        return true;
    }
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    return in_array($origin, ALLOWED_ORIGINS);
}

/**
 * Nettoie et valide les paramètres d'entrée
 */
function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

/**
 * Génère une réponse JSON standardisée
 */
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Vérifie la taille de la requête
 */
function checkRequestSize() {
    $contentLength = $_SERVER['CONTENT_LENGTH'] ?? 0;
    if ($contentLength > MAX_REQUEST_SIZE) {
        jsonResponse([
            'status' => 'error',
            'message' => 'Request too large',
            'max_size' => MAX_REQUEST_SIZE
        ], 413);
    }
}
