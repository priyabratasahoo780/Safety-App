# SafeSphere AI — Presentation Slides
---

## SLIDE 1 — Title Slide

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│            🛡️  SAFESPHERE AI                               │
│                                                             │
│     Your Smart Personal Safety Companion                    │
│                                                             │
│     Built with React Native · Firebase · Clerk             │
│                                                             │
│     Presented by: Priyabrata Sahoo                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

> **Tagline:** *"Empowered with AI to keep you safe, every step of the way."*

---

## SLIDE 2 — The Problem We Solve

### ⚠️ The Safety Crisis in India

| Problem | Impact |
|---|---|
| Women feel unsafe in public spaces | 71% report harassment in cities |
| No real-time emergency contact sharing | Delayed help in critical moments |
| Generic 112 calls don't always help | Lack of context for rescue teams |
| No community-driven safety intel | People unaware of local dangers |
| Stalking & harassment on the rise | Victims have no instant escape tool |

### 💡 Our Solution
> **SafeSphere AI** is a comprehensive, AI-powered mobile safety app that combines real-time GPS tracking, community safety intelligence, SOS alerts, and a personal AI assistant — all in one platform.

---

## SLIDE 3 — What is SafeSphere AI?

### 🎯 One App. Complete Safety.

SafeSphere AI is a **React Native mobile application** (Android & iOS) that provides:

- 🆘 **One-Touch SOS** — Hold to activate. Alerts all trusted contacts instantly.
- 📍 **Live GPS Tracking** — Share your real-time location with family.
- 🤖 **AI Safety Assistant** — 24/7 personal safety advisor (Ananya AI).
- 👥 **Community Safety Feed** — Crowdsourced incident reporting with live map.
- 🗺️ **Safety Heatmap** — Visualize dangerous zones in your area.
- 📊 **Crime Rate Analysis** — Dynamic risk score based on real community data.
- 📞 **Fake Call Feature** — Escape uncomfortable situations discreetly.
- 🛡️ **Trusted Guardian Network** — Emergency contact management.

---

## SLIDE 4 — Tech Stack

### ⚙️ Built With Industry-Grade Technology

```
FRONTEND                    BACKEND / SERVICES
────────────────────        ──────────────────────────
React Native (Expo)         Firebase Firestore (Database)
TypeScript                  Firebase Authentication
Expo Router (Navigation)    Clerk (Auth + User Mgmt)
react-native-maps           Google OAuth
OpenStreetMap Tiles         AsyncStorage (Local Cache)
Lucide Icons                expo-location (GPS)
Linear Gradient             expo-haptics (Touch Feedback)
```

| Layer | Technology | Purpose |
|---|---|---|
| **Mobile Framework** | React Native + Expo | Cross-platform app |
| **Navigation** | Expo Router v3 | File-based routing |
| **Authentication** | Clerk + Google OAuth | Secure sign-in |
| **Database** | Firebase Firestore | Real-time cloud data |
| **Maps** | react-native-maps + OSM | Free real-world maps |
| **Location** | expo-location | Live GPS tracking |

---

## SLIDE 5 — App Architecture

### 🏗️ Clean, Modular Architecture

```
SafeSphere App
├── app/                    # All screens (file-based routing)
│   ├── (auth)/             # Sign In, Sign Up, OTP Verify
│   ├── (drawer)/           # Main app (authenticated)
│   │   ├── (tabs)/         # Bottom tab navigation
│   │   │   ├── home/       # Dashboard (main screen)
│   │   │   └── navigate/   # Safe Route navigation
│   │   ├── community/      # Safety Feed + Heatmap
│   │   ├── live-tracking/  # Real-time GPS sharing
│   │   ├── crime-rate/     # Dynamic risk score
│   │   ├── profile/        # User profile + contacts
│   │   ├── ai-assistant/   # Ananya AI chatbot
│   │   ├── fake-call/      # Fake call escape tool
│   │   └── settings/       # App configuration
├── src/services/           # authService, Firebase ops
├── features/               # Guardian + Location features
└── components/             # Reusable UI components
```

---

## SLIDE 6 — Feature 1: Home Dashboard

### 🏠 The Command Center for Your Safety

**Real-time features on the Home Screen:**

