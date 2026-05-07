import json
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db import Base, SessionLocal, User, UserLearnedWord, UserProfile, Word, engine

app = FastAPI(title="SATPrep API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:5173", "https://satprep-app.onrender.com"],
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def startup():
    Base.metadata.create_all(engine)
    _seed_words()


def _seed_words():
    db = SessionLocal()
    try:
        if db.query(Word).count() > 0:
            return
        words_file = Path(__file__).parent / "words.json"
        for w in json.loads(words_file.read_text()):
            db.add(Word(
                id=w["id"],
                word=w["word"],
                root_word=w.get("root_word"),
                part_of_speech=w["part_of_speech"],
                definition=w["definition"],
                example=w["example"],
            ))
        db.commit()
    finally:
        db.close()


# ── helpers ───────────────────────────────────────────────────────────────────

def _user_response(user: User):
    profile = user.profile
    return {
        "id":        user.id,
        "firstName": user.first_name,
        "lastName":  user.last_name,
        "email":     user.email,
        "createdAt": user.created_at.isoformat(),
        "profile": {
            "xp":              profile.xp,
            "streakDays":      profile.streak_days,
            "lastActiveDate":  profile.last_active_date,
            "totalAnswers":    profile.total_answers,
            "correctAnswers":  profile.correct_answers,
            "learnedWords":    [lw.word_id for lw in profile.learned_words],
        },
    }


# ── request schemas ───────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    firstName: str
    lastName:  str
    email:     str
    password:  str


class LoginRequest(BaseModel):
    email:    str
    password: str


class ProfileUpdate(BaseModel):
    xp:             int
    streakDays:     int
    lastActiveDate: str | None
    totalAnswers:   int
    correctAnswers: int


# ── auth endpoints ────────────────────────────────────────────────────────────

@app.post("/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    if db.query(User).filter_by(email=email).first():
        raise HTTPException(409, "An account with that email already exists.")

    user = User(
        id=str(uuid.uuid4()),
        first_name=req.firstName.strip(),
        last_name=req.lastName.strip(),
        email=email,
        password=req.password,
        created_at=datetime.utcnow(),
    )
    user.profile = UserProfile(user_id=user.id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return _user_response(user)


@app.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    user  = db.query(User).filter_by(email=email, password=req.password).first()
    if not user:
        raise HTTPException(401, "Incorrect email or password.")
    return _user_response(user)


# ── profile endpoints ─────────────────────────────────────────────────────────

@app.get("/profile/{user_id}")
def get_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(404, "User not found.")
    return _user_response(user)


@app.put("/profile/{user_id}")
def update_profile(user_id: str, body: ProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter_by(user_id=user_id).first()
    if not profile:
        raise HTTPException(404, "Profile not found.")
    profile.xp               = body.xp
    profile.streak_days      = body.streakDays
    profile.last_active_date = body.lastActiveDate
    profile.total_answers    = body.totalAnswers
    profile.correct_answers  = body.correctAnswers
    db.commit()
    return {"ok": True}


@app.post("/profile/{user_id}/learned/{word_id}")
def mark_learned(user_id: str, word_id: int, db: Session = Depends(get_db)):
    if db.query(UserLearnedWord).filter_by(user_id=user_id, word_id=word_id).first():
        return {"ok": True}
    db.add(UserLearnedWord(user_id=user_id, word_id=word_id))
    db.commit()
    return {"ok": True}


# ── word endpoints ────────────────────────────────────────────────────────────

@app.get("/words")
def get_all_words(db: Session = Depends(get_db)):
    return [
        {
            "id":             w.id,
            "word":           w.word,
            "root_word":      w.root_word,
            "part_of_speech": w.part_of_speech,
            "definition":     w.definition,
            "example":        w.example,
        }
        for w in db.query(Word).order_by(Word.id).all()
    ]
