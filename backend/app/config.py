import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../.env"))

# Groq LLM
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Geoapify Maps
GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY", "")

# Firebase
FIREBASE_API_KEY = os.getenv("FIREBASE_API_KEY", "")
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "")
FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "")
if not FIREBASE_STORAGE_BUCKET and FIREBASE_PROJECT_ID:
    FIREBASE_STORAGE_BUCKET = f"{FIREBASE_PROJECT_ID}.appspot.com"
FIREBASE_APP_ID = os.getenv("FIREBASE_APP_ID", "")
FIREBASE_PROJECT_NUMBER = os.getenv("FIREBASE_PROJECT_NUMBER", "")

# Backend URL for local static fallback
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")

# Auth
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "lucy-secret-change-in-production")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://lucy_user:lucy_pass@localhost:5432/lucy_db")
