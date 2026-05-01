# ሉሲ – AI Voice Guide for Ethiopian Heritage Sites

An AI-powered mobile application that lets users explore Ethiopian heritage sites through voice queries, text queries, interactive maps, audio storytelling, and personalized travel journeys. ሉሲ supports multiple languages including English, Amharic, Tigrinya, and Oromo.

## 🌟 Features

- **Multilingual AI Chat**: Ask ሉሲ about Ethiopian heritage sites in English, Amharic, Tigrinya, or Oromo
- **Voice Queries**: Speak naturally and get voice responses with audio playback
- **Interactive Maps**: Explore sites with Geoapify-powered maps and location services
- **Personalized Journeys**: Create and save custom travel itineraries
- **Audio Guides**: Listen to site information with text-to-speech
- **Favorites**: Save and organize your favorite heritage sites
- **Admin Panel**: Manage sites, users, and view analytics

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Mobile** | React Native + Expo + TypeScript |
| **Backend** | FastAPI + SQLAlchemy + PostgreSQL |
| **AI/NLP** | Groq (Llama 3.3 70B) + Sentence Transformers + FAISS |
| **Voice** | Groq Whisper (STT) + gTTS (TTS) |
| **Maps** | Geoapify + Leaflet WebView |
| **Auth** | JWT + bcrypt |
| **Storage** | Firebase Storage |
| **Deployment** | Docker + Docker Compose |

## 📁 Project Structure

```
lucy-ai-guide/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── config.py          # Environment configuration
│   │   ├── database.py        # SQLAlchemy database setup
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── routes/            # API route handlers
│   │   └── services/          # Business logic (AI, auth, voice, etc.)
│   ├── data/
│   │   ├── dataset.json       # Heritage site data for RAG
│   │   └── faiss_index/       # FAISS vector search index
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── mobile/                     # React Native + Expo app
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── navigation/        # React Navigation setup
│   │   ├── screens/           # App screens
│   │   ├── services/          # API client and utilities
│   │   └── types/             # TypeScript type definitions
│   ├── App.js
│   ├── app.json
│   ├── package.json
│   └── google-services.json
├── docker-compose.yml          # Docker services (DB + Backend)
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm
- Python 3.9+ (for local backend development)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd lucy-ai-guide
```

### 2. Backend Setup with Docker

```bash
# Copy environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your API keys (see Environment Variables section)
nano backend/.env

# Start services (PostgreSQL + Backend)
docker-compose up --build -d
```

The API will be available at `http://localhost:8000`  
API documentation: `http://localhost:8000/docs`

### 3. Seed the Database

```bash
# Seed with initial data
docker-compose exec backend python -m app.seed
```

### 4. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit mobile/.env
nano .env
# Set EXPO_PUBLIC_API_URL=http://localhost:8000

# Start Expo development server
npx expo start
```

#### Running Expo offline
If you need offline Expo mode and see a warning like:
`Unable to resolve manifest assets. Icons and fonts might not work. network timeout at: https://api.expo.dev/v2/project/configuration/schema/51.0.0`
run this once while connected to the internet to populate the local Expo schema cache:

```bash
cd mobile
npx expo config --json
```

Then start offline:

```bash
cd mobile
npx expo start --offline
```

## 📱 Mobile App Usage

1. **Install Expo Go** on your phone
2. **Scan QR code** from terminal or use Android/iOS simulator
3. **Register/Login** with email and password
4. **Set Language** in Profile (English, Amharic, Tigrinya, Oromo)
5. **Explore Features**:
   - Ask ሉሲ about heritage sites via text or voice
   - Browse interactive maps
   - Create personalized journeys
   - Save favorite sites

## 🔧 API Endpoints

### Authentication
| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| GET | `/auth/profile` | Get user profile | ✅ |
| PUT | `/auth/profile` | Update profile | ✅ |

### Heritage Sites
| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/sites` | List all sites | ❌ |
| GET | `/sites/{id}` | Get site details | ❌ |
| POST | `/sites` | Create site | Admin ✅ |
| PUT | `/sites/{id}` | Update site | Admin ✅ |
| DELETE | `/sites/{id}` | Delete site | Admin ✅ |

### AI Queries
| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/ai/query` | Text-based AI query | ✅ |
| POST | `/ai/voice` | Voice-based AI query | ✅ |

