<template>
  <div class="page">

    <!-- ── Game selector ── -->
    <div v-if="!activeGame">
      <header class="page-header">
        <h1 class="page-title">Word Games</h1>
        <span class="xp-label">Earn XP by playing!</span>
      </header>

      <div class="games-grid">
        <button
          v-for="g in GAME_DEFS"
          :key="g.id"
          class="game-card"
          @click="launchGame(g.id)"
        >
          <span class="game-icon">{{ g.icon }}</span>
          <div class="game-name">{{ g.name }}</div>
          <div class="game-desc">{{ g.description }}</div>
          <div class="game-xp">+{{ g.xpPerQuestion }} XP / correct</div>
        </button>
      </div>

      <!-- Recent score summary -->
      <div class="score-history" v-if="lastResult">
        <div class="score-history__title">Last game · {{ lastResult.gameName }}</div>
        <div class="score-history__row">
          <span>Score</span>
          <strong>{{ lastResult.score }} / {{ lastResult.total }}</strong>
        </div>
        <div class="score-history__row">
          <span>XP earned</span>
          <strong class="xp-green">+{{ lastResult.xpEarned }} XP</strong>
        </div>
      </div>
    </div>

    <!-- ── Quick Quiz ── -->
    <div v-else-if="activeGame === 'quiz' && quizGame">
      <GameHeader
        title="Quick Quiz"
        :question-num="quizGame.questionNumber"
        :total="quizGame.totalQuestions"
        :streak="streak"
        :xp-earned="quizGame.xpEarned"
        @quit="endGame"
      />

      <div v-if="!quizGame.done">
        <div class="question-card">
          <div class="question-label">Choose the best meaning</div>
          <div class="question-sentence" v-html="highlightWord(quizWord.example, quizWord.word)"></div>
        </div>

        <!-- Choices -->
        <div class="choices">
          <button
            v-for="(choice, i) in quizChoices"
            :key="i"
            class="choice-btn"
            :class="choiceClass(choice, i)"
            :disabled="answered"
            @click="submitQuiz(choice)"
          >
            <span class="choice-letter">{{ 'ABCD'[i] }}</span>
            <span class="choice-text">{{ choice.text }}</span>
            <span v-if="answered && choice.correct" class="choice-tick">✓</span>
            <span v-if="answered && !choice.correct && choice === pickedChoice" class="choice-cross">✗</span>
          </button>
        </div>

        <!-- Feedback bar -->
        <Transition name="slide">
          <div v-if="answered" class="feedback-bar" :class="lastCorrect ? 'feedback-bar--correct' : 'feedback-bar--wrong'">
            <span class="feedback-icon">{{ lastCorrect ? '🎉' : '💡' }}</span>
            <div>
              <div class="feedback-title">{{ lastCorrect ? 'Correct! +' + lastXP + ' XP' : 'Not quite!' }}</div>
              <div class="feedback-sub">{{ quizWord.root }} → "{{ quizWord.root_meaning }}"</div>
            </div>
            <button class="next-btn" @click="advanceQuiz">Next →</button>
          </div>
        </Transition>
      </div>

      <!-- Quiz results -->
      <ResultScreen
        v-else
        title="Quiz Complete!"
        :score="quizGame.score"
        :total="quizGame.totalQuestions"
        :xp-earned="quizGame.xpEarned"
        @play-again="launchGame('quiz')"
        @back="endGame"
      />
    </div>

    <!-- ── Word Scramble ── -->
    <div v-else-if="activeGame === 'scramble' && scrambleGame">
      <GameHeader
        title="Word Scramble"
        :question-num="scrambleGame.index + 1"
        :total="scrambleGame.totalRounds"
        :xp-earned="scrambleGame.xpEarned"
        @quit="endGame"
      />

      <div v-if="!scrambleGame.done">
        <div class="question-card">
          <div class="question-label">Unscramble the letters</div>
          <div class="scramble-def">{{ scrambleGame.current.definition }}</div>
        </div>

        <!-- Scrambled tiles -->
        <div class="letter-tiles">
          <span
            v-for="(letter, i) in scrambleGame.letters"
            :key="i"
            class="tile"
          >{{ letter }}</span>
        </div>

        <!-- Input -->
        <div class="scramble-input-row">
          <input
            v-model="scrambleInput"
            class="scramble-input"
            :placeholder="`${scrambleGame.current.word.length} letters`"
            :maxlength="scrambleGame.current.word.length"
            :disabled="scrambleGame.lastResult !== null"
            @keydown.enter="submitScramble"
            ref="scrambleRef"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
          />
          <button
            class="submit-btn"
            :disabled="!scrambleInput.trim() || scrambleGame.lastResult !== null"
            @click="submitScramble"
          >Check</button>
        </div>

        <!-- Feedback -->
        <Transition name="slide">
          <div v-if="scrambleGame.lastResult" class="feedback-bar"
               :class="scrambleGame.lastResult === 'correct' ? 'feedback-bar--correct' : 'feedback-bar--wrong'">
            <span class="feedback-icon">{{ scrambleGame.lastResult === 'correct' ? '🎉' : '💡' }}</span>
            <div>
              <div class="feedback-title">
                {{ scrambleGame.lastResult === 'correct' ? 'Correct! +' + lastXP + ' XP' : 'The word was: ' + scrambleGame.current.word }}
              </div>
              <div class="feedback-sub">{{ scrambleGame.current.memory_tip }}</div>
            </div>
            <button class="next-btn" @click="advanceScramble">Next →</button>
          </div>
        </Transition>
      </div>

      <ResultScreen
        v-else
        title="Scramble Complete!"
        :score="scrambleGame.score"
        :total="scrambleGame.totalRounds"
        :xp-earned="scrambleGame.xpEarned"
        @play-again="launchGame('scramble')"
        @back="endGame"
      />
    </div>

    <!-- ── Fill the Story ── -->
    <div v-else-if="activeGame === 'fill' && fillGame">
      <GameHeader
        title="Fill the Story"
        :question-num="fillGame.index + 1"
        :total="fillGame.totalRounds"
        :xp-earned="fillGame.xpEarned"
        @quit="endGame"
      />

      <div v-if="!fillGame.done">
        <div class="question-card">
          <div class="question-label">Choose the word that best completes the sentence</div>
          <div class="fill-sentence">{{ fillGame.blankedSentence }}</div>
        </div>

        <div class="choices">
          <button
            v-for="word in fillGame.wordChoices"
            :key="word.id"
            class="choice-btn"
            :class="fillChoiceClass(word)"
            :disabled="fillGame.lastResult !== null"
            @click="submitFill(word)"
          >
            <span class="choice-text choice-text--center">{{ word.word }}</span>
            <span v-if="fillGame.lastResult && word.id === fillGame.current.id" class="choice-tick">✓</span>
          </button>
        </div>

        <Transition name="slide">
          <div v-if="fillGame.lastResult" class="feedback-bar"
               :class="fillGame.lastResult === 'correct' ? 'feedback-bar--correct' : 'feedback-bar--wrong'">
            <span class="feedback-icon">{{ fillGame.lastResult === 'correct' ? '🎉' : '💡' }}</span>
            <div>
              <div class="feedback-title">
                {{ fillGame.lastResult === 'correct' ? 'Correct! +' + lastXP + ' XP' : 'The answer was: ' + fillGame.current.word }}
              </div>
              <div class="feedback-sub">{{ fillGame.current.definition }}</div>
            </div>
            <button class="next-btn" @click="advanceFill">Next →</button>
          </div>
        </Transition>
      </div>

      <ResultScreen
        v-else
        title="Story Complete!"
        :score="fillGame.score"
        :total="fillGame.totalRounds"
        :xp-earned="fillGame.xpEarned"
        @play-again="launchGame('fill')"
        @back="endGame"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '../store/gameStore.js'
