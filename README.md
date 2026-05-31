# ሉሲ (Lucy) - AI-Powered Cultural Tour Guide

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React Native](https://img.shields.io/badge/Mobile-React%20Native-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Mobile-Expo-000020.svg?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.3-orange.svg)](https://groq.com/)

**ሉሲ (Lucy)** is a state-of-the-art, multilingual AI tour guide designed to promote and preserve Ethiopian cultural heritage. Named after the famous hominid fossil, Lucy leverages advanced AI to provide an immersive, conversational experience for tourists and history enthusiasts.

---

## 🎬 See Lucy in Action

<a href="#" onclick="document.getElementById('videoModal').style.display='flex'; return false;" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 28px; border-radius: 40px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: transform 0.2s;">▶ Watch Demo Video</a>

<div id="videoModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 9999; justify-content: center; align-items: center;" onclick="if(event.target === this) this.style.display='none'">
  <div style="position: relative; width: 90%; max-width: 800px; background: #000; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5)">
    <button onclick="document.getElementById('videoModal').style.display='none'" style="position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 30px; width: 36px; height: 36px; font-size: 20px; cursor: pointer; backdrop-filter: blur(5px); z-index: 10;">✕</button>
    <video controls autoplay style="width: 100%; display: block;">
      <source src="https://github.com/sol654/Lucy_AI_POWERED_TOUR_GUIDE/blob/main/LucyDemo_24mb_v2.mp4?raw=true" type="video/mp4">
      Your browser does not support the video tag.
    </video>
  </div>
</div>

> ⚡ *Click the button above to experience Lucy's capabilities — voice interaction, multilingual support, and intelligent tour guidance.*

---

## ✨ Key Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🎙️ Voice-First Intelligence</h3>
      <p>Conversational AI powered by <b>Groq Whisper</b> for real-time voice transcription and <b>gTTS</b> for natural, expressive speech synthesis. Speak naturally, get instant responses.</p>
      
      <h3>🌍 Multilingual Mastery</h3>
      <p>Fully localized in <b>Amharic (አማርኛ)</b>, <b>Tigrinya (ትግርኛ)</b>, <b>Oromo (Afaan Oromoo)</b>, and <b>English</b> — breaking language barriers for global travelers.</p>
      
      <h3>🧠 Context-Aware RAG Pipeline</h3>
      <p>Advanced <b>Retrieval-Augmented Generation</b> using <b>FAISS</b> + <b>Sentence Transformers</b> delivers historically accurate, fact-grounded answers — no hallucinations.</p>
    </td>
    <td width="50%" valign="top">
      <h3>🗺️ Interactive Heritage Maps</h3>
      <p>Explore <b>11+ UNESCO and local heritage sites</b> with integrated <b>Geolocation</b>, turn-by-turn navigation, and rich multimedia content for each location.</p>
      
      <h3>🎒 Personalized Cultural Journeys</h3>
      <p>Create custom itineraries, bookmark favorite landmarks, and receive AI-curated recommendations based on your interests and travel history.</p>
      
      <h3>🛡️ Enterprise Admin Dashboard</h3>
      <p>Comprehensive management system for heritage sites, real-time user feedback analytics, content moderation, and visitor engagement metrics.</p>
    </td>
  </tr>
</table>

---

## 🏛️ Project Structure

```text
.
├── backend/          # FastAPI Python Backend (RAG, Voice, Auth, Vector DB)
├── mobile/           # React Native Expo App (Voice UI, Maps, Offline support)
├── docker-compose.yml # Production orchestration (Backend + PostgreSQL + Redis)
└── README.md         # This file
```

---

## 🚀 Getting Started

### 🐳 Option 1: Using Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/sol654/Lucy_AI_POWERED_TOUR_GUIDE.git
cd Lucy_AI_POWERED_TOUR_GUIDE

# 2. Configure environment (copy .env.example to .env in /backend)
cp backend/.env.example backend/.env

# 3. Build and run all services
docker-compose up --build
```

### 🛠️ Option 2: Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed        # Seed heritage site data into FAISS
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Mobile Setup
```bash
cd mobile
npm install
npx expo start --tunnel
```

> 📱 *Scan the QR code with Expo Go (Android) or Camera app (iOS) to try Lucy on your phone.*

---

## 🏗️ AI Architecture

Lucy's intelligence flows through a modern, low-latency pipeline:

```
🗣️ User Voice Input
       ↓
🎙️ Groq Whisper (STT) → Transcription
       ↓
🔍 FAISS Vector Search → Heritage Context Retrieval
       ↓
🧠 Llama 3.3 70B → Response Generation (Grounded in facts)
       ↓
🔊 gTTS → Multilingual Audio Output
       ↓
🎧 User Hears Natural Response
```

**Total latency**: ~1.5-3 seconds end-to-end ⚡

---

## 🔐 Environment Configuration

### Backend (`/backend/.env`)

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `GROQ_API_KEY` | API key from [Groq Console](https://console.groq.com) | ✅ |
| `GEOAPIFY_API_KEY` | API key for Maps & Geocoding | ✅ |
| `FIREBASE_PROJECT_ID` | Firebase project ID for image CDN | ✅ |
| `JWT_SECRET_KEY` | Secret key for auth tokens (min 32 chars) | ✅ |
| `REDIS_URL` | Redis URL for caching (default: redis://redis:6379) | ❌ |

---

## 👤 Default Admin Access

After seeding the database, use these credentials to access the admin dashboard:

| Field | Value |
|---|---|
| **Email** | `admin@lucy.app` |
| **Password** | `Admin@Lucy2024!` |

> 🔐 *Change this password immediately after first login in production environments.*

---

## 🤝 Contributing

We welcome contributions from developers, historians, and heritage enthusiasts!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request with detailed description

**Areas needing help**:
- Additional Ethiopian languages (Somali, Sidama, Wolaytta)
- Offline mode for remote heritage sites
- AR integration for site reconstruction

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- Ethiopian Heritage Authority for cultural consultation
- Groq for ultra-fast LLM inference
- OpenStreetMap contributors for geodata

---

<p align="center">
  <b>Built with ❤️ for Ethiopian Heritage Preservation</b><br>
  <i>Promoting Tourism through Artificial Intelligence</i>
</p>

