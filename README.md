<p align="center">
  <img src="https://img.shields.io/badge/🛡️_SAFESPHERE_AI-8B5CF6?style=for-the-badge&labelColor=0A0A0F" alt="SafeSphere AI" />
</p>

<h1 align="center">SafeSphere AI</h1>
<h3 align="center"><code>Predict. Protect. Prevent.</code></h3>

<p align="center">
  <b>A Zero-Trust, Predictive Safety Ecosystem</b><br/>
  <sub>Next-generation intelligent safety platform leveraging Edge AI and zero-touch triggers.</sub>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-000020?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-DD2C00?style=for-the-badge&logo=firebase&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_2.0-8E75FF?style=for-the-badge&logo=google&logoColor=white" />
</p>

---

## 🎯 The Problem & Our Approach

Traditional safety applications are purely **reactive**—they require a victim in distress to manually unlock their phone, navigate to an app, and press an SOS button. In high-stress or physical attack scenarios, this interaction is near impossible.

**SafeSphere AI** fundamentally shifts the paradigm from reactive monitoring to **predictive analytics and autonomous response**. By analyzing real-time environmental factors on-device and utilizing zero-touch triggers, the platform acts before a situation escalates.

---

## 🏗️ System Architecture

The platform operates on a **4-tier architecture** spanning the mobile client, Firebase serverless backend, AI processing layer, and Google Maps cluster. Every component is purpose-built for high-throughput safety analytics at scale:

```mermaid
flowchart TD
    subgraph Client ["🌐 Client Tier — React Native Expo"]
        direction TB
        React["⚛️ React Components<br>(Pages + Layouts + NativeWind)"]
        
        Zustand["🧠 Zustand Stores<br>(authStore, safetyStore, sosStore)"]
        Router["🗺️ Expo Router v4<br>(PrivateRoute + Layout guards)"]
        
        React --> Zustand
        React --> Router
        
        Services["🚀 Business Services<br>(Offline SMS + SOS Engine)"]
        Zustand --> Services
    end

    Client -- "HTTPS / WSS (Real-time)" --> Backend

    subgraph Backend ["☁️ Backend Tier — Firebase Cloud"]
        direction TB
        Auth["🔐 Firebase Auth<br>(OAuth 2.0 + JWT)"]
        
        Firestore["🗄️ Firestore Database<br>(Real-time NoSQL + Offline Sync)"]
        
        Storage["📁 Cloud Storage<br>(AES-256 Encrypted Evidence)"]
        
        FCM["🔔 Cloud Messaging<br>(Emergency Push Notifications)"]

        Auth --> Firestore
        Firestore --> Storage
    end

    Backend -- "Serverless / RPC" --> AI

    subgraph AI ["🤖 AI Engine Tier"]
        direction TB
        Gemini["🧠 Gemini 2.0 Flash<br>(Risk Analysis + Chatbot)"]
        TFLite["📊 TensorFlow Lite<br>(On-device Pattern Detection)"]
        
        Gemini ~~~ TFLite
    end

    Backend -- "REST API" --> Maps

    subgraph Maps ["📍 Location & Maps Tier"]
        direction TB
        SDK["🗺️ Maps SDK<br>(Live Heatmaps)"]
        Places["🏥 Places API<br>(Nearby Safe Zones)"]
        
        SDK ~~~ Places
    end

    %% Node Styling (Matching the provided screenshots)
    style React fill:#1E3A8A,color:#fff,stroke:#3B82F6
    style Zustand fill:#1E3A8A,color:#fff,stroke:#3B82F6
    style Router fill:#1E3A8A,color:#fff,stroke:#3B82F6
    style Services fill:#1E3A8A,color:#fff,stroke:#3B82F6

    style Auth fill:#4C1D95,color:#fff,stroke:#8B5CF6
    style Firestore fill:#4C1D95,color:#fff,stroke:#8B5CF6
    style Storage fill:#4C1D95,color:#fff,stroke:#8B5CF6
    style FCM fill:#4C1D95,color:#fff,stroke:#8B5CF6

    style Gemini fill:#065F46,color:#fff,stroke:#10B981
    style TFLite fill:#065F46,color:#fff,stroke:#10B981

    style SDK fill:#9F1239,color:#fff,stroke:#F43F5E
    style Places fill:#9F1239,color:#fff,stroke:#F43F5E

    %% Subgraph Styling (Grey background, no borders)
    style Client fill:#424242,stroke:none,color:#fff
    style Backend fill:#424242,stroke:none,color:#fff
    style AI fill:#424242,stroke:none,color:#fff
    style Maps fill:#424242,stroke:none,color:#fff
```

---

## 🔒 Security Architecture

The platform implements a **Zero-Trust, Defense-in-Depth** security model across both client and server tiers:

