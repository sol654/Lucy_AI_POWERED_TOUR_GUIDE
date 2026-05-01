from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class HeritageSiteCreate(BaseModel):
    name: str
    description: Optional[str] = None
    history: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None


class HeritageSiteUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    history: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    audio_url: Optional[str] = None


class HeritageSiteOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    history: Optional[str]
    location: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    image_url: Optional[str]
    audio_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