- 🌤️ **Smart Greeting** — Time-aware greeting with user's name from Clerk profile
- 📍 **Live Location** — Shows your current street address using reverse geocoding
- 🗺️ **Active Journey Map** — Live OpenStreetMap preview of your current location
- 🛡️ **AI Safety Score** — Dynamic score (0–100) calculated based on:
  - Time of day (night = lower score)
  - Location tracking status
  - Lifestyle, Travel, Home, Digital categories
- ⚡ **Quick Actions Grid** — 10 instant action shortcuts
- 📞 **Emergency Dialer** — One-tap calls to Police (100), Ambulance (102), Women's Helpline (1091)
- 👥 **Trusted Contacts Preview** — Shows your real safety network

---

## SLIDE 7 — Feature 2: SOS Emergency System

### 🆘 Activate Help in Seconds

**How SOS Works:**
```
User Holds SOS Button (3 seconds)
        ↓
Haptic feedback + Visual progress ring
        ↓
SOS Activated → Redirects to /sos/active
        ↓
Trusted contacts notified with live location
        ↓
User presses "I am Safe" → SOS cancelled
```

**Emergency Quick Dial:**
- 🔵 **Police** → Direct call to 100
- 🔴 **Ambulance** → Direct call to 102
- 🟣 **Guardian** → Calls your registered primary guardian
- 🌐 **Emergency 112** → Universal India emergency
- 💬 **Quick SMS** → Pre-filled "I feel unsafe" message with your live address

---

## SLIDE 8 — Feature 3: Live GPS Tracking

### 📍 Real-Time Location Sharing

**What Makes It Powerful:**

| Feature | How It Works |
|---|---|
| **Live Map** | Real interactive OpenStreetMap, no API key needed |
| **Session Timer** | Counts up from 00:00:00 the moment screen opens |
| **Distance Traveled** | Uses Haversine Formula to calculate exact km traveled |
| **Trusted Contacts** | Shows your real saved contacts from Firebase profile |
| **Stop Sharing** | Instantly stops GPS tracking and returns to Dashboard |
| **Custom Marker** | Animated purple dot showing your exact live position |

**The Haversine Algorithm:**
> Calculates the great-circle distance between two GPS coordinates on Earth — giving you real km accuracy as you move in real time.

---

## SLIDE 9 — Feature 4: Community Safety

### 👥 Crowdsourced Safety Intelligence

**Two Views in One Screen:**

#### 📋 Incident Feed
- Real-time list of all reports pulled from Firebase Firestore
- Incident categories: **Harassment, Poor Lighting, Suspicious Activity, Blocked Path**
- **Upvote / Downvote** system with live Firebase sync
- **Share** any incident to WhatsApp or other apps
- Tap any card to see **full incident details** with map location

#### 🗺️ Safety Heatmap
- Interactive OpenStreetMap showing **real incident locations** as colored circles
- Color coding: 🔴 Harassment | 🟡 Suspicious | 🟠 Poor Lighting
- **Report New Incident** button — GPS auto-fills your location
- Data sourced 100% from `community_reports` Firestore collection

---

## SLIDE 10 — Feature 5: Crime Rate Analysis

### 📊 AI-Powered Risk Scoring

**Dynamic Risk Score Algorithm:**

```
Risk Score =
    (Harassment Reports × 15) +
    (Theft/Assault Reports × 20) +
    (Suspicious Activity × 10) +
    (Poor Lighting Reports × 5)

Score capped at 100. Thresholds:
  0–35  → Low      (Green circle)
  36–70 → Moderate (Orange circle)
  71+   → High     (Red circle)
```

**Screen Features:**
- 📍 Shows your real GPS location (Reverse Geocoded city name)
- 🎯 Big centered risk score circle — color changes dynamically
- ⏰ Time Analysis: Safest Hours vs High Risk Hours
- 📋 Live "Recent Incidents" breakdown driven by real community data
- 💬 Dynamic description text — different message for Low / Moderate / High

---

## SLIDE 11 — Feature 6: AI Safety Assistant

### 🤖 Meet Ananya — Your AI Safety Advisor

**SafeSphere's built-in AI chatbot:**
- Available 24/7 for safety advice and guidance
- Can suggest safe routes and escape plans
- Provides mental health support during stressful situations
- Integrated directly into the app — no external app switching needed

**Example Conversation:**
> 🙋 "I'm being followed, what should I do?"
>
> 🤖 Ananya: "Stay calm. Move towards a crowded public place immediately. Press and hold the SOS button on your home screen. I'll help you alert your trusted contacts right away."