```mermaid
flowchart LR
    subgraph APISide ["⚙️ API-Side Security"]
        direction TB
        Rules["🛡️ Firestore Rules<br>(RBAC + UID matching)"]
        CORS["🌐 CORS Whitelist<br>(Only allowed origins)"]
        Rate["⏱️ Rate Limiting<br>Auth: 15 req/15min<br>Data: 100 req/15min"]
        StorageSec["📁 Storage Security<br>(Auth-only Evidence Upload)"]
        NoSQL["🧹 Payload Sanitizer<br>(Strip malicious keys)"]
        JWT["🔐 JWT Verify<br>(RS256 signature check)"]
        
        Rules --> CORS --> Rate --> StorageSec --> NoSQL --> JWT
    end

    subgraph ClientSide ["🌐 Client-Side Security"]
        direction LR
        Zod["✅ Zod Schema Validation<br>(Client-side form guards)"]
        Route["🛡️ Route Guards<br>(Expo Router auth middleware)"]
        Store["🔑 Encrypted MMKV Store<br>(AES-256 for local state)"]
        Logout["🚪 Auto Logout<br>(401 response -> clear token + redirect)"]
        Backoff["⏳ Exponential Backoff<br>(5xx retry: 1s -> 2s -> fail)"]

        Zod --> Route --> Store
        Store --> Logout
        Store --> Backoff
    end

    ClientSide -- "HTTPS / WSS" --> APISide

    %% Node Styling
    style Rules fill:#4C1D95,color:#fff,stroke:#8B5CF6
    style CORS fill:#4C1D95,color:#fff,stroke:#8B5CF6
    style Rate fill:#4C1D95,color:#fff,stroke:#8B5CF6
    style StorageSec fill:#4C1D95,color:#fff,stroke:#8B5CF6
    style NoSQL fill:#4C1D95,color:#fff,stroke:#8B5CF6
    style JWT fill:#4C1D95,color:#fff,stroke:#8B5CF6

    style Zod fill:#1E3A8A,color:#fff,stroke:#3B82F6
    style Route fill:#1E3A8A,color:#fff,stroke:#3B82F6
    style Store fill:#1E3A8A,color:#fff,stroke:#3B82F6
    style Logout fill:#1E3A8A,color:#fff,stroke:#3B82F6
    style Backoff fill:#1E3A8A,color:#fff,stroke:#3B82F6

    %% Subgraph Styling
    style APISide fill:#424242,stroke:none,color:#fff
    style ClientSide fill:#424242,stroke:none,color:#fff
```

---

## 🗄️ Database Tier — Firestore NoSQL

```mermaid
flowchart TD
    subgraph Database ["🗄️ Database Tier — Cloud Firestore"]
        direction LR
        Users["👤 users collection"]
        Events["🚨 sos_events collection<br>(Real-time emergency tracking)"]
        Guardians["👨‍👩‍👧 guardians collection"]
        Evidence["📸 evidence collection"]

        Events --> Pipelines["⚡ Real-time Listeners<br>(onSnapshot -> UI)"]
        Pipelines --> Indexes["🔑 Compound Indexes<br>({userId: 1, timestamp: -1})"]
    end

    style Users fill:#0F766E,color:#fff,stroke:#14B8A6
    style Events fill:#0F766E,color:#fff,stroke:#14B8A6
    style Guardians fill:#0F766E,color:#fff,stroke:#14B8A6
    style Evidence fill:#0F766E,color:#fff,stroke:#14B8A6
    style Pipelines fill:#1E3A8A,color:#fff,stroke:#3B82F6
    style Indexes fill:#1E3A8A,color:#fff,stroke:#3B82F6

    style Database fill:#424242,stroke:none,color:#fff
```

---

## 💻 Tech Stack Highlights

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Core Framework** | React Native + Expo | Cross-platform mobile architecture |
| **State Management** | Zustand + React Query | Predictable local and server state sync |
| **Styling Engine** | NativeWind (Tailwind CSS) | Utility-first, performant glassmorphism |
| **Cloud Backend** | Firebase (Firestore/Auth/Storage) | Real-time NoSQL and scalable auth |
| **AI Processing** | Gemini 2.0 Flash + TF Lite | Millisecond-latency risk analysis |
| **Geolocation** | Google Maps Platform | Routing, Heatmaps, and Safe Zones |

---

## 🚀 Setup & Local Development

### Prerequisites
- Node.js `v18+`
- Expo CLI
- Firebase Project with Firestore & Storage enabled

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/Infinity_Coders-v2v.git
   cd Infinity_Coders-v2v
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```

3. **Start Development Server:**
   ```bash
   npx expo start
   ```

---

<p align="center">
  <sub>Designed and engineered for maximum reliability. Built by <b>Infinity Coders</b>.</sub>
</p>
