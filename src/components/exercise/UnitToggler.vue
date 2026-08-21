<script setup>
import { useConfigStore } from '@/stores/configStore'

/* 스토어를 직접 구독한다: 부모에게 props를 받을 필요가 없다 */
const configStore = useConfigStore()
</script>

<template>
  <button class="unit-toggler" @click="configStore.toggleUnit()">
    <span class="opt" :class="{ on: !configStore.isFahrenheit }">°C</span>
    <span class="opt" :class="{ on: configStore.isFahrenheit }">°F</span>
  </button>
</template>

<style scoped>
/* ===== 단위 토글 : 작은 세그먼트 ===== */
.unit-toggler {
  display: flex;
  gap: 3px;
  padding: 4px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--c-paper);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.18s var(--ease);
}
.unit-toggler:active {
  transform: scale(0.93);
}
.opt {
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--c-ink-faint);
  transition:
    background 0.18s var(--ease),
    color 0.18s var(--ease);
}
.opt.on {
  background: var(--c-accent);
  color: #fff;
}
</style>
