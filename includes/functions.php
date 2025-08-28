<?php
/**
 * Fonctions utilitaires pour StreamWithAI
 */

require_once 'config.php';

/**
 * Effectue une requête HTTP avec cURL
 */
function makeHttpRequest($url, $options = []) {
    $defaultOptions = [
        'method' => 'GET',
        'timeout' => 30,
        'headers' => [],
        'data' => null,
        'ssl_verify' => false
    ];
    
    $options = array_merge($defaultOptions, $options);
    
    $ch = curl_init();
    
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => $options['ssl_verify'],
        CURLOPT_TIMEOUT => $options['timeout'],
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPHEADER => $options['headers']
    ]);
    
    if ($options['method'] === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($options['data']) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $options['data']);
        }
    }
    
    $response = curl_exec($ch);
    $error = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($response === false) {
        logMessage("cURL error: $error", 'ERROR');
        return [
            'success' => false,
            'error' => $error,
            'http_code' => $httpCode
        ];
    }
    
    return [
        'success' => true,
        'data' => $response,
        'http_code' => $httpCode
    ];
}

/**
 * Valide et traite une réponse JSON
 */
function validateJsonResponse($response) {
    $json = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        logMessage("Invalid JSON response: " . json_last_error_msg(), 'ERROR');
        return [
            'valid' => false,
            'error' => 'Invalid JSON response',
            'raw' => substr($response, 0, 500)
        ];
    }
    
    return [
        'valid' => true,
        'data' => $json
    ];
}

/**
 * Compresse une image pour réduire sa taille
 */
function compressImage($imageData, $quality = CAPTURE_QUALITY) {
    // Si c'est déjà une chaîne base64, on la décode
    if (is_string($imageData) && strpos($imageData, 'data:image') === 0) {
        $imageData = base64_decode(explode(',', $imageData)[1]);
    }
    
    // Créer une image à partir des données
    $image = imagecreatefromstring($imageData);
    if (!$image) {
        return false;
    }
    
    // Obtenir les dimensions
    $width = imagesx($image);
    $height = imagesy($image);
    
    // Calculer les nouvelles dimensions (max 800px de large)
    $maxWidth = 800;
    if ($width > $maxWidth) {
        $ratio = $maxWidth / $width;
        $newWidth = $maxWidth;
        $newHeight = (int)($height * $ratio);
    } else {
        $newWidth = $width;
        $newHeight = $height;
    }
    
    // Créer une nouvelle image redimensionnée
    $newImage = imagecreatetruecolor($newWidth, $newHeight);
    imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
    
    // Capturer la sortie
    ob_start();
    imagejpeg($newImage, null, (int)($quality * 100));
    $compressedData = ob_get_clean();
    
    // Libérer la mémoire
    imagedestroy($image);
    imagedestroy($newImage);
    
    return $compressedData;
}

/**
 * Upload une image vers le service temporaire
 */
function uploadImage($imageData) {
    // Compresser l'image si nécessaire
    $compressedData = compressImage($imageData);
    if ($compressedData === false) {
        return [
            'success' => false,
            'error' => 'Failed to compress image'
        ];
    }
    
    // Créer le FormData
    $boundary = uniqid();
    $data = "--$boundary\r\n";
    $data .= "Content-Disposition: form-data; name=\"file\"; filename=\"screenshot.jpg\"\r\n";
    $data .= "Content-Type: image/jpeg\r\n\r\n";
    $data .= $compressedData . "\r\n";
    $data .= "--$boundary--\r\n";
    
    $headers = [
        "Content-Type: multipart/form-data; boundary=$boundary",
        "Content-Length: " . strlen($data)
    ];
    
    $result = makeHttpRequest(UPLOAD_SERVICE_URL, [
        'method' => 'POST',
        'headers' => $headers,
        'data' => $data,
        'timeout' => UPLOAD_TIMEOUT
    ]);
    
    if (!$result['success']) {
        return $result;
    }
    
    $jsonValidation = validateJsonResponse($result['data']);
    if (!$jsonValidation['valid']) {
        return $jsonValidation;
    }
    
    $responseData = $jsonValidation['data'];
    
    if ($responseData['status'] !== 'success') {
        return [
            'success' => false,
            'error' => 'Upload service error',
            'details' => $responseData
        ];
    }
    
    // Construire l'URL de téléchargement direct
    $parts = explode('/', $responseData['data']['url']);
    $downloadUrl = $parts[0] . '//' . $parts[2] . '/dl/' . $parts[3] . '/' . $parts[4];
    
    return [
        'success' => true,
        'url' => $downloadUrl,
        'original_url' => $responseData['data']['url']
    ];
}

/**
 * Envoie une requête à l'API IA
 */
function sendToAI($message, $imageUrl = '', $conversationHistory = []) {
    // Construire l'historique pour l'API
    $historyForAI = [];
    foreach ($conversationHistory as $msg) {
        $historyForAI[] = [
            'role' => $msg['sender'] === 'user' ? 'user' : 'assistant',
            'content' => $msg['text']
        ];
    }
    
    // Construire l'URL avec les paramètres
    $params = [
        'message' => urlencode($message),
        'image' => urlencode($imageUrl),
        'system' => urlencode(AI_API_SYSTEM_PROMPT)
    ];
    
    if (!empty($historyForAI)) {
        $params['history'] = urlencode(json_encode($historyForAI));
    }
    
    $url = AI_API_URL . '?' . http_build_query($params);
    
    logMessage("Sending request to AI API: $url", 'INFO');
    
    $result = makeHttpRequest($url, [
        'timeout' => AI_API_TIMEOUT,
        'headers' => ['Accept: application/json']
    ]);
    
    if (!$result['success']) {
        return $result;
    }
    
    $jsonValidation = validateJsonResponse($result['data']);
    if (!$jsonValidation['valid']) {
        return $jsonValidation;
    }
    
    return [
        'success' => true,
        'data' => $jsonValidation['data']
    ];
}

/**
 * Gère les erreurs et génère une réponse appropriée
 */
function handleError($error, $context = '') {
    $errorMessage = $context ? "$context: $error" : $error;
    logMessage($errorMessage, 'ERROR');
    
    return jsonResponse([
        'status' => 'error',
        'message' => $errorMessage,
        'timestamp' => date('c')
    ], 500);
}

/**
 * Valide les paramètres de requête requis
 */
function validateRequiredParams($params, $required) {
    $missing = [];
    
    foreach ($required as $param) {
        if (!isset($params[$param]) || empty($params[$param])) {
            $missing[] = $param;
        }
    }
    
    if (!empty($missing)) {
        return [
            'valid' => false,
            'missing' => $missing
        ];
    }
    
    return ['valid' => true];
}
