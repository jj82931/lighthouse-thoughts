# Lighthouse Thoughts 💡

> An AI-powered emotional wellness journal to illuminate your inner world.

Lighthouse Thoughts is a modern web application designed to be a safe and insightful space for users to explore their thoughts and emotions. By leveraging the power of AI, it transforms traditional journaling into an interactive and supportive experience, helping users gain a deeper understanding of their emotional landscape.

## 🎯 The Goal & The Problem

In a fast-paced world, finding the time and space to process our emotions can be challenging. Many people struggle to articulate their feelings or identify underlying emotional patterns. Traditional journaling is a powerful tool, but it often lacks feedback and can feel like a one-way conversation.

Lighthouse Thoughts aims to solve this by providing:
- A **private, non-judgmental space** for self-expression.
- **Actionable insights** derived from journal entries.
- **Personalized support** that adapts to the user's emotional state.

## ✨ The Solution & Key Features

This application serves as a digital companion that actively listens, analyzes, and supports the user's wellness journey.

-   **Secure Diary Management:** Full CRUD (Create, Read, Update, Delete) functionality for journal entries, securely stored in Firestore and protected by Firebase Authentication.

-   **AI-Powered Analysis:** After a user writes an entry, a sophisticated AI model analyzes the text to provide:
    -   A comprehensive emotional analysis.
    -   A quantitative **Mood Score** (0-100).
    -   Core **emotional keywords**.

-   **Customizable AI Personas:** Users can choose from distinct AI "personas" (e.g., an empathetic friend, a logical advisor). Each persona provides feedback in a unique tone and style, offering a tailored analysis experience.

-   **Curated Content Recommendations:** Based on the AI's analysis, the app suggests relevant YouTube videos (music, guided meditations, nature sounds) to support the user's current mood.

-   **Secure Backend Architecture:** All sensitive API calls to AI models (OpenRouter) and the YouTube Data API are proxied through **Firebase Cloud Functions**. This ensures API keys are never exposed on the client-side, providing robust security.

-   **NEW - The Emotional Voyage Log:** A weekly/monthly report that visualizes the user's emotional journey. Instead of plain charts, it offers:
    -   An **"Emotion Galaxy"** that visualizes entries as stars.
    -   A **"Heart's Compass"** word cloud of core keywords.
    -   An AI-generated summary of the journey's overall theme and an encouraging "Lighthouse Message," delivered in the voice of the user's favorite persona.

## 🧪 Testing & User Feedback

Following the latest deployment, which included the major backend refactor and the new Emotional Voyage Log feature, the app was shared with a small group of friends and neighbors. The feedback was overwhelmingly positive. Users particularly praised:
-   The **novelty and insightfulness of the AI Personas**, which made the experience feel deeply personal.
-   The **"Emotion Galaxy"** visualization, describing it as a "beautiful and gentle way to look back at my week."
-   The feeling of **security and privacy**, knowing their personal entries were being analyzed by a trusted AI companion.

## 🛠️ Tech Stack

-   **Frontend:** React, Vite, Redux Toolkit, Tailwind CSS, Framer Motion, Headless UI
-   **Backend:** Node.js, TypeScript, Firebase Cloud Functions
-   **Database:** Firestore
-   **Services:**
    -   Firebase Authentication, Hosting
    -   OpenRouter (for access to AI models like DeepSeek)
    -   YouTube Data API v3

## 📈 Future Development Roadmap

-   [ ] **Enhance Reports:** Add trend analysis over longer periods (e.g., mood score charts over 3/6 months) and more interactive visualizations.
-   [ ] **Add More Personas:** Introduce new AI personas based on user feedback (e.g., a playful motivator, a stoic philosopher).
-   [ ] **Gentle Reminders:** Implement optional push notifications to encourage consistent journaling.
-   [ ] **Data Export:** Allow users to export their journal entries in a readable format like PDF or Markdown.
-   [ ] **Theme Customization:** Enable users to choose between different color themes for the UI.

## 🔧 Getting Started & Setup

To set up and modify this project locally, follow these steps:

**Prerequisites:**
-   Node.js (v18 or higher)
-   Firebase CLI (`npm install -g firebase-tools`)

**1. Clone the repository:**
```bash
git clone https://github.com/your-username/lighthouse-thoughts.git
cd lighthouse-thoughts
```

**2. Install dependencies:**
```bash
# Install root (frontend) dependencies
npm install

# Install backend dependencies
cd functions
npm install
cd ..
```

**3. Firebase Project Setup:**
-   Create a new project on the [Firebase Console](https://console.firebase.google.com/).
-   Enable **Authentication** (with Google Provider), **Firestore**, and **Functions**.
-   Register a new Web App in your Firebase project settings and copy the Firebase config object.

**4. Environment Variables:**
-   **Frontend:** Create a `.env` file in the project root. Add your Firebase config keys and the URLs for your deployed Cloud Functions.
    ```
    # .env
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_PROJECT_ID=...
    # ... and so on

    VITE_ANALYZE_DIARY_URL=...
    VITE_SEARCH_YOUTUBE_URL=...
    VITE_GENERATE_REPORT_URL=...
    ```
-   **Backend:** Set up secret keys for the Cloud Functions using the Firebase CLI. This is more secure than using `.env` files for the backend.
    ```bash
    firebase functions:secrets:set DEEPSEEK_KEY
    firebase functions:secrets:set YOUTUBE_KEY
    ```
    You will be prompted to enter the secret values.

**5. Run the application:**
-   For a full development experience with live reloading, run the Firebase Emulators and the Vite dev server in separate terminals.
    ```bash
    # Terminal 1: Start emulators
    firebase emulators:start

    # Terminal 2: Start Vite dev server
    npm run dev
    ```