### User Features
| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/favorites` | List user favorites | ✅ |
| POST | `/favorites` | Add to favorites | ✅ |
| DELETE | `/favorites/{id}` | Remove favorite | ✅ |
| GET | `/journeys` | List user journeys | ✅ |
| POST | `/journeys` | Create journey | ✅ |
| GET | `/journeys/{id}` | Get journey details | ✅ |
| POST | `/journeys/{id}/sites` | Add site to journey | ✅ |
| DELETE | `/journeys/{id}/sites/{site_id}` | Remove site from journey | ✅ |

### Admin & Analytics
| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/admin/stats` | Admin dashboard stats | Admin ✅ |
| GET | `/feedback` | List user feedback | Admin ✅ |
| POST | `/feedback` | Submit feedback | ✅ |

### Maps & Geocoding
| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/geo/search?q={query}` | Geocode place name | ❌ |
| GET | `/geo/reverse?lat={lat}&lon={lon}` | Reverse geocode | ❌ |

## 🎯 AI Pipeline

```
User Query (Text/Voice)
      ↓
Language Detection + User Preference
      ↓
Groq Whisper (Speech-to-Text for voice)
      ↓
Semantic Search (Sentence Transformers + FAISS)
      ↓
Context Retrieval from Heritage Site Dataset
      ↓
