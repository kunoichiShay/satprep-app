import json
import random
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Wordlist Study API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

WORDS_FILE = Path(__file__).parent / "words.json"


def load_words() -> list[dict]:
    with open(WORDS_FILE) as f:
        return json.load(f)


@app.get("/words")
def get_all_words():
    return load_words()


@app.get("/words/random")
def get_random_word():
    words = load_words()
    return random.choice(words)


@app.get("/words/{word_id}")
def get_word(word_id: int):
    words = load_words()
    for word in words:
        if word["id"] == word_id:
            return word
    raise HTTPException(status_code=404, detail="Word not found")
