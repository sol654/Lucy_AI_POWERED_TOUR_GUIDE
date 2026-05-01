import os
import base64
import logging
import tempfile
from groq import Groq
from gtts import gTTS

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Map app language codes to BCP-47 codes Whisper understands
WHISPER_LANG_MAP = {
    "en": "en",
    "am": "am",   # Amharic
    "ti": "ti",   # Tigrinya
    "or": "om",   # Oromo (ISO 639-1 is 'om')
}


def speech_to_text_from_bytes(audio_bytes: bytes, mime_type: str = "audio/wav", language: str = "en") -> str:
    """Transcribe audio using Groq Whisper.
    
    Args:
        audio_bytes: Raw audio data
        mime_type: Audio MIME type
        language: User's preferred language code (en/am/ti/or) — tells Whisper what language to expect
    """
    if not audio_bytes or not _client:
        logger.warning("STT skipped: no audio or GROQ_API_KEY not set.")
        return ""

    ext_map = {
        "audio/wav": "wav", "audio/wave": "wav",
        "audio/mpeg": "mp3", "audio/mp3": "mp3",
        "audio/mp4": "mp4", "audio/m4a": "m4a",
        "audio/ogg": "ogg", "audio/webm": "webm", "audio/flac": "flac",
    }
    ext = ext_map.get(mime_type, "wav")
    whisper_lang = WHISPER_LANG_MAP.get(language, "en")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=f".{ext}", delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        with open(tmp_path, "rb") as f:
            transcription = _client.audio.transcriptions.create(
                file=(f"audio.{ext}", f, mime_type),
                model="whisper-large-v3",
                language=whisper_lang,   # tell Whisper which language to expect
                response_format="text",
            )
        result = transcription.strip() if isinstance(transcription, str) else transcription.text.strip()
        logger.info("STT transcribed (%s): %s", whisper_lang, result[:80])
        return result

    except Exception as e:
        logger.warning("Groq Whisper STT error: %s", e)
        return ""
    finally:
        if tmp_path:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass


def text_to_speech_base64(text: str, lang: str = "en") -> str:
    """Convert text to speech using gTTS, return base64-encoded MP3."""
    if not text:
        return ""
    LANG_MAP = {
        "ti": "am",   # Tigrinya falls back to Amharic (closest gTTS supports)
        "or": "am",   # Oromo falls back to Amharic
    }
    SUPPORTED_LANGS = {"en", "am", "fr", "de", "es", "it", "pt", "ar", "zh", "ja", "ko", "hi", "sw"}
    gtts_lang = LANG_MAP.get(lang, lang if lang in SUPPORTED_LANGS else "en")
    try:
        tts = gTTS(text=text, lang=gtts_lang, slow=False)
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
            tts.save(tmp.name)
            tmp_path = tmp.name
        with open(tmp_path, "rb") as f:
            audio_bytes = f.read()
        os.unlink(tmp_path)
        return base64.b64encode(audio_bytes).decode("utf-8")
    except Exception as e:
        logger.exception("TTS error: %s", e)
        return ""
