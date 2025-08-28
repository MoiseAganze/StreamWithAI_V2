<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Lab IA - Interface Futuriste</title>
  
  <!-- CSS -->
  <link rel="stylesheet" href="assets/css/main.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <link rel="stylesheet" href="assets/css/animations.css">
  
  <!-- External Libraries -->
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="text-purple-300">

  <!-- HEADER -->
  <div class="header">
    <i data-lucide="cpu" class="icon"></i>
    <span class="header-title">🧪 Laboratoire IA - Expérimentation en temps réel</span>
  </div>

  <!-- MAIN SPLIT -->
  <div class="main-split">

    <!-- Console IA -->
    <div class="console-section">
      <h2 class="console-title">
        <i data-lucide="terminal" class="icon-sm"></i> Console IA
      </h2>
      <div id="console" class="console">
        <!-- Les messages seront ajoutés dynamiquement -->
      </div>
    </div>

    <!-- Zone droite -->
    <div class="controls-section">

      <!-- Dernière capture -->
      <div>
        <h2 class="console-title">
          <i data-lucide="image" class="icon-sm"></i> Dernière capture
        </h2>
        <div class="capture-container">
          <img id="lastCapture" src="" class="capture-image">
          <div id="capture-overlay" class="capture-overlay hidden">
            <span class="text-white text-sm">Capture en cours...</span>
          </div>
        </div>
      </div>

      <!-- Contrôles -->
      <div class="controls-panel">
        <h2 class="controls-title">
          <i data-lucide="settings" class="icon-sm"></i> Contrôles
        </h2>

        <div class="button-group">
          <button id="share-button" class="btn btn-primary">
            <i data-lucide="monitor" class="icon-sm"></i> Partager
          </button>
          <button id="stop-share-button" class="btn btn-danger">
            <i data-lucide="square" class="icon-sm"></i> Stop
          </button>
        </div>

        <div class="button-group">
          <button id="start-recognition-button" class="btn btn-info pulse">
            <i data-lucide="mic" class="icon-sm"></i> Micro
          </button>
          <button id="stop-recognition-button" class="btn btn-danger hidden">
            <i data-lucide="mic-off" class="icon-sm"></i> Stop micro
          </button>
        </div>

        <button id="stop-voice-button" class="btn btn-warning hidden">
          <i data-lucide="volume-x" class="icon-sm"></i> Stop voix IA
        </button>
      </div>
      
      <!-- Statut -->
      <div class="status-panel">
        <div class="status-header">
          <span class="status-label">Statut:</span>
          <span id="status-indicator" class="status-indicator"></span>
        </div>
        <div id="status-text" class="status-text">En attente de partage d'écran</div>
        <div id="recognition-status" class="status-text">Reconnaissance vocale: inactive</div>
      </div>
    </div>
  </div>

  <!-- JavaScript Modules -->
  <script src="assets/js/utils/EventBus.js"></script>
  <script src="assets/js/utils/ImageUploader.js"></script>
  <script src="assets/js/modules/ConsoleLogger.js"></script>
  <script src="assets/js/modules/StatusManager.js"></script>
  <script src="assets/js/modules/ScreenCapture.js"></script>
  <script src="assets/js/modules/SpeechRecognition.js"></script>
  <script src="assets/js/modules/SpeechSynthesis.js"></script>
  <script src="assets/js/modules/AIConnector.js"></script>
  <script src="assets/js/app.js"></script>

</body>
</html>