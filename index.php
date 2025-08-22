 <!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Lab IA - Interface Futuriste</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'JetBrains Mono', monospace;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
    }
    
    .console-text {
      text-shadow: 0 0 5px rgba(192, 132, 252, 0.7);
    }
    
    .glow {
      box-shadow: 0 0 10px rgba(192, 132, 252, 0.5);
    }
    
    .pulse {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% { opacity: 0.7; }
      50% { opacity: 1; }
      100% { opacity: 0.7; }
    }
    
    .typewriter {
      overflow: hidden;
      border-right: .15em solid #c084fc;
      white-space: nowrap;
      animation: typing 3.5s steps(40, end), blink-caret .75s step-end infinite;
    }
    
    @keyframes typing {
      from { width: 0 }
      to { width: 100% }
    }
    
    @keyframes blink-caret {
      from, to { border-color: transparent }
      50% { border-color: #c084fc }
    }
  </style>
</head>
<body class="text-purple-300 flex flex-col h-screen">

  <!-- HEADER -->
  <div class="bg-gray-900/80 backdrop-blur-md text-purple-400 p-4 text-xl font-bold border-b border-purple-600/30 flex items-center gap-2">
    <i data-lucide="cpu" class="w-6 h-6 text-purple-500"></i>
    <span class="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">🧪 Laboratoire IA - Expérimentation en temps réel</span>
  </div>

  <!-- MAIN SPLIT -->
  <div class="flex flex-1 overflow-hidden">

    <!-- Console IA -->
    <div class="w-2/3 p-4 flex flex-col bg-gray-950/50 border-r border-gray-800/50">
      <h2 class="text-purple-400 font-bold mb-2 flex items-center gap-2">
        <i data-lucide="terminal" class="w-5 h-5 text-purple-500"></i> Console IA
      </h2>
      <div id="console" class="flex-1 bg-black/70 text-green-400 p-4 rounded-lg overflow-y-auto text-sm space-y-2 border border-purple-500/30 glow">
        <div class="console-text"><span class="text-purple-400">[SYSTEM]</span> <span class="text-gray-400">00:00</span> Initialisation du laboratoire...</div>
      </div>
    </div>

    <!-- Zone droite -->
    <div class="w-1/3 p-4 flex flex-col space-y-4">

      <!-- Dernière capture -->
      <div>
        <h2 class="text-purple-400 font-bold mb-2 flex items-center gap-2">
          <i data-lucide="image" class="w-5 h-5 text-purple-500"></i> Dernière capture
        </h2>
        <div class="relative">
          <img id="lastCapture" src="" class="w-full h-48 object-cover rounded-lg border border-purple-500/30 shadow-lg glow">
          <div id="capture-overlay" class="absolute inset-0 bg-black/50 flex items-center justify-center hidden">
            <span class="text-white text-sm">Capture en cours...</span>
          </div>
        </div>
      </div>

      <!-- Contrôles -->
      <div class="bg-gray-900/70 backdrop-blur-md p-4 rounded-lg space-y-3 border border-gray-800/50 shadow-xl">
        <h2 class="text-purple-400 font-bold mb-2 flex items-center gap-2">
          <i data-lucide="settings" class="w-5 h-5 text-purple-500"></i> Contrôles
        </h2>

        <div class="flex gap-2">
          <button onclick="startScreenShare()" 
            class="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 py-2 rounded-lg flex items-center justify-center gap-1 transition-all glow">
            <i data-lucide="monitor" class="w-4 h-4"></i> Partager
          </button>
          <button onclick="stopScreenShare()" 
            class="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 py-2 rounded-lg flex items-center justify-center gap-1 transition-all glow">
            <i data-lucide="square" class="w-4 h-4"></i> Stop
          </button>
        </div>

        <div class="flex gap-2">
          <button id="start-recognition-button"
            class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-2 rounded-lg flex items-center justify-center gap-1 transition-all glow pulse">
            <i data-lucide="mic" class="w-4 h-4"></i> Micro
          </button>
          <button id="stop-recognition-button"
            class="hidden flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 py-2 rounded-lg flex items-center justify-center gap-1 transition-all glow">
            <i data-lucide="mic-off" class="w-4 h-4"></i> Stop micro
          </button>
        </div>

        <button id="stop-voice-button"
          class="hidden w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 py-2 rounded-lg flex items-center justify-center gap-1 transition-all glow">
          <i data-lucide="volume-x" class="w-4 h-4"></i> Stop voix IA
        </button>
      </div>
      
      <!-- Statut -->
      <div class="bg-gray-900/50 p-3 rounded-lg border border-gray-800/30 text-xs">
        <div class="flex justify-between items-center mb-2">
          <span class="text-purple-400">Statut:</span>
          <span id="status-indicator" class="h-2 w-2 rounded-full bg-red-500"></span>
        </div>
        <div id="status-text" class="text-gray-400">En attente de partage d'écran</div>
        <div id="recognition-status" class="text-gray-400 mt-1">Reconnaissance vocale: inactive</div>
      </div>
    </div>
  </div>

<script>
let screenStream, captureInterval;
let recognition;
let isSpeaking = false, speechQueue = [];
let isListening = false;
let streamPaused = false;
let conversationHistory = []; // ⚡ Historique complet
let recognitionActive = false;
let recognitionStarting = false; // Nouveau flag pour éviter les démarrages multiples

// === Logger ===
function logConsole(text, type="system") {
  const consoleDiv = document.getElementById("console");
  const now = new Date();
  const time = now.toLocaleTimeString("fr-FR", { hour12: false });
  
  const div = document.createElement("div");
  div.className = "console-text";
  
  // Différents styles selon le type de message
  if (type === "system") {
    div.innerHTML = `<span class="text-purple-400">[SYSTEM]</span> <span class="text-gray-400">${time}</span> ${text}`;
  } else if (type === "ai") {
    div.innerHTML = `<span class="text-green-400">[IA]</span> <span class="text-gray-400">${time}</span> ${text}`;
  } else if (type === "user") {
    div.innerHTML = `<span class="text-blue-400">[UTILISATEUR]</span> <span class="text-gray-400">${time}</span> ${text}`;
  } else if (type === "error") {
    div.innerHTML = `<span class="text-red-400">[ERREUR]</span> <span class="text-gray-400">${time}</span> ${text}`;
  } else if (type === "voice") {
    div.innerHTML = `<span class="text-yellow-400">[VOIX]</span> <span class="text-gray-400">${time}</span> ${text}`;
  }
  
  consoleDiv.appendChild(div);
  consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

// Mise à jour du statut
function updateStatus(text, isActive = false) {
  const indicator = document.getElementById("status-indicator");
  const statusText = document.getElementById("status-text");
  
  statusText.textContent = text;
  indicator.className = `h-2 w-2 rounded-full ${isActive ? 'bg-green-500 pulse' : 'bg-red-500'}`;
}

// Mise à jour du statut de reconnaissance vocale
function updateRecognitionStatus(text) {
  document.getElementById("recognition-status").textContent = `Reconnaissance vocale: ${text}`;
}

// === Upload capture ===
async function uploadTmpFile(blob) {
  // Afficher l'indicateur de capture
  document.getElementById("capture-overlay").classList.remove("hidden");
  
  const formData = new FormData();
  formData.append("file", blob, "screenshot.png");
  
  try {
    const res = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.status !== "success") throw new Error("Erreur upload");
    
    const parts = data.data.url.split("/");
    const url = `${parts[0]}//${parts[2]}/dl/${parts[3]}/${parts[4]}`;
    document.getElementById("lastCapture").src = url;
    logConsole("Capture uploadée avec succès", "system");
    return url;
  } catch (err) {
    throw err;
  } finally {
    // Masquer l'indicateur de capture
    document.getElementById("capture-overlay").classList.add("hidden");
  }
}

// === Envoi à IA ===
async function sendToAI(message, imageUrl) {
  if (!message) return;
  
  // Formater l'historique de conversation pour l'envoi
  const historyForAI = conversationHistory.map(msg => ({
    role: msg.sender === "user" ? "user" : "assistant",
    content: msg.text
  }));
  
  const apiUrl = `/proxy.php?message=${encodeURIComponent(message)}&image_url=${encodeURIComponent(imageUrl)}`;
  logConsole("Envoi de la requête à l'IA...", "system");

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    
    if (data.status === "success") {
      const safeMsg = data.message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      logConsole(safeMsg, "ai");
      conversationHistory.push({ sender: "ai", text: safeMsg });
      enqueueSpeech(safeMsg);
    } else {
      logConsole("Erreur de l'IA: " + JSON.stringify(data), "error");
    }
  } catch (err) {
    logConsole("Erreur de connexion avec l'IA: " + err.message, "error");
  }
}