Groq Llama 3.3 70B (Response Generation in user's language)
      ↓
gTTS (Text-to-Speech in appropriate language)
      ↓
Return { text, audio_base64, map_coords, suggested_followups }
```

## 🌍 Supported Languages

- **English**: Full support
- **Amharic (አማርኛ)**: Ethiopic script
- **Tigrinya (ትግርኛ)**: Ethiopic script
- **Oromo (Afaan Oromoo)**: Latin script

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://lucy_user:lucy_pass@localhost:5432/lucy_db

# AI Services
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Maps & Geocoding
GEOAPIFY_API_KEY=your_geoapify_api_key_here

# Firebase (for file storage)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
FIREBASE_APP_ID=your_app_id
FIREBASE_PROJECT_NUMBER=your_project_number
FIREBASE_CREDENTIALS_PATH=./app/firebase_key.json

# JWT Authentication
JWT_SECRET_KEY=your_super_secret_jwt_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Optional: Transformers cache
TRANSFORMERS_OFFLINE=1
HF_DATASETS_OFFLINE=1
SENTENCE_TRANSFORMERS_HOME=/app/models
```

### Mobile (.env)

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_api_key_here
```

## 👤 Default Admin Account

After seeding the database, you can login with:

```
Email: admin@lucy.app
Password: Admin@Lucy2024!
```

**⚠️ Change these credentials immediately in production!**

## 🗂 Heritage Sites Included

The app comes pre-seeded with detailed information about:

- **Lalibela Rock-Hewn Churches** - UNESCO World Heritage Site
- **Aksum (Axum)** - Ancient obelisks and stelae
- **Fasil Ghebbi (Gondar Castles)** - 17th-century royal enclosure
- **Simien Mountains National Park** - Dramatic peaks and wildlife
- **Harar Jugol** - Walled city with 82 mosques
- **Tiya** - Ancient stelae field
- **Konso Cultural Landscape** - Terraced hills and villages
- **Lower Valley of the Awash** - Paleoanthropological sites
- **Lower Valley of the Omo** - Fossil and archaeological sites
- **Melka Kunture and Balchit** - Ancient tools and hominid remains
- **Jimma Aba Jiffar Palace** - 19th-century Oromo palace

## 🧪 Testing

### Backend Tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/
```

### Mobile Tests

```bash
cd mobile
npm test
```

## 🚀 Deployment

### Production Backend

```bash
# Build and run with Docker
docker-compose -f docker-compose.yml up --build -d

# Or deploy to cloud (Heroku, Railway, etc.)
# Set environment variables and deploy
```

### Mobile App

```bash
# Build for production
cd mobile
npx expo build:android  # or :ios
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Ethiopian Ministry of Tourism for heritage site information
- UNESCO World Heritage Centre for cultural preservation data
- Groq for AI model access
- Geoapify for mapping services
- Firebase for cloud storage

---

**Built with ❤️ for Ethiopian cultural heritage preservation and tourism promotion**
| DELETE | /sites/{id} | Delete site | Admin |
| POST | /ai/query | Text AI query | ✅ |
| POST | /ai/voice | Voice AI query | ✅ |
| GET | /favorites | List favorites | ✅ |
| POST | /favorites | Add favorite | ✅ |
| DELETE | /favorites/{id} | Remove favorite | ✅ |
| GET | /journeys | List journeys | ✅ |
| POST | /journeys | Create journey | ✅ |
| POST | /journeys/{id}/sites | Add site to journey | ✅ |
| GET | /geo/search | Geocode a place name | — |
| GET | /geo/reverse | Reverse geocode coordinates | — |

---

## Voice Query Pipeline

```
User Voice Input
      ↓
Groq Whisper (Speech-to-Text)
      ↓
Semantic Search (Sentence Transformers + FAISS)
      ↓
Context Retrieval from Heritage Site Dataset
      ↓
Groq Llama 3.3 70B (Response Generation)
      ↓
gTTS (Text-to-Speech)
      ↓
Return { text, audio_base64, map_coords, suggested_followups }
```

## 🌍 Supported Languages

- **English**: Full support
- **Amharic (አማርኛ)**: Ethiopic script
- **Tigrinya (ትግርኛ)**: Ethiopic script
- **Oromo (Afaan Oromoo)**: Latin script

## 🔐 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://lucy_user:lucy_pass@localhost:5432/lucy_db

# AI Services
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Maps & Geocoding
GEOAPIFY_API_KEY=your_geoapify_api_key_here

# Firebase (for file storage)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
FIREBASE_APP_ID=your_app_id
FIREBASE_PROJECT_NUMBER=your_project_number
FIREBASE_CREDENTIALS_PATH=./app/firebase_key.json

# JWT Authentication
JWT_SECRET_KEY=your_super_secret_jwt_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Optional: Transformers cache
TRANSFORMERS_OFFLINE=1
HF_DATASETS_OFFLINE=1
SENTENCE_TRANSFORMERS_HOME=/app/models
```

### Mobile (.env)

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_api_key_here
```

## 👤 Default Admin Account

After seeding the database, you can login with:

```
Email: admin@lucy.app
Password: Admin@Lucy2024!
```

**⚠️ Change these credentials immediately in production!**

## 🗂 Heritage Sites Included

The app comes pre-seeded with detailed information about:

- **Lalibela Rock-Hewn Churches** - UNESCO World Heritage Site
- **Aksum (Axum)** - Ancient obelisks and stelae
- **Fasil Ghebbi (Gondar Castles)** - 17th-century royal enclosure
- **Simien Mountains National Park** - Dramatic peaks and wildlife
- **Harar Jugol** - Walled city with 82 mosques
- **Tiya** - Ancient stelae field
- **Konso Cultural Landscape** - Terraced hills and villages
- **Lower Valley of the Awash** - Paleoanthropological sites
- **Lower Valley of the Omo** - Fossil and archaeological sites
- **Melka Kunture and Balchit** - Ancient tools and hominid remains
- **Jimma Aba Jiffar Palace** - 19th-century Oromo palace

## 🧪 Testing

### Backend Tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/
```

### Mobile Tests

```bash
cd mobile
npm test
```

## 🚀 Deployment

### Production Backend

```bash
# Build and run with Docker
docker-compose -f docker-compose.yml up --build -d

# Or deploy to cloud (Heroku, Railway, etc.)
# Set environment variables and deploy
```

### Mobile App

```bash
# Build for production
cd mobile
npx expo build:android  # or :ios
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🙏 Acknowledgments

- Ethiopian Ministry of Tourism for heritage site information
- UNESCO World Heritage Centre for cultural preservation data
- Groq for AI model access
- Geoapify for mapping services
- Firebase for cloud storage

---

**Built with ❤️ for Ethiopian cultural heritage preservation and tourism promotion**
