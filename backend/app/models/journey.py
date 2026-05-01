import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base


class Journey(Base):
    __tablename__ = "journeys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class JourneySite(Base):
    __tablename__ = "journey_sites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    journey_id = Column(UUID(as_uuid=True), ForeignKey("journeys.id", ondelete="CASCADE"), nullable=False)
    heritage_site_id = Column(UUID(as_uuid=True), ForeignKey("heritage_sites.id", ondelete="CASCADE"), nullable=False)
    order_index = Column(Integer, default=0)
