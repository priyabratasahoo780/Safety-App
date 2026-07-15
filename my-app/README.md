# 🛡️ SafeSphereAI

**SafeSphereAI** is a comprehensive personal safety and emergency response application built with React Native and Expo (SDK 54). It integrates real-time location tracking, AI-powered safety analysis, SOS capabilities, Guardian networking, and seamless multimedia evidence gathering to keep users protected at all times.

---

## 🚀 Key Features

| Feature Name | Description | Status |
|---|---|---|
| **Real-time SOS Trigger** | Instantly trigger an SOS by tapping/holding the center button to alert Guardians. | ✅ Fully Working |
| **Guardian Network** | Connect with trusted contacts who can monitor your live location during emergencies. | ✅ Fully Working |
| **Live Tracking** | Real-time map location sharing using secure Firebase real-time updates. | ✅ Fully Working |
| **AI Safety Assistant** | Chat with Gemini-powered AI for safety analysis and situation guidance. | ✅ Fully Working |
| **AI Fake Call Simulator** | Simulate a real phone call from "Dad" that uses AI text-to-speech to interact with the user and deter threats. | ✅ Fully Working |
| **Background Evidence Capture** | Automatically record high-quality audio and video evidence via `expo-audio` & `expo-video` during SOS. | ✅ Fully Working |
| **Safe Route Planning** | Calculate the safest walking or driving routes based on historical risk data. | 🛠️ UI/Mocked |
| **Secure Authentication** | Full user management with session persistence powered by Firebase Auth. | ✅ Fully Working |

---

## 🛠️ Technology Stack

| Category | Technology / Library |
|---|---|
| **Framework** | React Native, Expo SDK 54 |
| **Routing** | Expo Router (File-based navigation) |
| **State Management** | Zustand (Global State) |
| **Backend / DB** | Firebase (Auth, Firestore, Storage) |
| **AI Integrations** | Gemini API (Safety Analysis, Fake Call logic) |
| **Mapping** | `react-native-maps` (with `MapViewProxy` for Web support) |
| **Media / Hardware** | `expo-audio`, `expo-video`, `expo-camera`, `expo-location` |
| **UI / Styling** | Custom Neumorphism UI, `lucide-react-native`, `expo-vector-icons` |

---

## ⚙️ Installation & Setup

Follow these steps to run SafeSphereAI locally on your machine.

| Step | Command / Action | Description |
|---|---|---|
| 1 | `git clone` | Clone the repository to your local machine. |
| 2 | `npm install` | Install all required dependencies (Expo SDK 54 compliant). |
| 3 | Configure `.env` | Create a `.env` file and add `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_GEMINI_API_KEY`, etc. |
| 4 | `npx expo start --clear` | Start the Metro Bundler (clearing cache is recommended). |
| 5 | Open on Device | Press `a` for Android Emulator, `i` for iOS Simulator, or scan the QR code with Expo Go. |

> **Note on Web Support**: `npx expo start --web` is supported. Native maps are safely proxied on the web to prevent Metro bundler crashes.

---

## 🧪 Testing Checklist

SafeSphereAI relies on physical device hardware for some of its most critical features. Use this table as a manual testing guide:

| Hardware/System | Action | Expected Result |
|---|---|---|
| **Location / GPS** | Trigger an SOS while walking. | Map marker should smoothly update in real-time on Guardian's device. |
| **Microphone** | Use the Fake Call feature. | Audio is captured via `expo-audio` and processed by the AI for dynamic responses. |
| **Audio / Speakers** | Listen to AI Fake Call responses. | `expo-speech` and `expo-audio` reliably playback the synthesized voice. |
| **Background Task** | Minimize the app during an active SOS. | Location continues to update and audio recording persists. |
| **Push Notifications** | Receive a Guardian Request. | Device shows a local/push notification (Requires EAS Build for full APNs/FCM functionality). |

---

## 🔒 Security & Environment Variables

This project uses environment variables to protect sensitive configuration. **Never commit actual API keys to version control.**

Required variables (refer to `.env.example` if available):
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_GEMINI_API_KEY`

---

## 📦 Recent Updates

- **Expo SDK 54 Compliance**: Successfully migrated deprecated `expo-av` implementations over to the new `expo-audio` and `expo-video` packages.
- **Cross-Platform Stability**: Implemented a `MapViewProxy` to conditionally render `react-native-maps` on Native devices and a fallback UI on Web to ensure `npx expo export` completes successfully across all platforms.
- **TypeScript Health**: Achieved 0 TypeScript compilation errors and passed all `expo-doctor` health checks seamlessly. 

---

Made with ❤️ for Personal Safety.
