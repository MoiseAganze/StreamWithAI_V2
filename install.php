<?php
/**
 * Script d'installation pour StreamWithAI
 * Configure l'environnement et crée le fichier .env
 */

echo "🚀 Installation de StreamWithAI v2.0.0\n";
echo "=====================================\n\n";

// Vérifier les prérequis
echo "📋 Vérification des prérequis...\n";

$requirements = [
    'PHP Version >= 7.4' => version_compare(PHP_VERSION, '7.4.0', '>='),
    'cURL Extension' => extension_loaded('curl'),
    'GD Extension' => extension_loaded('gd'),
    'JSON Extension' => extension_loaded('json')
];

$allGood = true;
foreach ($requirements as $requirement => $satisfied) {
    $status = $satisfied ? '✅' : '❌';
    echo "  $status $requirement\n";
    if (!$satisfied) $allGood = false;
}

if (!$allGood) {
    echo "\n❌ Certains prérequis ne sont pas satisfaits.\n";
    echo "Veuillez installer les extensions manquantes.\n";
    exit(1);
}

echo "\n✅ Tous les prérequis sont satisfaits !\n\n";

// Créer le fichier .env
echo "🔧 Configuration de l'environnement...\n";

$envFile = '.env';
if (file_exists($envFile)) {
    echo "⚠️  Le fichier .env existe déjà.\n";
    $overwrite = readline("Voulez-vous le remplacer ? (y/N): ");
    if (strtolower($overwrite) !== 'y') {
        echo "Installation annulée.\n";
        exit(0);
    }
}

// Demander les informations de configuration
echo "\n📝 Configuration de l'API IA:\n";
$aiApiUrl = readline("URL de l'API IA (défaut: https://chat.onestepcom00.workers.dev/chat): ");
if (empty($aiApiUrl)) {
    $aiApiUrl = 'https://chat.onestepcom00.workers.dev/chat';
}

$aiApiKey = readline("Clé API IA (optionnel): ");

echo "\n📝 Configuration du service d'upload:\n";
$uploadServiceUrl = readline("URL du service d'upload (défaut: https://tmpfiles.org/api/v1/upload): ");
if (empty($uploadServiceUrl)) {
    $uploadServiceUrl = 'https://tmpfiles.org/api/v1/upload';
}

echo "\n📝 Configuration de l'application:\n";
$appDebug = readline("Mode debug (true/false, défaut: true): ");
if (empty($appDebug)) {
    $appDebug = 'true';
}

$appEnv = readline("Environnement (development/production, défaut: development): ");
if (empty($appEnv)) {
    $appEnv = 'development';
}

// Générer le contenu du fichier .env
$envContent = "# Configuration de l'API IA\n";
$envContent .= "AI_API_URL=$aiApiUrl\n";
if (!empty($aiApiKey)) {
    $envContent .= "AI_API_KEY=$aiApiKey\n";
} else {
    $envContent .= "AI_API_KEY=\n";
}
$envContent .= "\n# Configuration du service d'upload\n";
$envContent .= "UPLOAD_SERVICE_URL=$uploadServiceUrl\n";
$envContent .= "\n# Configuration de l'application\n";
$envContent .= "APP_DEBUG=$appDebug\n";
$envContent .= "APP_ENV=$appEnv\n";
$envContent .= "\n# Configuration de sécurité\n";
$envContent .= "CORS_ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000\n";
$envContent .= "\n# Configuration des timeouts\n";
$envContent .= "REQUEST_TIMEOUT=15000\n";
$envContent .= "RETRY_ATTEMPTS=3\n";
$envContent .= "RETRY_DELAY=1000\n";
$envContent .= "\n# Configuration de compression\n";
$envContent .= "CAPTURE_QUALITY=0.8\n";
$envContent .= "MAX_CAPTURE_SIZE=800\n";

// Écrire le fichier .env
if (file_put_contents($envFile, $envContent)) {
    echo "✅ Fichier .env créé avec succès !\n";
} else {
    echo "❌ Erreur lors de la création du fichier .env\n";
    exit(1);
}

// Créer le dossier logs
$logsDir = 'logs';
if (!is_dir($logsDir)) {
    if (mkdir($logsDir, 0755, true)) {
        echo "✅ Dossier logs créé.\n";
    } else {
        echo "⚠️  Impossible de créer le dossier logs.\n";
    }
}

// Tester la configuration
echo "\n🧪 Test de la configuration...\n";

// Charger la configuration
require_once 'includes/EnvLoader.php';
$env = EnvLoader::getInstance();

echo "  ✅ Variables d'environnement chargées\n";
echo "  📊 URL API IA: " . $env->getAIApiUrl() . "\n";
echo "  📊 Service upload: " . $env->getUploadServiceUrl() . "\n";
echo "  📊 Mode debug: " . ($env->isDebug() ? 'Activé' : 'Désactivé') . "\n";
echo "  📊 Environnement: " . $env->get('APP_ENV') . "\n";

echo "\n🎉 Installation terminée avec succès !\n\n";

echo "📖 Prochaines étapes:\n";
echo "1. Démarrer le serveur: php -S localhost:8000 -t .\n";
echo "2. Ouvrir http://localhost:8000 dans votre navigateur\n";
echo "3. Configurer votre clé API IA dans le fichier .env si nécessaire\n\n";

echo "🔒 Sécurité:\n";
echo "- Le fichier .env est automatiquement exclu du contrôle de version\n";
echo "- Ne partagez jamais votre fichier .env\n";
echo "- En production, utilisez des variables d'environnement système\n\n";

echo "📚 Documentation: Consultez le README.md pour plus d'informations.\n";