// === Capture immédiate ===
async function captureAndSend(message) {
  // Ajouter le message de l'utilisateur à l'historique
  conversationHistory.push({ sender: "user", text: message });
  logConsole(message, "user");
  
  if (!screenStream) { 
    await sendToAI(message, ""); 
    return; 
  }
  
  const video = document.createElement("video");
  video.srcObject = screenStream;
  video.play();
  
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  // Attendre que la vidéo soit prête
  setTimeout(() => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      try {
        const directUrl = await uploadTmpFile(blob);
        await sendToAI(message, directUrl);
      } catch (err) { 
        logConsole("Échec de l'upload: " + err.message, "error");
        // Envoyer quand même le message sans image
        await sendToAI(message, "");
      }
    }, "image/png");
  }, 500);
}

// === Partage d'écran ===
async function startScreenShare() {
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({ 
      video: { cursor: "always" }, 
      audio: false 
    });
    
    updateStatus("Partage d'écran actif", true);
    logConsole("Partage d'écran démarré avec succès", "system");
    
    // Gérer la fin du partage d'écran
    screenStream.getTracks().forEach(track => {
      track.onended = () => {
        stopScreenShare();
        logConsole("Partage d'écran interrompu par l'utilisateur", "system");
      };
    });
    
  } catch (err) {
    logConsole("Erreur de partage d'écran: " + err.message, "error");
    updateStatus("Erreur de partage d'écran");
  }
}

