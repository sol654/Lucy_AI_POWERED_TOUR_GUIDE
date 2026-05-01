# ሉሲ (Lucy) - AI-Powered Cultural Tour Guide

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React Native](https://img.shields.io/badge/Mobile-React%20Native-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Mobile-Expo-000020.svg?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.3-orange.svg)](https://groq.com/)

**ሉሲ (Lucy)** is a state-of-the-art, multilingual AI tour guide designed to promote and preserve Ethiopian cultural heritage. Named after the famous hominid fossil, Lucy leverages advanced AI to provide an immersive, conversational experience for tourists and history enthusiasts.

---

## ✨ Key Features

- 🎙️ **Voice-First Interaction**: Converse naturally with Lucy using voice queries powered by Groq Whisper and gTTS.
- 🌍 **Multilingual Support**: Fully localized in **Amharic (አማርኛ)**, **Tigrinya (ትግርኛ)**, **Oromo (Afaan Oromoo)**, and **English**.
- 🧠 **Context-Aware AI**: Utilizes RAG (Retrieval-Augmented Generation) with FAISS and Sentence Transformers to provide accurate historical facts.
- 🗺️ **Interactive Maps**: Explore 11+ UNESCO and local heritage sites with integrated Geolocation services.
- 🎒 **Personalized Journeys**: Create custom travel itineraries and save your favorite cultural landmarks.
- 🛡️ **Admin Dashboard**: Comprehensive management system for heritage sites, feedback, and user analytics.

---

## 🏛️ Project Structure

```text
.
├── backend/          # FastAPI Python Backend (RAG, Voice, Auth)
├── mobile/           # React Native Expo App (UI, Voice UI, Maps)
├── docker-compose.yml # Production orchestration
└── README.md         # This file
```

---

## 🚀 Getting Started

### 🐳 Option 1: Using Docker (Recommended)

The easiest way to get the entire system up and running is using Docker Compose.

```bash
# 1. Clone the repository
git clone https://github.com/sol654/Lucy_AI_POWERED_TOUR_GUIDE.git
cd Lucy_AI_POWERED_TOUR_GUIDE

# 2. Configure environment variables
# Copy .env.example to .env in both /backend and /mobile directories

# 3. Spin up the services
docker-compose up --build
```

### 🛠️ Option 2: Local Development

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed        # Seed heritage site data
uvicorn app.main:app --reload
```

#### 2. Mobile Setup
```bash
cd mobile
npm install
npx expo start
```

---

## 🏗️ Architecture

Lucy uses a modern AI pipeline to ensure fast and accurate responses:

1. **Input**: User speaks or types a query.
2. **STT**: Groq Whisper transcribes voice input (if applicable).
3. **Retrieval**: FAISS searches our curated heritage dataset for relevant context.
4. **Generation**: Llama 3.3 70B synthesizes a response using the retrieved context.
5. **TTS**: gTTS converts the response into the user's preferred language audio.

---

## 🔐 Environment Configuration

### Backend (`/backend/.env`)
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GROQ_API_KEY` | API key from Groq Console |
| `GEOAPIFY_API_KEY` | API key for Maps/Geocoding |
| `FIREBASE_PROJECT_ID` | Firebase ID for image storage |
| `JWT_SECRET_KEY` | Secret for user authentication |

---

## 👤 Default Admin Access

Once seeded, use these credentials to access the admin features:

- **Email**: `admin@lucy.app`
- **Password**: `Admin@Lucy2024!`

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) (coming soon) and feel free to submit Pull Requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  <b>Built with ❤️ for Ethiopian Heritage Preservation</b><br>
  <i>Promoting Tourism through Artificial Intelligence</i>
</p>
