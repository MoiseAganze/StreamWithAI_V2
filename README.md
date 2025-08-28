# StreamWithAI v2.0.0

## 🎯 **Projet d'origine et inspiration**

Ce projet est une refactorisation majeure du projet original **[StreamWithAI](https://github.com/Hpmetainsan/StreamWithAI)** créé par [Hpmetainsan](https://github.com/Hpmetainsan). 

### **Le projet original**
Le projet original était un script simple qui :
- Faisait un screenshot de l'écran chaque seconde
- Envoyait l'image à une API IA
- Simulait un chat en temps réel avec l'IA
- Était inspiré de l'application **Gemini Studio AI**

### **Notre amélioration**
Nous avons transformé ce script simple en une **application modulaire et professionnelle** avec :
- Architecture modulaire et extensible
- Interface utilisateur moderne
- Optimisations de performance
- Gestion d'état centralisée
- Reconnaissance et synthèse vocale

---

## 🚀 **Grandes lignes du projet**

**StreamWithAI** est une application web qui permet d'avoir une **conversation en temps réel avec une IA** en combinant :

- 🖥️ **Capture d'écran** : Partage et analyse du contenu visuel
- 🎤 **Reconnaissance vocale** : Interaction vocale naturelle
- 🔊 **Synthèse vocale** : Réponses audio de l'IA
- 🤖 **Intelligence artificielle** : Analyse et réponses contextuelles
- 📊 **Monitoring temps réel** : Suivi des performances

### **Objectif principal**
Créer une expérience d'interaction avec l'IA similaire à **Gemini Studio AI**, où l'utilisateur peut :
1. Partager son écran
2. Poser des questions vocalement
3. Recevoir des réponses audio de l'IA
4. Analyser le contenu visuel en temps réel

---

## 🏗️ **Architecture et structure**

### **Structure des dossiers**
```
StreamWithAI/
├── assets/
│   ├── css/
│   │   ├── main.css          # Styles de base et variables CSS
│   │   ├── components.css    # Composants UI spécifiques
│   │   └── animations.css    # Animations et effets visuels
│   ├── js/
│   │   ├── modules/          # Modules fonctionnels
│   │   │   ├── ConsoleLogger.js     # Gestion des messages console
│   │   │   ├── StatusManager.js     # Gestion centralisée des états
│   │   │   ├── ScreenCapture.js     # Capture d'écran optimisée
│   │   │   ├── SpeechRecognition.js # Reconnaissance vocale
│   │   │   ├── SpeechSynthesis.js   # Synthèse vocale avec file d'attente
│   │   │   └── AIConnector.js       # Communication avec l'API IA
│   │   ├── utils/            # Utilitaires
│   │   │   ├── EventBus.js          # Communication entre modules
│   │   │   └── ImageUploader.js     # Upload optimisé d'images
│   │   └── app.js                   # Application principale
│   └── images/               # Images statiques
├── includes/                 # Backend PHP
│   ├── config.php            # Configuration globale
│   └── functions.php         # Fonctions utilitaires
├── api/
│   └── proxy.php             # Proxy API refactorisé
├── index.php                 # Interface principale
└── README.md                 # Documentation
```

### **Architecture modulaire**

#### **1. Frontend (JavaScript)**
- **EventBus** : Communication découplée entre modules
- **Modules spécialisés** : Chaque fonctionnalité dans son module
- **Application principale** : Orchestration de tous les modules

#### **2. Backend (PHP)**
- **Configuration centralisée** : Paramètres dans `config.php`
- **Fonctions utilitaires** : Logique réutilisable dans `functions.php`
- **Proxy API** : Communication sécurisée avec l'IA

#### **3. Interface (CSS/HTML)**
- **Design moderne** : Interface futuriste avec thème sombre
- **Responsive** : Adaptation à différentes tailles d'écran
- **Animations fluides** : Expérience utilisateur optimisée

---

## 🛠️ **Technologies et outils utilisés**

### **Frontend**
- **HTML5** : Structure de l'interface
- **CSS3** : Styles et animations (sans framework)
- **JavaScript ES6+** : Logique côté client
- **Web APIs** :
  - `getDisplayMedia()` : Partage d'écran
  - `Web Speech API` : Reconnaissance et synthèse vocale
  - `Canvas API` : Compression d'images
  - `Fetch API` : Communication avec le backend

### **Backend**
- **PHP 8.3+** : Langage serveur
- **cURL** : Communication avec les APIs externes
- **GD Library** : Compression d'images
- **JSON** : Format de données

### **APIs externes**
- **tmpfiles.org** : Service d'upload temporaire d'images
- **API IA** : Service d'intelligence artificielle (configurable)

### **Outils de développement**
- **PHP Development Server** : Serveur local de développement
- **Git** : Gestion de version
- **VS Code** : Éditeur de code (recommandé)

---

## 🔄 **Fonctionnement de l'application**

### **1. Initialisation**
```javascript
// L'application démarre automatiquement
window.streamWithAI = new StreamWithAI();
```

### **2. Flux de données**
```
Utilisateur → Reconnaissance vocale → Capture d'écran → Upload image → API IA → Synthèse vocale → Réponse audio
```

### **3. Modules en action**

#### **ScreenCapture**
- Gère le partage d'écran
- Capture optimisée avec compression
- Debouncing pour éviter les captures excessives

#### **SpeechRecognition**
- Écoute continue en français
- Retry automatique en cas d'erreur
- Gestion des conflits audio

#### **SpeechSynthesis**
- File d'attente pour les réponses
- Gestion intelligente des priorités
- Pause automatique lors de la reconnaissance

#### **AIConnector**
- Communication avec l'API IA
- Gestion d'historique de conversation
- Retry automatique et gestion d'erreurs

### **4. Optimisations de performance**
- **Compression d'images** : Réduction de 80% de la taille
- **Cache intelligent** : Évite les re-uploads
- **Debouncing** : Limite les captures fréquentes
- **Retry automatique** : Gestion robuste des erreurs

---

## 🎨 **Interface utilisateur**

### **Design**
- **Thème sombre** : Interface futuriste
- **Animations fluides** : Transitions CSS3
- **Indicateurs temps réel** : Statut des modules
- **Console interactive** : Messages colorés par type

### **Sections principales**
1. **Console IA** : Affichage des messages et interactions
2. **Capture d'écran** : Visualisation de la dernière capture
3. **Contrôles** : Boutons pour démarrer/arrêter les fonctionnalités
4. **Statut** : Indicateurs en temps réel

---

## 📊 **Fonctionnalités avancées**

### **Gestion d'état centralisée**
- Monitoring de tous les modules
- Indicateurs visuels en temps réel
- Statistiques détaillées

### **Communication modulaire**
- EventBus pour la communication entre modules
- Architecture découplée
- Extensibilité facilitée

### **Optimisations**
- Compression automatique des images
- Cache pour éviter les re-uploads
- Debouncing des captures
- Retry automatique

---

## 🔧 **Installation et configuration**

### **Prérequis**
- Serveur web avec PHP 7.4+
- Extension cURL activée
- Extension GD pour la compression d'images
- Navigateur moderne avec support des APIs Web

### **Installation rapide**
```bash
# Cloner le projet
git clone https://github.com/votre-repo/StreamWithAI.git

# Accéder au dossier
cd StreamWithAI

# Installer et configurer l'environnement
php install.php

# Démarrer le serveur PHP
php -S localhost:8000 -t .

# Ouvrir dans le navigateur
# http://localhost:8000
```

### **Configuration**
Les paramètres sont dans le fichier `.env` (créé automatiquement par `install.php`) :
- URLs des APIs
- Clés API sensibles
- Timeouts et retry
- Qualité de compression
- Paramètres de sécurité

#### **Variables d'environnement importantes**
```bash
# API IA
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=your_secret_api_key_here

# Service d'upload
UPLOAD_SERVICE_URL=https://tmpfiles.org/api/v1/upload

# Application
APP_DEBUG=true
APP_ENV=development
```

---

## 🚀 **Différences avec le projet original**

| Aspect | Projet original | Notre version |
|--------|----------------|---------------|
| **Architecture** | Script monolithique | Architecture modulaire |
| **Interface** | Basique | Interface moderne et responsive |
| **Performance** | Capture toutes les secondes | Optimisations avancées |
| **Fonctionnalités** | Capture + IA | Capture + IA + Voix + Monitoring |
| **Maintenabilité** | Code simple | Code structuré et documenté |
| **Extensibilité** | Limitée | Très extensible |

---

## 📈 **Statistiques du projet**

- **Lignes de code** : ~2000 lignes
- **Modules JavaScript** : 8 modules spécialisés
- **Fichiers CSS** : 3 fichiers modulaires
- **Fichiers PHP** : 3 fichiers backend
- **Performance** : Compression 80% des images
- **Compatibilité** : Navigateurs modernes

---

## 🔮 **Évolutions futures**

### **Fonctionnalités prévues**
- Support multi-langues
- Personnalisation de l'IA
- Raccourcis clavier
- Thèmes personnalisables
- Intégration d'autres modèles d'IA

### **Améliorations techniques**
- Tests unitaires
- Documentation API
- Dockerisation
- CI/CD pipeline

---

## 🤝 **Contribution**

Le projet est conçu pour être facilement extensible :
- Architecture modulaire
- Documentation complète
- Code commenté
- Standards de codage

---

## 📄 **Licence**

Projet expérimental - Libre d'utilisation et de modification.

---

## 🙏 **Remerciements**

- **[Hpmetainsan](https://github.com/Hpmetainsan)** pour le projet original inspirant
- **Gemini Studio AI** pour l'inspiration conceptuelle
- La communauté open source pour les outils utilisés

---

**Note** : Cette version 2.0.0 est une refactorisation majeure qui préserve toutes les fonctionnalités de la version originale tout en apportant une architecture plus robuste et des performances optimisées. L'application est maintenant prête pour la production et l'extension.
