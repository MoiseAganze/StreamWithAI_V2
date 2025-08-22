 <!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Lab IA - ScreenShare + Chat</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'neural': {
              900: '#0a0118',
              800: '#1a0b2e',
              700: '#2d1b4e',
              600: '#4c2a85',
              500: '#7c3aed',
              400: '#a855f7',
              300: '#c084fc',
            }
          }
        }
      }
    }
  </script>
  <style>
    .glass {
      background: rgba(124, 58, 237, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(124, 58, 237, 0.2);
    }
    .neural-grid {
      background-image: 
        linear-gradient(rgba(124, 58, 237, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(124, 58, 237, 0.1) 1px, transparent 1px);
      background-size: 20px 20px;
    }
  </style>
</head>
<body class="bg-neural-900 text-neural-300 h-screen overflow-hidden neural-grid">
  
  <!-- Header simplifié -->
  <header class="glass border-b border-neural-600/30 p-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-white">Neural Laboratory</h1>
        <p class="text-sm text-neural-400">AI Vision Analysis System</p>
      </div>
      <div class="flex items-center space-x-2 text-sm">
        <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span id="statusText">Online</span>
      </div>
    </div>
  </header>

  <div class="flex h-full">
    <!-- Zone de chat (main content) -->
    <div class="flex-1 flex flex-col">
      <div id="chat" class="flex-1 overflow-y-auto p-4 space-y-2"></div>
    </div>

    <!-- Sidebar de contrôle -->
    <div class="w-80 glass border-l border-neural-600/30 p-4">
      <div class="space-y-4">
        <!-- Controls -->
        <div>
          <h3 class="font-semibold text-white mb-3">Screen Controls</h3>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="startScreenShare()" 
                    class="glass hover:bg-neural-600/20 border border-neural-500/50 rounded-lg px-3 py-2 transition-all duration-200">
              Start Share
            </button>
            <button onclick="stopScreenShare()" 
                    class="glass hover:bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-2 transition-all duration-200">
              Stop
            </button>
          </div>
        </div>

        <!-- Settings -->
        <div>
          <h3 class="font-semibold text-white mb-3">Settings</h3>
          <div class="space-y-2">
            <div>
              <label class="text-xs text-neural-400 mb-1 block">Capture Interval</label>
              <div class="flex items-center space-x-2">
                <input type="range" min="5" max="30" value="10" id="intervalSlider" 
                       class="flex-1 accent-neural-500">
                <span id="intervalValue" class="text-xs text-neural-300 w-8">10s</span>
              </div>
            </div>
            
            <div>
              <label class="text-xs text-neural-400 mb-1 block">Analysis Mode</label>
              <select id="analysisMode" class="w-full glass border border-neural-600/50 rounded-lg px-3 py-2 text-sm bg-transparent">
                <option value="general">General Vision</option>
                <option value="detailed">Detailed Analysis</option>
                <option value="code">Code Analysis</option>
                <option value="ui">UI/UX Review</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div>
          <h3 class="font-semibold text-white mb-3">Quick Actions</h3>
          <div class="space-y-2">
            <button onclick="quickAction('Describe what you see on screen')" 
                    class="w-full glass hover:bg-neural-600/20 border border-neural-600/50 rounded-lg px-3 py-2 text-left text-sm">
              📋 Describe Current View
            </button>
            <button onclick="quickAction('Analyze the UI design and suggest improvements')" 
                    class="w-full glass hover:bg-neural-600/20 border border-neural-600/50 rounded-lg px-3 py-2 text-left text-sm">
              🎨 UI/UX Analysis
            </button>
            <button onclick="quickAction('Review the code visible on screen for bugs and improvements')" 
                    class="w-full glass hover:bg-neural-600/20 border border-neural-600/50 rounded-lg px-3 py-2 text-left text-sm">
              🐛 Code Review
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Input zone (bas de page) -->
  <div class="p-4 glass border-t border-neural-600/30 flex items-center gap-2">
    <input id="userInput" 
           type="text" 
           placeholder="Écris ton message..." 
           class="flex-1 glass border border-neural-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neural-500 placeholder-neural-500">
    
    <button onclick="sendUserMessage()" 
            class="bg-neural-600 hover:bg-neural-500 text-white px-4 py-2 rounded-lg transition-all duration-200">
      Envoyer
    </button>
  </div>

<script>
let screenStream;
let captureInterval;
let isTyping = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Setup interval slider
  const slider = document.getElementById('intervalSlider');
  const valueDisplay = document.getElementById('intervalValue');
  slider.addEventListener('input', (e) => {
    valueDisplay.textContent = e.target.value + 's';
  });
});

