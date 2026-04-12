/**
 * GameEngine — manages the state for each game type.
 * Each game class is instantiated with a word pool and exposes a uniform
 * interface: { current, score, done, submitAnswer(answer) }.
 */

import { ALL_WORDS, randomWords, shuffle } from './WordModel.js'
import { XP_REWARDS } from './Player.js'

// ─── Quick Quiz ────────────────────────────────────────────────────────────────

export class QuizGame {
  /**
   * @param {number} totalQuestions
   * @param {WordModel[]} wordPool   optional custom pool; defaults to all words
   */
  constructor (totalQuestions = 5, wordPool = null) {
    this.totalQuestions = totalQuestions
    this.words          = shuffle(wordPool ?? ALL_WORDS).slice(0, totalQuestions)
    this.index          = 0
    this.score          = 0
    this.xpEarned       = 0
    this.consecutiveCorrect = 0
    this.answers        = []   // { wordId, correct, chosen }
    this.done           = false
    this.lastResult     = null  // 'correct' | 'wrong' | null
  }

  get current () {
    return this.words[this.index] ?? null
  }

  get questionNumber () { return this.index + 1 }

  get choices () {
    return this.current?.quizChoices() ?? []
  }

  /** Submit an answer. Returns { correct, xpGained, streak, done }. */
  submitAnswer (choiceText) {
    if (this.done || !this.current) return

    const correct = choiceText === this.current.definition
    let xpGained = 0

    if (correct) {
      this.score++
      this.consecutiveCorrect++
      xpGained += XP_REWARDS.QUIZ_CORRECT
      if (this.consecutiveCorrect % 5 === 0) xpGained += XP_REWARDS.QUIZ_STREAK_5
    } else {
      this.consecutiveCorrect = 0
    }

    this.xpEarned += xpGained
    this.answers.push({ wordId: this.current.id, correct, chosen: choiceText })
    this.lastResult = correct ? 'correct' : 'wrong'

    this.index++
    if (this.index >= this.totalQuestions) this.done = true

    return { correct, xpGained, streak: this.consecutiveCorrect, done: this.done }
  }

  get accuracyPct () {
    return this.index === 0 ? 0 : Math.round((this.score / this.index) * 100)
  }
}

// ─── Word Scramble ─────────────────────────────────────────────────────────────

export class ScrambleGame {
  constructor (totalRounds = 5) {
    this.words    = shuffle(ALL_WORDS).slice(0, totalRounds)
    this.index    = 0
    this.score    = 0
    this.xpEarned = 0
    this.done     = false
    this.lastResult = null
    this._resetRound()
  }

  _resetRound () {
    this.letters    = this.current?.scrambledLetters() ?? []
    this.userInput  = ''
    this.lastResult = null
    this.revealed   = false
  }

  get current () { return this.words[this.index] ?? null }
  get totalRounds () { return this.words.length }

  submitAnswer (answer) {
    if (this.done || !this.current) return
    const correct = answer.trim().toUpperCase() === this.current.word.toUpperCase()
    let xpGained = 0
    if (correct) {
      this.score++
      xpGained = XP_REWARDS.SCRAMBLE_CORRECT
      this.xpEarned += xpGained
    }
    this.lastResult = correct ? 'correct' : 'wrong'
    return { correct, xpGained }
  }

  next () {
    this.index++
    if (this.index >= this.words.length) {
      this.done = true
    } else {
      this._resetRound()
    }
  }
}

// ─── Fill the Story ────────────────────────────────────────────────────────────

export class FillGame {
  constructor (totalRounds = 5) {
    this.words    = shuffle(ALL_WORDS).slice(0, totalRounds)
    this.index    = 0
    this.score    = 0
    this.xpEarned = 0
    this.done     = false
    this.lastResult = null
  }

  get current () { return this.words[this.index] ?? null }
  get totalRounds () { return this.words.length }

  /** Choices: the correct word + 3 others from the pool, shuffled. */
  get wordChoices () {
    if (!this.current) return []
    const others = this.words
      .filter(w => w.id !== this.current.id)
      .concat(shuffle(ALL_WORDS.filter(w => !this.words.some(x => x.id === w.id))).slice(0, 3))
    const distractors = shuffle(others).slice(0, 3)
    return shuffle([this.current, ...distractors])
  }

  /** Sentence with the target word replaced by ___. */
  get blankedSentence () {
    if (!this.current) return ''
    return this.current.example.replace(
      new RegExp(this.current.word, 'i'),
      '___________'
    )
  }

  submitAnswer (wordId) {
    if (this.done || !this.current) return
    const correct = wordId === this.current.id
    let xpGained = 0
    if (correct) {
      this.score++
      xpGained = XP_REWARDS.FILL_CORRECT
      this.xpEarned += xpGained
    }
    this.lastResult = correct ? 'correct' : 'wrong'
    return { correct, xpGained }
  }

  next () {
    this.index++
    if (this.index >= this.words.length) {
      this.done = true
    } else {
      this.lastResult = null
    }
  }
}
