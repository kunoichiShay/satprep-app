<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Logo -->
      <div class="logo">
        <span class="logo-icon">📘</span>
        <div class="logo-title">SATPrep</div>
        <div class="logo-sub">Master vocabulary, ace the test</div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          class="tab"
          :class="{ 'tab--active': mode === 'login' }"
          @click="switchMode('login')"
        >Sign In</button>
        <button
          class="tab"
          :class="{ 'tab--active': mode === 'register' }"
          @click="switchMode('register')"
        >Create Account</button>
      </div>

      <!-- Error banner -->
      <div class="error-banner" v-if="errorMsg">{{ errorMsg }}</div>

      <!-- Sign In form -->
      <form v-if="mode === 'login'" class="form" @submit.prevent="submitLogin">
        <div class="field">
          <label class="field-label">Email</label>
          <input
            v-model="loginEmail"
            type="email"
            class="field-input"
            placeholder="you@example.com"
            autocomplete="email"
            required
          />
        </div>
        <div class="field">
          <label class="field-label">Password</label>
          <input
            v-model="loginPassword"
            type="password"
            class="field-input"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>
        <button type="submit" class="submit-btn">Sign In</button>
        <p class="switch-hint">
          No account?
          <button type="button" class="switch-link" @click="switchMode('register')">Create one</button>
        </p>
      </form>

      <!-- Create Account form -->
      <form v-else class="form" @submit.prevent="submitRegister">
        <div class="field-row">
          <div class="field">
            <label class="field-label">First name</label>
            <input
              v-model="regFirstName"
              type="text"
              class="field-input"
              placeholder="Alex"
              autocomplete="given-name"
              required
            />
          </div>
          <div class="field">
            <label class="field-label">Last name</label>
            <input
              v-model="regLastName"
              type="text"
              class="field-input"
              placeholder="Smith"
              autocomplete="family-name"
              required
            />
          </div>
        </div>
        <div class="field">
          <label class="field-label">Email</label>
          <input
            v-model="regEmail"
            type="email"
            class="field-input"
            placeholder="you@example.com"
            autocomplete="email"
            required
          />
        </div>
        <div class="field">
          <label class="field-label">Password</label>
          <input
            v-model="regPassword"
            type="password"
            class="field-input"
            placeholder="At least 6 characters"
            autocomplete="new-password"
            required
            minlength="6"
          />
        </div>
        <div class="field">
          <label class="field-label">Confirm password</label>
          <input
            v-model="regConfirm"
            type="password"
            class="field-input"
            placeholder="••••••••"
            autocomplete="new-password"
            required
          />
        </div>
        <button type="submit" class="submit-btn">Create Account</button>
        <p class="switch-hint">
          Already have an account?
          <button type="button" class="switch-link" @click="switchMode('login')">Sign in</button>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { UserStore } from '../models/UserStore.js'

const router = useRouter()

const mode = ref('login')

// Login fields
const loginEmail    = ref('')
const loginPassword = ref('')

// Register fields
const regFirstName = ref('')
const regLastName  = ref('')
const regEmail     = ref('')
const regPassword  = ref('')
const regConfirm   = ref('')

const errorMsg = ref('')

function switchMode (next) {
  mode.value = next
  errorMsg.value = ''
}

function submitLogin () {
  errorMsg.value = ''
  const result = UserStore.login(loginEmail.value, loginPassword.value)
  if (!result.ok) {
    errorMsg.value = result.error
    return
  }
  router.push({ name: 'home' })
}

function submitRegister () {
  errorMsg.value = ''
  if (regPassword.value !== regConfirm.value) {
    errorMsg.value = 'Passwords do not match.'
    return
  }
  const result = UserStore.register({
    firstName: regFirstName.value,
    lastName:  regLastName.value,
    email:     regEmail.value,
    password:  regPassword.value,
  })
  if (!result.ok) {
    errorMsg.value = result.error
    return
  }
  // Full reload so gameStore initializes fresh for the new user
  window.location.reload()
}
</script>

<style scoped>
.auth-page {
  min-height: 100dvh;
  background: #0a0f1e;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: #0f1e38;
  border: 1px solid #1e3058;
  border-radius: 20px;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.logo {
  text-align: center;
}

.logo-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 8px;
}

.logo-title {
  font-size: 26px;
  font-weight: 700;
  color: #e8f0fc;
  letter-spacing: -0.02em;
}

.logo-sub {
  font-size: 12px;
  color: #4a6a96;
  margin-top: 4px;
}

.tabs {
  display: flex;
  background: #080e1a;
  border-radius: 10px;
  padding: 3px;
  gap: 3px;
}

.tab {
  flex: 1;
  padding: 8px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #4a6a96;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.tab--active {
  background: #1a3d7c;
  color: #cce0ff;
}

.error-banner {
  background: #2a1020;
  border: 1px solid #6b2040;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  color: #ff7090;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: #4a6a96;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field-input {
  background: #080e1a;
  border: 1px solid #1e3058;
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 14px;
  color: #e0ecff;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}

.field-input::placeholder {
  color: #2a4060;
}

.field-input:focus {
  border-color: #3d7bd4;
}

.submit-btn {
  background: #1a3d7c;
  border: 1px solid #2a5aa8;
  border-radius: 12px;
  padding: 13px;
  font-size: 14px;
  font-weight: 700;
  color: #cce0ff;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 2px;
}

.submit-btn:hover {
  background: #204a92;
}

.switch-hint {
  font-size: 12px;
  color: #4a6a96;
  text-align: center;
  margin: 0;
}

.switch-link {
  background: none;
  border: none;
  color: #4a9eff;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.switch-link:hover {
  text-decoration: underline;
}
</style>