---

## SLIDE 12 — Feature 7: Fake Call

### 📞 Escape Uncomfortable Situations Discreetly

**The Fake Call Feature:**
- Simulates an incoming phone call on your screen
- Gives you a believable reason to leave any uncomfortable situation
- Works instantly without internet connection
- A trusted personal safety technique used globally

> **Use Case:** You're in an uncomfortable situation, being pressured, or on a bad date. One tap makes your phone "ring" so you can leave gracefully without confrontation.

---

## SLIDE 13 — Feature 8: Profile & Guardian Network

### 👤 Your Personal Safety Hub

**Profile Screen Features:**
- ✏️ **Edit Profile** — Change name and phone number (saved to Firebase)
- ➕ **Add Trusted Contacts** — Store name + phone number to your network
- 🗑️ **Delete Contacts** — Manage your safety network anytime
- ⚙️ **Safety Settings Toggles:**
  - SMS Fallback (when internet is down)
  - Background Location Tracking
  - Push Notifications
  - Shake-to-SOS Trigger
- 🚪 **Sign Out** — Secure session management via Clerk

**Real-time Sync:**
> Contacts saved in Profile automatically appear in the Live Tracking screen and Home Dashboard.

---

## SLIDE 14 — Authentication Flow

### 🔐 Secure Multi-Step Onboarding

```
App Launch
    ↓
Welcome / Splash Screen
    ↓
Sign Up / Sign In (Email + Password OR Google OAuth)
    ↓
OTP Verification (Phone number)
    ↓
Safety Info Collection (location preferences)
    ↓
Personal Details Setup
    ↓
Trusted Contacts Setup
    ↓
✅ Home Dashboard
```

**Security Stack:**
- **Clerk** — Industry-grade user session management
- **Google OAuth** — Secure one-tap sign-in
- **Firebase Firestore** — Encrypted cloud database
- **Route Guards** — Unauthenticated users are always redirected to sign-in

---

## SLIDE 15 — UI/UX Design Philosophy

### 🎨 Premium Neumorphic Design Language

**Design Principles:**
- **Neumorphism** — Soft extruded cards that feel physical and premium
- **Consistent Color Palette:**
  - Primary: `#6D35E8` (Purple) — Trust & Security
  - Background: `#EBF0F9` (Cool Blue-Grey) — Calm & Professional
  - Success: `#12B76A` (Green) — Safety confirmed
  - Danger: `#F04438` (Red) — Emergency states

**Micro-Interactions:**
- 🔔 Haptic feedback on every button press (`expo-haptics`)
- 📦 Spring animations on card press
- 💫 Pulse animations on all live/active indicators
- 🌊 Smooth scroll throughout all screens

**User Experience:**
- Large, readable text and clear visual hierarchy
- High contrast color coding for quick recognition in emergencies
- Clear icon + label pairings on every action button

---

## SLIDE 16 — Database Architecture

### 🗄️ Firebase Firestore Collections

```
Firestore Database
│
├── users/{userId}
│   ├── fullName: string
│   ├── phone: string
│   ├── trustedContacts: Contact[]
│   └── settings: { smsFallback, bgTracking, ... }
│
├── community_reports/{reportId}
│   ├── category: string
│   ├── description: string
│   ├── location: string (reverse geocoded)
│   ├── latitude: number
│   ├── longitude: number
│   ├── votes: number
│   ├── upvoters: string[]   (userId array)
│   ├── downvoters: string[] (userId array)
│   ├── verified: boolean
│   └── createdAt: Timestamp
│
└── guardians/{userId}
    └── registeredGuardians: Guardian[]
```

---

## SLIDE 17 — Real-Time Data Flow

### 📡 How Everything Connects

```
User's Phone GPS
      ↓
expo-location (watchPositionAsync — every 5 sec)
      ↓
Live Tracking Screen ──── Distance (Haversine Math)
      ↓                          ↓
Crime Rate Screen          Home Dashboard Map
      ↓                          ↓
Firebase Firestore ──────── Community Feed
                                  ↓
                           Safety Heatmap
```

**Real-time updates active in:**
- Community Feed (refreshes automatically on screen focus)
- Live Tracking GPS (every 5 seconds or 5 meters moved)
- Session Duration timer (every 1 second)
- Safety Score (time-of-day aware on load)

