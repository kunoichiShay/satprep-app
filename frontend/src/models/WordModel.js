/**
 * WordModel — wraps a raw word object from words.json with helper methods.
 */
export class WordModel {
  constructor (data) {
    Object.assign(this, data)
  }

  /** Returns the 4 answer choices (correct + 3 wrong) in shuffled order. */
  quizChoices () {
    const choices = [
      { text: this.definition,           correct: true  },
      { text: this.wrong_definitions[0], correct: false },
      { text: this.wrong_definitions[1], correct: false },
      { text: this.wrong_definitions[2], correct: false },
    ]
    return shuffle(choices)
  }

  /** Returns the word's letters as a shuffled array of characters. */
  scrambledLetters () {
    const letters = this.word.toUpperCase().split('')
    return shuffle(letters)
  }
}

/** Fisher-Yates in-place shuffle; returns array. */
export function shuffle (arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Load all words from the static JSON import. */
import rawWords from '../data/words.json'

export const ALL_WORDS = rawWords.map(w => new WordModel(w))

/** Return n random words, excluding any with ids in excludeIds. */
export function randomWords (n, excludeIds = []) {
  const pool = ALL_WORDS.filter(w => !excludeIds.includes(w.id))
  return shuffle(pool).slice(0, n)
}
