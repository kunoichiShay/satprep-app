import os
from datetime import datetime
from dotenv import load_dotenv

_env_file = ".env.production" if os.environ.get("APP_ENV") == "production" else ".env"
load_dotenv(_env_file)
from sqlalchemy import (
    Column, DateTime, ForeignKey, Integer, String, Text, create_engine,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

_url = os.environ.get("DATABASE_URL", "postgresql://satprep:satprep@localhost:5432/satprep")
if _url.startswith("postgres://"):
    _url = _url.replace("postgres://", "postgresql://", 1)

engine       = create_engine(_url)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base         = declarative_base()


class User(Base):
    __tablename__ = "users"
    id         = Column(String,   primary_key=True)
    first_name = Column(String,   nullable=False)
    last_name  = Column(String,   nullable=False)
    email      = Column(String,   unique=True, nullable=False)
    password   = Column(String,   nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    profile    = relationship(
        "UserProfile", uselist=False, back_populates="user", cascade="all, delete-orphan"
    )


class Word(Base):
    __tablename__ = "words"
    id             = Column(Integer, primary_key=True)
    word           = Column(String,  nullable=False)
    root_word      = Column(String,  nullable=True)
    part_of_speech = Column(String,  nullable=False)
    definition     = Column(Text,    nullable=False)
    example        = Column(Text,    nullable=False)


class UserProfile(Base):
    __tablename__ = "user_profiles"
    user_id          = Column(String,  ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    xp               = Column(Integer, default=0,    nullable=False)
    streak_days      = Column(Integer, default=0,    nullable=False)
    last_active_date = Column(String,  nullable=True)
    total_answers    = Column(Integer, default=0,    nullable=False)
    correct_answers  = Column(Integer, default=0,    nullable=False)
    user             = relationship("User", back_populates="profile")
    learned_words    = relationship(
        "UserLearnedWord", back_populates="profile", cascade="all, delete-orphan"
    )


class UserLearnedWord(Base):
    __tablename__ = "user_learned_words"
    user_id    = Column(String,   ForeignKey("user_profiles.user_id", ondelete="CASCADE"), primary_key=True)
    word_id    = Column(Integer,  ForeignKey("words.id"),                                  primary_key=True)
    learned_at = Column(DateTime, default=datetime.utcnow)
    profile    = relationship("UserProfile", back_populates="learned_words")
