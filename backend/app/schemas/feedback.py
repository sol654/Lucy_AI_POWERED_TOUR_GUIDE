from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class FeedbackCreate(BaseModel):
    message: str
    rating: Optional[int] = None  # 1-5


class FeedbackOut(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    message: str
    rating: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True
