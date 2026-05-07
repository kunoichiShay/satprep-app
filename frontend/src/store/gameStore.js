import { reactive, computed } from 'vue'
import { Player } from '../models/Player.js'
import { UserStore } from '../models/UserStore.js'

const API         = import.meta.env.VITE_API_URL
const currentUser = UserStore.getCurrentUser()

// Seed the Player from the DB-backed profile stored in the session.
// Falls back to empty state for guests or first-time loads.
const player = reactive(new Player(currentUser?.profile ?? {}, currentUser?.id ?? 'guest'))

player.checkDailyStreak()
_pushProfile()  // persist any streak change that just occurred

// Re-fetch the latest profile from the backend in the background so that
// progress made on another device is reflected without requiring a re-login.
if (currentUser) {
  fetch(`${API}/profile/${currentUser.id}`)
    .then(r => r.json())
    .then(({ profile: p }) => {
      player.xp              = p.xp
      player.streakDays      = p.streakDays
      player.lastActiveDate  = p.lastActiveDate
      player.totalAnswers    = p.totalAnswers
      player.correctAnswers  = p.correctAnswers
      player.learnedWords    = p.learnedWords
      player.save()
    })
    .catch(() => {})
}

function _pushProfile () {
  if (!currentUser) return
  fetch(`${API}/profile/${currentUser.id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      xp:             player.xp,
      streakDays:     player.streakDays,
      lastActiveDate: player.lastActiveDate,
      totalAnswers:   player.totalAnswers,
      correctAnswers: player.correctAnswers,
    }),
  }).catch(() => {})
}

export function useStore () {
  return {
    player,
    currentUser,

    logout () {
      UserStore.logout()
      window.location.reload()
    },

    addXP (amount) {
      const result = player.addXP(amount)
      _pushProfile()
      return result
    },

    learnWord (wordId) {
      player.learnWord(wordId)
      if (currentUser) {
        fetch(`${API}/profile/${currentUser.id}/learned/${wordId}`, { method: 'POST' }).catch(() => {})
        _pushProfile()
      }
    },

    recordAnswer (correct) {
      player.recordAnswer(correct)
      _pushProfile()
    },

    currentLevel:  computed(() => player.currentLevel),
    nextLevel:     computed(() => player.nextLevel),
    levelProgress: computed(() => player.levelProgress),
    accuracy:      computed(() => player.accuracy),
    learnedCount:  computed(() => player.learnedWords.length),
    streak:        computed(() => player.streakDays),
  }
}