function stopScreenShare() {
  if (captureInterval) clearInterval(captureInterval);
  if (screenStream) {
    screenStream.getTracks().forEach(track => track.stop());
  }
  updateStatus("Partage d'écran arrêté");
  logConsole("Partage d'écran arrêté", "system");
}

// === Reconnaissance vocale ===
function setupSpeechRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListening = true;
      recognitionStarting = false; // Réinitialiser le flag de démarrage
      streamPaused = true;
      stopVoice(); // Arrêter la voix IA si elle parle
      updateStatus("Micro actif - écoute en cours", true);
      updateRecognitionStatus("écoute en cours");
      logConsole("Micro activé - écoute en cours", "user");
      
      // Changer l'état des boutons microphone
      document.getElementById("start-recognition-button").classList.add("hidden");
      document.getElementById("stop-recognition-button").classList.remove("hidden");
    };
    
    recognition.onend = () => {
      isListening = false;
      streamPaused = false;
      updateStatus("Partage d'écran actif", true);
      updateRecognitionStatus("en attente");
      logConsole("Micro désactivé", "user");
      
      // Réactiver l'écoute après un court délai si toujours actif
      if (recognitionActive && !recognitionStarting) {
        setTimeout(() => {
          if (!isSpeaking && recognitionActive) {
            safeStartRecognition();
          }
        }, 800);
      }
      
      // Remettre les boutons dans l'état initial si la reconnaissance n'est plus active
      if (!recognitionActive) {
        document.getElementById("start-recognition-button").classList.remove("hidden");
        document.getElementById("stop-recognition-button").classList.add("hidden");
      }
    };
    
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();
      if (!transcript) return;
      
      // Envoyer immédiatement la transcription et capturer l'écran
      captureAndSend(transcript);
    };
    
    recognition.onerror = (e) => {
      if (e.error === 'no-speech') {
        // Cette erreur est normale quand l'utilisateur ne parle pas
        logConsole("Aucune parole détectée", "system");
        updateRecognitionStatus("aucune parole détectée");
      } else if (e.error === 'audio-capture') {
        logConsole("Impossible de capturer l'audio - vérifiez votre microphone", "error");
        updateRecognitionStatus("erreur de microphone");
      } else if (e.error === 'not-allowed') {
        logConsole("Microphone non autorisé - vérifiez les permissions", "error");
        updateRecognitionStatus("permissions refusées");
        recognitionActive = false;
      } else {
        logConsole("Erreur de reconnaissance vocale: " + e.error, "error");
        updateRecognitionStatus("erreur");
      }
      
      // Réessayer après une erreur, sauf si l'erreur est grave
      if (e.error !== 'not-allowed' && recognitionActive && !recognitionStarting) {
        setTimeout(() => {
          if (!isSpeaking && recognitionActive) {
            safeStartRecognition();
          }
        }, 1000);
      }
    };

    // Fonction pour démarrer la reconnaissance de manière sécurisée
    window.safeStartRecognition = function() {
      if (recognitionStarting) {
        logConsole("Démarrage déjà en cours", "system");
        return;
      }
      
      try {
        recognitionStarting = true;
        recognition.start();
        logConsole("Démarrage de la reconnaissance vocale", "system");
      } catch (err) {
        recognitionStarting = false;
        if (err.message.includes('already started')) {
          logConsole("Reconnaissance déjà active - attente...", "system");
          // Ne pas réessayer immédiatement pour éviter la boucle
          setTimeout(() => {
            recognitionStarting = false;
          }, 2000);
        } else {
          logConsole("Erreur lors du démarrage: " + err.message, "error");
          // Réessayer après un délai en cas d'autres erreurs
          setTimeout(() => {
            recognitionStarting = false;
            if (recognitionActive) safeStartRecognition();
          }, 1000);
        }
      }
    };

    // Configurer les boutons
    document.getElementById("start-recognition-button").onclick = () => {
      recognitionActive = true;
      safeStartRecognition();
    };
    
    document.getElementById("stop-recognition-button").onclick = () => {
      recognitionActive = false;
      try {
        recognition.stop();
      } catch (e) {
        logConsole("Erreur lors de l'arrêt: " + e.message, "error");
      }
    };
    
    // Démarrer automatiquement la reconnaissance au chargement
    setTimeout(() => {
      recognitionActive = true;
      safeStartRecognition();
    }, 1000);
  } else {
    logConsole("Reconnaissance vocale non supportée par ce navigateur", "error");
    updateRecognitionStatus("non supportée");
    document.getElementById("start-recognition-button").disabled = true;
    document.getElementById("start-recognition-button").classList.remove("pulse");
    document.getElementById("start-recognition-button").classList.add("opacity-50");
  }
}