import { QuizGame, ScrambleGame, FillGame } from '../models/GameEngine.js'

// ── sub-components defined inline ────────────────────────────────────────────

import { defineComponent, h } from 'vue'

const GameHeader = defineComponent({
  props: ['title','questionNum','total','streak','xpEarned'],
  emits: ['quit'],
  setup (props, { emit }) {
    return () => h('div', { class: 'game-header' }, [
      h('button', { class: 'quit-btn', onClick: () => emit('quit') }, '← Back'),
      h('div', { class: 'game-header__center' }, [
        h('span', { class: 'game-header__title' }, props.title),
        h('span', { class: 'game-header__progress' }, `${props.questionNum} / ${props.total}`),
      ]),
      h('div', { class: 'xp-pill' }, `+${props.xpEarned} XP`),
    ])
  }
})

const ResultScreen = defineComponent({
  props: ['title','score','total','xpEarned'],
  emits: ['play-again','back'],
  setup (props, { emit }) {
    const pct = Math.round((props.score / props.total) * 100)
    return () => h('div', { class: 'result-screen' }, [
      h('div', { class: 'result-emoji' }, pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '📚'),
      h('div', { class: 'result-title' }, props.title),
      h('div', { class: 'result-score' }, `${props.score} / ${props.total} correct`),
      h('div', { class: 'result-pct', style: { color: pct >= 80 ? '#3dcc8e' : pct >= 50 ? '#4a9eff' : '#ff8c50' } }, `${pct}%`),
      h('div', { class: 'result-xp' }, `+${props.xpEarned} XP earned`),
      h('div', { class: 'result-actions' }, [
        h('button', { class: 'btn btn--secondary', onClick: () => emit('back') }, 'Back to games'),
        h('button', { class: 'btn btn--primary',   onClick: () => emit('play-again') }, 'Play again'),
      ])
    ])
  }
})

