import logging
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routes import auth, sites, ai, favorites, journeys, feedback, geo, storage, admin
from app.routes import query, locations, voice  # legacy

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


def create_tables_with_retry(retries: int = 10, delay: int = 3):
    for attempt in range(retries):
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully.")
            return
        except Exception as e:
            logger.warning("DB not ready (attempt %d/%d): %s", attempt + 1, retries, e)
            time.sleep(delay)
    logger.error("Could not connect to database after %d attempts.", retries)


create_tables_with_retry()

app = FastAPI(
    title="ሉሲ – AI Voice Guide for Ethiopian Heritage Sites",
    version="1.0.0",
    description="AI-powered cultural tour guide API",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core routes
app.include_router(auth.router)
app.include_router(sites.router)
app.include_router(ai.router)
app.include_router(favorites.router)
app.include_router(journeys.router)
app.include_router(feedback.router)
app.include_router(geo.router)
app.include_router(storage.router)
app.include_router(admin.router)

# Serve static files (local images)
import os as _os
_static_dir = _os.path.join(_os.path.dirname(__file__), "static")
_os.makedirs(_static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=_static_dir), name="static")

# Legacy routes (prefixed under /api for backward compat)
app.include_router(query.router, prefix="/api")
app.include_router(locations.router, prefix="/api")
app.include_router(voice.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Welcome to ሉሲ – AI Heritage Guide API", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
