import uuid
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from app.services.firebase_service import upload_bytes
from app.services.auth_service import require_admin, get_current_user
from app.models.user import User

router = APIRouter(prefix="/storage", tags=["storage"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_AUDIO_TYPES = {"audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"}


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    _=Depends(require_admin),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images allowed")
    data = await file.read()
    ext = file.filename.rsplit(".", 1)[-1] if file.filename else "jpg"
    blob_name = f"sites/images/{uuid.uuid4()}.{ext}"
    url = upload_bytes(data, blob_name, file.content_type)
    return {"url": url, "blob": blob_name}


@router.post("/audio")
async def upload_audio(
    file: UploadFile = File(...),
    _=Depends(require_admin),
):
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(status_code=400, detail="Only MP3, WAV, or OGG audio allowed")
    data = await file.read()
    ext = file.filename.rsplit(".", 1)[-1] if file.filename else "mp3"
    blob_name = f"sites/audio/{uuid.uuid4()}.{ext}"
    url = upload_bytes(data, blob_name, file.content_type)
    return {"url": url, "blob": blob_name}


@router.post("/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images allowed")
    data = await file.read()
    ext = file.filename.rsplit(".", 1)[-1] if file.filename else "jpg"
    blob_name = f"users/{current_user.id}/profile.{ext}"
    url = upload_bytes(data, blob_name, file.content_type)
    return {"url": url, "blob": blob_name}
