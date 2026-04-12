<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">Word Library</h1>
      <span class="word-count">{{ filtered.length }} words</span>
    </header>

    <!-- Search -->
    <div class="search-row">
      <input
        v-model="query"
        class="search-input"
        placeholder="Search words…"
        type="search"
      />
    </div>

    <!-- Filters -->
    <div class="filter-row">
      <button
        v-for="f in FILTERS"
        :key="f.value"
        class="filter-btn"
        :class="{ 'filter-btn--active': filter === f.value }"
        @click="filter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Word list (left) + Detail (right) on wide screens -->
    <div class="layout">
      <!-- Word pills -->
      <div class="word-list">
        <button
          v-for="word in filtered"
          :key="word.id"
          class="word-pill"
          :class="{
            'word-pill--active':   selectedId === word.id,
            'word-pill--learned':  player.hasLearned(word.id),
          }"
          @click="selectWord(word)"
        >
          <span class="pill-word">{{ word.word }}</span>
          <span class="pill-pos">{{ word.part_of_speech }}</span>
          <span v-if="player.hasLearned(word.id)" class="pill-check">✓</span>
        </button>

        <div v-if="filtered.length === 0" class="empty-state">
          No words match your search.
        </div>
      </div>

      <!-- Detail panel -->
      <div class="detail-panel" v-if="selected">
        <WordDetailCard
          :word="selected"
          :is-learned="player.hasLearned(selected.id)"
          @learn="handleLearn"
        />
      </div>
      <div class="detail-panel detail-panel--empty" v-else>
        <div class="empty-hint">👆 Select a word to see its details</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import WordDetailCard from '../components/WordDetailCard.vue'
import { useStore } from '../store/gameStore.js'
import { ALL_WORDS } from '../models/WordModel.js'

const { player, learnWord } = useStore()

const query     = ref('')
const filter    = ref('all')
const selectedId = ref(null)

const FILTERS = [
  { value: 'all',         label: 'All' },
  { value: 'learned',     label: 'Learned' },
  { value: 'not-learned', label: 'Not learned' },
  { value: 'adjective',   label: 'Adjectives' },
  { value: 'noun',        label: 'Nouns' },
  { value: 'verb',        label: 'Verbs' },
]

const filtered = computed(() => {
  let list = ALL_WORDS
  const q = query.value.trim().toLowerCase()
  if (q) list = list.filter(w => w.word.toLowerCase().includes(q) || w.definition.toLowerCase().includes(q))

  if (filter.value === 'learned')     list = list.filter(w => player.hasLearned(w.id))
  if (filter.value === 'not-learned') list = list.filter(w => !player.hasLearned(w.id))
  if (['adjective', 'noun', 'verb'].includes(filter.value)) {
    list = list.filter(w => w.part_of_speech === filter.value)
  }
  return list
})

const selected = computed(() =>
  selectedId.value ? ALL_WORDS.find(w => w.id === selectedId.value) : null
)

function selectWord (word) {
  selectedId.value = word.id
}

function handleLearn (wordId) {
  learnWord(wordId)
}
</script>

<style scoped>
.page {
  padding: 16px 16px 90px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #e8f0fc;
  margin: 0;
}

.word-count {
  font-size: 12px;
  color: #5a7ca8;
  background: #101e38;
  border: 1px solid #1e3058;
  border-radius: 20px;
  padding: 3px 10px;
}

.search-input {
  width: 100%;
  background: #101e38;
  border: 1px solid #1e3058;
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 14px;
  color: #cce0ff;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.search-input::placeholder { color: #3a5a80; }
.search-input:focus { border-color: #3d7bd4; }

.filter-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-btn {
  background: #101e38;
  border: 1px solid #1e3058;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  color: #7090b8;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-btn:hover { border-color: #3d7bd4; color: #aac8ee; }

.filter-btn--active {
  background: #1a3d7c;
  border-color: #4a9eff;
  color: #cce0ff;
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 640px) {
  .layout {
    grid-template-columns: 220px 1fr;
    align-items: start;
  }
}

.word-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 520px;
  overflow-y: auto;
  padding-right: 4px;
}

.word-list::-webkit-scrollbar { width: 4px; }
.word-list::-webkit-scrollbar-track { background: transparent; }
.word-list::-webkit-scrollbar-thumb { background: #2a4070; border-radius: 4px; }

.word-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #101e38;
  border: 1px solid #1e3058;
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}

.word-pill:hover { background: #152240; border-color: #2a4a80; }

.word-pill--active {
  background: #1a3d7c;
  border-color: #4a9eff;
}

.word-pill--learned {
  border-left: 3px solid #3dcc8e;
}

.pill-word {
  font-size: 14px;
  font-weight: 500;
  color: #cce0ff;
  flex: 1;
}

.pill-pos {
  font-size: 10px;
  color: #4a6a96;
  text-transform: capitalize;
}

.pill-check {
  font-size: 12px;
  color: #3dcc8e;
}

.detail-panel {
  position: sticky;
  top: 16px;
}

.detail-panel--empty {
  background: #101e38;
  border: 1px dashed #1e3058;
  border-radius: 18px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-hint {
  font-size: 13px;
  color: #3a5a80;
}

.empty-state {
  font-size: 13px;
  color: #3a5a80;
  padding: 20px;
  text-align: center;
}
</style>