// ── store ────────────────────────────────────────────────────────────────────

const { addXP, recordAnswer, player } = useStore()

// ── game defs ────────────────────────────────────────────────────────────────

const GAME_DEFS = [
  { id: 'quiz',    icon: '⚡', name: 'Quick Quiz',    description: '5 multiple-choice questions',  xpPerQuestion: 30 },
  { id: 'scramble',icon: '🔤', name: 'Word Scramble', description: 'Unscramble SAT vocabulary',    xpPerQuestion: 25 },
  { id: 'fill',    icon: '📝', name: 'Fill the Story',description: 'Pick the word that fits',      xpPerQuestion: 25 },
]

// ── state ────────────────────────────────────────────────────────────────────

const activeGame    = ref(null)
const quizGame      = ref(null)
const scrambleGame  = ref(null)
const fillGame      = ref(null)
const lastResult    = ref(null)   // summary for the selector screen
const answered      = ref(false)
const pickedChoice  = ref(null)
const lastCorrect   = ref(false)
const lastXP        = ref(0)
const scrambleInput = ref('')
const scrambleRef   = ref(null)
const streak        = ref(0)
const pickedFillId  = ref(null)

// Frozen snapshots for the quiz — updated only when a new question begins
const quizWord    = ref(null)
const quizChoices = ref([])

// ── routing: auto-launch quiz if ?mode=quiz ───────────────────────────────────

const route = useRoute()
onMounted(() => {
  if (route.query.mode) launchGame(route.query.mode)
})

// ── helpers ─────────────────────────────────────────────────────────────────

function launchGame (id) {
  activeGame.value   = id
  answered.value     = false
  pickedChoice.value = null
  lastXP.value       = 0
  scrambleInput.value = ''
  pickedFillId.value  = null

  if (id === 'quiz') {
    quizGame.value = reactive(new QuizGame(5))
    quizWord.value    = quizGame.value.current
    quizChoices.value = quizGame.value.choices
  }
  if (id === 'scramble') scrambleGame.value = reactive(new ScrambleGame(5))
  if (id === 'fill')     fillGame.value     = reactive(new FillGame(5))
}

function endGame () {
  if (activeGame.value === 'quiz' && quizGame.value) {
    lastResult.value = { gameName: 'Quick Quiz', score: quizGame.value.score, total: quizGame.value.totalQuestions, xpEarned: quizGame.value.xpEarned }
  } else if (activeGame.value === 'scramble' && scrambleGame.value) {
    lastResult.value = { gameName: 'Word Scramble', score: scrambleGame.value.score, total: scrambleGame.value.totalRounds, xpEarned: scrambleGame.value.xpEarned }
  } else if (activeGame.value === 'fill' && fillGame.value) {
    lastResult.value = { gameName: 'Fill the Story', score: fillGame.value.score, total: fillGame.value.totalRounds, xpEarned: fillGame.value.xpEarned }
  }
  activeGame.value = null
}

function highlightWord (sentence, word) {
  return sentence.replace(new RegExp(`(${word})`, 'gi'), '<span class="hl">$1</span>')
}

// ── Quiz ─────────────────────────────────────────────────────────────────────

function choiceClass (choice, i) {
  if (!answered.value) return ''
  if (choice.correct) return 'choice-btn--correct'
  if (choice === pickedChoice.value && !choice.correct) return 'choice-btn--wrong'
  return 'choice-btn--dim'
}

