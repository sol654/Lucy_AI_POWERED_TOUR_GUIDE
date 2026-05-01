from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class FavoriteCreate(BaseModel):
    heritage_site_id: UUID


class FavoriteOut(BaseModel):
    id: UUID
    user_id: UUID
    heritage_site_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
