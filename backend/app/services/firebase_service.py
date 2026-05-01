import os
import logging
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore, storage
from google.api_core.exceptions import NotFound
from app.config import BACKEND_BASE_URL, FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET

logger = logging.getLogger(__name__)

# Initialise Firebase Admin SDK.
# In production supply a service account key JSON via FIREBASE_CREDENTIALS_PATH.
# For local dev without a service account, we use the project ID only (read-only ops).
_cred_path = os.getenv(
    "FIREBASE_CREDENTIALS_PATH",
    os.path.join(os.path.dirname(__file__), "../firebase_key.json"),
)

APP_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = APP_DIR / "static"

if not FIREBASE_STORAGE_BUCKET:
    logger.error("Firebase storage bucket is not configured. Set FIREBASE_STORAGE_BUCKET in .env.")

logger.info("Using Firebase project=%s storage_bucket=%s", FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET)

if not firebase_admin._apps:
    try:
        if os.path.exists(_cred_path):
            cred = credentials.Certificate(_cred_path)
            app_options = {}
            if FIREBASE_STORAGE_BUCKET:
                app_options["storageBucket"] = FIREBASE_STORAGE_BUCKET
            firebase_admin.initialize_app(cred, app_options or None)
            logger.info("Firebase initialised with service account credentials for bucket %s.", FIREBASE_STORAGE_BUCKET)
        else:
            app_options = {"projectId": FIREBASE_PROJECT_ID}
            if FIREBASE_STORAGE_BUCKET:
                app_options["storageBucket"] = FIREBASE_STORAGE_BUCKET
            firebase_admin.initialize_app(options=app_options)
            logger.warning(
                "Firebase initialised without service account key. "
                "Place your service account JSON at %s for full access.",
                _cred_path,
            )
    except Exception as e:
        logger.exception("Firebase init failed: %s", e)


def _get_storage_bucket():
    """Return the configured Firebase Storage bucket object."""
    if FIREBASE_STORAGE_BUCKET:
        return storage.bucket(FIREBASE_STORAGE_BUCKET)
    return storage.bucket()


def _local_public_url(destination_blob: str) -> str:
    """Return a public URL for a locally saved static file."""
    public_path = Path(destination_blob).as_posix()
    return f"{BACKEND_BASE_URL.rstrip('/')}/static/{public_path}"


def _save_locally(data: bytes, destination_blob: str) -> str:
    """Save upload data under app/static and return a local public URL."""
    target_path = STATIC_DIR / destination_blob
    target_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.write_bytes(data)
    logger.info("Saved file locally at %s", target_path)
    return _local_public_url(destination_blob)


def _upload_to_firebase(data: bytes, destination_blob: str, content_type: str) -> str:
    bucket = _get_storage_bucket()
    blob = bucket.blob(destination_blob)
    try:
        blob.upload_from_string(data, content_type=content_type)
        blob.make_public()
        return blob.public_url
    except NotFound as e:
        # If the configured bucket is the Firebase storage domain, retry with
        # the more common App Engine bucket naming convention as a fallback.
        if FIREBASE_PROJECT_ID and FIREBASE_STORAGE_BUCKET.endswith(".firebasestorage.app"):
            fallback_bucket = f"{FIREBASE_PROJECT_ID}.appspot.com"
            if fallback_bucket != FIREBASE_STORAGE_BUCKET:
                logger.warning(
                    "Firebase bucket %s not found; retrying with %s",
                    FIREBASE_STORAGE_BUCKET,
                    fallback_bucket,
                )
                alt_bucket = storage.bucket(fallback_bucket)
                alt_blob = alt_bucket.blob(destination_blob)
                alt_blob.upload_from_string(data, content_type=content_type)
                alt_blob.make_public()
                return alt_blob.public_url
        raise


def upload_file(local_path: str, destination_blob: str, content_type: str = "application/octet-stream") -> str:
    """Upload a file to Firebase Storage and return its public URL."""
    data = Path(local_path).read_bytes()
    return upload_bytes(data, destination_blob, content_type)


def upload_bytes(data: bytes, destination_blob: str, content_type: str = "application/octet-stream") -> str:
    """Upload raw bytes to Firebase Storage and return its public URL."""
    if FIREBASE_STORAGE_BUCKET:
        try:
            return _upload_to_firebase(data, destination_blob, content_type)
        except Exception as e:
            logger.warning(
                "Firebase upload failed for bucket %s, falling back to local storage: %s",
                FIREBASE_STORAGE_BUCKET,
                e,
            )
    else:
        logger.warning("Firebase storage bucket not configured; using local storage fallback.")

    return _save_locally(data, destination_blob)


# ── Firestore (optional — primary data is in PostgreSQL) ─────────────────────

def _db():
    return firestore.client()


def log_query(user_id: str, query: str, response_summary: str) -> None:
    """Persist a query log to Firestore for analytics."""
    try:
        _db().collection("query_logs").add({
            "user_id": user_id,
            "query": query,
            "response_summary": response_summary[:200],
        })
    except Exception as e:
        logger.warning("Firestore log_query failed: %s", e)
