<template>
  <div class="page">
    <!-- Header -->
    <header class="header">
      <div>
        <div class="greeting">Good {{ timeOfDay }}, {{ player.name }}</div>
        <div class="app-title">SATPrep</div>
      </div>
      <div class="avatar">
        <div class="avatar-dot"></div>
      </div>
    </header>

    <!-- Streak banner -->
    <div class="streak-banner" v-if="player.streakDays > 0">
      <div class="streak-emoji">🔥</div>
      <div>
        <div class="streak-title">{{ player.streakDays }} day streak!</div>
        <div class="streak-sub">Keep it up — log in tomorrow to continue</div>
      </div>
    </div>

    <!-- Level progress -->
    <LevelProgress />

    <!-- Quick stats -->
    <div class="stats-grid">
      <StatCard :value="learnedCount"    label="words learned" color="#4a9eff" />
      <StatCard :value="accuracy + '%'"  label="accuracy"      color="#3dcc8e" />
      <StatCard :value="player.streakDays" label="day streak"  color="#ff8c50" />
    </div>

    <!-- Level-up toast -->
    <Transition name="toast">
      <div class="toast" v-if="showLevelUp">
        🎉 Level Up! You're now <strong>{{ newLevelTitle }}</strong>!
      </div>
    </Transition>

    <!-- Mode buttons -->
    <div class="modes-grid">
      <router-link to="/words" class="mode-card mode-card--primary">
        <span class="mode-icon">📖</span>
        <div class="mode-name">Learn</div>
        <div class="mode-sub">New words today</div>
      </router-link>

      <button class="mode-card" @click="startQuickQuiz">
        <span class="mode-icon">⚡</span>
        <div class="mode-name">Quick Quiz</div>
        <div class="mode-sub">5 questions</div>
      </button>

      <router-link to="/games" class="mode-card">
        <span class="mode-icon">🎮</span>
        <div class="mode-name">Word Games</div>
        <div class="mode-sub">Play &amp; earn XP</div>
      </router-link>

      <div class="mode-card mode-card--disabled">
        <span class="mode-icon">🏆</span>
        <div class="mode-name">Leaderboard</div>
        <div class="mode-sub">#{{ leaderboardRank }} this week</div>
      </div>
    </div>

    <!-- Daily tip -->
    <div class="tip-section">
      <div class="tip-header">💡 Word of the Day</div>
      <div class="tip-word">{{ wotd.word }}</div>
      <div class="tip-def">{{ wotd.definition }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import LevelProgress from '../components/LevelProgress.vue'
import StatCard from '../components/StatCard.vue'
import { useStore } from '../store/gameStore.js'
import { ALL_WORDS } from '../models/WordModel.js'

const router = useRouter()
const { player, accuracy, learnedCount } = useStore()

const timeOfDay = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

const leaderboardRank = computed(() => {
  // Simulated rank based on XP
  return Math.max(1, 50 - Math.floor(player.xp / 100))
})

// Word of the day — deterministic based on day-of-year
const wotd = computed(() => {
  const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86_400_000)
  return ALL_WORDS[doy % ALL_WORDS.length]
})

// Level-up notification
const showLevelUp  = ref(false)
const newLevelTitle = ref('')

function startQuickQuiz () {
  router.push({ name: 'games', query: { mode: 'quiz' } })
}
</script>

<style scoped>
.page {
  padding: 16px 16px 90px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 480px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.greeting {
  font-size: 11px;
  color: #4a6a96;
  font-weight: 500;
  margin-bottom: 2px;
}

.app-title {
  font-size: 22px;
  font-weight: 600;
  color: #e8f0fc;
  letter-spacing: -0.01em;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #1a2d50;
  border: 1.5px solid #2a4070;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #3d7bd4;
}

.streak-banner {
  background: linear-gradient(135deg, #1a2d50, #1e3a66);
  border: 1px solid #2a4a80;
  border-radius: 14px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.streak-emoji {
  background: #ff6b2b;
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}

.streak-title {
  font-size: 16px;
  font-weight: 600;
  color: #ff8c50;
}

.streak-sub {
  font-size: 11px;
  color: #7090b8;
  margin-top: 2px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.modes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.mode-card {
  background: #101e38;
  border: 1px solid #1e3058;
  border-radius: 14px;
  padding: 16px 14px;
  cursor: pointer;
  text-decoration: none;
  display: block;
  transition: background 0.2s, transform 0.1s;
}

.mode-card:hover {
  background: #152240;
  transform: translateY(-1px);
}

.mode-card:active {
  transform: translateY(0);
}

.mode-card--primary {
  background: #1a3d7c;
  border-color: #2a5aa8;
}

.mode-card--primary:hover {
  background: #204a92;
}

.mode-card--disabled {
  cursor: default;
  opacity: 0.7;
}

.mode-icon {
  font-size: 20px;
  display: block;
  margin-bottom: 6px;
}

.mode-name {
  font-size: 13px;
  font-weight: 600;
  color: #cce0ff;
}

.mode-sub {
  font-size: 10px;
  color: #5a80b8;
  margin-top: 3px;
}

.tip-section {
  background: #101e38;
  border: 1px solid #1e3058;
  border-radius: 14px;
  padding: 14px 16px;
}

.tip-header {
  font-size: 11px;
  color: #4a7a96;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.tip-word {
  font-size: 20px;
  font-weight: 600;
  color: #4a9eff;
  margin-bottom: 4px;
}

.tip-def {
  font-size: 12px;
  color: #8ab0c8;
  line-height: 1.5;
}

/* Level-up toast */
.toast {
  background: #1a3d7c;
  border: 1px solid #4a9eff;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 13px;
  color: #cce0ff;
  text-align: center;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.4s ease;
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
