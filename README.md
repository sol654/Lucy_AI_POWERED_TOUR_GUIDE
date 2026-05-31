# ሉሲ (Lucy) - AI-Powered Cultural Tour Guide

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React Native](https://img.shields.io/badge/Mobile-React%20Native-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Mobile-Expo-000020.svg?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.3-orange.svg)](https://groq.com/)

**ሉሲ (Lucy)** is a state-of-the-art, multilingual AI tour guide designed to promote and preserve Ethiopian cultural heritage. Named after the famous hominid fossil, Lucy leverages advanced AI to provide an immersive, conversational experience for tourists and history enthusiasts.

**📢 Open Source & Free for Everyone** — Lucy is completely open source under the MIT license. Anyone can use, modify, and contribute to this project.

---

## 🎬 Demo Video

[![Watch Demo Video](https://img.shields.io/badge/▶️_Click_to_Watch_Demo_Video-red?style=for-the-badge&logo=video&logoColor=white)](https://github.com/sol654/Lucy_AI_POWERED_TOUR_GUIDE/blob/main/LucyDemo_24mb_v2.mp4?raw=true)

**Click the button above to view the demo video** — It will open/download in your browser.

---

## ✨ Key Features

- **🎙️ Voice-First Intelligence** — Powered by Groq Whisper for real-time voice transcription and gTTS for natural speech synthesis. Speak naturally, get instant responses.

- **🌍 Multilingual Support** — Fully localized in Amharic (አማርኛ), Tigrinya (ትግርኛ), Oromo (Afaan Oromoo), and English.

- **🧠 Context-Aware AI** — RAG pipeline using FAISS + Sentence Transformers delivers historically accurate, fact-grounded answers.

- **🗺️ Interactive Heritage Maps** — Explore 11+ UNESCO and local heritage sites with geolocation and turn-by-turn navigation.

- **🎒 Personalized Journeys** — Create custom itineraries, bookmark landmarks, and get AI-curated recommendations.

- **🛡️ Admin Dashboard** — Comprehensive management for heritage sites, feedback analytics, and content moderation.

---

## 📁 Project Structure

```
.
├── backend/          # FastAPI Python Backend (RAG, Voice, Auth)
├── mobile/           # React Native Expo App (UI, Maps, Voice)
├── docker-compose.yml # Production orchestration
└── README.md
```

---

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
git clone https://github.com/sol654/Lucy_AI_POWERED_TOUR_GUIDE.git
cd Lucy_AI_POWERED_TOUR_GUIDE
docker-compose up --build
```

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

**Mobile:**
```bash
cd mobile
npm install
npx expo start
```

---

## 🧠 AI Pipeline

```
Voice Input → Whisper (STT) → FAISS Search → Llama 3.3 → gTTS (TTS) → Audio Response
```

*End-to-end latency: ~1.5-3 seconds*

---

## 🔧 Environment Variables

Create `/backend/.env` with:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection |
| `GROQ_API_KEY` | Get from [Groq Console](https://console.groq.com) |
| `GEOAPIFY_API_KEY` | Maps & geocoding API |
| `JWT_SECRET_KEY` | Secret for auth tokens |

> 🔐 Get your free API keys from the respective services. All are free tier friendly.

---

## 🤝 Contributing

Open source contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Push and open a Pull Request

**Help wanted:** Additional Ethiopian languages, offline mode, AR features.

---

## 📄 License

MIT Open Source License — free for everyone to use, modify, and distribute.

---

## 🙏 Credits

- Groq for LLM inference
- OpenStreetMap contributors

---

<p align="center">
  <b>Built with ❤️ for Ethiopian Heritage Preservation</b><br>
  <i>Open Source • Free • For Everyone</i>
</p>
