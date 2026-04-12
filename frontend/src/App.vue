<template>
  <div id="app-shell">
    <router-view />
    <AppNavBar />
  </div>
</template>

<script setup>
import AppNavBar from './components/AppNavBar.vue'
</script>

<style>
/* ── Global reset & base ────────────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  background: #0a0f1e;
  color: #cce0ff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app-shell {
  min-height: 100vh;
  background: #0a0f1e;
}

button { font-family: inherit; }
input  { font-family: inherit; }

::-webkit-scrollbar        { width: 6px; height: 6px; }
::-webkit-scrollbar-track  { background: transparent; }
::-webkit-scrollbar-thumb  { background: #1e3058; border-radius: 6px; }
::-webkit-scrollbar-thumb:hover { background: #2a4a80; }
</style>