// === Chat UI ===
function addMessage(text, sender = "bot") {
  const div = document.createElement("div");
  div.className = sender === "user" ? "text-right" : "text-left";
  div.innerHTML = `<span class="inline-block px-3 py-2 rounded-lg ${sender === "user" ? "bg-neural-700 text-white" : "glass text-neural-200 border border-neural-600/30"}">${text}</span>`;
  document.getElementById("chat").appendChild(div);
  document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight;
}

// === Upload image -> tmpfiles.org ===
async function uploadTmpFile(blob) {
  const formData = new FormData();
  formData.append("file", blob, "screenshot.png");
  const res = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (data.status !== "success") throw new Error("Erreur upload");
  const parts = data.data.url.split("/");
  const directUrl = `${parts[0]}//${parts[2]}/dl/${parts[3]}/${parts[4]}`;
  return directUrl;
}

// === Envoi à l'API ===
async function sendToAI(message, imageUrl) {
  const mode = document.getElementById('analysisMode').value;
  const analysisPrompt = getAnalysisPrompt(mode, message);
  
  const apiUrl = `/proxy.php?message=${encodeURIComponent(analysisPrompt)}&image_url=${encodeURIComponent(imageUrl)}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.status === "success") {
      addMessage(data.message, "bot");
    } else {
      addMessage("Erreur: " + JSON.stringify(data), "bot");
    }
  } catch (error) {
    addMessage("Network error: " + error.message, "bot");
  }
}

function getAnalysisPrompt(mode, userMessage) {
  const prompts = {
    'general': userMessage || 'Decris ce que tu vois sur cette ecran.',
    'detailed': `Fournir une analyse complète de cet écran: ${userMessage || 'Incluez les détails techniques, l’analyse de la mise en page et tous les éléments notables.'}`,
    'code': `Se concentrer sur l'analyse de code: ${userMessage || 'Passez en revue tout code visible pour la syntaxe, la structure, les améliorations potentielles et les meilleures pratiques.'}`,
    'ui': `Analyse UI/UX: ${userMessage || 'Évaluer la conception de l’interface utilisateur, la convivialité, l’accessibilité et fournir des suggestions d’amélioration.'}`
  };
  return prompts[mode] || prompts['general'];
}

// === Capture écran ===
async function startScreenShare() {
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({ 
      video: { cursor: "always" }, 
      audio: false 
    });
    
    const video = document.createElement("video");
    video.srcObject = screenStream;
    video.play();

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    const interval = parseInt(document.getElementById('intervalSlider').value) * 1000;
    
    document.getElementById('statusText').textContent = 'Capturing';

    captureInterval = setInterval(async () => {
      if (isTyping) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        try {
          const directUrl = await uploadTmpFile(blob);
          addMessage("📷 Capture envoyée", "user");
          
          const lastMsg = localStorage.getItem("lastMessage") || getDefaultMessage();
          await sendToAI(lastMsg, directUrl);

        } catch (err) {
          addMessage("Erreur: " + err.message, "bot");
        }
      }, "image/png");
    }, interval);

  } catch (err) {
    document.getElementById('statusText').textContent = 'Error';
    addMessage("Erreur capture: " + err.message, "bot");
  }
}

function stopScreenShare() {
  clearInterval(captureInterval);
  if (screenStream) {
    screenStream.getTracks().forEach(track => track.stop());
  }
  document.getElementById('statusText').textContent = 'Online';
}

// === Gestion input ===
document.getElementById("userInput").addEventListener("input", () => {
  isTyping = true;
  clearTimeout(window.typingTimeout);
  window.typingTimeout = setTimeout(() => {
    isTyping = false;
  }, 2000);
});

async function sendUserMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  localStorage.setItem("lastMessage", message);
  addMessage(message, "user");
  input.value = "";
  isTyping = false;

  await sendToAI(message, "");
}

function quickAction(prompt) {
  document.getElementById("userInput").value = prompt;
  localStorage.setItem("lastMessage", prompt);
  sendUserMessage();
}

function getDefaultMessage() {
  const mode = document.getElementById('analysisMode').value;
  const defaults = {
    'general': 'Decris ce que tu vois',
    'detailed': 'Tu vois quoi sur cette ecran ?',
    'code': 'Analyze any code visible on screen',
    'ui': 'Review the user interface design and usability'
  };
  return defaults[mode] || defaults['general'];
}
</script>
</body>
</html