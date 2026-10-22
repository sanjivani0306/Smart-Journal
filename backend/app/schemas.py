from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class JournalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)


class JournalUpdate(BaseModel):
    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    content: Optional[str] = Field(
        default=None,
        min_length=1,
    )


class MoodAnalysisResponse(BaseModel):
    mood: str
    sentiment_score: float
    confidence: float
    summary: Optional[str] = None
    reflection: Optional[str] = None
    themes: List[str] = []


class JournalResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    analysis: Optional[MoodAnalysisResponse] = None

    model_config = ConfigDict(from_attributes=True)