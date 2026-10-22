
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    entries = relationship(
        "JournalEntry",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    user = relationship(
        "User",
        back_populates="entries",
    )

    analysis = relationship(
        "MoodAnalysis",
        back_populates="entry",
        uselist=False,
        cascade="all, delete-orphan",
    )


class MoodAnalysis(Base):
    __tablename__ = "mood_analysis"

    id = Column(Integer, primary_key=True, index=True)

    entry_id = Column(
        Integer,
        ForeignKey("journal_entries.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    mood = Column(String(50), nullable=False)

    sentiment_score = Column(Float, nullable=False)

    confidence = Column(Float, nullable=False)

    summary = Column(Text)

    reflection = Column(Text)

    created_at = Column(DateTime(timezone=True), default=utc_now)

    entry = relationship(
        "JournalEntry",
        back_populates="analysis",
    )


class Theme(Base):
    __tablename__ = "themes"

    id = Column(Integer, primary_key=True, index=True)

    analysis_id = Column(
        Integer,
        ForeignKey("mood_analysis.id", ondelete="CASCADE"),
        nullable=False,
    )

    theme = Column(String(100), nullable=False)