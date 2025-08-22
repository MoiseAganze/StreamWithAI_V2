 <?php
if (isset($_GET['message']) && isset($_GET['image_url'])) {
    $message = urlencode($_GET['message']);
    $image_url = urlencode($_GET['image_url']);

    $url = "https://test-api.workers.dev/chat?message=$message&image=$image_url&system=Reponds+en+francais+au+message+de+user";

    // Initialiser cURL
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => false, // tu peux mettre true si ton SSL est OK
        CURLOPT_TIMEOUT => 15,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPHEADER => [
            "Accept: application/json"
        ]
    ]);

    $response = curl_exec($ch);
    $error    = curl_error($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    header("Content-Type: application/json");

    if ($response === false) {
        echo json_encode([
            "status"  => "error",
            "message" => "cURL error: " . $error,
            "http"    => $httpcode
        ]);
        exit;
    }

    // Vérifier que la réponse est du JSON
    $json = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode([
            "status"  => "error",
            "message" => "Invalid JSON response",
            "raw"     => substr($response, 0, 500), // log seulement un extrait
            "http"    => $httpcode
        ]);
        exit;
    }

    echo $response; // ✅ réponse propre
} else {
    header("Content-Type: application/json");
    echo json_encode([
        "status"  => "error",
        "message" => "Params missing"
    ]);
}
