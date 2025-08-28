<?php
/**
 * Proxy API pour StreamWithAI
 * Gère les requêtes vers l'API IA et l'upload d'images
 */

require_once '../includes/functions.php';

// Gérer les requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(200);
    exit;
}

// Vérifier la taille de la requête
checkRequestSize();

// Valider l'origine si nécessaire
if (!validateOrigin()) {
    jsonResponse([
        'status' => 'error',
        'message' => 'Origin not allowed'
    ], 403);
}

try {
    // Valider les paramètres requis
    $validation = validateRequiredParams($_GET, ['message']);
    if (!$validation['valid']) {
        jsonResponse([
            'status' => 'error',
            'message' => 'Missing required parameters: ' . implode(', ', $validation['missing'])
        ], 400);
    }
    
    // Récupérer et nettoyer les paramètres
    $message = sanitizeInput($_GET['message']);
    $imageUrl = sanitizeInput($_GET['image_url'] ?? '');
    $conversationHistory = [];
    
    // Traiter l'historique de conversation si fourni
    if (isset($_GET['history']) && !empty($_GET['history'])) {
        $historyData = json_decode(urldecode($_GET['history']), true);
        if (is_array($historyData)) {
            $conversationHistory = $historyData;
        }
    }
    
    logMessage("Processing request: message='$message', image='$imageUrl'", 'INFO');
    
    // Envoyer à l'API IA
    $result = sendToAI($message, $imageUrl, $conversationHistory);
    
    if (!$result['success']) {
        handleError($result['error'], 'AI API request failed');
    }
    
    // Retourner la réponse de l'IA
    $aiResponse = $result['data'];
    
    // Si la réponse de l'IA indique une erreur
    if (isset($aiResponse['status']) && $aiResponse['status'] === 'error') {
        jsonResponse($aiResponse, 500);
    }
    
    // Succès
    jsonResponse($aiResponse);
    
} catch (Exception $e) {
    handleError($e->getMessage(), 'Unexpected error');
}
