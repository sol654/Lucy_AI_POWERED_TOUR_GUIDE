# ሉሲ AI Guide Backend

FastAPI backend for the ሉሲ AI Heritage Guide mobile application. Provides AI-powered cultural tour guide services with multilingual support.

## Features

- **AI Chat**: Groq-powered conversational AI for Ethiopian heritage sites
- **Voice Processing**: Speech-to-text and text-to-speech using Groq Whisper and gTTS
- **Semantic Search**: FAISS vector search with Sentence Transformers for context retrieval
- **Multilingual**: Support for English, Amharic, Tigrinya, and Oromo
- **User Management**: JWT authentication with role-based access
- **Heritage Sites**: CRUD operations for cultural site management
- **Journeys & Favorites**: Personalized user experiences
- **Admin Dashboard**: Analytics and content management

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **AI**: Groq (Llama 3.3 70B, Whisper)
- **Search**: FAISS + Sentence Transformers
- **Voice**: gTTS for text-to-speech
- **Auth**: JWT with bcrypt hashing
- **Storage**: Firebase Storage
- **Maps**: Geoapify geocoding
- **Deployment**: Docker + Docker Compose

## Quick Start

### Prerequisites

- Python 3.9+
- PostgreSQL (or use Docker)
- API Keys: Groq, Geoapify, Firebase

### Local Development

1. **Clone and setup**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Database setup**:
   ```bash
   # Create PostgreSQL database or use Docker
   # Update DATABASE_URL in .env

   # Run migrations
   python -c "from app.database import engine, Base; Base.metadata.create_all(bind=engine)"

   # Seed data
   python -m app.seed
   ```

4. **Run the server**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

API docs available at: `http://localhost:8000/docs`

### Docker Development

```bash
# From project root
docker-compose up --build
```

## API Endpoints

### Core Routes

- `GET /` - Health check
- `GET /docs` - Interactive API documentation
- `GET /redoc` - Alternative API documentation

### Authentication (`/auth`)

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/profile` - Get current user profile
- `PUT /auth/profile` - Update user profile

### Heritage Sites (`/sites`)

- `GET /sites` - List all sites
- `GET /sites/{id}` - Get site details
- `POST /sites` - Create new site (Admin)
- `PUT /sites/{id}` - Update site (Admin)
- `DELETE /sites/{id}` - Delete site (Admin)

### AI Queries (`/ai`)

- `POST /ai/query` - Text-based AI query
- `POST /ai/voice` - Voice-based AI query

### User Features

- `GET /favorites` - List user favorites
- `POST /favorites` - Add to favorites
- `DELETE /favorites/{id}` - Remove favorite

- `GET /journeys` - List user journeys
- `POST /journeys` - Create journey
- `GET /journeys/{id}` - Get journey details
- `POST /journeys/{id}/sites` - Add site to journey
- `DELETE /journeys/{id}/sites/{site_id}` - Remove site from journey

### Admin (`/admin`)

- `GET /admin/stats` - Dashboard statistics

### Maps (`/geo`)

- `GET /geo/search` - Geocode place names
- `GET /geo/reverse` - Reverse geocode coordinates

### Feedback

- `GET /feedback` - List feedback (Admin)
- `POST /feedback` - Submit feedback

## Data Models

### User
- id, name, email, language_preference, role, created_at

### HeritageSite
- id, name, description, location, latitude, longitude, category, images, created_at

### Journey
- id, user_id, name, description, sites (many-to-many)

### Favorite
- user_id, site_id

### Feedback
- user_id, rating, comment, created_at

## AI Pipeline

1. **Query Processing**: Language detection + user preference override
2. **Voice Input**: Groq Whisper transcribes audio to text
3. **Semantic Search**: Sentence Transformers encode query → FAISS similarity search
4. **Context Retrieval**: Top-k relevant documents from heritage site dataset
5. **Response Generation**: Groq Llama generates response in user's language
6. **Text-to-Speech**: gTTS converts response to audio (base64)

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/lucy_db

# AI Services
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

# Maps
GEOAPIFY_API_KEY=your_geoapify_key

# Firebase Storage
FIREBASE_API_KEY=your_firebase_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_APP_ID=your_app_id
FIREBASE_PROJECT_NUMBER=your_number
FIREBASE_CREDENTIALS_PATH=./app/firebase_key.json

# Authentication
JWT_SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Optional: Model caching
TRANSFORMERS_OFFLINE=1
SENTENCE_TRANSFORMERS_HOME=/app/models
```

## Testing

```bash
# Install test dependencies
pip install pytest httpx

# Run tests
pytest tests/

# Run specific test file
pytest tests/test_main.py
```

## Deployment

### Docker Production

```bash
# Build and run
docker-compose -f docker-compose.yml up --build -d

# Scale services
docker-compose up -d --scale backend=3
```

### Cloud Deployment

The app can be deployed to:
- **Heroku**: Set environment variables, use heroku.yml
- **Railway**: Connect GitHub repo, set env vars
- **AWS/GCP**: Use Docker containers with load balancer

### Environment Setup

1. Set all required environment variables
2. Ensure database is accessible
3. Run database migrations
4. Seed initial data
5. Start the application

## Development Notes

- **CORS**: Configured for mobile app origins
- **File Uploads**: Handled via Firebase Storage
- **Vector Search**: FAISS index rebuilt on data changes
- **Language Support**: Responses always in user's preferred language
- **Error Handling**: Comprehensive error responses with localization

## Contributing

1. Follow FastAPI best practices
2. Add type hints for all functions
3. Write tests for new features
4. Update API documentation
5. Ensure multilingual support

## License

MIT License - see main project LICENSE file.
