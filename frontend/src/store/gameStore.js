/**
 * Global reactive store — holds the Player and exposes mutation helpers.
 * Import `useStore` in any component; the returned object is always reactive.
 */

import { reactive, computed } from 'vue'
import { Player } from '../models/Player.js'
import { UserStore } from '../models/UserStore.js'

const currentUser = UserStore.getCurrentUser()
const player      = reactive(Player.load(currentUser?.id ?? 'guest'))

// Check/update daily streak once when the app loads
player.checkDailyStreak()

export function useStore () {
  return {
    player,

    /** Currently logged-in user profile (id, firstName, lastName, email). */
    currentUser,

    /** Log out and do a full page reload to reset all module state. */
    logout () {
      UserStore.logout()
      window.location.reload()
    },

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