function submitQuiz (choice) {
  if (answered.value || quizGame.value.done) return
  pickedChoice.value = choice
  const res = quizGame.value.submitAnswer(choice.text)
  lastCorrect.value = res.correct
  lastXP.value = res.xpGained
  streak.value = res.streak
  answered.value = true
  recordAnswer(res.correct)
  addXP(res.xpGained)
}

function advanceQuiz () {
  answered.value     = false
  pickedChoice.value = null
  // Snapshot the new question now that the game has advanced
  quizWord.value    = quizGame.value.current
  quizChoices.value = quizGame.value.choices
}

// ── Scramble ─────────────────────────────────────────────────────────────────

function submitScramble () {
  if (!scrambleInput.value.trim() || scrambleGame.value.lastResult) return
  const res = scrambleGame.value.submitAnswer(scrambleInput.value)
  lastXP.value = res.xpGained
  recordAnswer(res.correct)
  addXP(res.xpGained)
}

function advanceScramble () {
  scrambleGame.value.next()
  scrambleInput.value = ''
  nextTick(() => scrambleRef.value?.focus())
}

// ── Fill ─────────────────────────────────────────────────────────────────────

function fillChoiceClass (word) {
  if (!fillGame.value.lastResult) return ''
  if (word.id === fillGame.value.current?.id) return 'choice-btn--correct'
  if (word.id === pickedFillId.value && word.id !== fillGame.value.current?.id) return 'choice-btn--wrong'
  return 'choice-btn--dim'
}

function submitFill (word) {
  if (fillGame.value.lastResult) return
  pickedFillId.value = word.id
  const res = fillGame.value.submitAnswer(word.id)
  lastXP.value = res.xpGained
  recordAnswer(res.correct)
  addXP(res.xpGained)
}

function advanceFill () {
  fillGame.value.next()
  pickedFillId.value = null
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

/* ── selector ─────────────────────────── */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #e8f0fc;
  margin: 0;
}

.xp-label {
  font-size: 12px;
  color: #5a7ca8;
}

.games-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.game-card {
  background: #101e38;
  border: 1px solid #1e3058;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s, transform 0.1s;
}

.game-card:hover {
  background: #152240;
  transform: translateY(-2px);
}

.game-icon {
  font-size: 22px;
  display: block;
  margin-bottom: 8px;
}

.game-name {
  font-size: 13px;
  font-weight: 600;
  color: #cce0ff;
  margin-bottom: 4px;
}

.game-desc {
  font-size: 11px;
  color: #5a80b8;
  margin-bottom: 6px;
  line-height: 1.4;
}

.game-xp {
  font-size: 11px;
  color: #4a9eff;
  font-weight: 500;
}

.score-history {
  background: #101e38;
  border: 1px solid #1e3058;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.score-history__title {
  font-size: 11px;
  color: #5a7ca8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
}

.score-history__row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #7090b8;
}

.score-history__row strong {
  color: #cce0ff;
}

