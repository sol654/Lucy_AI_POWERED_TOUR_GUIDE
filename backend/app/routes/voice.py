# Kept for backward compatibility — use /ai/voice instead
from fastapi import APIRouter, UploadFile, File
from app.services.voice_service import speech_to_text_from_bytes

router = APIRouter(tags=["legacy"])


@router.post("/voice")
async def voice_upload(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    text = speech_to_text_from_bytes(audio_bytes)
    return {"text": text}
