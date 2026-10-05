# PrepPulse AI - Full-Stack AI-Powered Mock Interview Platform

A full-stack, enterprise-grade AI mock interview platform built on the **MERN stack** (MongoDB, Express, React, Node.js) and powered by **Google Gemini AI**.

---

## 🌟 Key Features

1. **🎙️ Voice-to-Voice AI Interviewer**:
   - Spoken question delivery using browser Speech Synthesis.
   - Live speech recognition (speech-to-text) transcribing candidate answers in real-time.
   - Audio waveform visualizer reflecting speaking and listening states.

2. **📹 Video Simulation Tile**:
   - Mirror video feed using browser webcam (`getUserMedia`) to simulate a genuine video interview.
   - Quick toggles for camera and microphone.

3. **💻 Live Coding Sandbox**:
   - Built-in multi-language code editor (JavaScript, TypeScript, Python, Java, SQL).
   - Line numbers, tab indentation, syntax simulation runner, code reset, and copy to clipboard.

4. **🤖 Dynamic Probing & Follow-Up Questions**:
   - The AI evaluates intermediate candidate answers and asks challenging follow-up questions on edge cases and trade-offs.

5. **📊 Comprehensive Performance Scorecard**:
   - Overall score (0-100) and hiring verdict ("Strong Hire", "Hire", "Leaning Hire", "Needs Preparation").
   - Categorized metric bars: Technical Depth, Communication Clarity, Problem Solving, Confidence.
   - Question-by-question breakdown with candidate transcript, submitted code, evaluator critique, and exemplary **Model Answers**.
   - Actionable preparation roadmap with targeted next steps.
   - Print & PDF export ready.

6. **📁 Session History & Progress Tracker**:
   - View past mock interview scores, roles, and review previous feedback reports anytime.

7. **⚡ Resilient Hybrid Storage & Smart AI Simulation Fallback**:
   - Connects to MongoDB / MongoDB Atlas. If MongoDB is not running locally, it automatically falls back to local file persistence without failing.
   - Connects to Google Gemini API. If no API key is provided, it uses a built-in smart simulation engine with high-caliber question banks.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Canvas Confetti, Web Speech API
- **Backend**: Node.js, Express, Mongoose, `@google/generative-ai`, CORS, Dotenv
- **Database**: MongoDB / MongoDB Atlas (with automatic resilient local JSON fallback)

---

## 🚀 Quick Start Guide

### 1. Start the Server (Port 5000)
```bash
cd server
npm install
npm start
```
The server will run at: `http://localhost:5000`

### 2. Start the Client (Port 5173)
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## ⚙️ Environment Variables (Optional)

In `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai_mock_interview
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```
*Tip: You can also enter or update your Gemini API Key directly in the web app UI by clicking the AI Settings button in the navigation bar!*

---

## 🧭 API Endpoints

- `GET /api/health` - Health check & active AI provider status
- `POST /api/interviews/generate` - Generate tailored questions and initialize interview
- `POST /api/interviews/:id/submit-answer` - Submit answer and obtain AI follow-up
- `POST /api/interviews/:id/submit-followup` - Record response to follow-up
- `POST /api/interviews/:id/complete` - Finish interview and generate full scorecard
- `GET /api/interviews` - Fetch all past interview sessions
- `GET /api/interviews/:id` - Fetch single interview session details
- `DELETE /api/interviews/:id` - Delete interview record
