from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import JournalEntry, MoodAnalysis, Theme

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)

@router.get("/mood-calendar")
def get_mood_calendar(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    results = (
        db.query(
            JournalEntry.created_at,
            MoodAnalysis.mood,
            MoodAnalysis.sentiment_score,
        )
        .join(
            MoodAnalysis,
            MoodAnalysis.entry_id == JournalEntry.id,
        )
        .filter(
            JournalEntry.user_id == current_user.id
        )
        .order_by(
            JournalEntry.created_at.asc()
        )
        .all()
    )

    return [
        {
            "date": created_at.date().isoformat(),
            "mood": mood,
            "sentiment_score": sentiment_score,
        }
        for created_at, mood, sentiment_score in results
    ]
    
@router.get("/mood-summary")
def get_mood_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    analyses = (
        db.query(MoodAnalysis)
        .join(
            JournalEntry,
            MoodAnalysis.entry_id == JournalEntry.id,
        )
        .filter(
            JournalEntry.user_id == current_user.id
        )
        .all()
    )

    total_entries = len(analyses)

    if total_entries == 0:
        return {
            "total_entries": 0,
            "average_sentiment": 0,
            "positive_entries": 0,
            "neutral_entries": 0,
            "negative_entries": 0,
        }

    average_sentiment = (
        sum(
            analysis.sentiment_score
            for analysis in analyses
        )
        / total_entries
    )

    positive_entries = sum(
        1
        for analysis in analyses
        if analysis.sentiment_score > 0.2
    )

    negative_entries = sum(
        1
        for analysis in analyses
        if analysis.sentiment_score < -0.2
    )

    neutral_entries = (
        total_entries
        - positive_entries
        - negative_entries
    )

    return {
        "total_entries": total_entries,
        "average_sentiment": round(
            average_sentiment,
            2,
        ),
        "positive_entries": positive_entries,
        "neutral_entries": neutral_entries,
        "negative_entries": negative_entries,
    }
    
@router.get("/mood-trend")
def get_mood_trend(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    results = (
        db.query(
            JournalEntry.created_at,
            MoodAnalysis.sentiment_score,
        )
        .join(
            MoodAnalysis,
            MoodAnalysis.entry_id == JournalEntry.id,
        )
        .filter(
            JournalEntry.user_id == current_user.id
        )
        .order_by(
            JournalEntry.created_at.asc()
        )
        .all()
    )

    return [
        {
            "date": created_at.date().isoformat(),
            "sentiment_score": sentiment_score,
        }
        for created_at, sentiment_score in results
    ]
    
@router.get("/themes")
def get_themes(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    results = (
        db.query(
            Theme.theme,
            func.count(Theme.id).label("count"),
        )
        .join(
            MoodAnalysis,
            Theme.analysis_id == MoodAnalysis.id,
        )
        .join(
            JournalEntry,
            MoodAnalysis.entry_id == JournalEntry.id,
        )
        .filter(
            JournalEntry.user_id == current_user.id
        )
        .group_by(
            Theme.theme
        )
        .order_by(
            func.count(Theme.id).desc()
        )
        .all()
    )

    return [
        {
            "theme": theme,
            "count": count,
        }
        for theme, count in results
    ]