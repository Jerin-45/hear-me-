# HearMe AI – AI-Powered Hearing Accessibility Platform

> **Tagline:** Communication Without Barriers.  
> **Target Audience:** Deaf and hard-of-hearing individuals, educators, students, healthcare workers, and everyone communicating with them.  
> **Language Standard:** STRICTLY ENGLISH ONLY (`en-IN` English (India) and `en-US` English (United States)).

---

## 1. Overview & Problem Statement

Deaf and hard-of-hearing individuals face significant friction daily when navigating conversations in classrooms, medical clinics, transit stations, and workplaces. Spoken communication happens fast, background noise interferes with hearing aids, and real-time captioning or certified sign-language interpreters are often unavailable.

**HearMe AI** is an AI-powered accessibility platform built from the ground up to eliminate these barriers. It unifies:
1. **Live Caption Studio**: Real-time continuous English speech-to-text with large readable typography, dialect customization, and high-contrast modes.
2. **Sign Language Learning Library**: An authentic, categorized library of Indian Sign Language (ISL) vocabulary, with step-by-step instructions, visual diagrams, and learning progress tracking.
3. **AI Sign Language Explainer**: A Gemini AI-powered educator explaining conversational nuance, deaf etiquette context, sign guidance, and polite alternatives.
4. **Camera Sign Recognition**: An experimental computer-vision prototype using MediaPipe Hands 21-landmark tracking to detect 5 core gestures (**HELLO, HELP, YES, NO, THANK YOU**).
5. **Text-to-Speech Communication**: Instant synthesis of typed messages and quick conversational phrases into spoken English with custom speech rates.
6. **AI Conversation Summarizer**: Extraction of key directives, deadlines, action items, and simplified points from lecture or meeting transcripts.
7. **AI Accessibility Assistant**: A floating accessible assistant answering hearing accessibility concepts and communication techniques in English.

---

## 2. Technology Stack

