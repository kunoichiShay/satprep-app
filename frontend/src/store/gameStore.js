/**
 * Global reactive store — holds the Player and exposes mutation helpers.
 * Import `useStore` in any component; the returned object is always reactive.
 */

import { reactive, computed } from 'vue'
import { Player } from '../models/Player.js'

const player = reactive(Player.load())

// Check/update daily streak once when the app loads
player.checkDailyStreak()

export function useStore () {
  return {
    player,

    /** Add XP and return result (see Player.addXP). */
    addXP (amount) {
      return player.addXP(amount)
    },

    /** Mark a word learned and award XP. */
    learnWord (wordId) {
      player.learnWord(wordId)
    },

    /** Record a quiz / game answer. */
    recordAnswer (correct) {
      player.recordAnswer(correct)
    },

    /** Derived stats as computed refs. */
    currentLevel:   computed(() => player.currentLevel),
    nextLevel:      computed(() => player.nextLevel),
    levelProgress:  computed(() => player.levelProgress),
    accuracy:       computed(() => player.accuracy),
    learnedCount:   computed(() => player.learnedWords.length),
    streak:         computed(() => player.streakDays),
  }
}
