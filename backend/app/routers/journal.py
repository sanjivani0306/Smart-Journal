from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..ai_service import analyze_journal_entry
from ..database import get_db
from ..dependencies import get_current_user
from ..models import JournalEntry, MoodAnalysis, Theme
from ..schemas import (
    JournalCreate,
    JournalResponse,
    JournalUpdate,
)

router = APIRouter(
    prefix="/journal",
    tags=["Journal"],
)


@router.post(
    "",
    response_model=JournalResponse,
)
def create_entry(
    data: JournalCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    entry = JournalEntry(
        user_id=current_user.id,
        title=data.title,
        content=data.content,
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    try:
        result = analyze_journal_entry(
            data.content
        )

        analysis = MoodAnalysis(
            entry_id=entry.id,
            mood=result["mood"],
            sentiment_score=float(
                result["sentiment_score"]
            ),
            confidence=float(
                result["confidence"]
            ),
            summary=result.get("summary"),
            reflection=result.get("reflection"),
        )

        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        for theme_name in result.get("themes", []):
            theme = Theme(
                analysis_id=analysis.id,
                theme=theme_name,
            )
            db.add(theme)

        db.commit()

    except Exception as exc:
        db.rollback()
        print(f"AI analysis failed: {exc}")

    return entry


@router.get(
    "",
    response_model=list[JournalResponse],
)
def get_entries(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return (
        db.query(JournalEntry)
        .filter(
            JournalEntry.user_id == current_user.id
        )
        .order_by(
            JournalEntry.created_at.desc()
        )
        .all()
    )


@router.get(
    "/{entry_id}",
    response_model=JournalResponse,
)
def get_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    entry = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == current_user.id,
        )
        .first()
    )

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Journal entry not found",
        )

    return entry


@router.put(
    "/{entry_id}",
    response_model=JournalResponse,
)
def update_entry(
    entry_id: int,
    data: JournalUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    entry = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == current_user.id,
        )
        .first()
    )

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Journal entry not found",
        )

    if data.title is not None:
        entry.title = data.title

    if data.content is not None:
        entry.content = data.content

    db.commit()
    db.refresh(entry)

    return entry


@router.delete("/{entry_id}")
def delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    entry = (
        db.query(JournalEntry)
        .filter(
            JournalEntry.id == entry_id,
            JournalEntry.user_id == current_user.id,
        )
        .first()
    )

    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Journal entry not found",
        )

    db.delete(entry)
    db.commit()

    return {
        "message": "Journal entry deleted successfully"
    }