.xp-green { color: #3dcc8e; }

/* ── game header ───────────────────────── */

:deep(.game-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

:deep(.quit-btn) {
  background: none;
  border: none;
  color: #5a7ca8;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}

:deep(.quit-btn:hover) { color: #cce0ff; }

:deep(.game-header__center) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

:deep(.game-header__title) {
  font-size: 14px;
  font-weight: 600;
  color: #cce0ff;
}

:deep(.game-header__progress) {
  font-size: 11px;
  color: #5a7ca8;
}

:deep(.xp-pill) {
  background: #1a3d7c;
  border-radius: 20px;
  padding: 4px 10px;
  font-size: 12px;
  color: #7ab0ff;
  font-weight: 600;
}

/* ── question card ─────────────────────── */

.question-card {
  background: #0f2040;
  border: 1.5px solid #1e4080;
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 12px;
}

.question-label {
  font-size: 10px;
  color: #4a8ad4;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.question-sentence {
  font-size: 14px;
  color: #a0c0e8;
  line-height: 1.7;
}

:deep(.hl) {
  color: #5daeff;
  font-weight: 600;
  background: #0f2a50;
  padding: 1px 5px;
  border-radius: 4px;
}

/* ── choices ───────────────────────────── */

.choices {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.choice-btn {
  background: #101e38;
  border: 1.5px solid #1e3058;
  border-radius: 13px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  width: 100%;
}

.choice-btn:hover:not(:disabled) {
  background: #152240;
  border-color: #2a4a80;
}

.choice-btn:disabled { cursor: default; }

.choice-btn--correct {
  background: #0f2a18 !important;
  border-color: #1e6040 !important;
}

.choice-btn--wrong {
  background: #2a0f0f !important;
  border-color: #601e1e !important;
  opacity: 0.8;
}

.choice-btn--dim { opacity: 0.4; }

.choice-letter {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1a2d50;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #5a7ca8;
  font-weight: 600;
  flex-shrink: 0;
}

.choice-btn--correct .choice-letter { background: #1e7048; color: #3dcc8e; }
.choice-btn--wrong   .choice-letter { background: #6a1e1e; color: #e06060; }

.choice-text {
  font-size: 13px;
  color: #cce0ff;
  flex: 1;
  line-height: 1.4;
}

.choice-text--center { text-align: center; }

.choice-tick  { margin-left: auto; color: #3dcc8e; font-size: 16px; }
.choice-cross { margin-left: auto; color: #e06060; font-size: 16px; }

/* ── feedback bar ──────────────────────── */

.feedback-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 12px;
  padding: 12px 14px;
}

.feedback-bar--correct {
  background: #0f2a18;
  border: 1px solid #1e6040;
}

.feedback-bar--wrong {
  background: #2a0f0f;
  border: 1px solid #601e1e;
}

.feedback-icon { font-size: 20px; flex-shrink: 0; }

.feedback-title {
  font-size: 13px;
  font-weight: 600;
  color: #3dcc8e;
}

.feedback-bar--wrong .feedback-title { color: #e06060; }

.feedback-sub {
  font-size: 11px;
  color: #4a8a60;
  margin-top: 2px;
  line-height: 1.4;
}

.feedback-bar--wrong .feedback-sub { color: #8a4a4a; }

.next-btn {
  margin-left: auto;
  background: #1a3d7c;
  border: 1px solid #2a5aa8;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 12px;
  color: #cce0ff;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.next-btn:hover { background: #204a92; }

/* ── scramble ──────────────────────────── */

.scramble-def {
  font-size: 14px;
  color: #a0c0e8;
  line-height: 1.6;
}

.letter-tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin: 12px 0;
}

.tile {
  background: #1a3d7c;
  border: 1.5px solid #2a5aa8;
  border-radius: 10px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #cce0ff;
  letter-spacing: 0.05em;
}

.scramble-input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.scramble-input {
  flex: 1;
  background: #101e38;
  border: 1px solid #1e3058;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 16px;
  color: #cce0ff;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  outline: none;
  transition: border-color 0.2s;
}

.scramble-input:focus { border-color: #3d7bd4; }
.scramble-input::placeholder { color: #3a5a80; font-weight: 400; letter-spacing: normal; text-transform: none; }

.submit-btn {
  background: #1a3d7c;
  border: 1px solid #2a5aa8;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  color: #cce0ff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.submit-btn:hover:not(:disabled) { background: #204a92; }
.submit-btn:disabled { opacity: 0.4; cursor: default; }

/* ── fill ──────────────────────────────── */

.fill-sentence {
  font-size: 15px;
  color: #a0c0e8;
  line-height: 1.8;
  font-style: italic;
}

/* ── result screen ─────────────────────── */

:deep(.result-screen) {
  background: #0f2040;
  border: 1.5px solid #1e4080;
  border-radius: 20px;
  padding: 28px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

:deep(.result-emoji) { font-size: 40px; }
:deep(.result-title) { font-size: 20px; font-weight: 600; color: #e8f0fc; }
:deep(.result-score) { font-size: 14px; color: #7090b8; }
:deep(.result-pct)   { font-size: 36px; font-weight: 700; }
:deep(.result-xp)    { font-size: 14px; color: #3dcc8e; font-weight: 600; }

:deep(.result-actions) {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  width: 100%;
}

:deep(.btn) {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  border: none;
}

:deep(.btn--primary) {
  background: #1a3d7c;
  color: #cce0ff;
  border: 1px solid #2a5aa8;
}

:deep(.btn--primary:hover) { background: #204a92; }

:deep(.btn--secondary) {
  background: #101e38;
  color: #7090b8;
  border: 1px solid #1e3058;
}

:deep(.btn--secondary:hover) { background: #152240; }

/* transitions */
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; }
.slide-enter-from { opacity: 0; transform: translateY(10px); }
.slide-leave-to   { opacity: 0; transform: translateY(-10px); }
</style>