- **Frontend:**
  - React 18, Vite 6, TypeScript
  - Tailwind CSS (Premium Monochrome SaaS palette: #000000, #FFFFFF, #111111, #1C1C1C, #777777, #E5E5E5, #F7F7F7)
  - Framer Motion & CSS keyframe animations with reduced-motion overrides
  - Lucide React accessible iconography
  - Canvas Confetti for sign learning milestones
- **Speech Technologies:**
  - **Web Speech API** (`webkitSpeechRecognition` / `SpeechRecognition`) for real microphone live captions.
  - **SpeechSynthesis API** for customizable English text-to-speech audio playback.
- **Computer Vision:**
  - **MediaPipe Hands** (21 3D hand landmarks via official CDN scripts)
  - Custom geometric heuristic gesture classifier.
- **AI Core:**
  - **Google Gemini API** (`gemini-1.5-flash`) orchestrated through a secure Express backend.
  - Zero API keys exposed on the client.
- **Backend & Database:**
  - Node.js & Express server with TypeScript support
  - Firebase Authentication & Cloud Firestore (with fallback local session state)
  - Firebase Hosting & Firestore Security Rules

---

## 3. Key Pages & Routes

| Route | Page | Key Capability |
| :--- | :--- | :--- |
| `/` | **Landing Page** | Platform overview, live caption preview, feature cards, tech stack, WCAG benefits. |
| `/login` | **Sign In** | Firebase authentication, form validation, password visibility toggle, 1-click evaluator login. |
| `/register` | **Registration** | Account creation with full name, email, and password validation. |
| `/dashboard` | **Main Dashboard** | User stats, quick launcher, recent caption activity feed, and prominent "Start Listening" CTA. |
| `/captions` | **Live Caption Studio** | Real-time speech captions, dialect toggle (en-IN / en-US), font scaling (16px–48px), high contrast, download TXT, save to history. |
| `/sign-language` | **Sign Library** | 8 categories (Greetings, Everyday, Emergency, Medical, Education, Food & Drinks, Travel, Responses), ISL references, favorite & learned toggles. |
| `/sign-explainer` | **AI Sign Explainer** | Structured Gemini AI breakdown: Meaning, Context, Simple Explanation, Sign Guidance, Polite Alternatives, and Verified Reference standard. |
| `/sign-recognition`| **Camera Recognition** | MediaPipe hand landmark tracking, real-time canvas skeleton, detection of HELLO, HELP, YES, NO, THANK YOU, and honest "Unknown Gesture". |
| `/communication` | **Text to Speech** | Large text input, rate (0.5x–1.8x) & pitch sliders, voice selection, quick phrase chips that automatically insert into text. |
| `/summarizer` | **AI Summarizer** | Gemini digest extracting Short Summary, Important Points, Instructions, Tasks, and Deadlines from pasted transcripts. |
| `/settings` | **Accessibility Settings**| Font scaling preview, high contrast toggle, dark/light theme, dialect selection, TTS speed, transcript management, and privacy policies. |

---

## 4. Privacy & Ethical AI Principles

1. **Microphone Access**:
   - Requested strictly when you click **"Start Listening"** in Live Caption Studio.
   - Speech processing happens on-device or directly through browser speech recognition. No audio recordings are saved or uploaded to external servers.
2. **Camera Access**:
   - Requested strictly when you click **"Start Camera"** in Camera Sign Recognition.
   - Video frames are analyzed locally in browser memory using MediaPipe Hands. Video is never streamed, recorded, or stored.
3. **Sign Language Authenticity**:
   - Prioritizes authentic Indian Sign Language (ISL) referenced from the Indian Sign Language Research and Training Centre (ISLRTC).
   - We **never hallucinate AI-generated hand poses** as authentic sign language. If a verified visual reference is not available, clear English guidance is provided without pretense.
4. **Honest Gesture Recognition**:
   - The camera recognizer is explicitly labeled as an **experimental prototype**.
   - MediaPipe landmarks provide geometric coordinates only; they do not replace human sign language interpreters. Any gesture outside the 5 supported postures is honestly classified as **"Unknown Gesture"**.

---

## 5. Getting Started & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- Google Chrome, Microsoft Edge, or Safari (for Web Speech API & Camera support)

### Installation
```bash
# Clone or navigate to the project directory
cd hearme

# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and configure your API keys:
```env
# Google Gemini API Key (Get free key from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Backend Port (Default: 5001)
PORT=5001

# Optional Firebase Configuration (App operates out-of-the-box in local demo mode without this)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> **Note on AI Out-of-the-Box Mode:** If `GEMINI_API_KEY` is not provided, the backend seamlessly operates in Graceful Demo Mode, delivering realistic, structured educational responses with helpful instructions on how to plug in a live key.

---

## 6. Running the Application

### Option A: Run Both Frontend and Backend Concurrently (Recommended)
```bash
npm run dev
```
- Frontend will open at `http://localhost:5173`
- Backend API will run on `http://localhost:5001`

### Option B: Run Services Separately
Terminal 1 (Backend API):
```bash
npm run server
```

Terminal 2 (Frontend Client):
```bash
npm run dev:frontend
```

### Building for Production
```bash
npm run build
```
Creates an optimized production bundle in `dist/`.

---

## 7. Hackathon Live Demonstration Flow

Follow this step-by-step sequence for judging and demonstration:

1. **Landing Page (`/`)**:
   - Showcase the hero headline *"Communication Without Barriers."*
   - Observe the simulated live caption preview with sound wave animation.
   - Point out the 6 core feature cards and accessibility standards.
2. **Instant Sign In (`/login`)**:
   - Click **"Instant Demo Sign In (Evaluator Mode)"** to immediately access the dashboard without tedious registration, or register a new user.
3. **Main Dashboard (`/dashboard`)**:
   - Review personalized greeting, user statistics (words captioned, signs cataloged), and the prominent **"Start Listening"** button.
4. **Live Caption Studio (`/captions`)**:
   - Click **"Start Listening"** (allow microphone permission in Chrome/Edge).
   - Speak a few English sentences (e.g. *"Welcome to our presentation on hearing accessibility."*).
   - Demonstrate the real-time interim and finalized text stream.
   - Adjust font size controls (`md` to `3xl`) and toggle **High Contrast**.
   - Click **"Copy"**, **"Download TXT"**, and **"Save Session"**.
5. **Sign Language Learning Library (`/sign-language`)**:
   - Filter by categories: *Greetings, Emergency, Medical Communication*.
   - Inspect authentic ISL vector diagrams (Namaste, Help, Thank You, Doctor).
   - Click **"Mark as Learned"** to trigger the celebratory confetti milestone.
6. **AI Sign Language Explainer (`/sign-explainer`)**:
   - Enter *"Where is the hospital?"* or click one of the quick suggestions.
   - Click **"Explain Phrase"**.
   - Walk through the 6-part structured AI output: Meaning, Context, Simple Explanation, Sign Guidance, Polite Alternatives, and ISLRTC Standard Reference.
7. **Camera Sign Recognition Prototype (`/sign-recognition`)**:
   - Click **"Start Camera"** (allow webcam access).
   - Raise your open hand and wave &rarr; Observe real-time 21 MediaPipe hand landmark skeleton & **"HELLO"** recognition.
   - Form a thumbs-up support fist &rarr; Observe **"HELP"** recognition.
   - Close fist &rarr; Observe **"YES"** recognition.
   - Show an unsupported hand pose &rarr; Observe honest **"Unknown Gesture"** state.
   - Click **"Stop Camera"** &rarr; Notice webcam stream terminates cleanly.
8. **Text-to-Speech Communication (`/communication`)**:
   - Click a quick phrase chip such as *"I cannot hear clearly. Please type your message."*
   - Click **"Speak Message"** &rarr; Browser synthesizes audio out loud.
   - Adjust speech rate from 1.0x to 1.4x and test voice.
9. **AI Conversation Summarizer (`/summarizer`)**:
   - Click **"Class Lecture"** or **"Doctor Visit"** sample transcript buttons.
   - Click **"Generate Summary"**.
   - Review the structured breakdown: Summary, Important Points, Instructions, Tasks & Actions, and Deadlines.
10. **Accessibility Settings (`/settings`)**:
    - Showcase live font scaling preview, high-contrast toggle, dark/light theme switch, speech dialect switch (en-IN vs en-US), and privacy declarations.

---

## 8. Deployment to Firebase Hosting

```bash
# 1. Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# 2. Log in to Firebase
firebase login

# 3. Initialize Firebase in this folder (select Hosting and Firestore)
firebase init

# 4. Build the production assets
npm run build

# 5. Deploy to Firebase Hosting
firebase deploy
```

---

## 9. Accessibility Compliance Summary

- **Color Contrast:** Navy (`#0b192c`), Slate (`#020617`), Violet (`#8b5cf6`), Cyan (`#06b6d4`), and pure White (`#ffffff`) exceed WCAG AAA requirements.
- **Zero Sound Dependence:** No visual state or alert requires auditory perception.
- **Motion Reduction:** Full CSS and React reduced-motion support respects `prefers-reduced-motion`.
- **Keyboard Navigation:** High-visibility focus rings and ARIA accessibility labels across all interactive elements.
- **Strict English Only:** Standardized strictly for English (`en-IN` & `en-US`) without multilingual translation overhead.

---

**HearMe AI — Communication Without Barriers.**
