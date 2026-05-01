# ሉሲ (Lucy) - Backend Architecture

[![FastAPI](https://img.shields.io/badge/FastAPI-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB.svg?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

This is the core engine of the ሉሲ (Lucy) AI platform. It provides a robust, asynchronous REST API for AI-powered cultural tourism services.

---

## 🛠 Tech Stack

- **Framework**: FastAPI (High-performance Python web framework)
- **Database**: PostgreSQL with SQLAlchemy (ORM) & Alembic (Migrations)
- **AI Engine**: 
  - **Groq Llama 3.3 70B**: For intelligent response generation.
  - **Groq Whisper**: For high-accuracy speech-to-text.
  - **Sentence Transformers**: For semantic vector embeddings.
- **Search**: **FAISS** (Facebook AI Similarity Search) for RAG context retrieval.
- **Voice**: **gTTS** (Google Text-to-Speech) with localized language support.
- **Storage**: **Firebase Storage** for heritage site images and user profiles.

---

## 📡 API Overview

The backend exposes several key modules:

### 🔐 Authentication (`/auth`)
- Secure JWT-based registration and login.
- Profile management with support for language preferences.

### 🏛 Heritage Sites (`/sites`)
- CRUD operations for 11+ major Ethiopian heritage sites.
- Geolocation metadata (Lat/Lon) for map integration.

### 🤖 AI Services (`/ai`)
- **Text Query**: Process natural language queries about cultural sites.
- **Voice Query**: Seamlessly convert audio to text, process via RAG, and return text + audio responses.

### 🗺 Geo Services (`/geo`)
- Forward and reverse geocoding via Geoapify.

---

## ⚙️ Setup & Installation

### 1. Environment Setup
Create a `.env` file in this directory based on `.env.example`:
```bash
cp .env.example .env
```

### 2. Manual Installation
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database
python -m app.seed

# Start the development server
uvicorn app.main:app --reload
```

---

## 🧠 AI Pipeline Details

Lucy implements a sophisticated **Retrieval-Augmented Generation (RAG)** pipeline:

1. **Embedding**: The heritage site dataset is embedded using `sentence-transformers`.
2. **Indexing**: Embeddings are stored in a FAISS vector index.
3. **Retrieval**: When a query arrives, it is vectorized and matched against the index to find the most relevant context.
4. **Augmentation**: The query + context are sent to **Llama 3.3 70B** on Groq for ultra-fast generation.
5. **Localization**: The response is generated directly in the user's preferred language (Amharic, Tigrinya, Oromo, or English).

---

## 🐳 Docker Deployment

The backend is fully dockerized. To run it independently:
```bash
docker build -t lucy-backend .
docker run -p 8000:8000 --env-file .env lucy-backend
```

---

## 🧪 Testing
We use `pytest` for unit and integration testing:
```bash
pytest tests/
```

---

*For full project documentation, please refer to the [Root README](../README.md).*
