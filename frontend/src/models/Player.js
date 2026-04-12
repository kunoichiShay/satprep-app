/**
 * Player model — manages XP, levels, streaks, and learned words.
 * State is persisted to localStorage automatically.
 */

export const LEVELS = [
  { level: 1,  title: 'Novice',          minXP: 0 },
  { level: 2,  title: 'Apprentice',      minXP: 300 },
  { level: 3,  title: 'Scholar',         minXP: 700 },
  { level: 4,  title: 'Linguist',        minXP: 1300 },
  { level: 5,  title: 'Wordsmith',       minXP: 2100 },
  { level: 6,  title: 'Word Warrior',    minXP: 3100 },
  { level: 7,  title: 'Vocabulary Ace',  minXP: 4400 },
  { level: 8,  title: 'SAT Champion',    minXP: 6000 },
  { level: 9,  title: 'Word Master',     minXP: 8000 },
  { level: 10, title: 'Lexicon Legend',  minXP: 10500 },
]

export const XP_REWARDS = {
  LEARN_WORD:       20,
  QUIZ_CORRECT:     30,
  QUIZ_STREAK_5:    50,   // bonus for 5 correct in a row
  SCRAMBLE_CORRECT: 25,
  FILL_CORRECT:     25,
  DAILY_LOGIN:      10,
}

const STORAGE_KEY = 'satprep_player'

export class Player {
  constructor (data = {}) {
    this.name           = data.name           ?? 'Alex'
    this.xp             = data.xp             ?? 0
    this.streakDays     = data.streakDays      ?? 0
    this.lastActiveDate = data.lastActiveDate  ?? null
    this.learnedWords   = data.learnedWords    ?? []    // array of word ids
    this.totalAnswers   = data.totalAnswers    ?? 0
    this.correctAnswers = data.correctAnswers  ?? 0
  }

  /** Restore from localStorage; returns new Player if nothing saved. */
  static load () {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return new Player(raw ? JSON.parse(raw) : {})
    } catch {
      return new Player()
    }
  }

  /** Persist current state to localStorage. */
  save () {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      name:           this.name,
      xp:             this.xp,
      streakDays:     this.streakDays,
      lastActiveDate: this.lastActiveDate,
      learnedWords:   this.learnedWords,
      totalAnswers:   this.totalAnswers,
      correctAnswers: this.correctAnswers,
    }))
  }

  /** Call once per session to update the daily streak. */
  checkDailyStreak () {
    const today = new Date().toDateString()
    if (this.lastActiveDate === today) return

    const yesterday = new Date(Date.now() - 86_400_000).toDateString()
    if (this.lastActiveDate === yesterday) {
      this.streakDays += 1
    } else if (this.lastActiveDate !== null) {
      this.streakDays = 1   // streak broken, restart
    } else {
      this.streakDays = 1   // first ever login
    }

    this.lastActiveDate = today
    this.addXP(XP_REWARDS.DAILY_LOGIN)
    this.save()
  }

  /** Add XP and save. Returns { newXP, leveledUp, newLevel }. */
  addXP (amount) {
    const prevLevel = this.currentLevel
    this.xp = Math.max(0, this.xp + amount)
    this.save()
    const newLevel = this.currentLevel
    return { newXP: this.xp, leveledUp: newLevel.level > prevLevel.level, newLevel }
  }

  /** Record a quiz answer. */
  recordAnswer (correct) {
    this.totalAnswers += 1
    if (correct) this.correctAnswers += 1
    this.save()
  }

  /** Mark a word as learned (idempotent). */
  learnWord (wordId) {
    if (!this.learnedWords.includes(wordId)) {
      this.learnedWords.push(wordId)
      this.addXP(XP_REWARDS.LEARN_WORD)
    }
  }

  /** Whether a word has been marked learned. */
  hasLearned (wordId) {
    return this.learnedWords.includes(wordId)
  }

  /** Accuracy as a 0–100 integer. */
  get accuracy () {
    if (this.totalAnswers === 0) return 0
    return Math.round((this.correctAnswers / this.totalAnswers) * 100)
  }

  /** Current level object from LEVELS. */
  get currentLevel () {
    let current = LEVELS[0]
    for (const lvl of LEVELS) {
      if (this.xp >= lvl.minXP) current = lvl
    }
    return current
  }

  /** Next level object, or null if max level. */
  get nextLevel () {
    const idx = LEVELS.findIndex(l => l.level === this.currentLevel.level)
    return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null
  }

  /** Progress percentage (0–100) toward next level. */
  get levelProgress () {
    const cur  = this.currentLevel
    const next = this.nextLevel
    if (!next) return 100
    const range = next.minXP - cur.minXP
    const done  = this.xp  - cur.minXP
    return Math.round((done / range) * 100)
  }
}
