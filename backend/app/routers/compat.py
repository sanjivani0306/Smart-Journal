from datetime import datetime, timedelta, timezone
from collections import Counter

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..ai_service import analyze_journal_entry
from ..database import get_db
from ..dependencies import get_current_user
from ..models import JournalEntry, MoodAnalysis, Theme, User
from ..security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api", tags=["Frontend Compatibility"])


def _entry_to_ui(entry, db):
    analysis = entry.analysis
    themes = []
    if analysis:
        themes = [
            row.theme
            for row in db.query(Theme)
            .filter(Theme.analysis_id == analysis.id)
            .order_by(Theme.id.asc())
            .all()
        ]

    score = analysis.sentiment_score if analysis else None
    mood = analysis.mood if analysis else "neutral"

    emotions = []
    if mood:
        emotions = [{"emotion": mood, "score": 1.0}]

    return {
        "id": entry.id,
        "date": entry.created_at.date().isoformat(),
        "time": entry.created_at.strftime("%H:%M"),
        "title": entry.title,
        "content": entry.content,
        "wordCount": len(entry.content.split()),
        "isFavorite": False,
        "manualMood": mood,
        "userReflection": None,
        "aiAnalysis": (
            {
                "moodCategory": mood,
                "sentimentScore": score if score is not None else 0,
                "confidence": analysis.confidence,
                "summary": analysis.summary,
                "reflectionPrompt": analysis.reflection,
                "themes": themes,
                "emotions": emotions,
                "keyTakeaways": [],
            }
            if analysis
            else None
        ),
    }


def _user_to_ui(user):
    return {
        "id": user.id,
        "name": user.email.split("@")[0].replace(".", " ").title(),
        "email": user.email,
        "isDemo": user.email == "demo@smartjournal.local",
        "avatar": None,
        "preferences": {
            "aiCoachingTone": "empathetic",
            "reminderTime": "20:30",
        },
    }


class AuthPayload(BaseModel):
    email: str
    password: str


class DemoPayload(BaseModel):
    mode: str = "demo"


class AnalyzePayload(BaseModel):
    title: str = "Journal Entry"
    content: str
    date: str | None = None
    manualMood: str | None = None


class ReflectPayload(BaseModel):
    message: str
    entryId: int | None = None
    conversationHistory: list = []


@router.post("/auth/register")
def compat_register(data: AuthPayload, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=data.email, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": create_access_token(user.id), "user": _user_to_ui(user)}


@router.post("/auth/login")
def compat_login(data: AuthPayload, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"token": create_access_token(user.id), "user": _user_to_ui(user)}


@router.post("/auth/demo-login")
def demo_login(data: DemoPayload, db: Session = Depends(get_db)):
    email = "demo@smartjournal.local"
    password = "DemoPass123!"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, password_hash=hash_password(password))
        db.add(user)
        db.commit()
        db.refresh(user)
    return {"token": create_access_token(user.id), "user": _user_to_ui(user)}


@router.get("/auth/me")
def auth_me(current_user=Depends(get_current_user)):
    return {"user": _user_to_ui(current_user)}


@router.post("/auth/logout")
def auth_logout():
    return {"message": "Signed out"}


@router.put("/auth/profile")
def auth_profile(current_user=Depends(get_current_user)):
    return {"user": _user_to_ui(current_user)}


@router.get("/entries")
def compat_entries(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.created_at.desc())
        .all()
    )
    return {"entries": [_entry_to_ui(e, db) for e in entries]}


