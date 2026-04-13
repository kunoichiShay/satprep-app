<template>
  <nav class="navbar">
    <router-link to="/"      class="nav-item" active-class="nav-item--active" exact>
      <span class="nav-icon">⊞</span>
      <span class="nav-label">Home</span>
    </router-link>
    <router-link to="/words" class="nav-item" active-class="nav-item--active">
      <span class="nav-icon">📚</span>
      <span class="nav-label">Library</span>
    </router-link>
    <router-link to="/games" class="nav-item" active-class="nav-item--active">
      <span class="nav-icon">🎮</span>
      <span class="nav-label">Games</span>
    </router-link>
    <button class="nav-item nav-item--logout" @click="logout">
      <span class="nav-icon">⏻</span>
      <span class="nav-label">Sign Out</span>
    </button>
  </nav>
</template>

<script setup>
import { useStore } from '../store/gameStore.js'
const { logout } = useStore()
</script>

<style scoped>
.navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #080e1a;
  border-top: 1px solid #1a2a42;
  display: flex;
  justify-content: space-around;
  padding: 10px 0 18px;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: #4a6a90;
  flex: 1;
  transition: color 0.2s;
}

.nav-item--active {
  color: #4a9eff;
}

.nav-item--logout {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

.nav-item--logout:hover {
  color: #ff7090;
}

.nav-icon {
  font-size: 18px;
  line-height: 1;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.03em;
}
</style>
