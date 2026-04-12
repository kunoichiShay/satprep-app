<template>
  <div class="word-card">
    <div class="word-header">
      <h2 class="word">{{ word.word }}</h2>
      <span class="pos">{{ word.part_of_speech }}</span>
    </div>
    <p class="definition">{{ word.definition }}</p>
    <div class="example">
      <span class="example-label">Example</span>
      <p>{{ word.example }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  word: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.word-card {
  background: #fff;
  border-radius: 16px;
  padding: 2rem 2.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  max-width: 640px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: slide-in 0.3s ease;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.word-header {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.word {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  text-transform: lowercase;
}

.pos {
  font-size: 0.85rem;
  font-style: italic;
  color: #7c3aed;
  background: #ede9fe;
  padding: 2px 10px;
  border-radius: 999px;
  font-weight: 500;
}

.definition {
  font-size: 1.1rem;
  color: #374151;
  line-height: 1.65;
  margin: 0;
}

.example {
  background: #f5f3ff;
  border-left: 4px solid #7c3aed;
  border-radius: 0 8px 8px 0;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.example-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: #7c3aed;
}

.example p {
  margin: 0;
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.6;
  font-style: italic;
}
</style>
