import logging
from fastapi import APIRouter, UploadFile, File, Depends
from app.schemas.ai import QueryRequest, QueryResponse, VoiceQueryResponse
from app.services.utils import process_query
from app.services.voice_service import speech_to_text_from_bytes
from app.services.auth_service import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/query", response_model=QueryResponse)
def text_query(
    payload: QueryRequest,
    current_user: User = Depends(get_current_user),
):
    lang = payload.language or current_user.language_preference or "en"
    result = process_query(payload.text, language=lang, include_audio=bool(payload.include_audio))
    return QueryResponse(**result)


@router.post("/voice", response_model=VoiceQueryResponse)
async def voice_query(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    audio_bytes = await audio.read()
    lang = current_user.language_preference or "en"
    mime = audio.content_type or "audio/m4a"

    logger.info("Voice query: %d bytes, mime=%s, lang=%s", len(audio_bytes), mime, lang)

    transcribed = speech_to_text_from_bytes(audio_bytes, mime_type=mime, language=lang)

    if not transcribed:
        no_audio_msgs = {
            "en": "Sorry, I could not understand the audio. Please speak clearly and try again.",
            "am": "ይቅርታ፣ ድምፁን መረዳት አልቻልኩም። እባክዎ ግልጽ ብለው ይናገሩ።",
            "ti": "ይቅርታ፣ ድምጺ ክርዳእ ኣይከኣልኩን። ብንጹር ተዛረብ።",
            "or": "Dhiifama, sagalee hubachuu hin dandeenye. Ifatti dubbadhu.",
        }
        return VoiceQueryResponse(
            transcribed_text="",
            response=QueryResponse(
                text=no_audio_msgs.get(lang, no_audio_msgs["en"]),
                audio_base64="",
                images=[],
                map_query="",
                suggested_followups=[],
            ),
        )

    result = process_query(transcribed, language=lang)
    return VoiceQueryResponse(
        transcribed_text=transcribed,
        response=QueryResponse(**result),
    )
