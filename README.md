# Tracker Growth 🚀
> **Fast, offline-ready daily productivity, habit tracking, deep work focus, and long-term goal execution platform.**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-3.8_Flash_%7C_3.1_Lite_%7C_4_Argon-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Android APK](https://img.shields.io/badge/Android-APK_%26_PWA_Ready-3DDC84?logo=android&logoColor=white)](#-android-app--apk)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Overview

**Tracker Growth** is an execution platform designed for high-agency builders, students, and engineers. It unites daily task checkpoints, recurring daily habits with streak counters, acoustic deep work focus timers, and quarterly OKR milestones into a single, high-contrast, distraction-free workspace.

It includes full offline persistence, real-time cloud synchronization via Firebase Firestore, interactive Gemini AI reasoning with live Google Search citations, and native Android APK download support.

---

## ✨ Key Features

### 1. 📋 Execution Board & Daily Checkpoints
- **Daily Pacing**: View and manage tasks per day with the smooth horizontal Date Scroller.
- **Micro-Subtasks**: Break complex tasks into bite-sized actionable steps with progress indicators.
- **Categorization**: Organize by domains: *Engineering, Research, Deep Work, Health, Academic*.
- **Quick Filters**: Instantly toggle between *All, In-Progress, and Completed* tasks, plus search by keywords.

### 2. 🔄 Habits Tracker & Streaks
- **Daily Habit Check-ins**: Track recurring routines (exercise, reading, hydration, code review).
- **Streak Velocity**: Automated streak counters that celebrate consistency.
- **7-Day Mini Heatmap**: Visual 7-day dot matrix indicating completion history for every routine.
- **Quick Starters**: Pre-configured habit templates with customizable target durations.

### 3. ⏱️ Deep Work Execution Chamber
- **Focus Timer**: Single-task lock-in with customizable Pomodoro blocks (25m, 45m, 60m, 90m).
- **Acoustic Noise Generator**: Built-in Web Audio synthesis providing *Binaural Alpha Waves*, *Rain Ambience*, and *Analog Tape Hum* to mask distractions without external music services.
- **Session Logging**: Automatically records focused time back to the active checkpoint.

### 4. 🤖 Multi-Model Gemini AI Assistant
- **Choose Your Model**:
  - **Gemini 3.8 Flash** *(Recommended)*: Fast, balanced reasoning with real-time Google Web Search citations.
  - **Gemini 3.1 Flash Lite**: Ultra-fast, lightweight responses for rapid breakdown.
  - **Gemini 4 Argon**: High-power multimodal reasoning for deep technical planning.
- **Co-Pilot Task Extractor**: Type a single natural-language sentence on the board and convert it directly into scheduled tasks.
- **1-Click Checkpoint Conversion**: Turn any AI suggestion from chat into a live task on your board.

### 5. 🎯 Quarterly Growth Trajectory (OKRs)
- **High-Leverage Milestones**: Track progress toward long-term quarterly goals.
- **Velocity Meter**: Dynamic calculation of invested hours versus target velocity.
- **Visual Evidence**: Attach design diagrams, system architectures, and figures to any goal.

### 6. 📱 Android App & Standalone APK
- **1-Tap Direct Install**: Progressive Web App (PWA) with offline Service Worker and Web App Manifest.
- **Direct APK Download**: Built-in Android APK package (`tracker-growth.apk`) available directly from `/api/download/android-apk`.
- **Offline First**: All tasks, habits, and timer logs persist in browser `localStorage` and IndexedDB even when offline.

### 7. 📊 Data Portability & CSV Export
- **CSV Export**: Export your complete task history, goal progression, and habit streaks as an RFC 4180 CSV spreadsheet for Excel, Google Sheets, or custom data science pipelines.
- **JSON Backup**: Download full workspace JSON backup for archival and transfer.

### 8. 🛡️ Authentication & Root Administration
- **Google / Gmail Authentication**: Instant sign-in via Google OAuth or verified email.
- **PBKDF2 Password Security**: Salted hashing with 10,000 iterations for secure local credentials.
- **Root Admin Dashboard**: Complete governance dashboard for managing users, purging cache, broadcasting announcements, and auditing system events.

### 9. 🎨 Responsive & Accessible UI
- **Dual Surface Theming**: Switch between Obsidian Slate (`#0B1020`) and Clean Daylight (`#F5F7FC`).
- **Device Agnostic**: Fully responsive layout tailored for Phones (375px–430px), Tablets (768px–1023px), Laptops (1024px–1440px), and Ultra-wide Desktops.
- **Sound Feedback**: Synthesized audio clicks, chimes, and haptics powered by standard Web Audio API.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript 5.8, Vite 8, Tailwind CSS v4, Motion, Lucide Icons |
| **Backend** | Express 4, Node.js (via `tsx` TypeScript runtime) |
| **AI / LLM** | `@google/genai` (Gemini 3.8 Flash, 3.1 Flash Lite, 4 Argon) |
| **Database & Auth** | Firebase Firestore & Firebase Authentication |
| **Audio** | HTML5 Web Audio API (real-time synthesizers, pink/binaural generators) |
| **Mobile / PWA** | Progressive Web App (Service Worker, Manifest) + Android APK package |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- Google Gemini API key ([Get one for free at Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/tracker-growth.git
   cd tracker-growth
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example `.env` file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and add your credentials:
   ```env
   # Required for Gemini AI Chat and Task Extractor
   GEMINI_API_KEY="your-gemini-api-key-here"

   # App URL (default http://localhost:3000)
   APP_URL="http://localhost:3000"
   PORT=3000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Project Structure

```text
├── public/                  # Static assets, logos, favicon, manifest
│   ├── favicon.svg          # App icon
│   ├── logo.svg             # Vector brand logo mark
│   └── tracker-growth.apk   # Ready-to-download Android APK package
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AddTaskModal.tsx        # Checkpoint creation dialog
│   │   ├── AndroidInstallModal.tsx # PWA install & APK download center
│   │   ├── AuthModal.tsx           # Login, registration & Google sign-in
│   │   ├── BottomDock.tsx          # Mobile floating navigation dock
│   │   ├── DateScroller.tsx        # Horizontal date carousel
│   │   ├── HabitsTracker.tsx       # Daily habits, streaks & 7-day mini heatmap
│   │   ├── Header.tsx              # Utilitarian top app bar & theme toggle
│   │   ├── Sidebar.tsx             # Desktop workspace navigation & domain filters
│   │   ├── TaskCard.tsx            # Expandable task with subtasks & audio
│   │   └── ...
│   ├── views/               # Primary workspace views
│   │   ├── ExecutionBoard.tsx      # Today's tasks, Co-Pilot bar & KPI metrics
│   │   ├── DeepWorkChamber.tsx     # Focus timer dial & acoustic generator
│   │   ├── GeminiChatView.tsx      # Multi-model AI chat with search grounding
│   │   ├── GrowthTrajectory.tsx    # Long-term OKR growth arcs
│   │   ├── AdminDashboardView.tsx  # Full governance & user management
│   │   └── SettingsView.tsx        # Audio, theme, and CSV/JSON export
│   ├── utils/
│   │   ├── audio.ts                # Pure Web Audio API sound & ambient generator
│   │   └── firebase.ts             # Firebase client SDK initialization
│   ├── types/
│   │   └── index.ts                # TypeScript domain models and interfaces
│   ├── App.tsx              # Root application router and global state
│   ├── main.tsx             # React application DOM entry point
│   └── index.css            # Tailwind CSS styling and theme design tokens
├── server.ts                # Express backend proxy for Gemini AI & APK downloads
├── package.json             # Scripts & dependencies
└── tsconfig.json            # TypeScript configuration
```

---

## 📱 Android App & APK

Tracker Growth supports two convenient mobile distribution options:

1. **Native PWA (Add to Home Screen)**:
   - Open the web app on Chrome / Safari on your mobile device.
   - Tap **Android APK / App** in the header and click **1-Tap Direct Install**.
   - The app installs as a standalone app with full offline cache.

2. **Standalone APK**:
   - The package is compiled and bundled at `public/tracker-growth.apk`.
   - Download directly from your running instance via `/api/download/android-apk` or through the **Android App & APK Center** modal in the UI.

---

## 🔒 Security & Admin Access

- **Root Admin**: Configured with full administrative privileges to oversee users, review session logs, broadcast announcements, and reset credentials.
- **Honeypot Spam Defense**: Registration and recovery forms feature invisible honeypot verification.
- **Client-Side Data Safety**: Tasks, goals, and habits function completely offline even without a backend connection.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/your-username/tracker-growth/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
