<template>
  <div class="stat-card">
    <div class="stat-value" :style="{ color: color }">{{ value }}</div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<script setup>
defineProps({
  value: { type: [String, Number], required: true },
  label: { type: String, required: true },
  color: { type: String, default: '#4a9eff' },
})
</script>

<style scoped>
.stat-card {
  background: #101e38;
  border: 1px solid #1e3058;
  border-radius: 12px;
  padding: 10px;
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
}

.stat-label {
  font-size: 10px;
  color: #4a6a96;
  margin-top: 3px;
}
</style>
