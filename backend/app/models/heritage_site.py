import uuid
from sqlalchemy import Column, String, Text, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class HeritageSite(Base):
    __tablename__ = "heritage_sites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text)
    history = Column(Text)
    location = Column(String(200))
    latitude = Column(Float)
    longitude = Column(Float)
    image_url = Column(String(500))
    audio_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