@router.get("/entries/{entry_id}")
def compat_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    entry = (
        db.query(JournalEntry)
        .filter(JournalEntry.id == entry_id, JournalEntry.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return {"entry": _entry_to_ui(entry, db)}


@router.post("/entries")
def compat_create_entry(
    payload: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    content = str(payload.get("content", "")).strip()
    title = str(payload.get("title", "")).strip() or "Journal Entry"
    if not content:
        raise HTTPException(status_code=422, detail="Journal content cannot be empty")

    entry = JournalEntry(user_id=current_user.id, title=title, content=content)
    db.add(entry)
    db.commit()
    db.refresh(entry)

    try:
        result = analyze_journal_entry(content)
        analysis = MoodAnalysis(
            entry_id=entry.id,
            mood=result["mood"],
            sentiment_score=result["sentiment_score"],
            confidence=result["confidence"],
            summary=result.get("summary"),
            reflection=result.get("reflection"),
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        for name in result.get("themes", []):
            db.add(Theme(analysis_id=analysis.id, theme=name))
        db.commit()
    except Exception as exc:
        db.rollback()
        # The journal entry remains saved; analysis can be retried later.

    db.refresh(entry)
    return {"entry": _entry_to_ui(entry, db)}


@router.put("/entries/{entry_id}")
def compat_update_entry(
    entry_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    entry = (
        db.query(JournalEntry)
        .filter(JournalEntry.id == entry_id, JournalEntry.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    if payload.get("title") is not None:
        entry.title = str(payload["title"]).strip() or entry.title
    if payload.get("content") is not None:
        entry.content = str(payload["content"]).strip()

    db.commit()
    db.refresh(entry)

    if payload.get("reanalyze") or payload.get("content") is not None:
        old = db.query(MoodAnalysis).filter(MoodAnalysis.entry_id == entry.id).first()
        if old:
            db.query(Theme).filter(Theme.analysis_id == old.id).delete()
            db.delete(old)
            db.commit()
        try:
            result = analyze_journal_entry(entry.content)
            analysis = MoodAnalysis(
                entry_id=entry.id,
                mood=result["mood"],
                sentiment_score=result["sentiment_score"],
                confidence=result["confidence"],
                summary=result.get("summary"),
                reflection=result.get("reflection"),
            )
            db.add(analysis)
            db.commit()
            db.refresh(analysis)
            for name in result.get("themes", []):
                db.add(Theme(analysis_id=analysis.id, theme=name))
            db.commit()
        except Exception:
            db.rollback()

    return {"entry": _entry_to_ui(entry, db)}


@router.delete("/entries/{entry_id}")
def compat_delete_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    entry = (
        db.query(JournalEntry)
        .filter(JournalEntry.id == entry_id, JournalEntry.user_id == current_user.id)
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Entry deleted successfully"}


@router.post("/analyze")
def compat_analyze(
    payload: AnalyzePayload,
    current_user=Depends(get_current_user),
):
    try:
        result = analyze_journal_entry(payload.content)
        return {
            "analysis": {
                "moodCategory": result["mood"],
                "sentimentScore": result["sentiment_score"],
                "confidence": result["confidence"],
                "summary": result.get("summary"),
                "reflectionPrompt": result.get("reflection"),
                "themes": result.get("themes", []),
                "emotions": [{"emotion": result["mood"], "score": 1.0}],
                "keyTakeaways": [],
            }
        }
    except Exception:
        return {
            "analysis": {
                "moodCategory": payload.manualMood or "neutral",
                "sentimentScore": 0,
                "confidence": 0,
                "summary": "AI analysis is unavailable until OPENAI_API_KEY is configured.",
                "reflectionPrompt": "What stands out most to you about this entry?",
                "themes": [],
                "emotions": [],
                "keyTakeaways": [],
            }
        }


@router.get("/trends")
def compat_trends(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == current_user.id)
        .order_by(JournalEntry.created_at.asc())
        .all()
    )
    analyses = [e.analysis for e in entries if e.analysis]
    total = len(entries)
    if not analyses:
        return {
            "totalEntries": total, "averageSentiment": 0, "currentStreak": 0,
            "longestStreak": 0, "dominantMood": "neutral", "patterns": [],
            "weekdayMoods": [], "topThemes": [], "weeklyRecap": "Write more entries to unlock AI pattern insights.",
            "coachingSuggestion": None,
        }

    avg = sum(a.sentiment_score for a in analyses) / len(analyses)
    mood_counts = Counter(a.mood for a in analyses)
    dominant = mood_counts.most_common(1)[0][0]
    date_set = sorted({e.created_at.date() for e in entries})
    current = date_set[-1] if date_set else None
    streak = 0
    if current:
        cursor = current
        while cursor in date_set:
            streak += 1
            cursor -= timedelta(days=1)
    longest = 0
    run = 0
    prev = None
    for d in date_set:
        run = run + 1 if prev and d == prev + timedelta(days=1) else 1
        longest = max(longest, run)
        prev = d

    theme_rows = (
        db.query(Theme.theme, func.count(Theme.id))
        .join(MoodAnalysis, Theme.analysis_id == MoodAnalysis.id)
        .join(JournalEntry, MoodAnalysis.entry_id == JournalEntry.id)
        .filter(JournalEntry.user_id == current_user.id)
        .group_by(Theme.theme)
        .order_by(func.count(Theme.id).desc())
        .limit(8)
        .all()
    )

    weekday = Counter()
    for e in entries:
        if e.analysis:
            weekday[e.created_at.strftime("%A")] += e.analysis.sentiment_score
    weekday_moods = [
        {"weekday": day, "averageSentiment": round(weekday[day] / sum(1 for e in entries if e.created_at.strftime("%A") == day and e.analysis), 2)}
        for day in ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
        if any(e.created_at.strftime("%A") == day and e.analysis for e in entries)
    ]

    return {
        "totalEntries": total,
        "averageSentiment": round(avg, 2),
        "currentStreak": streak,
        "longestStreak": longest,
        "dominantMood": dominant,
        "patterns": [],
        "weekdayMoods": weekday_moods,
        "topThemes": [{"theme": t, "count": c} for t, c in theme_rows],
        "weeklyRecap": "Your recent entries show a " + ("positive" if avg > .2 else "challenging" if avg < -.2 else "reflective") + " emotional arc.",
        "coachingSuggestion": "Keep noticing which activities coincide with your best days.",
    }


@router.post("/reflect")
def compat_reflect(
    payload: ReflectPayload,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Lightweight fallback when no LLM key is configured.
    context = ""
    if payload.entryId:
        e = db.query(JournalEntry).filter(
            JournalEntry.id == payload.entryId,
            JournalEntry.user_id == current_user.id,
        ).first()
        if e:
            context = f" You were reflecting on “{e.title}”."

    if not payload.message.strip():
        return {"reply": "What would you like to reflect on today?"}

    try:
        result = analyze_journal_entry(payload.message)
        return {
            "reply": (
                f"I hear a {result['mood']} tone in what you shared.{context} "
                f"{result.get('reflection') or 'What feels most important about this moment?'}"
            )
        }
    except Exception:
        return {
            "reply": (
                "Thank you for sharing that. What part of this experience feels "
                "most important to understand right now?"
            )
        }


@router.post("/seed")
def compat_seed(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # The original UI expects a reset button. For the real PostgreSQL app,
    # create a small deterministic sample set without calling the LLM.
    db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).delete(
        synchronize_session=False
    )
    db.commit()

    samples = [
        ("A fresh start", "I started the day with a clear plan and finished an important task."),
        ("A quiet evening", "I slowed down tonight, read for a while, and felt calm."),
        ("A difficult moment", "Today felt frustrating and I struggled to focus, but I kept going."),
        ("Good connection", "I spent time with people I care about and felt grateful."),
        ("Small win", "I made progress on my project and feel proud of the work."),
    ]
    for title, content in samples:
        entry = JournalEntry(user_id=current_user.id, title=title, content=content)
        db.add(entry)
        db.flush()
        mood = "happy" if "proud" in content or "grateful" in content or "progress" in content else "calm" if "calm" in content else "sad" if "frustrating" in content else "happy"
        score = .75 if mood == "happy" else .5 if mood == "calm" else -.45
        analysis = MoodAnalysis(entry_id=entry.id, mood=mood, sentiment_score=score, confidence=.8, summary=content, reflection="Notice what helped shape this moment.")
        db.add(analysis)
        db.flush()
        db.add(Theme(analysis_id=analysis.id, theme="daily life"))
    db.commit()
    entries = db.query(JournalEntry).filter(JournalEntry.user_id == current_user.id).order_by(JournalEntry.created_at.desc()).all()
    return {"entries": [_entry_to_ui(e, db) for e in entries]}
