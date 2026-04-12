<template>
  <div class="level-card">
    <div class="level-header">
      <span class="level-title">Level {{ player.currentLevel.level }} · {{ player.currentLevel.title }}</span>
      <span class="xp-badge">{{ player.xp.toLocaleString() }} XP</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: player.levelProgress + '%' }"></div>
    </div>
    <div class="level-range">
      <span>Lv {{ player.currentLevel.level }}</span>
      <span v-if="player.nextLevel">Lv {{ player.nextLevel.level }} at {{ player.nextLevel.minXP.toLocaleString() }} XP</span>
      <span v-else>Max Level!</span>
    </div>
  </div>
</template>

<script setup>
import { useStore } from '../store/gameStore.js'
const { player } = useStore()
</script>

<style scoped>
.level-card {
  background: #101e38;
  border: 1px solid #1e3058;
  border-radius: 14px;
  padding: 12px 16px;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.level-title {
  font-size: 12px;
  color: #5a7ca8;
}

.xp-badge {
  font-size: 12px;
  color: #4a9eff;
  font-weight: 600;
}

.progress-track {
  background: #1a2d4a;
  border-radius: 20px;
  height: 7px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, #2d6bbf, #4a9eff);
  height: 100%;
  border-radius: 20px;
  transition: width 0.6s ease;
}

.level-range {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 10px;
  color: #3a5a80;
}
</style>