---

## SLIDE 18 — Safety Use Cases

### 🎯 Who Is This For?

| User | Scenario | Feature Used |
|---|---|---|
| College student | Walking home at night, feels followed | **SOS + Live Tracking** |
| Worried parent | Wants to track child's commute | **Live Tracking + Guardian View** |
| Solo traveler | In an unknown city at night | **Crime Rate Score + Heatmap** |
| Woman on a bad date | Needs a graceful exit | **Fake Call Feature** |
| Local resident | Spots a broken streetlight | **Community Report** |
| Anyone in danger | Needs immediate police help | **Emergency 112 Direct Dial** |

---

## SLIDE 19 — Key Differentiators

### 🏆 What Makes SafeSphere Different?

| Feature | Generic Apps | SafeSphere AI |
|---|---|---|
| **Maps** | Requires paid Google Maps API | ✅ Free OpenStreetMap |
| **Crime Data** | Static government reports | ✅ Live crowdsourced Firestore data |
| **Authentication** | Basic email only | ✅ Clerk + Google OAuth + OTP |
| **Guardian Alerts** | Email only | ✅ SMS + App notification |
| **AI Assistance** | None | ✅ Built-in Ananya AI advisor |
| **Design** | Flat & generic | ✅ Premium Neumorphic UI |
| **India-Specific** | No | ✅ Pre-set Indian emergency numbers |
| **Free to Run** | High API costs | ✅ OSM tiles + free Firebase tier |

---

## SLIDE 20 — Future Roadmap

### 🚀 What's Coming Next

**Phase 2:**
- 🔴 Real-time SOS push notifications to guardian phones (Firebase Cloud Messaging)
- 🗺️ AI-powered safe route suggestions between two GPS points
- 👁️ Background shake-to-SOS trigger using phone motion sensor

**Phase 3:**
- 🌐 Web dashboard for guardians to monitor live location
- 📱 Guardian companion app (separate lightweight app)
- 🔊 Audio recording during SOS for evidence capture

**Phase 4 — Long Term:**
- 🚔 Direct API integration with police FIR system
- 🛰️ Offline SOS via satellite emergency connectivity
- 🌍 Multi-language support (Hindi, Bengali, Telugu, Tamil)

---

## SLIDE 21 — Live Demo Flow

### 🎬 Demonstration Script (5 Minutes)

```
Step 1 → Launch app → Sign in with Google OAuth
Step 2 → View Home Dashboard → Live location + safety score
Step 3 → Hold SOS button → Watch activation animation
Step 4 → Navigate to Community → Switch Feed vs Heatmap
Step 5 → Submit a new incident report → Appears on map instantly
Step 6 → Open Live Tracking → GPS tracker + session timer ticking
Step 7 → Check Crime Rate → Dynamic score from real community data
Step 8 → Open Profile → Add a trusted contact
Step 9 → Return to Live Tracking → New contact appears automatically
Step 10 → Tap "Stop Sharing" → Returns safely to home
```

---

## SLIDE 22 — Summary

### ✅ What We Built

> **SafeSphere AI** is a fully functional, production-ready personal safety mobile application that delivers:

- 🔐 **Secure Authentication** — Clerk + Firebase + Google OAuth
- 📍 **Real-Time GPS** — Live tracking with Haversine distance math
- 🗺️ **Interactive Maps** — OpenStreetMap (free, no API key needed)
- 👥 **Community Safety** — Live crowdsourced Firestore data
- 🤖 **AI Assistant** — 24/7 safety advisor (Ananya)
- 🆘 **Emergency System** — SOS + Quick Dial + Fake Call
- 📊 **Dynamic Risk Scoring** — Calculated from real community reports
- 🎨 **Premium Neumorphic UI** — Micro-animations + Haptic feedback

---

## SLIDE 23 — Thank You

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│            🛡️  THANK YOU                                   │
│                                                             │
│     "Your Safety is Our Priority"                          │
│                                                             │
│     GitHub:                                                 │
│     github.com/priyabratasahoo780/Safety-App               │
│                                                             │
│     Tech Stack:                                             │
│     React Native + Expo + Firebase + Clerk                 │
│                                                             │
│     Built with ❤️ by Priyabrata Sahoo                      │
│                                                             │
│              ❓ Questions Welcome!                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---
*SafeSphere AI — Empowering personal safety through technology*
