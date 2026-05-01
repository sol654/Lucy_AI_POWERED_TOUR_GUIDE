from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    language_preference: Optional[str] = "en"
    security_question: str
    security_answer: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: UUID
    name: str
    email: str
    role: str
    language_preference: str
    profile_picture_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserUpdate(BaseModel):
    name: Optional[str] = None
    language_preference: Optional[str] = None
    profile_picture_url: Optional[str] = None


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


class ForgotPassword(BaseModel):
    email: EmailStr
    security_answer: str
    new_password: str