// === Synthèse vocale avec file d'attente ===
function enqueueSpeech(text) {
  speechQueue.push(text);
  if (!isSpeaking) playNextSpeech();
}

function playNextSpeech() {
  if (speechQueue.length === 0) {
    isSpeaking = false;
    document.getElementById("stop-voice-button").classList.add("hidden");
    return;
  }
  
  if (!("speechSynthesis" in window)) {
    logConsole("Synthèse vocale non supportée", "error");
    return;
  }
  
  const text = speechQueue.shift();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "fr-FR";
  utter.rate = 1.0;
  utter.pitch = 1.0;
  
  isSpeaking = true;
  document.getElementById("stop-voice-button").classList.remove("hidden");
  logConsole("Début de la synthèse vocale", "voice");

  utter.onend = () => {
    logConsole("Fin de la synthèse vocale", "voice");
    isSpeaking = false;
    playNextSpeech();
  };
  
  utter.onerror = (e) => {
    logConsole("Erreur de synthèse vocale: " + e.error, "error");
    isSpeaking = false;
    playNextSpeech();
  };

  speechSynthesis.speak(utter);
}

function stopVoice() {
  if (isSpeaking || speechSynthesis.speaking) {
    speechSynthesis.cancel();
    isSpeaking = false;
    speechQueue = [];
    document.getElementById("stop-voice-button").classList.add("hidden");
    logConsole("Synthèse vocale arrêtée", "voice");
  }
}

document.getElementById("stop-voice-button").onclick = stopVoice;

// Initialiser les icônes et la reconnaissance vocale
document.addEventListener('DOMContentLoaded', function() {
  lucide.createIcons();
  setupSpeechRecognition();
});
</script>

</body>
</html