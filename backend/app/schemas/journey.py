from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class JourneyCreate(BaseModel):
    title: str


class JourneyOut(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    created_at: datetime

    class Config:
        from_attributes = True


class JourneySiteCreate(BaseModel):
    heritage_site_id: UUID
    order_index: Optional[int] = 0


class JourneySiteOut(BaseModel):
    id: UUID
    journey_id: UUID
    heritage_site_id: UUID
    order_index: int

    class Config:
        from_attributes = True
