from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class QueryRequest(BaseModel):
    text: str
    language: Optional[str] = "en"
    include_audio: Optional[bool] = False


class QueryResponse(BaseModel):
    text: str
    audio_base64: Optional[str] = None
    images: List[str] = []
    map_query: Optional[str] = None
    site_coords: Optional[Dict[str, Any]] = None
    suggested_followups: List[str] = []


class VoiceQueryResponse(BaseModel):
    transcribed_text: str
    response: QueryResponse
