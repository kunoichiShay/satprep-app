<template>
  <div class="word-card" :class="{ 'word-card--learned': isLearned }">
    <div class="word-card__meta">
      <span class="pos-tag">{{ word.part_of_speech }}</span>
    </div>

    <h2 class="word-title">{{ word.word }}</h2>

    <div class="root-box">
      <div class="root-box__label">Root word</div>
      <div class="root-box__value">{{ word.root }}</div>
      <div class="root-box__meaning">{{ word.root_meaning }}</div>
    </div>

    <p class="definition">{{ word.definition }}</p>

    <div class="example-box">
      <div class="example-box__label">In a sentence</div>
      <p class="example-text" v-html="highlightWord(word.example, word.word)"></p>
    </div>

    <div class="tip-box">
      <span class="tip-icon">💡</span>
      <div>
        <div class="tip-box__label">Memory trick</div>
        <div class="tip-box__text">{{ word.memory_tip }}</div>
      </div>
    </div>

    <button
      class="learn-btn"
      :class="{ 'learn-btn--done': isLearned }"
      @click="$emit('learn', word.id)"
    >
      {{ isLearned ? '✓ Learned  (+0 XP)' : `Mark as Learned  (+20 XP)` }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  word:      { type: Object, required: true },
  isLearned: { type: Boolean, default: false },
})
defineEmits(['learn'])

function highlightWord (sentence, word) {
  const re = new RegExp(`(${word})`, 'gi')
  return sentence.replace(re, '<span class="highlight">$1</span>')
}
</script>

<style scoped>
.word-card {
  background: #0f2040;
  border: 1.5px solid #1e4080;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color 0.3s;
}

.word-card--learned {
  border-color: #3dcc8e;
}

.word-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pos-tag {
  font-size: 11px;
  color: #4a8ad4;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.root-label {
  font-size: 11px;
  color: #5a7ca8;
}

.word-title {
  font-size: 30px;
  font-weight: 600;
  color: #e8f0fc;
  margin: 0;
}

.root-box {
  background: #0a1830;
  border-radius: 12px;
  padding: 10px 14px;
}

.root-box__label {
  font-size: 10px;
  color: #3a6a96;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.root-box__value {
  font-size: 13px;
  color: #6ab0ff;
  font-weight: 500;
}

.root-box__meaning {
  font-size: 11px;
  color: #5a7ca8;
  margin-top: 3px;
}

.definition {
  font-size: 14px;
  color: #ccd8ee;
  line-height: 1.6;
  margin: 0;
}

.example-box {
  background: #0a1830;
  border-left: 3px solid #2d6bbf;
  border-radius: 0 10px 10px 0;
  padding: 10px 12px;
}

.example-box__label {
  font-size: 10px;
  color: #3a6a96;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.example-text {
  font-size: 13px;
  color: #a0c0e8;
  line-height: 1.6;
  margin: 0;
}

:deep(.highlight) {
  color: #5daeff;
  font-weight: 600;
  background: #0f2a50;
  padding: 1px 4px;
  border-radius: 4px;
}

.tip-box {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #15283a;
  border: 1px solid #1e4060;
  border-radius: 12px;
  padding: 10px 14px;
}

.tip-icon { font-size: 16px; }

.tip-box__label {
  font-size: 11px;
  color: #4a7a96;
  font-weight: 600;
  margin-bottom: 3px;
}

.tip-box__text {
  font-size: 11px;
  color: #8ab0c8;
  line-height: 1.5;
}

.learn-btn {
  background: #1a3d7c;
  border: 1px solid #2a5aa8;
  border-radius: 12px;
  padding: 12px;
  font-size: 13px;
  color: #cce0ff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  text-align: center;
}

.learn-btn:hover {
  background: #24508a;
}

.learn-btn--done {
  background: #0f2a18;
  border-color: #1e6040;
  color: #3dcc8e;
}
</style>
