import json
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="SATPrep API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://satprep-app.onrender.com"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ── file helpers ──────────────────────────────────────────────────────────────

WORDS_FILE = Path(__file__).parent / "words.json"
USERS_FILE = Path(__file__).parent / "users.json"


def load_users() -> list[dict]:
    if not USERS_FILE.exists():
        return []
    with open(USERS_FILE) as f:
        return json.load(f)


def save_users(users: list[dict]) -> None:
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


# ── request schemas ───────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# ── auth endpoints ────────────────────────────────────────────────────────────

@app.post("/auth/register")
def register(req: RegisterRequest):
    users = load_users()
    email = req.email.strip().lower()

    if any(u["email"] == email for u in users):
        raise HTTPException(status_code=409, detail="An account with that email already exists.")

    user = {
        "id":        str(uuid.uuid4()),
        "firstName": req.firstName.strip(),
        "lastName":  req.lastName.strip(),
        "email":     email,
        "password":  req.password,          # plain text — local learning app
        "createdAt": datetime.utcnow().isoformat(),
    }
    users.append(user)
    save_users(users)

    # never send the password back to the client
    return {k: v for k, v in user.items() if k != "password"}


@app.post("/auth/login")
def login(req: LoginRequest):
    email = req.email.strip().lower()
    users = load_users()
    user  = next(
        (u for u in users if u["email"] == email and u["password"] == req.password),
        None,
    )
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    return {k: v for k, v in user.items() if k != "password"}


# ── word endpoints (unchanged) ────────────────────────────────────────────────

@app.get("/words")
def get_all_words():
    with open(WORDS_FILE) as f:
        return json.load(f)
